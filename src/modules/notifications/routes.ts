import { Router, Request, Response } from 'express';
import {
  sendEmail,
  verifySmtpConnection,
  sendPickupScheduledNotification,
  sendPickupCompletedNotification,
  sendWashingInProgressNotification,
  sendWashCompleteNotification,
  sendOutForDeliveryNotification,
  sendOrderDeliveredNotification,
  sendOtpNotification,
} from '../../lib/email';
import {
  OrderEmailData,
  getPickupScheduledEmail,
  getPickupCompletedEmail,
  getWashingInProgressEmail,
  getWashCompleteEmail,
  getOutForDeliveryEmail,
  getOrderDeliveredEmail,
  getOtpVerificationEmail,
} from '../../lib/emailTemplates';

const router = Router();

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

// 2. Get All Readymade Email Templates (with live preview HTML)
router.get('/templates', (req: Request, res: Response) => {
  const sampleData: OrderEmailData = {
    orderId: 'LAU-8829',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@example.com',
    customerPhone: '+91 98765 43210',
    pickupDate: 'Thursday, 28 Aug',
    pickupTimeSlot: '08:00 AM - 10:00 AM',
    deliveryDate: 'Friday, 29 Aug',
    deliveryTimeSlot: '04:00 PM - 06:00 PM',
    pickupAddress: 'Tower B, Apt 402, Green Glen Layout, Bellandur, Bangalore - 560103',
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

  const templates = [
    {
      id: 'EMAIL-PICKUP-SCHEDULED',
      name: 'Pickup Scheduled & Order Confirmed',
      category: 'ORDER_LIFECYCLE',
      event: 'PICKUP_SCHEDULED',
      description: 'Triggered when customer books a laundry pickup slot.',
      ...getPickupScheduledEmail(sampleData),
    },
    {
      id: 'EMAIL-PICKUP-COMPLETED',
      name: 'Driver Picked Up & Reached Hub',
      category: 'ORDER_LIFECYCLE',
      event: 'PICKUP_COMPLETED',
      description: 'Triggered when valet driver collects the bag and brings it to hub.',
      ...getPickupCompletedEmail(sampleData),
    },
    {
      id: 'EMAIL-WASH-IN-PROGRESS',
      name: 'Washing & Fabric Care In-Progress',
      category: 'ORDER_LIFECYCLE',
      event: 'WASHING_IN_PROGRESS',
      description: 'Triggered when clothes start washing / organic dry cleaning.',
      ...getWashingInProgressEmail(sampleData),
    },
    {
      id: 'EMAIL-WASH-COMPLETED',
      name: 'Wash Complete & Garments Packed',
      category: 'ORDER_LIFECYCLE',
      event: 'WASH_COMPLETED',
      description: 'Triggered when garments are washed, steam pressed, QC inspected, and packed.',
      ...getWashCompleteEmail(sampleData),
    },
    {
      id: 'EMAIL-OUT-FOR-DELIVERY',
      name: 'Out for Delivery (with OTP)',
      category: 'ORDER_LIFECYCLE',
      event: 'OUT_FOR_DELIVERY',
      description: 'Triggered when delivery valet departs hub with the delivery verification OTP.',
      ...getOutForDeliveryEmail(sampleData),
    },
    {
      id: 'EMAIL-ORDER-DELIVERED',
      name: 'Delivered & Tax Invoice Receipt',
      category: 'ORDER_LIFECYCLE',
      event: 'ORDER_DELIVERED',
      description: 'Triggered after successful handover with full invoice and review link.',
      ...getOrderDeliveredEmail(sampleData),
    },
    {
      id: 'EMAIL-OTP-LOGIN',
      name: 'Customer Authentication OTP',
      category: 'AUTH',
      event: 'OTP_VERIFICATION',
      description: 'Sent during phone/email OTP login.',
      ...getOtpVerificationEmail('Rahul Verma', '7392'),
    },
  ];

  res.json({ success: true, count: templates.length, data: templates });
});

// 3. Send Transactional Email for Lifecycle Events
router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { to, templateType, orderData, customSubject, customHtml } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    }

    let result;

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
        result = await sendOtpNotification(to, orderData?.customerName || 'Customer', orderData?.otp || '123456');
        break;
      case 'CUSTOM':
      default:
        if (!customSubject || !customHtml) {
          return res.status(400).json({ success: false, message: 'customSubject and customHtml are required for custom emails.' });
        }
        result = await sendEmail({ to, subject: customSubject, html: customHtml });
        break;
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

// 4. Send Test Email (for Admin verification)
router.post('/test-email', async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, message: 'Recipient email "to" is required.' });
    }

    const testData: OrderEmailData = {
      orderId: 'TEST-1001',
      customerName: 'Admin Tester',
      pickupDate: 'Today',
      pickupTimeSlot: 'Immediate',
      pickupAddress: 'HSR Layout Sector 4, Bangalore',
      totalAmount: 299,
      driverName: 'Fleet Agent 1',
    };

    const result = await sendWashCompleteNotification(to, testData);
    res.json({
      success: result.success,
      message: result.success ? `Test "Wash Complete" email successfully dispatched to ${to}!` : 'Error sending test email',
      error: result.error,
      messageId: result.messageId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
