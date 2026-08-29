import { randomUUID } from 'crypto';
import { pool, isDbConnected } from './mysql';
import type { Order, OrderStatus } from '../types';

export type PushProvider = 'EXPO';

interface MobileDevice {
  id: string;
  customerId: string;
  pushToken: string;
  provider: PushProvider;
  platform: 'android' | 'ios';
}

const fallbackDevices = new Map<string, MobileDevice>();

function fallbackKey(customerId: string, pushToken: string) {
  return `${customerId}:${pushToken}`;
}

export async function registerMobileDevice(input: Omit<MobileDevice, 'id'>) {
  const now = new Date().toISOString();
  const existing = [...fallbackDevices.values()].find((device) => device.pushToken === input.pushToken);
  const device: MobileDevice = existing || { ...input, id: `device_${randomUUID()}` };
  device.customerId = input.customerId;
  device.provider = input.provider;
  device.platform = input.platform;
  fallbackDevices.set(fallbackKey(input.customerId, input.pushToken), device);

  if (isDbConnected && pool) {
    await pool.query(
      `INSERT INTO mobile_devices (id, customer_id, push_token, provider, platform, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE customer_id = VALUES(customer_id), provider = VALUES(provider), platform = VALUES(platform), updated_at = VALUES(updated_at)`,
      [device.id, input.customerId, input.pushToken, input.provider, input.platform, now, now],
    );
  }

  return device;
}

export async function removeMobileDevice(customerId: string, pushToken: string) {
  fallbackDevices.delete(fallbackKey(customerId, pushToken));
  if (isDbConnected && pool) {
    await pool.query('DELETE FROM mobile_devices WHERE customer_id = ? AND push_token = ?', [customerId, pushToken]);
  }
}

async function expoTokensForCustomer(customerId: string) {
  if (isDbConnected && pool) {
    const [rows] = await pool.query(
      'SELECT push_token FROM mobile_devices WHERE customer_id = ? AND provider = ?',
      [customerId, 'EXPO'],
    ) as unknown as [{ push_token?: string }[], unknown];
    return rows.map((row) => row.push_token).filter((token): token is string => Boolean(token));
  }
  return [...fallbackDevices.values()]
    .filter((device) => device.customerId === customerId && device.provider === 'EXPO')
    .map((device) => device.pushToken);
}

function messageForStatus(status: OrderStatus) {
  const messages: Partial<Record<OrderStatus, { title: string; body: string }>> = {
    ORDER_PLACED: { title: 'Pickup scheduled', body: 'Your LaundryFresh pickup is confirmed.' },
    PICKUP_ASSIGNED: { title: 'Pickup partner assigned', body: 'Your pickup partner is preparing to collect your garments.' },
    PICKED_UP: { title: 'Garments collected', body: 'Your laundry is on its way to our care facility.' },
    WASHING: { title: 'Washing has started', body: 'Your garments are now receiving their selected care.' },
    QUALITY_CHECK: { title: 'Quality check underway', body: 'Your garments are being carefully inspected before packing.' },
    PACKED: { title: 'Fresh and packed', body: 'Your order is ready for delivery.' },
    OUT_FOR_DELIVERY: { title: 'Out for delivery', body: 'Your fresh garments are on the way.' },
    DELIVERED: { title: 'Order delivered', body: 'Your LaundryFresh order has been delivered. Thank you!' },
    COMPLETED: { title: 'Order complete', body: 'We hope your garments feel fresh and wonderful.' },
  };
  return messages[status] || { title: 'Order update', body: `Your order status is now ${status.replace(/_/g, ' ').toLowerCase()}.` };
}

export async function sendOrderStatusPushNotification(order: Order, status: OrderStatus) {
  const tokens = await expoTokensForCustomer(order.customerId);
  if (!tokens.length) return;

  const content = messageForStatus(status);
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(tokens.map((to) => ({
      to,
      sound: 'default',
      channelId: 'orders',
      title: content.title,
      body: content.body,
      data: { orderId: order.id, screen: 'orders' },
    }))),
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    console.warn(`Expo push notification could not be sent for order ${order.id}: ${response.status}`);
  }
}
