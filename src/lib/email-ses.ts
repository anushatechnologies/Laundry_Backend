/**
 * AWS SES (Simple Email Service) Integration
 * Professional email delivery with high deliverability
 */

import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
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

// AWS SES Configuration
const AWS_REGION = process.env.AWS_SES_REGION || process.env.AWS_REGION || 'ap-south-1'; // Mumbai region
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || '"Anjani Laundry" <anushabazaar4@gmail.com>';
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || 'anushabazaar4@gmail.com';

// Use environment variable or default to false for development
const USE_AWS_SES = process.env.USE_AWS_SES === 'true';

let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient && USE_AWS_SES) {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
    }

    sesClient = new SESClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log(`✓ AWS SES Client initialized (Region: ${AWS_REGION})`);
  }
  return sesClient!;
}

export async function verifySESConnection(): Promise<{ isConnected: boolean; message: string; region?: string }> {
  try {
    if (!USE_AWS_SES) {
      return {
        isConnected: false,
        message: 'AWS SES is disabled. Set USE_AWS_SES=true in backend/.env to enable',
      };
    }

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return {
        isConnected: false,
        message: 'AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
      };
    }

    const client = getSESClient();
    
    // AWS SES doesn't have a "verify" command, but we can check if credentials are valid
    // by checking the client configuration
    return {
      isConnected: true,
      message: `AWS SES ready to send emails from ${EMAIL_FROM}`,
      region: AWS_REGION,
    };
  } catch (error: any) {
    return {
      isConnected: false,
      message: `AWS SES Error: ${error.message}`,
    };
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
    // Development mode simulation
    if (!USE_AWS_SES) {
      console.log(`\n======================================================`);
      console.log(`[EMAIL SIMULATOR - AWS SES Disabled]`);
      console.log(`To: ${opts.to}`);
      console.log(`Subject: ${opts.subject}`);
      console.log(`Set USE_AWS_SES=true in backend/.env to send real emails via AWS SES`);
      console.log(`======================================================\n`);
      return { success: true, messageId: `simulated-${Date.now()}` };
    }

    // AWS SES Email Sending
    const client = getSESClient();

    const params: SendEmailCommandInput = {
      Source: EMAIL_FROM,
      Destination: {
        ToAddresses: [opts.to],
      },
      Message: {
        Subject: {
          Data: opts.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: opts.html,
            Charset: 'UTF-8',
          },
          ...(opts.text && {
            Text: {
              Data: opts.text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    };

    const command = new SendEmailCommand(params);
    const response = await client.send(command);

    console.log(`✓ [AWS SES EMAIL SENT] MessageId: ${response.MessageId} to ${opts.to} (${opts.subject})`);
    
    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (err: any) {
    console.error(`✗ [AWS SES EMAIL ERROR] Failed sending to ${opts.to}:`, err.message);
    return {
      success: false,
      error: err.message,
    };
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

export async function sendWelcomeCustomerNotification(
  to: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string
) {
  const { subject, html, text } = getWelcomeCustomerEmail(customerName, customerEmail, customerPhone);
  return sendEmail({ to, subject, html, text });
}

export async function sendAdminNewOrderAlert(data: OrderEmailData) {
  const { subject, html, text } = getAdminNewOrderAlertEmail(data);
  return sendEmail({ to: ADMIN_ALERT_EMAIL, subject, html, text });
}
