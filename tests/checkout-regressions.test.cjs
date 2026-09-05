const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

function load(relative, mocks = {}, env = {}) {
  const filename = path.resolve(__dirname, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, require: (id) => id in mocks ? mocks[id] : require(id),
    process: { env }, Buffer, console: { log() {}, warn() {}, error() {} },
  }, { filename });
  return exports;
}

function fixture(module, overrides = {}) {
  const routes = {};
  const router = Object.fromEntries(['get', 'post', 'put', 'delete', 'patch'].map(method => [method,
    (url, ...handlers) => { routes[`${method} ${url}`] = handlers; },
  ]));
  let paid = 0;
  let inserts = 0;
  const order = { id: 'internal-1', totalAmount: 177, paymentStatus: 'PENDING', paymentGatewayOrderId: 'order_real' };
  const plan = { id: 'plan-1', name: 'Pass', price: 177, includedKg: 10, validityDays: 30, isActive: true };
  const gatewayOrder = { id: 'order_real', amount: 17700, notes: { type: 'SUBSCRIPTION', customerId: 'customer-1', subscriptionId: 'plan-1' } };
  const payment = { id: 'pay_real', order_id: 'order_real', amount: 17700, currency: 'INR', status: 'captured' };
  const rows = [];
  class Gateway {
    orders = { create: async () => { if (overrides.failGateway) throw Error('Gateway offline'); return gatewayOrder; }, fetch: async () => gatewayOrder };
    payments = { fetch: async () => payment };
  }
  load(`../src/modules/${module}/routes.ts`, {
    express: { Router: () => router }, razorpay: Gateway,
    '../../lib/db': { db: { getOrderById: () => order, getSubscriptionPlans: () => [plan],
      setPaymentGatewayOrder() {}, markOrderPaymentFailed() {}, markOrderPaymentPaid: () => { paid++; return order; } } },
    '../../middleware/admin': { requireAdmin() {}, requireConfiguredAdmin() {} },
    './view': load('../src/modules/subscriptions/view.ts'),
    '../../lib/customer-tokens': { verifyAccessToken: () => ({ customerId: 'customer-1' }) },
    '../../lib/email': {},
    '../../lib/mysql': { pool: { query: async (sql, args) => {
      if (sql.startsWith('INSERT')) { inserts++; rows.push({ id: args[0], payment_status: 'PAID' }); return [{}]; }
      return [rows];
    } } },
  }, overrides.noConfig ? {} : { RAZORPAY_KEY_ID: 'rzp_test_valid', RAZORPAY_KEY_SECRET: 'secret', RAZORPAY_WEBHOOK_SECRET: 'webhook' });
  const signature = crypto.createHmac('sha256', 'secret').update('order_real|pay_real').digest('hex');
  const body = { internalOrderId: order.id, customerId: 'customer-1', subscriptionId: 'plan-1',
    razorpay_order_id: 'order_real', razorpay_payment_id: 'pay_real', razorpay_signature: signature };
  async function call(route, payload = body, headers = {}) {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.body = data; return this; } };
    await routes[route].at(-1)({ body: payload, headers, params: { customerId: 'customer-1' }, query: {}, rawBody: Buffer.from(JSON.stringify(payload)) }, res);
    return res;
  }
  return { call, body, payment, gatewayOrder, rows, get paid() { return paid; }, get inserts() { return inserts; } };
}

test('missing configuration and gateway errors never create a fake successful checkout', async () => {
  for (const option of [{ noConfig: true }, { failGateway: true }]) {
    const f = fixture('payments', option);
    const res = await f.call('post /create-order');
    assert.equal(res.code, 503);
    assert.equal(res.body.success, false);
    assert.equal(f.paid, 0);
  }
});

test('mock signatures are rejected, captured matching payments are accepted', async () => {
  const f = fixture('payments');
  assert.equal((await f.call('post /verify-signature', { ...f.body, razorpay_signature: '0'.repeat(64) })).code, 400);
  assert.equal(f.paid, 0);
  assert.equal((await f.call('post /verify-signature')).code, 200);
  assert.equal(f.paid, 1);
});

test('authorized but uncaptured payments cannot mark an order paid', async () => {
  const f = fixture('payments');
  f.payment.status = 'authorized';
  assert.equal((await f.call('post /verify-signature')).code, 409);
  assert.equal(f.paid, 0);
});

test('unsigned and incorrectly signed webhooks cannot mark an order paid', async () => {
  const f = fixture('payments');
  const body = { event: 'payment.captured', payload: { payment: { entity: { ...f.payment, notes: { internalOrderId: 'internal-1' } } } } };
  assert.equal((await f.call('post /webhook', body)).code, 400);
  assert.equal((await f.call('post /webhook', body, { 'x-razorpay-signature': '0'.repeat(64) })).code, 400);
  assert.equal(f.paid, 0);
  const signature = crypto.createHmac('sha256', 'webhook').update(JSON.stringify(body)).digest('hex');
  assert.equal((await f.call('post /webhook', body, { 'x-razorpay-signature': signature })).code, 200);
  assert.equal(f.paid, 1);
});

