// Readymade High-Aesthetic Transactional Email Templates for LaundryFresh Platform

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupDate?: string;
  pickupTimeSlot?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  pickupAddress?: string;
  serviceName?: string;
  itemsSummary?: { name: string; qty: number; price?: number; service?: string }[];
  totalAmount?: number;
  taxAmount?: number;
  deliveryFee?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryOtp?: string;
  trackingUrl?: string;
  weightKg?: number;
  specialNotes?: string;
  otp?: string;
}

export interface EmailTemplateConfig {
  id: string;
  name: string;
  category: string;
  event: string;
  description: string;
  isActive: boolean;
  subject: string;
  headline: string;
  subheadline: string;
  customMessage: string;
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  ctaText: string;
  footerNote: string;
  senderName: string;
  senderEmail: string;
  supportPhone: string;
  supportEmail: string;
  icon: string;
  updatedAt?: string;
}

const BRAND_PRIMARY = '#16A34A';
const BRAND_DARK = '#0F172A';
const BG_LIGHT = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const TEXT_MUTED = '#64748B';

// Factory Default Template Configurations
export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateConfig[] = [
  {
    id: 'EMAIL-PICKUP-SCHEDULED',
    name: 'Pickup Scheduled & Order Confirmed',
    category: 'ORDER_LIFECYCLE',
    event: 'PICKUP_SCHEDULED',
    description: 'Triggered when customer books a laundry pickup slot.',
    isActive: true,
    subject: '🧺 Pickup Scheduled! - Order #{{orderId}} Confirmed',
    headline: 'Pickup Scheduled!',
    subheadline: 'Hello {{customerName}}, our valet driver is assigned for your doorstep pickup.',
    customMessage: 'Please ensure your garments are ready in a bag for the pickup valet inspection.',
    badgeText: 'Pickup Confirmed',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
    ctaText: 'Track Pickup Live →',
    footerNote: 'Keep your laundry bag ready for driver inspection at scheduled time.',
    senderName: 'LaundryFresh Notifications',
    senderEmail: 'notifications@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '🧺',
  },
  {
    id: 'EMAIL-PICKUP-COMPLETED',
    name: 'Driver Picked Up & Reached Hub',
    category: 'ORDER_LIFECYCLE',
    event: 'PICKUP_COMPLETED',
    description: 'Triggered when valet driver collects the bag and brings it to hub.',
    isActive: true,
    subject: '🚚 Clothes Collected! - Order #{{orderId}} Arrived at Hub',
    headline: 'Clothes Safely Collected!',
    subheadline: 'Order #{{orderId}} has reached our main processing facility.',
    customMessage: 'Our garment care experts are currently sorting fabrics according to care labels.',
    badgeText: 'At Processing Hub',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    ctaText: 'View Order Status →',
    footerNote: 'Individual barcode tagging ensures 100% garment tracking.',
    senderName: 'LaundryFresh Notifications',
    senderEmail: 'notifications@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '🚚',
  },
  {
    id: 'EMAIL-WASH-IN-PROGRESS',
    name: 'Washing & Fabric Care In-Progress',
    category: 'ORDER_LIFECYCLE',
    event: 'WASHING_IN_PROGRESS',
    description: 'Triggered when clothes start washing / organic dry cleaning.',
    isActive: true,
    subject: '🫧 Washing In-Progress - Order #{{orderId}}',
    headline: 'Fabric Care In-Progress!',
    subheadline: 'Your clothes are undergoing eco-friendly washing and organic steam processing.',
    customMessage: 'We use RO water and hypoallergenic German detergents for optimal fabric hygiene.',
    badgeText: 'Washing In Progress',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    ctaText: 'Track Live Progress →',
    footerNote: 'Gentle temperature-controlled cycle ensures fabric longevity.',
    senderName: 'LaundryFresh Notifications',
    senderEmail: 'notifications@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '🫧',
  },
  {
    id: 'EMAIL-WASH-COMPLETED',
    name: 'Wash Complete & Garments Packed',
    category: 'ORDER_LIFECYCLE',
    event: 'WASH_COMPLETED',
    description: 'Triggered when garments are washed, steam pressed, QC inspected, and packed.',
    isActive: true,
    subject: '✨ Your Wash is Complete! - Order #{{orderId}} is Fresh & Ready',
    headline: 'Your Wash is Complete!',
    subheadline: 'Hello {{customerName}}, your clothes have been freshly laundered, steam pressed, and carefully packed.',
    customMessage: 'Multi-stage QC inspection passed. Garments are sealed in eco-friendly protective packaging.',
    badgeText: '100% Quality Checked',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
    ctaText: 'View Order Details →',
    footerNote: 'Garments will be dispatched in the next available delivery window.',
    senderName: 'LaundryFresh Notifications',
    senderEmail: 'notifications@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '✨',
  },
  {
    id: 'EMAIL-OUT-FOR-DELIVERY',
    name: 'Out for Delivery (with OTP)',
    category: 'ORDER_LIFECYCLE',
    event: 'OUT_FOR_DELIVERY',
    description: 'Triggered when delivery valet departs hub with the delivery verification OTP.',
    isActive: true,
    subject: '🚀 Out for Delivery! - Order #{{orderId}} (OTP: {{deliveryOtp}})',
    headline: 'Out for Delivery!',
    subheadline: 'Our delivery valet is on the way with your freshly pressed clothes.',
    customMessage: 'Please share the Secure Delivery OTP with your valet driver upon doorstep handover.',
    badgeText: 'Out for Delivery',
    badgeBg: '#EDE9FE',
    badgeColor: '#6D28D9',
    ctaText: 'Track Delivery Valet →',
    footerNote: 'Please keep the OTP ready for contactless verification.',
    senderName: 'LaundryFresh Notifications',
    senderEmail: 'notifications@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '🚀',
  },
  {
    id: 'EMAIL-ORDER-DELIVERED',
    name: 'Delivered & Tax Invoice Receipt',
    category: 'ORDER_LIFECYCLE',
    event: 'ORDER_DELIVERED',
    description: 'Triggered after successful handover with full invoice and review link.',
    isActive: true,
    subject: '🎉 Delivered! - Order #{{orderId}} Tax Invoice & Receipt',
    headline: 'Order Delivered!',
    subheadline: 'Thank you for choosing LaundryFresh. Your clothes have been safely delivered.',
    customMessage: 'We hope you love the fresh, crisp quality! Please rate your valet service experience.',
    badgeText: 'Delivered Successfully',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
    ctaText: 'Download Tax Invoice →',
    footerNote: 'Need any revisions or have questions? Contact our support team within 24 hours.',
    senderName: 'LaundryFresh Notifications',
    senderEmail: 'notifications@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '🎉',
  },
  {
    id: 'EMAIL-OTP-LOGIN',
    name: 'Customer Authentication OTP',
    category: 'AUTH',
    event: 'OTP_VERIFICATION',
    description: 'Sent during phone/email OTP login.',
    isActive: true,
    subject: '🔐 {{deliveryOtp}} is your LaundryFresh Verification Code',
    headline: 'Verification Code',
    subheadline: 'Hello {{customerName}}, use this one-time password to securely access your account.',
    customMessage: 'Never share this code with anyone. LaundryFresh staff will never ask for your password or OTP.',
    badgeText: 'Valid for 10 Mins',
    badgeBg: '#FEF2F2',
    badgeColor: '#B91C1C',
    ctaText: 'Verify & Sign In →',
    footerNote: 'If you did not request this OTP, please contact support immediately.',
    senderName: 'LaundryFresh Security',
    senderEmail: 'security@laundryfresh.in',
    supportPhone: '+91 40 4567 8901',
    supportEmail: 'support@anushatechnologies.com',
    icon: '🔐',
  },
];

