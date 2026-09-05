import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireConfiguredAdmin } from '../../middleware/admin';
import { verifyAccessToken } from '../../lib/customer-tokens';
import {
  sendPushNotificationToCustomer,
  broadcastPushNotification,
  getCustomerNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteCustomerNotification,
  getDeviceStats,
  type PushChannel,
} from '../../lib/push';
import {
  sendEmail,
  verifySmtpConnection,
  sendPickupScheduledNotification,
  sendPickupCompletedNotification,
  sendWashingInProgressNotification,
  sendWashCompleteNotification,
  sendOutForDeliveryNotification,
  sendOrderDeliveredNotification,
} from '../../lib/email';
import {
  OrderEmailData,
  EmailTemplateConfig,
  getEmailTemplatesStore,
  getTemplateById,
  getTemplateByEvent,
  updateEmailTemplateInStore,
  resetEmailTemplateInStore,
  toggleTemplateActiveInStore,
  getPickupScheduledEmail,
  getPickupCompletedEmail,
  getWashingInProgressEmail,
  getWashCompleteEmail,
  getOutForDeliveryEmail,
  getOrderDeliveredEmail,
  getOtpVerificationEmail,
} from '../../lib/emailTemplates';

const router = Router();

const firebasePushSchema = z.object({
  customerId: z.string().trim().min(1).max(255),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(500),
  channel: z.enum(['orders', 'promotions']).default('orders'),
  orderId: z.string().trim().min(1).max(255).optional(),
});

const sampleData: OrderEmailData = {
  orderId: 'LAU-8829',
  customerName: 'Rahul Verma',
  customerEmail: 'rahul.verma@example.com',
  customerPhone: '+91 98765 43210',
  pickupDate: 'Thursday, 28 Aug',
  pickupTimeSlot: '08:00 AM - 10:00 AM',
  deliveryDate: 'Friday, 29 Aug',
  deliveryTimeSlot: '04:00 PM - 06:00 PM',
  pickupAddress: 'Survey 64, Hitech City Main Road, Madhapur, Hyderabad - 500081',
  serviceName: 'Premium Dry Cleaning & Steam Press',
  itemsSummary: [
    { name: 'Formal Shirt (Steam Press)', qty: 3, price: 35 },
    { name: 'Denim Jeans (Wash & Fold)', qty: 2, price: 50 },
    { name: 'Silk Saree (Dry Cleaning)', qty: 1, price: 180 },
  ],
  totalAmount: 425,
  taxAmount: 40,
  deliveryFee: 0,
  paymentStatus: 'PAID',
  paymentMethod: 'UPI / Google Pay',
  driverName: 'Vikram Singh (In-House Fleet)',
  driverPhone: '+91 98765 11001',
  deliveryOtp: '7392',
  trackingUrl: 'https://laundryfresh.in/track/LAU-8829',
};

function renderPreviewForConfig(cfg: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  switch (cfg.event) {
    case 'PICKUP_SCHEDULED':
      return getPickupScheduledEmail(sampleData, cfg);
    case 'PICKUP_COMPLETED':
      return getPickupCompletedEmail(sampleData, cfg);
    case 'WASHING_IN_PROGRESS':
      return getWashingInProgressEmail(sampleData, cfg);
    case 'WASH_COMPLETED':
      return getWashCompleteEmail(sampleData, cfg);
    case 'OUT_FOR_DELIVERY':
      return getOutForDeliveryEmail(sampleData, cfg);
    case 'ORDER_DELIVERED':
      return getOrderDeliveredEmail(sampleData, cfg);
    case 'OTP_VERIFICATION':
      return getOtpVerificationEmail('Rahul Verma', '7392', cfg);
    default:
      return getPickupScheduledEmail(sampleData, cfg);
  }
}

function customerFromRequest(req: Request, res: Response) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ success: false, message: 'Customer sign-in is required.' });
    return null;
  }
  try {
    const customer = verifyAccessToken(token);
    if (!customer.customerId) {
      res.status(401).json({ success: false, message: 'Customer session is incomplete.' });
      return null;
    }
    return customer;
  } catch {
    res.status(401).json({
      success: false,
      message: 'Customer session expired. Please sign in again.',
    });
    return null;
  }
}

/** Customer In-App Notification Feed */
router.get('/', async (req: Request, res: Response) => {
  const customer = customerFromRequest(req, res);
  if (!customer) return;
  const notifications = await getCustomerNotifications(customer.customerId!);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  res.json({ success: true, data: notifications, unreadCount });
});

