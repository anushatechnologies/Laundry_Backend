/**
 * Direct Unit Verification of cancelAndRefundOrder
 */

const { db } = require('../dist/lib/db');
const { cancelAndRefundOrder } = require('../dist/modules/orders/routes');
const { getWallet } = require('../dist/modules/wallet/service');

async function testCancelAndRefund() {
  console.log('🧪 Starting Direct Unit Verification of cancelAndRefundOrder...\n');

  try {
    const testCustomerId = `test-cust-refund-${Date.now()}`;
    const initialWallet = await getWallet(testCustomerId);
    console.log(`Initial wallet balance for ${testCustomerId}: ₹${initialWallet.balance}`);

    // TEST 1: Online Paid Order Cancellation (Paid ₹550 online)
    console.log('\n--- TEST 1: Online Paid Order (Paid ₹550) ---');
    const order1 = db.createOrder({
      customerId: testCustomerId,
      customerName: 'Direct Test Customer',
      customerPhone: '9123456780',
      address: {
        street: '123 Test Apt',
        city: 'Hyderabad',
        pincode: '500104',
      },
      items: [
        {
          id: 'item-1',
          serviceId: 'wf',
          serviceName: 'Wash & Fold',
          categoryName: 'Wash',
          pricingModel: 'PER_KG',
          unitPrice: 110,
          quantity: 5,
          unit: 'KG',
          subtotal: 550,
        },
      ],
      paymentMethod: 'ONLINE',
    });

    // Simulate payment completion
    order1.paymentStatus = 'PAID';
    order1.totalAmount = 550;
    order1.walletDeduction = 0;

    const res1 = await cancelAndRefundOrder(order1.id, {
      cancelledBy: testCustomerId,
      role: 'CUSTOMER',
      reason: 'Need to change time slot',
    });

    console.log('Cancel Result 1:', {
      success: res1.success,
      refundAmount: res1.refundAmount,
      orderStatus: res1.order?.currentStatus,
      paymentStatus: res1.order?.paymentStatus,
      message: res1.message,
    });

    if (!res1.success || res1.refundAmount !== 550) {
      throw new Error(`Expected success and refund of ₹550, got ${JSON.stringify(res1)}`);
    }
    if (res1.order.currentStatus !== 'CANCELLED' || res1.order.paymentStatus !== 'REFUNDED') {
      throw new Error(`Expected status CANCELLED and paymentStatus REFUNDED!`);
    }

    const walletAfter1 = await getWallet(testCustomerId);
    console.log(`Wallet Balance After Test 1: ₹${walletAfter1.balance} (Expected ₹${initialWallet.balance + 550})`);
    if (Math.abs(walletAfter1.balance - (initialWallet.balance + 550)) > 0.01) {
      throw new Error(`Wallet balance mismatch! Got ${walletAfter1.balance}, expected ${initialWallet.balance + 550}`);
    }
    console.log('✅ TEST 1 PASSED: Online payment successfully refunded to wallet.');

    // TEST 2: Wallet Deducted Order Cancellation (Paid ₹200 via Wallet)
    console.log('\n--- TEST 2: Wallet Deducted Order (Paid ₹200 via Wallet) ---');
    const order2 = db.createOrder({
      customerId: testCustomerId,
      customerName: 'Direct Test Customer',
      customerPhone: '9123456780',
      address: {
        street: '123 Test Apt',
        city: 'Hyderabad',
        pincode: '500104',
      },
      items: [
        {
          id: 'item-2',
          serviceId: 'iron',
          serviceName: 'Steam Iron',
          categoryName: 'Iron',
          pricingModel: 'PER_ITEM',
          unitPrice: 20,
          quantity: 10,
          unit: 'Piece',
          subtotal: 200,
        },
      ],
      paymentMethod: 'WALLET',
    });

    order2.paymentStatus = 'PAID';
    order2.totalAmount = 0;
    order2.walletDeduction = 200;

    const res2 = await cancelAndRefundOrder(order2.id, {
      cancelledBy: testCustomerId,
      role: 'CUSTOMER',
      reason: 'No longer needed',
    });

    console.log('Cancel Result 2:', {
      success: res2.success,
      refundAmount: res2.refundAmount,
      orderStatus: res2.order?.currentStatus,
      paymentStatus: res2.order?.paymentStatus,
    });

    if (!res2.success || res2.refundAmount !== 200) {
      throw new Error(`Expected ₹200 wallet refund, got ${JSON.stringify(res2)}`);
    }

    const walletAfter2 = await getWallet(testCustomerId);
    console.log(`Wallet Balance After Test 2: ₹${walletAfter2.balance} (Expected ₹${walletAfter1.balance + 200})`);
    if (Math.abs(walletAfter2.balance - (walletAfter1.balance + 200)) > 0.01) {
      throw new Error(`Wallet balance mismatch! Got ${walletAfter2.balance}, expected ${walletAfter1.balance + 200}`);
    }
    console.log('✅ TEST 2 PASSED: Wallet deduction successfully refunded back to wallet.');

    // TEST 3: Duplicate Cancel Prevention (Idempotency)
    console.log('\n--- TEST 3: Duplicate Cancel Attempt ---');
    const resDup = await cancelAndRefundOrder(order1.id, {
      cancelledBy: testCustomerId,
      role: 'CUSTOMER',
      reason: 'Duplicate cancel',
    });

    console.log('Duplicate Cancel Result:', {
      success: resDup.success,
      refundAmount: resDup.refundAmount,
      message: resDup.message,
    });

    if (resDup.success || resDup.refundAmount > 0) {
      throw new Error(`Duplicate cancellation should NOT succeed or refund again!`);
    }

    const walletAfterDup = await getWallet(testCustomerId);
    if (walletAfterDup.balance !== walletAfter2.balance) {
      throw new Error(`Wallet balance changed on duplicate cancel! Before: ${walletAfter2.balance}, After: ${walletAfterDup.balance}`);
    }
    console.log('✅ TEST 3 PASSED: Duplicate cancellation prevented from double-refunding.');

    // TEST 4: Unpaid COD Order Cancellation (Unpaid -> ₹0 Refund)
    console.log('\n--- TEST 4: Unpaid COD Order Cancellation ---');
    const order3 = db.createOrder({
      customerId: testCustomerId,
      customerName: 'Direct Test Customer',
      customerPhone: '9123456780',
      address: {
        street: '123 Test Apt',
        city: 'Hyderabad',
        pincode: '500104',
      },
      items: [
        {
          id: 'item-3',
          serviceId: 'dc',
          serviceName: 'Dry Cleaning',
          categoryName: 'Dry Clean',
          pricingModel: 'PER_ITEM',
          unitPrice: 400,
          quantity: 1,
          unit: 'Piece',
          subtotal: 400,
        },
      ],
      paymentMethod: 'COD',
    });

    order3.paymentStatus = 'PENDING';
    order3.totalAmount = 400;
    order3.walletDeduction = 0;

    const res3 = await cancelAndRefundOrder(order3.id, {
      cancelledBy: testCustomerId,
      role: 'CUSTOMER',
      reason: 'Cancelled before pickup',
    });

    console.log('Cancel Result 3:', {
      success: res3.success,
      refundAmount: res3.refundAmount,
      orderStatus: res3.order?.currentStatus,
      paymentStatus: res3.order?.paymentStatus,
    });

    if (!res3.success || res3.refundAmount !== 0) {
      throw new Error(`Expected ₹0 refund for unpaid COD order, got ₹${res3.refundAmount}`);
    }

    const walletAfter3 = await getWallet(testCustomerId);
    if (walletAfter3.balance !== walletAfter2.balance) {
      throw new Error(`Wallet balance should not change for unpaid COD!`);
    }
    console.log('✅ TEST 4 PASSED: Unpaid COD cancelled with ₹0 refund and paymentStatus preserved.');

    // TEST 5: Non-cancellable stage check (e.g. WASHING)
    console.log('\n--- TEST 5: Non-cancellable stage check by Customer ---');
    const order4 = db.createOrder({
      customerId: testCustomerId,
      customerName: 'Direct Test Customer',
      customerPhone: '9123456780',
      address: { street: '123', city: 'Hyd', pincode: '500104' },
      items: [{ id: 'i-4', serviceId: 'wf', serviceName: 'Wash', categoryName: 'Wash', pricingModel: 'PER_KG', unitPrice: 100, quantity: 1, unit: 'KG', subtotal: 100 }],
      paymentMethod: 'COD',
    });
    order4.currentStatus = 'WASHING';

    const res4 = await cancelAndRefundOrder(order4.id, {
      cancelledBy: testCustomerId,
      role: 'CUSTOMER',
    });

    console.log('Non-cancellable Stage Result:', {
      success: res4.success,
      message: res4.message,
    });

    if (res4.success) {
      throw new Error(`Customer should not be able to self-cancel order in WASHING stage!`);
    }
    console.log('✅ TEST 5 PASSED: Guard against self-cancelling in-progress laundry works.');

    console.log('\n🎉🎉 ALL DIRECT VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉🎉');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

testCancelAndRefund();
