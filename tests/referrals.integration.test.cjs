const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env')));

function load(relative, mocks = {}) {
  const filename = path.resolve(__dirname, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: id => id in mocks ? mocks[id] : require(id), Buffer, console }, { filename });
  return exports;
}

async function setup(context) {
  const connection = await mysql.createConnection({ host: env.DB_HOST, user: env.DB_USER, password: env.DB_PASSWORD,
    database: env.DB_NAME, port: Number(env.DB_PORT || 3306), connectTimeout: 10000, timezone: 'Z' });
  context.after(() => connection.end());
  // Connection-local TEMPORARY tables shadow real tables; no customer records or settings are modified.
  const schema = load('../src/modules/referrals/schema.ts');
  await schema.createReferralTables({ query: sql => connection.query(sql.replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMPORARY TABLE')) });
  await connection.query(`CREATE TEMPORARY TABLE customers (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), phone VARCHAR(100))`);
  await connection.query(`CREATE TEMPORARY TABLE orders (id VARCHAR(255) PRIMARY KEY, customer_id VARCHAR(255), current_status VARCHAR(30), payment_status VARCHAR(30), total_amount DECIMAL(10,2), created_at DATETIME(3),
    customer_name VARCHAR(255), customer_phone VARCHAR(100), address JSON, items JSON, pricing_model_summary VARCHAR(30),
    express_tier VARCHAR(30), pickup_slot JSON, delivery_slot JSON, pickup_otp VARCHAR(20), delivery_otp VARCHAR(20),
    bag_tag_code VARCHAR(100), status_history JSON, is_weighed TINYINT, actual_weight_kg DECIMAL(10,2),
    item_total DECIMAL(10,2), discount_amount DECIMAL(10,2), coupon_code VARCHAR(100), pickup_delivery_fee DECIMAL(10,2),
    express_fee DECIMAL(10,2), tax_amount DECIMAL(10,2), payment_method VARCHAR(30), updated_at DATETIME(3))`);
  await connection.query("INSERT INTO customers VALUES ('alice', 'Alice', '9000000001'), ('bob', 'Bob', '9000000002'), ('carol', 'Carol', '9000000003')");
  // MySQL cannot open a TEMPORARY table twice in one query. Give the admin
  // ledger's second customer alias an identical connection-local copy.
  await connection.query('CREATE TEMPORARY TABLE referral_test_customers AS SELECT * FROM customers');
  const query = (sql, values) => connection.query(sql.replace('LEFT JOIN customers b', 'LEFT JOIN referral_test_customers b'), values);
  const transactional = {
    query, beginTransaction: connection.beginTransaction.bind(connection),
    commit: connection.commit.bind(connection), rollback: connection.rollback.bind(connection), release() {},
  };
  const service = load('../src/modules/referrals/service.ts', {
    '../../lib/mysql': { pool: { query, getConnection: async () => transactional } },
  });
  const settings = { enabled: true, referrerReward: 50, friendReward: 25, minimumFirstOrder: 100,
    minimumRedemptionOrder: 150, rewardValidityDays: 30, shareUrl: '' };
  return { connection, transactional, service, settings };
}

test('no configured campaign produces no invented code, records or balance', async context => {
  const { service } = await setup(context);
  const summary = await service.getReferralSummary('alice');
  assert.equal(summary.settings, null);
  assert.equal(summary.code, null);
  assert.equal(summary.stats.invited, 0);
  assert.equal(summary.stats.available, 0);
  assert.equal(summary.canApply, false);
});

test('settings validation and unique persisted codes; rejects self, invalid, duplicate and late referrals', async context => {
  const { connection, service, settings } = await setup(context);
  assert.equal(service.referralSettingsSchema.safeParse({ ...settings, referrerReward: 0 }).success, false);
  assert.equal(service.referralSettingsSchema.safeParse({ ...settings, minimumRedemptionOrder: 20 }).success, false);
  assert.equal(service.referralSettingsSchema.safeParse({ ...settings, shareUrl: 'javascript:bad' }).success, false);
  await service.saveReferralSettings(settings);
  const alice = await service.getReferralSummary('alice');
  const bob = await service.getReferralSummary('bob');
  assert.notEqual(alice.code, bob.code);
  assert.equal((await service.getReferralSummary('alice')).code, alice.code);
  await assert.rejects(service.applyReferral('alice', alice.code), /own referral/);
  await assert.rejects(service.applyReferral('bob', 'LF0000000000000000'), /not found/);
  await service.applyReferral('bob', alice.code);
  await assert.rejects(service.applyReferral('bob', alice.code), /already been applied/);
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('old', 'carol', 'ORDER_PLACED', 'PENDING', 200, UTC_TIMESTAMP(3))");
  await assert.rejects(service.applyReferral('carol', alice.code), /before placing your first order/);
  await service.saveReferralSettings({ ...settings, enabled: false });
  assert.equal((await service.getReferralSummary('alice')).settings.enabled, false);
  const [audit] = await connection.query('SELECT COUNT(*) AS total FROM referral_settings_audit');
  assert.equal(audit[0].total, 2);
});

test('only paid delivered qualifying orders earn rewards once, with accepted terms preserved', async context => {
  const { connection, service, settings } = await setup(context);
  await service.saveReferralSettings(settings);
  const alice = await service.getReferralSummary('alice');
  await service.applyReferral('bob', alice.code);
  await service.saveReferralSettings({ ...settings, referrerReward: 100, enabled: false });
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('first', 'bob', 'ORDER_PLACED', 'PAID', 200, UTC_TIMESTAMP(3))");
  assert.equal((await service.getReferralSummary('alice')).rewards.length, 0);
  await connection.query("UPDATE orders SET current_status = 'DELIVERED', payment_status = 'PENDING' WHERE id = 'first'");
  assert.equal((await service.getReferralSummary('alice')).rewards.length, 0);
  await connection.query("UPDATE orders SET payment_status = 'PAID' WHERE id = 'first'");
  const earned = await service.getReferralSummary('alice');
  assert.equal(earned.stats.qualified, 1);
  assert.equal(earned.rewards[0].amount, 50);
  assert.equal((await service.getReferralSummary('alice')).rewards.length, 1);
  assert.equal((await service.getReferralSummary('bob')).rewards[0].amount, 25);
});

test('a completed first order below the minimum earns nothing', async context => {
  const { connection, service, settings } = await setup(context);
  await service.saveReferralSettings(settings);
  await service.applyReferral('bob', (await service.getReferralSummary('alice')).code);
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('small', 'bob', 'COMPLETED', 'PAID', 20, UTC_TIMESTAMP(3))");
  const summary = await service.getReferralSummary('alice');
  assert.equal(summary.history[0].status, 'INELIGIBLE');
  assert.equal(summary.rewards.length, 0);
});

test('reward checkout enforces owner/minimum/expiry and transaction rollback; failed orders restore rewards', async context => {
  const { connection, transactional, service, settings } = await setup(context);
  await service.saveReferralSettings(settings);
  await service.applyReferral('bob', (await service.getReferralSummary('alice')).code);
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('first', 'bob', 'DELIVERED', 'PAID', 200, UTC_TIMESTAMP(3))");
  const reward = (await service.getReferralSummary('alice')).rewards[0];
  await assert.rejects(service.referralRewardDiscount('carol', reward.code, 200), /another account/);
  await assert.rejects(service.referralRewardDiscount('alice', reward.code, 100), /subtotal/);
  await connection.beginTransaction();
  assert.equal((await service.referralRewardDiscount('alice', reward.code, 200, transactional, 'checkout')).discountAmount, 50);
  await connection.rollback();
  assert.equal((await service.referralRewardDiscount('alice', reward.code, 200)).discountAmount, 50);
  await connection.beginTransaction();
  await service.referralRewardDiscount('alice', reward.code, 200, transactional, 'checkout');
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('checkout', 'alice', 'ORDER_PLACED', 'PENDING', 150, UTC_TIMESTAMP(3))");
  await connection.commit();
  await assert.rejects(service.referralRewardDiscount('alice', reward.code, 200), /already used/);
  await connection.query("UPDATE orders SET current_status = 'CANCELLED', payment_status = 'FAILED' WHERE id = 'checkout'");
  await service.reconcileReferrals();
  assert.equal((await service.referralRewardDiscount('alice', reward.code, 200)).discountAmount, 50);
  await connection.query('UPDATE referral_rewards SET expires_at = DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 1 DAY) WHERE code = ?', [reward.code]);
  await assert.rejects(service.referralRewardDiscount('alice', reward.code, 200), /expired/);
  assert.equal((await service.getReferralSummary('alice')).rewards[0].status, 'EXPIRED');
});

test('paid redemption is recorded and a refunded qualifying order voids unused rewards', async context => {
  const { connection, transactional, service, settings } = await setup(context);
  await service.saveReferralSettings(settings);
  await service.applyReferral('bob', (await service.getReferralSummary('alice')).code);
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('first', 'bob', 'DELIVERED', 'PAID', 200, UTC_TIMESTAMP(3))");
  const reward = (await service.getReferralSummary('alice')).rewards[0];
  await connection.beginTransaction();
  await service.referralRewardDiscount('alice', reward.code, 200, transactional, 'redeemed');
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('redeemed', 'alice', 'DELIVERED', 'PAID', 150, UTC_TIMESTAMP(3))");
  await connection.commit();
  assert.equal((await service.getReferralSummary('alice')).rewards[0].status, 'REDEEMED');
  await connection.query("UPDATE orders SET payment_status = 'REFUNDED' WHERE id = 'first'");
  const admin = await service.getAdminReferrals();
  assert.equal(admin.referrals[0].status, 'REVERSED');
  assert.equal((await service.getReferralSummary('bob')).rewards[0].status, 'VOID');
  assert.equal((await service.getReferralSummary('alice')).rewards[0].status, 'REDEEMED');
});

test('production order creation persists the order and reserves its reward atomically', async context => {
  const { connection, transactional, service, settings } = await setup(context);
  await service.saveReferralSettings(settings);
  await service.applyReferral('bob', (await service.getReferralSummary('alice')).code);
  await connection.query("INSERT INTO orders (id, customer_id, current_status, payment_status, total_amount, created_at) VALUES ('first', 'bob', 'DELIVERED', 'PAID', 200, UTC_TIMESTAMP(3))");
  const reward = (await service.getReferralSummary('alice')).rewards[0];
  const { db } = load('../src/lib/db.ts', {
    '../types': { DEFAULT_CUSTOMER_PREFERENCES: {} },
    './mysql': { pool: { getConnection: async () => transactional }, isDbConnected: true },
    '../modules/referrals/service': service,
  });
  const input = { customerId: 'alice', customerName: 'Alice', customerPhone: '9000000001',
    address: {}, items: [], pricingModelSummary: 'PER_ITEM', expressTier: 'REGULAR', pickupSlot: {},
    itemTotal: 200, discountAmount: 1, couponCode: reward.code, pickupDeliveryFee: 0, expressFee: 0,
    taxAmount: 0, totalAmount: 150, paymentMethod: 'ONLINE_RAZORPAY', paymentStatus: 'PENDING' };
  await assert.rejects(db.createOrder(input), /Reward amount changed/);
  assert.equal((await service.referralRewardDiscount('alice', reward.code, 200)).discountAmount, 50);
  const order = await db.createOrder({ ...input, discountAmount: 50 });
  const [saved] = await connection.query('SELECT * FROM orders WHERE id = ?', [order.id]);
  assert.equal(saved.length, 1);
  assert.equal(Number(saved[0].discount_amount), 50);
  const [coupons] = await connection.query('SELECT status, used_order_id FROM referral_rewards WHERE code = ?', [reward.code]);
  assert.equal(coupons[0].status, 'RESERVED');
  assert.equal(coupons[0].used_order_id, order.id);
  await assert.rejects(db.createOrder({ ...input, discountAmount: 50 }), /already used/);
});