router.patch('/:id/read', async (req: Request, res: Response) => {
  const customer = customerFromRequest(req, res);
  if (!customer) return;
  const ok = await markNotificationAsRead(customer.customerId!, req.params.id);
  res.json({ success: ok });
});

router.post('/mark-all-read', async (req: Request, res: Response) => {
  const customer = customerFromRequest(req, res);
  if (!customer) return;
  const ok = await markAllNotificationsAsRead(customer.customerId!);
  res.json({ success: ok });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const customer = customerFromRequest(req, res);
  if (!customer) return;
  const ok = await deleteCustomerNotification(customer.customerId!, req.params.id);
  res.json({ success: ok });
});

// 1. Get SMTP Configuration & Connection Status
router.get('/smtp-status', async (req: Request, res: Response) => {
  const result = await verifySmtpConnection();
  res.json({
    success: true,
    data: {
      smtpHost: process.env.SMTP_HOST || 'Not Configured (Simulator Mode)',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER || 'None',
      emailFrom: process.env.EMAIL_FROM || 'notifications@laundryfresh.in',
      ...result,
    },
  });
});

/**
 * Sends one customer notification through Firebase Cloud Messaging only.
 * Firebase service-account credentials remain on the backend; the Admin UI
 * talks solely to this protected endpoint.
 */
router.post('/push', requireConfiguredAdmin, async (req: Request, res: Response) => {
  const parsed = firebasePushSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid Firebase push notification.',
    });
  }

  const input = parsed.data;
  const data: Record<string, string> = input.orderId
    ? { orderId: input.orderId, screen: 'ORDER_DETAIL' }
    : { screen: 'HOME' };

  try {
    const delivery = await sendPushNotificationToCustomer(input.customerId, {
      title: input.title,
      body: input.body,
      data,
      channel: input.channel as PushChannel,
    });

    if (!delivery.targetedDeviceCount) {
      return res.status(409).json({
        success: false,
        message: 'This customer has not registered a Firebase FCM device yet.',
      });
    }

    return res.json({
      success: delivery.failureCount === 0,
      message: `Firebase Cloud Messaging sent to ${delivery.successCount} device(s).`,
      data: delivery,
    });
  } catch (error) {
    console.error('Admin Firebase push error:', error);
    return res.status(502).json({
      success: false,
      message: 'Firebase Cloud Messaging could not deliver this push notification.',
    });
  }
});

const broadcastSchema = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(500),
  channel: z.enum(['orders', 'promotions']).default('promotions'),
  screen: z.string().trim().default('OFFERS'),
  couponCode: z.string().trim().optional(),
});

/**
 * Broadcast push notification to all active registered devices
 */
router.post('/broadcast', requireConfiguredAdmin, async (req: Request, res: Response) => {
  const parsed = broadcastSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message || 'Invalid broadcast payload.',
    });
  }

  const { title, body, channel, screen, couponCode } = parsed.data;
  const data: Record<string, string> = { screen };
  if (couponCode) data.couponCode = couponCode;

  try {
    const delivery = await broadcastPushNotification({
      title,
      body,
      channel: channel as PushChannel,
      data,
    });

    return res.json({
      success: true,
      message: `Broadcast push dispatched to ${delivery.targetedDeviceCount} device(s). Success: ${delivery.successCount}, Failed: ${delivery.failureCount}`,
      data: delivery,
    });
  } catch (error) {
    console.error('Admin Broadcast push error:', error);
    return res.status(502).json({
      success: false,
      message: 'Firebase Cloud Messaging broadcast encountered an error.',
    });
  }
});

/**
 * Get device registration stats for admin dashboard
 */
router.get('/device-stats', requireConfiguredAdmin, async (req: Request, res: Response) => {
  const stats = await getDeviceStats();
  res.json({ success: true, data: stats });
});

// 2. Get All Readymade Email Templates (with live preview HTML and full editable settings)
router.get('/templates', (req: Request, res: Response) => {
  const configs = getEmailTemplatesStore();
  const enriched = configs.map((cfg) => {
    const rendered = renderPreviewForConfig(cfg);
    return {
      ...cfg,
      subject: rendered.subject,
      rawSubject: cfg.subject,
      html: rendered.html,
      text: rendered.text,
    };
  });

  res.json({ success: true, count: enriched.length, data: enriched });
});

