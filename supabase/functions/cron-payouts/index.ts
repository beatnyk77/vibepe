
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fix: Declare Deno to resolve type errors in non-Deno environments
declare const Deno: any;

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CASHFREE_CLIENT_ID = Deno.env.get("CASHFREE_CLIENT_ID");
const CASHFREE_SECRET = Deno.env.get("CASHFREE_SECRET");
const WISE_API_KEY = Deno.env.get("WISE_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting T+2 Payout Cron Job...");

    // 1. Fetch Eligible Transactions
    // Criteria: Status = success, Payout = pending, Age > 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*, users(email, id)")
      .eq("status", "success")
      .eq("payout_status", "pending")
      .lt("created_at", twoDaysAgo)
      .limit(500); // Batch limit safety

    if (error) throw error;
    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ message: "No eligible transactions found." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${transactions.length} eligible transactions.`);

    // 2. Group by User & Currency
    const payouts: Record<string, typeof transactions> = {};
    transactions.forEach((txn: any) => {
      const key = `${txn.user_id}-${txn.currency}`;
      if (!payouts[key]) payouts[key] = [];
      payouts[key].push(txn);
    });

    const results = [];

    // 3. Process Batches
    for (const key in payouts) {
      const batch = payouts[key];
      const userId = batch[0].user_id;
      const currency = batch[0].currency;
      const userEmail = batch[0].users?.email;

      // Calculate Totals
      const totalGross = batch.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
      
      // Vibepe Pricing: 2.9% flat
      const platformFee = totalGross * 0.029; 
      const netAmount = totalGross - platformFee;

      // Fraud Guard: Beta Cap $500
      if (currency === 'USD' && totalGross > 500) {
        console.warn(`FLAG: User ${userId} exceeded beta payout limit ($${totalGross}). Skipping.`);
        continue;
      }

      let payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let providerResponse = null;

      // 4. Route to Provider
      try {
        if (currency === 'INR') {
          // --- CASHFREE PAYOUT (India) ---
          // Mocking Cashfree Payouts API
          // Docs: https://docs.cashfree.com/reference/payouts-create-transfer
          /*
          const resp = await fetch('https://payout-api.cashfree.com/payout/v1/authorize', { ... });
          const token = await resp.json();
          providerResponse = await fetch('https://payout-api.cashfree.com/payout/v1/directTransfer', {
             body: JSON.stringify({ amount: netAmount, transferId: payoutId, ... })
          });
          */
          providerResponse = { status: 'SUCCESS', referenceId: 'cf_ref_123' }; // Stub
          console.log(`[Cashfree] Payout of ₹${netAmount} initiated for ${userEmail}`);

        } else {
          // --- WISE PAYOUT (Global) ---
          // Mocking Wise Transfer
          // 1. Get Quote USD -> INR
          // 2. Create Transfer
          const fxRate = 84.5; // Mock Rate
          const estimatedInr = netAmount * fxRate;
          const wiseFee = estimatedInr * 0.004; // 0.4% Interbank
          const finalInr = estimatedInr - wiseFee;

          providerResponse = { status: 'PROCESSING', wiseTransferId: 'wise_tf_999', fxRate, finalInr }; // Stub
          console.log(`[Wise] Payout of $${netAmount} -> ₹${finalInr.toFixed(2)} initiated for ${userEmail}`);
        }

        // 5. Update Database
        const txnIds = batch.map((t: any) => t.id);
        const { error: updateError } = await supabase
          .from("transactions")
          .update({
            payout_status: 'processing', // Sets to processing until webhook confirms
            payout_id: payoutId,
            fee_amount: platformFee / batch.length, // Distribute fee primarily for record keeping
            net_amount: netAmount / batch.length,
            payout_date: new Date().toISOString()
          })
          .in('id', txnIds);
        
        if (updateError) throw updateError;

        // 6. Notify User
        if (userEmail && RESEND_API_KEY) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Vibepe Payouts <money@vibepe.com>',
              to: userEmail,
              subject: `💰 T+2 Payout Incoming: ${currency === 'USD' ? '$' : '₹'}${netAmount.toFixed(2)}`,
              html: `<p>Great news! We've processed your payout for <strong>${batch.length} transactions</strong>.</p>
                     <p>Gross: ${currency} ${totalGross}</p>
                     <p>Fees (2.9%): -${currency} ${platformFee.toFixed(2)}</p>
                     <p><strong>Net Payout: ${currency} ${netAmount.toFixed(2)}</strong></p>
                     <p>Expect it in your bank within 24 hours.</p>`
            })
          });
        }

        results.push({ userId, status: 'success', netAmount });

      } catch (err: any) {
        console.error(`Payout failed for user ${userId}:`, err);
        results.push({ userId, status: 'failed', error: err.message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
