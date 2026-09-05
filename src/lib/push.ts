import { randomUUID } from 'crypto';
import { pool, isDbConnected } from './mysql';
import { getFirebaseMessaging } from './firebase-admin';
import type { Order, OrderStatus } from '../types';

export type PushProvider = 'FCM';
export type PushChannel = 'orders' | 'promotions';

export interface PushDeliveryResult {
  targetedDeviceCount: number;
  successCount: number;
  failureCount: number;
}

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

export async function registerMobileDevice(input: Omit<MobileDevice, 'id' | 'provider'>) {
  const now = new Date().toISOString();
  const existing = [...fallbackDevices.values()].find((device) => device.pushToken === input.pushToken);
  const device: MobileDevice = existing || { ...input, provider: 'FCM', id: `device_${randomUUID()}` };
  device.customerId = input.customerId;
  device.provider = 'FCM';
  device.platform = input.platform;
  fallbackDevices.set(fallbackKey(input.customerId, input.pushToken), device);

  if (isDbConnected && pool) {
    await pool.query(
      `INSERT INTO mobile_devices (id, customer_id, push_token, provider, platform, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE customer_id = VALUES(customer_id), provider = VALUES(provider), platform = VALUES(platform), updated_at = VALUES(updated_at)`,
      [device.id, input.customerId, input.pushToken, device.provider, input.platform, now, now],
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
      "SELECT id, customer_id, push_token, provider, platform FROM mobile_devices WHERE customer_id = ? AND provider = 'FCM'",
      [customerId],
    ).catch(() => [[]]);
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        customerId: r.customer_id,
        pushToken: r.push_token,
        provider: 'FCM' as const,
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

export interface CustomerNotificationItem {
  id: string;
  customerId: string;
  title: string;
  body: string;
  type: string;
  channel: PushChannel;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

const fallbackNotifications: CustomerNotificationItem[] = [];

export async function saveNotificationToFeed(
  customerId: string,
  title: string,
  body: string,
  channel: PushChannel = 'orders',
  type = 'ORDER',
  data: Record<string, any> = {}
): Promise<CustomerNotificationItem> {
  const item: CustomerNotificationItem = {
    id: `notif_${randomUUID()}`,
    customerId,
    title,
    body,
    type,
    channel,
    data,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isDbConnected && pool) {
    try {
      await pool.query(
        `INSERT INTO customer_notifications (id, customer_id, title, body, type, channel, data, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [item.id, customerId, title, body, type, channel, JSON.stringify(data), item.createdAt]
      );
      return item;
    } catch (err) {
      console.warn('[Push] Error persisting notification to MySQL:', err);
    }
  }

  fallbackNotifications.unshift(item);
  if (fallbackNotifications.length > 200) fallbackNotifications.pop();
  return item;
}

export async function getCustomerNotifications(customerId: string, limit = 50): Promise<CustomerNotificationItem[]> {
  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query(
        `SELECT id, customer_id, title, body, type, channel, data, is_read, created_at
         FROM customer_notifications
         WHERE customer_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [customerId, limit]
      );
      return (rows || []).map((r: any) => ({
        id: r.id,
        customerId: r.customer_id,
        title: r.title,
        body: r.body,
        type: r.type || 'ORDER',
        channel: (r.channel || 'orders') as PushChannel,
        data: typeof r.data === 'string' ? JSON.parse(r.data || '{}') : (r.data || {}),
        isRead: Boolean(r.is_read),
        createdAt: r.created_at,
      }));
    } catch (err) {
      console.warn('[Push] Error querying customer_notifications from MySQL:', err);
    }
  }

  return fallbackNotifications.filter((n) => n.customerId === customerId).slice(0, limit);
}

export async function markNotificationAsRead(customerId: string, notificationId: string): Promise<boolean> {
  if (isDbConnected && pool) {
    try {
      await pool.query(
        'UPDATE customer_notifications SET is_read = 1 WHERE id = ? AND customer_id = ?',
        [notificationId, customerId]
      );
      return true;
    } catch (err) {
      console.warn('[Push] Error marking notification as read:', err);
    }
  }
  const item = fallbackNotifications.find((n) => n.id === notificationId && n.customerId === customerId);
  if (item) {
    item.isRead = true;
    return true;
  }
  return false;
}

export async function markAllNotificationsAsRead(customerId: string): Promise<boolean> {
  if (isDbConnected && pool) {
    try {
      await pool.query(
        'UPDATE customer_notifications SET is_read = 1 WHERE customer_id = ?',
        [customerId]
      );
      return true;
    } catch (err) {
      console.warn('[Push] Error marking all notifications as read:', err);
    }
  }
  fallbackNotifications.forEach((n) => {
    if (n.customerId === customerId) n.isRead = true;
  });
  return true;
}

export async function deleteCustomerNotification(customerId: string, notificationId: string): Promise<boolean> {
  if (isDbConnected && pool) {
    try {
      await pool.query(
        'DELETE FROM customer_notifications WHERE id = ? AND customer_id = ?',
        [notificationId, customerId]
      );
      return true;
    } catch (err) {
      console.warn('[Push] Error deleting customer notification:', err);
    }
  }
  const idx = fallbackNotifications.findIndex((n) => n.id === notificationId && n.customerId === customerId);
  if (idx !== -1) {
    fallbackNotifications.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getDeviceStats() {
  if (isDbConnected && pool) {
    try {
      const [countRows]: any = await pool.query('SELECT COUNT(*) as total FROM mobile_devices');
      const [androidRows]: any = await pool.query("SELECT COUNT(*) as android FROM mobile_devices WHERE platform = 'android'");
      const [iosRows]: any = await pool.query("SELECT COUNT(*) as ios FROM mobile_devices WHERE platform = 'ios'");
      return {
        total: Number(countRows[0]?.total || 0),
        android: Number(androidRows[0]?.android || 0),
        ios: Number(iosRows[0]?.ios || 0),
      };
    } catch (err) {
      console.warn('[Push] Error querying device stats:', err);
    }
  }
  const devices = [...fallbackDevices.values()];
  return {
    total: devices.length,
    android: devices.filter((d) => d.platform === 'android').length,
    ios: devices.filter((d) => d.platform === 'ios').length,
  };
}

export async function sendPushNotificationToCustomer(
  customerId: string,
  payload: { title: string; body: string; data?: Record<string, string>; channel?: PushChannel; type?: string }
): Promise<PushDeliveryResult> {
  const channel = payload.channel || 'orders';
  const type = payload.type || (channel === 'promotions' ? 'OFFER' : 'ORDER');

  // Always save into customer in-app notification feed so they can see it when opening the app
  await saveNotificationToFeed(customerId, payload.title, payload.body, channel, type, payload.data || {});

  const devices = await getDevicesForCustomer(customerId);
  const fcmTokens = devices.map((device) => device.pushToken);
  if (!fcmTokens.length) {
    return { targetedDeviceCount: 0, successCount: 0, failureCount: 0 };
  }

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
          channelId: channel,
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

    // Remove Firebase tokens that are permanently invalid. Legacy Expo rows are
    // excluded at query time and are never sent through an Expo endpoint.
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

    return {
      targetedDeviceCount: fcmTokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('[FCM Push] Multicast send error:', error);
    throw error;
  }
}

export async function broadcastPushNotification(payload: {
  title: string;
  body: string;
  channel?: PushChannel;
  data?: Record<string, string>;
}): Promise<PushDeliveryResult> {
  const channel = payload.channel || 'promotions';
  let devices: { customerId: string; pushToken: string }[] = [];

  if (isDbConnected && pool) {
    try {
      const [rows]: any = await pool.query(
        "SELECT customer_id, push_token FROM mobile_devices WHERE provider = 'FCM'"
      );
      devices = (rows || []).map((r: any) => ({
        customerId: r.customer_id,
        pushToken: r.push_token,
      }));
    } catch (err) {
      console.warn('[Push] Error querying broadcast devices from MySQL:', err);
    }
  } else {
    devices = [...fallbackDevices.values()].map((d) => ({ customerId: d.customerId, pushToken: d.pushToken }));
  }

  const fcmTokens = Array.from(new Set(devices.map((d) => d.pushToken)));
  if (!fcmTokens.length) {
    return { targetedDeviceCount: 0, successCount: 0, failureCount: 0 };
  }

  // Also record in-app notifications for targeted customers
  const uniqueCustomerIds = Array.from(new Set(devices.map((d) => d.customerId)));
  for (const cid of uniqueCustomerIds) {
    saveNotificationToFeed(cid, payload.title, payload.body, channel, 'OFFER', payload.data || {}).catch(() => {});
  }

  let totalSuccess = 0;
  let totalFailure = 0;
  const messaging = getFirebaseMessaging();

  // Firebase multicast maximum batch size is 500
  const batchSize = 500;
  for (let i = 0; i < fcmTokens.length; i += batchSize) {
    const batch = fcmTokens.slice(i, i + batchSize);
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: channel,
            sound: 'default',
            color: '#FF7A00',
            icon: 'ic_stat_notification',
            priority: 'max',
            defaultVibrateTimings: true,
          },
        },
      });

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            const badToken = batch[idx];
            const matched = devices.find((d) => d.pushToken === badToken);
            if (matched) {
              removeMobileDevice(matched.customerId, badToken).catch(() => {});
            }
          }
        }
      });
    } catch (batchErr) {
      console.error('[FCM Broadcast] Batch error:', batchErr);
      totalFailure += batch.length;
    }
  }

  return {
    targetedDeviceCount: fcmTokens.length,
    successCount: totalSuccess,
    failureCount: totalFailure,
  };
}

export async function sendOrderStatusPushNotification(order: Order, status: OrderStatus) {
  const content = messageForStatus(status);
  await sendPushNotificationToCustomer(order.customerId, {
    title: content.title,
    body: content.body,
    channel: 'orders',
    type: 'ORDER',
    data: {
      orderId: order.id,
      status,
      screen: 'ORDER_DETAIL',
    },
  });
}