// In-memory editable templates store
let emailTemplatesStore: EmailTemplateConfig[] = JSON.parse(JSON.stringify(DEFAULT_EMAIL_TEMPLATES));

export function getEmailTemplatesStore(): EmailTemplateConfig[] {
  return emailTemplatesStore;
}

export function getTemplateById(id: string): EmailTemplateConfig | undefined {
  return emailTemplatesStore.find((t) => t.id === id);
}

export function getTemplateByEvent(event: string): EmailTemplateConfig | undefined {
  return emailTemplatesStore.find((t) => t.event === event);
}

export function updateEmailTemplateInStore(id: string, updates: Partial<EmailTemplateConfig>): EmailTemplateConfig | null {
  const idx = emailTemplatesStore.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  emailTemplatesStore[idx] = {
    ...emailTemplatesStore[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return emailTemplatesStore[idx];
}

export function resetEmailTemplateInStore(id: string): EmailTemplateConfig | null {
  const defaultT = DEFAULT_EMAIL_TEMPLATES.find((t) => t.id === id);
  if (!defaultT) return null;

  const idx = emailTemplatesStore.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  emailTemplatesStore[idx] = JSON.parse(JSON.stringify(defaultT));
  emailTemplatesStore[idx].updatedAt = new Date().toISOString();
  return emailTemplatesStore[idx];
}

export function toggleTemplateActiveInStore(id: string, isActive?: boolean): EmailTemplateConfig | null {
  const template = emailTemplatesStore.find((t) => t.id === id);
  if (!template) return null;

  template.isActive = isActive !== undefined ? isActive : !template.isActive;
  template.updatedAt = new Date().toISOString();
  return template;
}

export function interpolatePlaceholders(templateStr: string, data: OrderEmailData): string {
  if (!templateStr) return '';
  return templateStr
    .replace(/\{\{\s*orderId\s*\}\}/g, data.orderId || 'LAU-8829')
    .replace(/\{\{\s*customerName\s*\}\}/g, data.customerName || 'Valued Customer')
    .replace(/\{\{\s*customerEmail\s*\}\}/g, data.customerEmail || 'customer@example.com')
    .replace(/\{\{\s*customerPhone\s*\}\}/g, data.customerPhone || '+91 98765 43210')
    .replace(/\{\{\s*pickupDate\s*\}\}/g, data.pickupDate || 'Today')
    .replace(/\{\{\s*pickupTimeSlot\s*\}\}/g, data.pickupTimeSlot || '08:00 AM - 10:00 AM')
    .replace(/\{\{\s*deliveryDate\s*\}\}/g, data.deliveryDate || 'Tomorrow')
    .replace(/\{\{\s*deliveryTimeSlot\s*\}\}/g, data.deliveryTimeSlot || '04:00 PM - 06:00 PM')
    .replace(/\{\{\s*pickupAddress\s*\}\}/g, data.pickupAddress || 'Customer Doorstep Address')
    .replace(/\{\{\s*serviceName\s*\}\}/g, data.serviceName || 'Premium Dry Cleaning & Steam Press')
    .replace(/\{\{\s*totalAmount\s*\}\}/g, String(data.totalAmount || 425))
    .replace(/\{\{\s*taxAmount\s*\}\}/g, String(data.taxAmount || 40))
    .replace(/\{\{\s*deliveryFee\s*\}\}/g, String(data.deliveryFee || 0))
    .replace(/\{\{\s*paymentStatus\s*\}\}/g, data.paymentStatus || 'PAID')
    .replace(/\{\{\s*paymentMethod\s*\}\}/g, data.paymentMethod || 'UPI / Online')
    .replace(/\{\{\s*driverName\s*\}\}/g, data.driverName || 'Vikram Singh (In-House Fleet)')
    .replace(/\{\{\s*driverPhone\s*\}\}/g, data.driverPhone || '+91 98765 11001')
    .replace(/\{\{\s*deliveryOtp\s*\}\}/g, data.deliveryOtp || data.otp || '7392')
    .replace(/\{\{\s*trackingUrl\s*\}\}/g, data.trackingUrl || 'https://laundryfresh.in/track/' + (data.orderId || 'LAU-8829'));
}

function getEmailWrapper(title: string, preheader: string, contentHtml: string, config?: EmailTemplateConfig): string {
  const senderName = config?.senderName || 'LaundryFresh';
  const supportPhone = config?.supportPhone || '+91 40 4567 8901';
  const supportEmail = config?.supportEmail || 'support@anushatechnologies.com';

  return '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>' + title + '</title>' +
'  <style>' +
'    body { margin: 0; padding: 0; background-color: ' + BG_LIGHT + '; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }' +
'    table { border-collapse: collapse; }' +
'    img { border: 0; outline: none; text-decoration: none; }' +
'    .btn { display: inline-block; background-color: ' + BRAND_PRIMARY + '; color: #FFFFFF !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25); }' +
'    .card { background-color: ' + CARD_BG + '; border-radius: 16px; border: 1px solid #E2E8F0; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }' +
'    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }' +
'  </style>' +
'</head>' +
'<body style="background-color: ' + BG_LIGHT + '; padding: 30px 10px;">' +
'  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; color: transparent;">' +
'    ' + preheader +
'  </div>' +
'  <center>' +
'    <table width="100%" style="max-width: 600px; text-align: left;" cellpadding="0" cellspacing="0">' +
'      <tr>' +
'        <td style="padding: 0 0 20px 0; text-align: center;">' +
'          <table width="100%">' +
'            <tr>' +
'              <td align="center">' +
'                <div style="display: inline-flex; align-items: center; gap: 8px;">' +
'                  <span style="font-size: 24px; font-weight: 900; color: ' + BRAND_DARK + '; letter-spacing: -0.5px;">' +
'                    🧺 <span style="color: ' + BRAND_PRIMARY + ';">' + (senderName.split(' ')[0] || 'Laundry') + '</span>' + (senderName.split(' ').slice(1).join(' ') || 'Fresh') +
'                  </span>' +
'                </div>' +
'                <div style="font-size: 11px; font-weight: 600; color: ' + TEXT_MUTED + '; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">' +
'                  Doorstep Clean & Fabric Care' +
'                </div>' +
'              </td>' +
'            </tr>' +
'          </table>' +
'        </td>' +
'      </tr>' +
'      <tr>' +
'        <td>' +
'          <div class="card">' +
'            ' + contentHtml +
'          </div>' +
'        </td>' +
'      </tr>' +
'      <tr>' +
'        <td style="text-align: center; padding: 10px 20px; font-size: 12px; color: ' + TEXT_MUTED + '; line-height: 1.6;">' +
'          <p style="margin: 0 0 8px 0;">' +
'            Need assistance? Support hotline available at <strong style="color: ' + BRAND_DARK + ';">' + supportPhone + '</strong> or email <a href="mailto:' + supportEmail + '" style="color: ' + BRAND_PRIMARY + '; text-decoration: none;">' + supportEmail + '</a>' +
'          </p>' +
'          <p style="margin: 0; font-size: 11px; color: #94A3B8;">' +
'            © ' + new Date().getFullYear() + ' ' + senderName + '. All rights reserved.<br/>' +
'            Anusha Bazaar, Kukatpally, Hyderabad - 500072' +
'          </p>' +
'        </td>' +
'      </tr>' +
'    </table>' +
'  </center>' +
'</body>' +
'</html>';
}

// 1. Template: Pickup Scheduled & Order Confirmed
export function getPickupScheduledEmail(data: OrderEmailData, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('PICKUP_SCHEDULED') || DEFAULT_EMAIL_TEMPLATES[0];
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || 'Pickup Confirmed';
  const ctaText = config.ctaText || 'Track Pickup Live →';
  const footerNote = interpolatePlaceholders(config.footerNote, data);
  const trackingUrl = data.trackingUrl || ('https://laundryfresh.in/track/' + (data.orderId || ''));

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #DCFCE7; color: #16A34A; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '🧺') +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px dashed #CBD5E1;">' +
    '  <table width="100%" cellpadding="0" cellspacing="0">' +
    '    <tr>' +
    '      <td>' +
    '        <div style="font-size: 11px; color: ' + TEXT_MUTED + '; font-weight: 700; text-transform: uppercase;">Order Reference</div>' +
    '        <div style="font-size: 16px; font-weight: 800; color: ' + BRAND_DARK + '; font-family: monospace;">#' + data.orderId + '</div>' +
    '      </td>' +
    '      <td align="right">' +
    '        <span class="badge" style="background-color: ' + (config.badgeBg || '#DCFCE7') + '; color: ' + (config.badgeColor || '#15803D') + ';">' +
    '          ' + badgeText +
    '        </span>' +
    '      </td>' +
    '    </tr>' +
    '  </table>' +
    '</div>' +
    (customMessage ? 
    '<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #166534;">' +
    '  ℹ️ <strong>Instructions:</strong> ' + customMessage +
    '</div>' : '') +
    '<div style="margin-bottom: 24px;">' +
    '  <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ' + BRAND_DARK + '; margin: 0 0 12px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">' +
    '    📅 Scheduled Timings & Location' +
    '  </h3>' +
    '  <table width="100%" style="font-size: 13px;" cellpadding="6" cellspacing="0">' +
    '    <tr>' +
    '      <td width="35%" style="color: ' + TEXT_MUTED + '; font-weight: 600;">Pickup Slot:</td>' +
    '      <td style="font-weight: 700; color: ' + BRAND_DARK + ';">' + (data.pickupDate || 'Today') + ', ' + (data.pickupTimeSlot || '08:00 AM - 10:00 AM') + '</td>' +
    '    </tr>' +
    '    <tr>' +
    '      <td style="color: ' + TEXT_MUTED + '; font-weight: 600;">Pickup Address:</td>' +
    '      <td style="font-weight: 600; color: ' + BRAND_DARK + ';">' + (data.pickupAddress || 'Customer Registered Address') + '</td>' +
    '    </tr>' +
    (data.driverName ? 
    '    <tr>' +
    '      <td style="color: ' + TEXT_MUTED + '; font-weight: 600;">Assigned Driver:</td>' +
    '      <td style="font-weight: 700; color: #0284C7;">' + data.driverName + (data.driverPhone ? ' (' + data.driverPhone + ')' : '') + '</td>' +
    '    </tr>' : '') +
    (data.deliveryDate ? 
    '    <tr>' +
    '      <td style="color: ' + TEXT_MUTED + '; font-weight: 600;">Est. Delivery:</td>' +
    '      <td style="font-weight: 700; color: #16A34A;">' + data.deliveryDate + ' (' + (data.deliveryTimeSlot || 'Standard Delivery') + ')</td>' +
    '    </tr>' : '') +
    '  </table>' +
    '</div>' +
    '<div style="text-align: center; margin: 32px 0 12px 0;">' +
    '  <a href="' + trackingUrl + '" class="btn" target="_blank">' +
    '    ' + ctaText +
    '  </a>' +
    '  <div style="font-size: 11px; color: ' + TEXT_MUTED + '; margin-top: 10px;">' +
    '    ' + footerNote +
    '  </div>' +
    '</div>';

  const html = getEmailWrapper(headline, 'Your laundry pickup for Order #' + data.orderId + ' is confirmed.', contentHtml, config);
  const text = (config.senderName || 'LaundryFresh') + ' - ' + headline + '\nOrder #' + data.orderId + '\n' + subheadline + '\nTrack: ' + trackingUrl;

  return { subject, html, text, isActive: config.isActive };
}

// 2. Template: Pickup Completed / Reached Hub
export function getPickupCompletedEmail(data: OrderEmailData, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('PICKUP_COMPLETED') || DEFAULT_EMAIL_TEMPLATES[1];
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || 'At Processing Hub';
  const ctaText = config.ctaText || 'View Order Status →';
  const footerNote = interpolatePlaceholders(config.footerNote, data);
  const trackingUrl = data.trackingUrl || ('https://laundryfresh.in/track/' + (data.orderId || ''));

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #E0F2FE; color: #0284C7; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '🚚') +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin-bottom: 24px;">' +
    '  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">' +
    '    <span style="font-size: 12px; font-weight: 700; color: #64748B;">STATUS</span>' +
    '    <span class="badge" style="background-color: ' + (config.badgeBg || '#E0F2FE') + '; color: ' + (config.badgeColor || '#0369A1') + ';">' + badgeText + '</span>' +
    '  </div>' +
    '  <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0F172A;">Next Care Steps:</h4>' +
    '  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">' +
    '    <li>Fabric sorting according to garment care labels</li>' +
    '    <li>Pre-wash stain inspection under high-lumen lighting</li>' +
    '    <li>Individual barcode tagging for 100% garment tracking</li>' +
    '  </ul>' +
    (customMessage ? '<p style="margin: 12px 0 0 0; font-size: 12px; color: #0284C7; font-weight: 600;">ℹ️ ' + customMessage + '</p>' : '') +
    '</div>' +
    '<div style="text-align: center; margin: 28px 0 12px 0;">' +
    '  <a href="' + trackingUrl + '" class="btn" style="background-color: #0284C7;" target="_blank">' +
    '    ' + ctaText +
    '  </a>' +
    '  <div style="font-size: 11px; color: ' + TEXT_MUTED + '; margin-top: 10px;">' +
    '    ' + footerNote +
    '  </div>' +
    '</div>';

  const html = getEmailWrapper(headline, 'Order #' + data.orderId + ' has reached our facility.', contentHtml, config);
  const text = (config.senderName || 'LaundryFresh') + ' - ' + headline + '\nOrder #' + data.orderId + '\n' + subheadline + '\nTrack: ' + trackingUrl;

  return { subject, html, text, isActive: config.isActive };
}

// 3. Template: Washing In-Progress
export function getWashingInProgressEmail(data: OrderEmailData, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('WASHING_IN_PROGRESS') || DEFAULT_EMAIL_TEMPLATES[2];
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || 'Washing In Progress';
  const ctaText = config.ctaText || 'Track Live Progress →';
  const footerNote = interpolatePlaceholders(config.footerNote, data);
  const trackingUrl = data.trackingUrl || ('https://laundryfresh.in/track/' + (data.orderId || ''));

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #FEF3C7; color: #D97706; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '🫧') +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #FFFBEB; border-radius: 12px; padding: 20px; border: 1px solid #FDE68A; margin-bottom: 24px;">' +
    '  <div style="font-size: 12px; font-weight: 800; color: #92400E; text-transform: uppercase; margin-bottom: 8px;">' +
    '    ✨ Premium Processing Details' +
    '  </div>' +
    '  <p style="margin: 0; font-size: 13px; color: #78350F; line-height: 1.6;">' +
    '    ' + (customMessage || 'We use softened RO water, antibacterial eco-detergents, and Italian steam iron finishes to protect delicate fabrics.') +
    '  </p>' +
    '</div>' +
    '<div style="text-align: center; margin: 28px 0 12px 0;">' +
    '  <a href="' + trackingUrl + '" class="btn" style="background-color: #D97706;" target="_blank">' +
    '    ' + ctaText +
    '  </a>' +
    '  <div style="font-size: 11px; color: ' + TEXT_MUTED + '; margin-top: 10px;">' +
    '    ' + footerNote +
    '  </div>' +
    '</div>';

  const html = getEmailWrapper(headline, 'Your clothes for Order #' + data.orderId + ' are being processed.', contentHtml, config);
  const text = (config.senderName || 'LaundryFresh') + ' - ' + headline + '\nOrder #' + data.orderId + '\n' + subheadline + '\nTrack: ' + trackingUrl;

  return { subject, html, text, isActive: config.isActive };
}

// 4. Template: Wash Complete & Garments Packed
export function getWashCompleteEmail(data: OrderEmailData, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('WASH_COMPLETED') || DEFAULT_EMAIL_TEMPLATES[3];
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || '100% Quality Checked';
  const ctaText = config.ctaText || 'View Order Details →';
  const footerNote = interpolatePlaceholders(config.footerNote, data);
  const trackingUrl = data.trackingUrl || ('https://laundryfresh.in/track/' + (data.orderId || ''));

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #DCFCE7; color: #16A34A; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '✨') +
    '  </div>' +
    '  <span class="badge" style="background-color: ' + (config.badgeBg || '#DCFCE7') + '; color: ' + (config.badgeColor || '#15803D') + '; margin-bottom: 12px;">' +
    '    ' + badgeText +
    '  </span>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 8px 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">' +
    '  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #166534; line-height: 1.8;">' +
    '    <li><strong>Multi-Stage QC Inspection:</strong> Passed</li>' +
    '    <li><strong>Italian Steam Pressing:</strong> Completed</li>' +
    '    <li><strong>Eco-Friendly Garment Packaging:</strong> Sealed & Sanitized</li>' +
    '  </ul>' +
    (customMessage ? '<p style="margin: 12px 0 0 0; font-size: 12px; color: #15803D; font-weight: 600;">ℹ️ ' + customMessage + '</p>' : '') +
    '</div>' +
    '<table width="100%" style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; font-size: 13px; border: 1px solid #E2E8F0; margin-bottom: 24px;">' +
    '  <tr>' +
    '    <td style="color: ' + TEXT_MUTED + '; font-weight: 600;">Order ID:</td>' +
    '    <td style="font-weight: 800; color: ' + BRAND_DARK + '; font-family: monospace;">#' + data.orderId + '</td>' +
    '  </tr>' +
    '  <tr>' +
    '    <td style="color: ' + TEXT_MUTED + '; font-weight: 600;">Delivery Window:</td>' +
    '    <td style="font-weight: 700; color: #16A34A;">' + (data.deliveryDate || 'Tomorrow') + ' (' + (data.deliveryTimeSlot || '04:00 PM - 06:00 PM') + ')</td>' +
    '  </tr>' +
    '</table>' +
    '<div style="text-align: center; margin: 28px 0 12px 0;">' +
    '  <a href="' + trackingUrl + '" class="btn" target="_blank">' +
    '    ' + ctaText +
    '  </a>' +
    '  <div style="font-size: 11px; color: ' + TEXT_MUTED + '; margin-top: 10px;">' +
    '    ' + footerNote +
    '  </div>' +
    '</div>';

  const html = getEmailWrapper(headline, 'Order #' + data.orderId + ' wash is complete.', contentHtml, config);
  const text = (config.senderName || 'LaundryFresh') + ' - ' + headline + '\nOrder #' + data.orderId + '\n' + subheadline + '\nTrack: ' + trackingUrl;

  return { subject, html, text, isActive: config.isActive };
}

// 5. Template: Out for Delivery (with OTP)
export function getOutForDeliveryEmail(data: OrderEmailData, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('OUT_FOR_DELIVERY') || DEFAULT_EMAIL_TEMPLATES[4];
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || 'Out for Delivery';
  const ctaText = config.ctaText || 'Track Delivery Valet →';
  const footerNote = interpolatePlaceholders(config.footerNote, data);
  const trackingUrl = data.trackingUrl || ('https://laundryfresh.in/track/' + (data.orderId || ''));
  const otp = data.deliveryOtp || '7392';

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #EDE9FE; color: #7C3AED; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '🚀') +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background: linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%); border-radius: 16px; padding: 24px; text-align: center; color: #FFFFFF; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.25);">' +
    '  <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; font-weight: 700; margin-bottom: 8px;">' +
    '    Secure Delivery OTP' +
    '  </div>' +
    '  <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">' +
    '    ' + otp +
    '  </div>' +
    '  <div style="font-size: 11px; opacity: 0.8; margin-top: 8px;">' +
    '    Share this 4-digit code with your valet rider upon receiving your package.' +
    '  </div>' +
    '</div>' +
    (customMessage ? 
    '<div style="background-color: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #5B21B6;">' +
    '  ℹ️ ' + customMessage +
    '</div>' : '') +
    '<div style="text-align: center; margin: 28px 0 12px 0;">' +
    '  <a href="' + trackingUrl + '" class="btn" style="background-color: #7C3AED;" target="_blank">' +
    '    ' + ctaText +
    '  </a>' +
    '  <div style="font-size: 11px; color: ' + TEXT_MUTED + '; margin-top: 10px;">' +
    '    ' + footerNote +
    '  </div>' +
    '</div>';

  const html = getEmailWrapper(headline, 'Order #' + data.orderId + ' is out for delivery with OTP ' + otp + '.', contentHtml, config);
  const text = (config.senderName || 'LaundryFresh') + ' - ' + headline + '\nOrder #' + data.orderId + '\nDelivery OTP: ' + otp + '\nTrack: ' + trackingUrl;

  return { subject, html, text, isActive: config.isActive };
}

// 6. Template: Delivered & Tax Invoice Receipt
export function getOrderDeliveredEmail(data: OrderEmailData, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('ORDER_DELIVERED') || DEFAULT_EMAIL_TEMPLATES[5];
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || 'Delivered Successfully';
  const ctaText = config.ctaText || 'Download Tax Invoice →';
  const footerNote = interpolatePlaceholders(config.footerNote, data);
  const trackingUrl = data.trackingUrl || ('https://laundryfresh.in/track/' + (data.orderId || ''));

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #DCFCE7; color: #16A34A; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '🎉') +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">' +
    '  <div style="font-size: 13px; font-weight: 800; color: ' + BRAND_DARK + '; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">' +
    '    🧾 Payment & Tax Invoice' +
    '  </div>' +
    '  <table width="100%" style="font-size: 13px;" cellpadding="6" cellspacing="0">' +
    '    <tr>' +
    '      <td style="color: ' + TEXT_MUTED + ';">Order Total:</td>' +
    '      <td align="right" style="font-weight: 700; color: ' + BRAND_DARK + ';">₹' + (data.totalAmount || 0) + '</td>' +
    '    </tr>' +
    '    <tr>' +
    '      <td style="color: ' + TEXT_MUTED + ';">Payment Status:</td>' +
    '      <td align="right" style="font-weight: 700; color: #16A34A;">' + (data.paymentStatus || 'PAID') + '</td>' +
    '    </tr>' +
    '    <tr>' +
    '      <td style="color: ' + TEXT_MUTED + ';">Payment Method:</td>' +
    '      <td align="right" style="font-weight: 600; color: ' + BRAND_DARK + ';">' + (data.paymentMethod || 'Online') + '</td>' +
    '    </tr>' +
    '  </table>' +
    '</div>' +
    (customMessage ? 
    '<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #166534;">' +
    '  ℹ️ ' + customMessage +
    '</div>' : '') +
    '<div style="text-align: center; margin: 28px 0 12px 0;">' +
    '  <a href="' + trackingUrl + '" class="btn" target="_blank">' +
    '    ' + ctaText +
    '  </a>' +
    '  <div style="font-size: 11px; color: ' + TEXT_MUTED + '; margin-top: 10px;">' +
    '    ' + footerNote +
    '  </div>' +
    '</div>';

  const html = getEmailWrapper(headline, 'Order #' + data.orderId + ' delivered.', contentHtml, config);
  const text = (config.senderName || 'LaundryFresh') + ' - ' + headline + '\nOrder #' + data.orderId + ' delivered.\nTotal: ₹' + (data.totalAmount || 0) + '\nInvoice: ' + trackingUrl;

  return { subject, html, text, isActive: config.isActive };
}

// 7. Template: OTP Verification
export function getOtpVerificationEmail(name: string, otp: string, customConfig?: EmailTemplateConfig): { subject: string; html: string; text: string; isActive: boolean } {
  const config = customConfig || getTemplateByEvent('OTP_VERIFICATION') || DEFAULT_EMAIL_TEMPLATES[6];
  const data: OrderEmailData = { orderId: 'OTP', customerName: name, deliveryOtp: otp, otp };
  const subject = interpolatePlaceholders(config.subject, data);
  const headline = interpolatePlaceholders(config.headline, data);
  const subheadline = interpolatePlaceholders(config.subheadline, data);
  const customMessage = interpolatePlaceholders(config.customMessage, data);
  const badgeText = config.badgeText || 'Valid for 10 Mins';
  const footerNote = interpolatePlaceholders(config.footerNote, data);

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 56px; height: 56px; background-color: #FEF2F2; color: #EF4444; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">' +
    '    ' + (config.icon || '🔐') +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    ' + headline +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    ' + subheadline +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #0F172A; border-radius: 16px; padding: 28px; text-align: center; color: #FFFFFF; margin-bottom: 24px;">' +
    '  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; font-weight: 700; margin-bottom: 8px;">' +
    '    One-Time Password' +
    '  </div>' +
    '  <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; font-family: monospace; color: #4ADE80;">' +
    '    ' + otp +
    '  </div>' +
    '  <div style="font-size: 12px; color: #94A3B8; margin-top: 10px;">' +
    '    ⏳ ' + badgeText +
    '  </div>' +
    '</div>' +
    (customMessage ? 
    '<div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #991B1B;">' +
    '  ⚠️ ' + customMessage +
    '</div>' : '') +
    '<div style="font-size: 11px; color: ' + TEXT_MUTED + '; text-align: center;">' +
    '  ' + footerNote +
    '</div>';

  const html = getEmailWrapper(headline, 'Your LaundryFresh login OTP is ' + otp + '.', contentHtml, config);
  const text = 'LaundryFresh OTP: ' + otp + '\nValid for 10 minutes.';

  return { subject, html, text, isActive: config.isActive };
}

// 8. Template: Welcome Customer Email
export function getWelcomeCustomerEmail(name: string, email: string, phone: string): { subject: string; html: string; text: string } {
  const subject = '🎉 Welcome to LaundryFresh, ' + (name || 'Friend') + '! Your Account is Ready';

  const contentHtml = 
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <div style="width: 64px; height: 64px; background-color: #F3E8FF; color: #7E22CE; border-radius: 50%; font-size: 32px; line-height: 64px; margin: 0 auto 12px auto;">' +
    '    ✨' +
    '  </div>' +
    '  <h1 style="font-size: 22px; font-weight: 800; color: ' + BRAND_DARK + '; margin: 0 0 6px 0;">' +
    '    Welcome to LaundryFresh!' +
    '  </h1>' +
    '  <p style="font-size: 14px; color: ' + TEXT_MUTED + '; margin: 0;">' +
    '    Hello <strong>' + (name || 'Valued Customer') + '</strong>, we\'re thrilled to have you with us.' +
    '  </p>' +
    '</div>' +
    '<div style="background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 16px; padding: 20px; margin-bottom: 24px;">' +
    '  <div style="font-size: 14px; font-weight: 700; color: #6B21A8; margin-bottom: 10px;">' +
    '    👤 Your Account Details:' +
    '  </div>' +
    '  <table width="100%" style="font-size: 13px; color: #4B5563;">' +
    '    <tr>' +
    '      <td style="padding: 4px 0; color: #6B7280;">Name:</td>' +
    '      <td style="padding: 4px 0; font-weight: 700; color: #111827;">' + name + '</td>' +
    '    </tr>' +
    '    <tr>' +
    '      <td style="padding: 4px 0; color: #6B7280;">Mobile:</td>' +
    '      <td style="padding: 4px 0; font-weight: 700; color: #111827;">+91 ' + phone + '</td>' +
    '    </tr>' +
    (email ? 
    '    <tr>' +
    '      <td style="padding: 4px 0; color: #6B7280;">Email:</td>' +
    '      <td style="padding: 4px 0; font-weight: 700; color: #111827;">' + email + '</td>' +
    '    </tr>' : '') +
    '  </table>' +
    '</div>' +
    '<div style="text-align: center; margin-bottom: 24px;">' +
    '  <a href="https://laundry-website-peach.vercel.app/book" class="btn" style="background-color: #5B214F; color: #ffffff !important; display: inline-block; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 14px;">' +
    '    Schedule Your First Pickup →' +
    '  </a>' +
    '</div>' +
    '<div style="border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8; text-align: center;">' +
    '  Use coupon <strong>WELCOME100</strong> at checkout for ₹100 flat discount on your first order!' +
    '</div>';

  const html = getEmailWrapper('Welcome to LaundryFresh', 'Welcome to LaundryFresh!', contentHtml);
  const text = 'Welcome to LaundryFresh, ' + name + '!\nYour account (+91 ' + phone + ') is active.\nBook now: https://laundry-website-peach.vercel.app/book';

  return { subject, html, text };
}

// 9. Template: Admin New Order Alert
export function getAdminNewOrderAlertEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = '🔔 NEW ORDER RECEIVED: #' + data.orderId + ' (₹' + (data.totalAmount || 0) + ') - ' + data.customerName;

  const contentHtml = 
    '<div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 16px; padding: 20px; margin-bottom: 20px;">' +
    '  <div style="font-size: 16px; font-weight: 800; color: #065F46; margin-bottom: 8px;">' +
    '    📦 New Order #' + data.orderId + ' Placed!' +
    '  </div>' +
    '  <div style="font-size: 13px; color: #047857;">' +
    '    Total Value: <strong>₹' + (data.totalAmount || 0) + '</strong> (' + (data.paymentMethod || 'ONLINE') + ')' +
    '  </div>' +
    '</div>' +
    '<div class="card" style="padding: 20px; margin-bottom: 20px; border: 1px solid #E2E8F0; border-radius: 14px;">' +
    '  <table width="100%" style="font-size: 13px; color: #374151;">' +
    '    <tr>' +
    '      <td style="padding: 6px 0; color: #6B7280; width: 120px;">Customer:</td>' +
    '      <td style="padding: 6px 0; font-weight: 700; color: #111827;">' + data.customerName + ' (+91 ' + (data.customerPhone || '') + ')</td>' +
    '    </tr>' +
    '    <tr>' +
    '      <td style="padding: 6px 0; color: #6B7280;">Pickup Window:</td>' +
    '      <td style="padding: 6px 0; font-weight: 700; color: #111827;">' + (data.pickupDate || '') + ' | ' + (data.pickupTimeSlot || '') + '</td>' +
    '    </tr>' +
    '    <tr>' +
    '      <td style="padding: 6px 0; color: #6B7280;">Address:</td>' +
    '      <td style="padding: 6px 0; font-weight: 600; color: #374151;">' + (data.pickupAddress || 'Customer Doorstep') + '</td>' +
    '    </tr>' +
    '  </table>' +
    '</div>';

  const html = getEmailWrapper('New Order Alert', 'New order #' + data.orderId + ' placed.', contentHtml);
  const text = 'NEW ORDER #' + data.orderId + ' from ' + data.customerName + ' (+91 ' + data.customerPhone + ')\nPickup: ' + data.pickupDate + ' ' + data.pickupTimeSlot + '\nTotal: ₹' + data.totalAmount;

  return { subject, html, text };
}