test('membership activation is bound to the purchased plan and is retry safe', async () => {
  const f = fixture('subscriptions');
  f.gatewayOrder.notes.subscriptionId = 'another-plan';
  assert.equal((await f.call('post /verify-payment')).code, 409);
  assert.equal(f.inserts, 0);
  f.gatewayOrder.notes.subscriptionId = 'plan-1';
  assert.equal((await f.call('post /verify-payment')).body.data.payment_status, 'PAID');
  assert.equal((await f.call('post /verify-payment')).body.data.payment_status, 'PAID');
  assert.equal(f.inserts, 1);
});

test('membership listing accepts MySQL decoded JSON features', async () => {
  const f = fixture('subscriptions');
  f.rows.push({ id: 'membership-1', features: ['Free pickup'] });
  const res = await f.call('get /customer/:customerId');
  assert.equal(res.code, 200);
  assert.equal(res.body.data[0].features[0], 'Free pickup');
});

test('booking normalizes optional nulls and explains missing required contact fields', () => {
  const { createOrderPayload } = load('../../mobile-customer/src/lib/api.ts', {
    'react-native': { Platform: { OS: 'android' } }, '@/lib/config': { API_BASE_URL: '' },
  });
  const session = { user: { id: 'customer-1', name: null, phone: '9999999999', email: null } };
  const cart = [{ id: 'cloth-shirt-srv-m-dry-clean', serviceId: 'srv-m-dry-clean', serviceName: 'Shirt',
    categoryName: null, unit: 'Piece', quantity: 1, specialInstructions: null }];
  const input = { address: { id: null, type: 'Home', contactName: 'Customer', street: 'Street', city: 'Hyderabad', pincode: '500085', landmark: null },
    slot: { date: '2026-09-05', startTime: '13:00', endTime: '15:00' }, paymentMethod: 'ONLINE_RAZORPAY' };
  const payload = createOrderPayload(session, cart, input);
  assert.equal(payload.customerName, 'Customer');
  assert.equal(payload.address.landmark, undefined);
  assert.equal(payload.items[0].categoryName, 'Laundry');
  input.address.contactName = null;
  assert.throws(() => createOrderPayload(session, cart, input), /your name in Profile/);
});

test('customer and admin views agree on active, expired, unpaid and scheduled memberships', async () => {
  const f = fixture('subscriptions');
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
  const base = { id: 'membership', status: 'ACTIVE', payment_status: 'PAID', start_date: yesterday, end_date: tomorrow, remaining_kg: '10', used_kg: '5' };
  f.rows.push(base, { ...base, id: 'expired', end_date: yesterday },
    { ...base, id: 'unpaid', payment_status: 'PENDING' },
    { ...base, id: 'scheduled', start_date: tomorrow, end_date: nextWeek });
  for (const route of ['get /customer/:customerId', 'get /purchases']) {
    const res = await f.call(route);
    assert.equal(res.code, 200);
    assert.equal(JSON.stringify(res.body.data.map(item => item.status)), JSON.stringify(['ACTIVE', 'EXPIRED', 'PAYMENT_PENDING', 'SCHEDULED']));
    assert.equal(res.body.data.filter(item => item.isActive).length, 1);
    assert.equal(res.body.data[0].includedKg, 15);
  }
});

test('invalid dates and malformed plan features do not create active memberships or break the ledger', () => {
  const { subscriptionView } = load('../src/modules/subscriptions/view.ts');
  const membership = subscriptionView({ status: 'ACTIVE', payment_status: 'PAID', start_date: 'invalid', end_date: 'invalid', features: '{broken', auto_renew: '0' });
  assert.equal(membership.isActive, false);
  assert.equal(membership.status, 'PENDING');
  assert.equal(membership.features.length, 0);
  assert.equal(membership.autoRenew, false);
});

test('purchase ledger administrator guard rejects absent credentials', () => {
  const { requireConfiguredAdmin } = load('../src/middleware/admin.ts', {}, { ADMIN_API_TOKEN: 'configured-test-token' });
  let passed = false;
  const res = { status(code) { this.code = code; return this; }, json() { return this; } };
  requireConfiguredAdmin({ get: () => undefined }, res, () => { passed = true; });
  assert.equal(res.code, 401);
  assert.equal(passed, false);
  requireConfiguredAdmin({ get: name => name === 'x-admin-token' ? 'configured-test-token' : undefined }, res, () => { passed = true; });
  assert.equal(passed, true);
});
