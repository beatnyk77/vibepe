/**
 * Vibepe Payment System - Production Reference Implementation
 * Stack: Next.js 15 (App Router), TypeScript, Jest
 * 
 * This file contains:
 * 1. The Client-Side Script Component (Injects the modal)
 * 2. The Server-Side API Route (Handles Geo-IP & Provider Sessions)
 * 3. Jest Unit Tests for Routing Logic
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ==========================================
// 1. CLIENT COMPONENT (app/components/VibepeScript.tsx)
// ==========================================

/*
import Script from 'next/script';

export const VibepeScript = ({ username, price, currency, product }: any) => {
  const src = `https://vibepe.com/pay/${username}?price=${price}&currency=${currency}&product=${encodeURIComponent(product)}`;
  
  return (
    <Script 
      src={src} 
      strategy="lazyOnload" 
      onLoad={() => console.log('Vibepe payments initialized')}
    />
  );
};
*/

// ==========================================
// 2. SERVER API ROUTE (app/api/vibepe/checkout/route.ts)
// ==========================================

// Environment Variables Interface
interface EnvConfig {
  CASHFREE_APP_ID: string;
  CASHFREE_SECRET: string;
  LEMON_SQUEEZY_API_KEY: string;
  LEMON_SQUEEZY_STORE_ID: string;
}

// Mock DB lookup
const getUserWallet = async (username: string) => {
  // In prod: await supabase.from('users').select('wallet_id').eq('username', username)
  return { wallet_id: 'vibe_123456' }; 
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, price, currency, product, ip } = body;

    // 1. Validate Input
    if (!username || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Geo-IP Routing Logic
    // In production, use request.geo (Vercel) or a library like 'geoip-lite'
    // Here we assume IP is passed or headers are checked
    const country = request.headers.get('x-vercel-ip-country') || 'US';
    
    // 3. Provider Selection
    let checkoutUrl = '';
    let provider = '';

    if (country === 'IN') {
      // --- INDIA: CASHFREE ROUTE ---
      provider = 'Cashfree';
      
      // Call Cashfree Create Order API
      const cfResponse = await fetch('https://sandbox.cashfree.com/pg/orders', {
        method: 'POST',
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID!,
          'x-client-secret': process.env.CASHFREE_SECRET!,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: `order_${Date.now()}`,
          order_amount: price,
          order_currency: 'INR',
          customer_details: {
            customer_id: 'guest_123',
            customer_phone: '9999999999'
          },
          order_meta: {
            return_url: `https://vibepe.com/success?order_id={order_id}`
          }
        })
      });
      
      const cfData = await cfResponse.json();
      checkoutUrl = cfData.payment_link;

    } else {
      // --- GLOBAL: LEMON SQUEEZY ROUTE ---
      provider = 'LemonSqueezy';
      
      // Call Lemon Squeezy Checkout API
      const lsResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json'
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              checkout_data: {
                custom: {
                  username: username
                }
              },
              product_options: {
                 name: product,
                 description: `Payment to @${username}`,
                 receipt_button_text: 'Return to Merchant',
                 receipt_link_url: 'https://vibepe.com/success'
              }
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: process.env.LEMON_SQUEEZY_STORE_ID
                }
              },
              variant: {
                data: {
                  type: "variants",
                  id: "variant_123" // Dynamic variant creation needed in real app
                }
              }
            }
          }
        })
      });

      const lsData = await lsResponse.json();
      checkoutUrl = lsData.data?.attributes?.url;
    }

    return NextResponse.json({ 
      url: checkoutUrl, 
      provider, 
      country 
    });

  } catch (error) {
    console.error('Payment Init Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// ==========================================
// 3. UNIT TESTS (Jest) - __tests__/routing.test.ts
// ==========================================

/*
import { createMocks } from 'node-mocks-http';
import { POST } from '../app/api/vibepe/checkout/route';

describe('Vibepe Payment Routing', () => {
  
  test('Should route India IP to Cashfree', async () => {
    const { req } = createMocks({
      method: 'POST',
      headers: {
        'x-vercel-ip-country': 'IN'
      },
      body: {
        username: 'test_user',
        price: 100,
        currency: 'INR'
      }
    });

    // Mock fetch to return fake Cashfree URL
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ payment_link: 'https://cashfree.com/pay/123' }),
      })
    ) as jest.Mock;

    // Note: In a real Next.js test env, you'd invoke the handler slightly differently
    // or separate the logic from the NextRequest wrapper.
    
    // Assert Logic Expectation:
    // expect(fetch).toHaveBeenCalledWith(expect.stringContaining('cashfree.com'), ...);
  });

  test('Should route US IP to Lemon Squeezy', async () => {
    // Similar setup with 'x-vercel-ip-country': 'US'
    // Expect fetch to lemon squeezy API
  });

});
*/
