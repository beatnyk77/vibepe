
/**
 * @jest-environment node
 */

// Fix: Declare Jest globals to resolve type errors
declare var describe: any;
declare var test: any;
declare var expect: any;

describe('Vibepe Payout Logic', () => {
  
  const mockTransactions = [
    { id: 1, amount: 49.00, currency: 'USD', user_id: 'u1' },
    { id: 2, amount: 100.00, currency: 'USD', user_id: 'u1' },
    { id: 3, amount: 500.00, currency: 'INR', user_id: 'u2' } // Different user
  ];

  test('Calculates 2.9% fee correctly for USD batch', () => {
    // User 1 Batch
    const user1Txns = mockTransactions.filter(t => t.user_id === 'u1');
    const totalGross = user1Txns.reduce((acc, t) => acc + t.amount, 0); // 149.00
    
    // Fee Calc
    const feePercent = 0.029;
    const fee = totalGross * feePercent; // 149 * 0.029 = 4.321
    const net = totalGross - fee; // 144.679

    expect(totalGross).toBe(149);
    expect(Number(fee.toFixed(3))).toBe(4.321);
    expect(Number(net.toFixed(2))).toBe(144.68);
  });

  test('Calculates payout for single INR transaction', () => {
    const user2Txn = mockTransactions.find(t => t.user_id === 'u2')!;
    const fee = user2Txn.amount * 0.029; // 500 * 0.029 = 14.5
    const net = user2Txn.amount - fee; // 485.5

    expect(net).toBe(485.5);
  });

  test('Mock Wise FX Conversion Logic', () => {
    // Scenario: $49 USD payout -> INR
    // Vibepe Fee first
    const gross = 49.00;
    const vibepeFee = gross * 0.029; // 1.421
    const netUsd = gross - vibepeFee; // 47.579

    // Wise Mock
    const fxRate = 84.00; 
    const estimatedInr = netUsd * fxRate; // 47.579 * 84 = 3996.636
    const wiseFee = estimatedInr * 0.004; // 0.4% fee = 15.98
    const finalInr = estimatedInr - wiseFee; // 3980.65

    // Assertion against approximate values
    expect(netUsd).toBeCloseTo(47.58, 2);
    expect(finalInr).toBeGreaterThan(3900); 
    expect(finalInr).toBeLessThan(4100);
  });
});
