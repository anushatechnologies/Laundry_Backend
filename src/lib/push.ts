import { randomUUID } from 'crypto';
import { pool, isDbConnected } from './mysql';
import { getFirebaseMessaging } from './firebase-admin';
import type { Order, OrderStatus } from '../types';

export type PushProvider = 'FCM' | 'EXPO';

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

export async function getDevicesForCustomer(customerId: string): Promise<MobileDevice[]> {
  if (isDbConnected && pool) {
    const [rows]: any = await pool.query(
      'SELECT id, customer_id, push_token, provider, platform FROM mobile_devices WHERE customer_id = ?',
      [customerId],
    ).catch(() => [[]]);
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        customerId: r.customer_id,
        pushToken: r.push_token,
        provider: (r.provider || 'FCM') as PushProvider,
        platform: (r.platform || 'android') as 'android' | 'ios',
      }));
    }
  }
  return [...fallbackDevices.values()].filter((device) => device.customerId === customerId);
}

function messageForStatus(status: OrderStatus) {
  const messages: Partial<Record<OrderStatus, { title: string; body: string }>> = {
    ORDER_PLACED: {
      title: '🧺 Order Confirmed!',
      body: 'Your pickup is scheduled with LaundryFresh doorstep service.',
    },
    PICKUP_ASSIGNED: {
      title: '🛵 Pilot Assigned',
      body: 'Our pickup partner is on the way to collect your garments.',
    },
    PICKED_UP: {
      title: '👔 Garments Picked Up',
      body: 'Your garments have been safely collected and are headed to our care facility.',
    },
    RECEIVED_AT_FACILITY: {
      title: '🏢 Received at Facility',
      body: 'Garments tagged and undergoing expert sorting & inspection.',
    },
    WASHING: {
      title: '🫧 Care in Progress',
      body: 'Your garments are receiving ozone sanitization & eco-wash.',
    },
    DRYING: {
      title: '☀️ Temperature-Controlled Drying',
      body: 'Your garments are in gentle moisture-extracted drying.',
    },
    IRONING: {
      title: '♨️ Steam Pressing Underway',
      body: 'Precision steam pressing & crisp finishing in progress.',
    },
    QUALITY_CHECK: {
      title: '✨ 6-Point Quality Check',
      body: 'Inspecting each seam, collar, and crease for flawless finishing.',
    },
    PACKED: {
      title: '📦 Freshly Packed',
      body: 'Your garments are sanitized, sealed, and ready for dispatch.',
    },
    OUT_FOR_DELIVERY: {
      title: '🚚 Out for Delivery',
      body: 'Our delivery pilot is en route with your crisp, fresh clothes.',
    },
    DELIVERED: {
      title: '🎉 Order Delivered!',
      body: 'Your LaundryFresh order has been handed over. Thank you for choosing us!',
    },
    COMPLETED: {
      title: '✨ Service Completed',
      body: 'We hope your fabrics feel luxurious and brand new. Rate your experience!',
    },
  };
  return messages[status] || {
    title: 'Order update',
    body: `Your order status is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
  };
}

export async function sendPushNotificationToCustomer(
  customerId: string,
  payload: { title: string; body: string; data?: Record<string, string> }
) {
  const devices = await getDevicesForCustomer(customerId);
  if (!devices.length) return;

  const fcmTokens: string[] = [];
  const expoTokens: string[] = [];

  for (const d of devices) {
    if (d.provider === 'EXPO' && d.pushToken.startsWith('ExponentPushToken')) {
      expoTokens.push(d.pushToken);
    } else {
      fcmTokens.push(d.pushToken);
    }
  }

  // 1. Send Firebase Cloud Messaging (FCM) natively
  if (fcmTokens.length > 0) {
    try {
      const messaging = getFirebaseMessaging();
      const response = await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'orders',
            sound: 'default',
            color: '#FF7A00',
            icon: 'ic_stat_notification',
            priority: 'max',
            defaultVibrateTimings: true,
          },
        },
      });

      console.log(
        `[FCM Push] Sent to ${fcmTokens.length} devices. Success: ${response.successCount}, Failed: ${response.failureCount}`
      );

      // Clean up stale tokens
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            removeMobileDevice(customerId, fcmTokens[idx]).catch(() => {});
          }
        }
      });
    } catch (fcmErr) {
      console.error('[FCM Push] Multicast send error:', fcmErr);
    }
  }

  // 2. Send Expo push notifications if any Expo tokens exist
  if (expoTokens.length > 0) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(
          expoTokens.map((to) => ({
            to,
            sound: 'default',
            channelId: 'orders',
            title: payload.title,
            body: payload.body,
            data: payload.data || {},
          }))
        ),
        signal: AbortSignal.timeout(6000),
      });
    } catch (expoErr) {
      console.warn('[Expo Push] Delivery error:', expoErr);
    }
  }
}

export async function sendOrderStatusPushNotification(order: Order, status: OrderStatus) {
  const content = messageForStatus(status);
  await sendPushNotificationToCustomer(order.customerId, {
    title: content.title,
    body: content.body,
    data: {
      orderId: order.id,
      status,
      screen: 'ORDER_DETAIL',
    },
  });
}
