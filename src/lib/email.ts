import nodemailer from 'nodemailer';
import {
  OrderEmailData,
  getPickupScheduledEmail,
  getPickupCompletedEmail,
  getWashingInProgressEmail,
  getWashCompleteEmail,
  getOutForDeliveryEmail,
  getOrderDeliveredEmail,
  getOtpVerificationEmail,
  getWelcomeCustomerEmail,
  getAdminNewOrderAlertEmail,
} from './emailTemplates';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const EMAIL_FROM = process.env.EMAIL_FROM || '"LaundryFresh Notifications" <notifications@laundryfresh.in>';
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || SMTP_USER || 'anushabazaar4@gmail.com';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    } else {
      // Fallback in dev: use a JSON or test transporter
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
      });
    }
  }
  return transporter;
}

export async function verifySmtpConnection(): Promise<{ isConnected: boolean; message: string }> {
  try {
    if (!SMTP_HOST || !SMTP_USER) {
      return {
        isConnected: false,
        message: 'SMTP credentials not configured in backend/.env (using development fallback simulator)',
      };
    }
    const t = getTransporter();
    await t.verify();
    return { isConnected: true, message: `SMTP connected to ${SMTP_HOST}:${SMTP_PORT}` };
  } catch (error: any) {
    return { isConnected: false, message: `SMTP Error: ${error.message}` };
  }
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
  message?: string;
}

export async function sendEmail(opts: SendMailOptions): Promise<SendEmailResult> {
  try {
    const t = getTransporter();
    const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

    if (!isConfigured) {
      console.log(`\n======================================================`);
      console.log(`[EMAIL SIMULATOR] To: ${opts.to}`);
      console.log(`[EMAIL SIMULATOR] Subject: ${opts.subject}`);
      console.log(`[EMAIL SIMULATOR] (Configure SMTP_HOST, SMTP_USER, SMTP_PASS in backend/.env to send real emails)`);
      console.log(`======================================================\n`);
      return { success: true, messageId: `simulated-${Date.now()}` };
    }

    const info = await t.sendMail({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    console.log(`✓ [EMAIL SENT] MessageId: ${info.messageId} to ${opts.to} (${opts.subject})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`✗ [EMAIL ERROR] Failed sending to ${opts.to}:`, err.message);
    return { success: false, error: err.message };
  }
}

// Readymade Lifecycle Email Helpers (Checks Admin Active/Inactive Status)
export async function sendPickupScheduledNotification(to: string, data: OrderEmailData) {
  const { subject, html, text, isActive } = getPickupScheduledEmail(data);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "Pickup Scheduled" notification is DEACTIVATED in Admin Panel for Order #${data.orderId}`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendPickupCompletedNotification(to: string, data: OrderEmailData) {
  const { subject, html, text, isActive } = getPickupCompletedEmail(data);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "Pickup Completed" notification is DEACTIVATED in Admin Panel for Order #${data.orderId}`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendWashingInProgressNotification(to: string, data: OrderEmailData) {
  const { subject, html, text, isActive } = getWashingInProgressEmail(data);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "Washing In-Progress" notification is DEACTIVATED in Admin Panel for Order #${data.orderId}`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendWashCompleteNotification(to: string, data: OrderEmailData) {
  const { subject, html, text, isActive } = getWashCompleteEmail(data);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "Wash Complete" notification is DEACTIVATED in Admin Panel for Order #${data.orderId}`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendOutForDeliveryNotification(to: string, data: OrderEmailData) {
  const { subject, html, text, isActive } = getOutForDeliveryEmail(data);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "Out for Delivery" notification is DEACTIVATED in Admin Panel for Order #${data.orderId}`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendOrderDeliveredNotification(to: string, data: OrderEmailData) {
  const { subject, html, text, isActive } = getOrderDeliveredEmail(data);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "Order Delivered" notification is DEACTIVATED in Admin Panel for Order #${data.orderId}`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendOtpNotification(to: string, name: string, otp: string) {
  const { subject, html, text, isActive } = getOtpVerificationEmail(name, otp);
  if (!isActive) {
    console.log(`[EMAIL SKIPPED] "OTP Verification" notification is DEACTIVATED in Admin Panel`);
    return { success: true, skipped: true, message: 'Notification deactivated by Admin' };
  }
  return sendEmail({ to, subject, html, text });
}

export async function sendWelcomeCustomerNotification(to: string, name: string, email: string, phone: string) {
  const { subject, html, text } = getWelcomeCustomerEmail(name, email, phone);
  return sendEmail({ to, subject, html, text });
}

export async function sendAdminOrderAlert(data: OrderEmailData) {
  const { subject, html, text } = getAdminNewOrderAlertEmail(data);
  return sendEmail({ to: ADMIN_ALERT_EMAIL, subject, html, text });
}