// 3. Get Single Email Template
router.get('/templates/:id', (req: Request, res: Response) => {
  const cfg = getTemplateById(req.params.id);
  if (!cfg) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }
  const rendered = renderPreviewForConfig(cfg);
  return res.json({
    success: true,
    data: {
      ...cfg,
      subject: rendered.subject,
      rawSubject: cfg.subject,
      html: rendered.html,
      text: rendered.text,
    },
  });
});

// 4. Update Email Template Settings (Subject, headline, custom message, sender info, active toggle)
router.put('/templates/:id', (req: Request, res: Response) => {
  const updated = updateEmailTemplateInStore(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const rendered = renderPreviewForConfig(updated);
  return res.json({
    success: true,
    message: 'Email template updated successfully',
    data: {
      ...updated,
      subject: rendered.subject,
      rawSubject: updated.subject,
      html: rendered.html,
      text: rendered.text,
    },
  });
});

// 5. Quick Toggle Active/Inactive Status
router.post('/templates/:id/toggle', (req: Request, res: Response) => {
  const isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : undefined;
  const updated = toggleTemplateActiveInStore(req.params.id, isActive);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const rendered = renderPreviewForConfig(updated);
  return res.json({
    success: true,
    message: `Notification template "${updated.name}" is now ${updated.isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
    data: {
      ...updated,
      subject: rendered.subject,
      rawSubject: updated.subject,
      html: rendered.html,
      text: rendered.text,
    },
  });
});

// 6. Reset Template to Default Factory Settings
router.post('/templates/:id/reset', (req: Request, res: Response) => {
  const reset = resetEmailTemplateInStore(req.params.id);
  if (!reset) {
    return res.status(404).json({ success: false, message: 'Template not found' });
  }

  const rendered = renderPreviewForConfig(reset);
  return res.json({
    success: true,
    message: 'Template reset to factory default settings',
    data: {
      ...reset,
      subject: rendered.subject,
      rawSubject: reset.subject,
      html: rendered.html,
      text: rendered.text,
    },
  });
});

// 7. Send Transactional Email for Lifecycle Events
router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { to, templateType, orderData, customSubject, customHtml } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    }

    let result: any;

    switch (templateType) {
      case 'PICKUP_SCHEDULED':
        result = await sendPickupScheduledNotification(to, orderData || { orderId: 'LAU-NEW', customerName: 'Customer' });
        break;
      case 'PICKUP_COMPLETED':
        result = await sendPickupCompletedNotification(to, orderData || { orderId: 'LAU-NEW', customerName: 'Customer' });
        break;
      case 'WASHING_IN_PROGRESS':
        result = await sendWashingInProgressNotification(to, orderData || { orderId: 'LAU-NEW', customerName: 'Customer' });
        break;
      case 'WASH_COMPLETED':
        result = await sendWashCompleteNotification(to, orderData || { orderId: 'LAU-NEW', customerName: 'Customer' });
        break;
      case 'OUT_FOR_DELIVERY':
        result = await sendOutForDeliveryNotification(to, orderData || { orderId: 'LAU-NEW', customerName: 'Customer' });
        break;
      case 'ORDER_DELIVERED':
        result = await sendOrderDeliveredNotification(to, orderData || { orderId: 'LAU-NEW', customerName: 'Customer' });
        break;
      case 'OTP':
      case 'OTP_VERIFICATION':
        return res.status(410).json({
          success: false,
          code: 'FIREBASE_PHONE_AUTH_REQUIRED',
          message: 'Email OTP notifications are disabled. Firebase Phone Authentication sends verification codes.',
        });
      case 'CUSTOM':
      default:
        if (!customSubject || !customHtml) {
          return res.status(400).json({ success: false, message: 'customSubject and customHtml are required for custom emails.' });
        }
        result = await sendEmail({ to, subject: customSubject, html: customHtml });
        break;
    }

    if (result.skipped) {
      return res.json({ success: true, message: result.message || 'Notification skipped (deactivated by admin)', skipped: true });
    }

    if (result.success) {
      return res.json({ success: true, message: `Email dispatched to ${to}`, messageId: result.messageId });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to send email', error: result.error });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 8. Send Test Email (for Admin verification)
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { to, templateId } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    }

    const cfg = (templateId ? getTemplateById(templateId) : null) || getEmailTemplatesStore()[0];
    const rendered = renderPreviewForConfig(cfg);

    const result = await sendEmail({
      to,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    });

    res.json({
      success: result.success,
      message: result.success ? `Test "${cfg.name}" email successfully dispatched to ${to}!` : 'Error sending test email',
      error: result.error,
      messageId: result.messageId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
