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
}

const BRAND_PRIMARY = '#16A34A';
const BRAND_DARK = '#0F172A';
const BG_LIGHT = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const TEXT_MUTED = '#64748B';

function getEmailWrapper(title: string, preheader: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${BG_LIGHT}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    .btn { display: inline-block; background-color: ${BRAND_PRIMARY}; color: #FFFFFF !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25); }
    .card { background-color: ${CARD_BG}; border-radius: 16px; border: 1px solid #E2E8F0; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>
</head>
<body style="background-color: ${BG_LIGHT}; padding: 30px 10px;">
  <!-- Preheader text for email client inbox snippet -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; color: transparent;">
    ${preheader}
  </div>

  <center>
    <table width="100%" max-width="600" style="max-width: 600px; text-align: left;" cellpadding="0" cellspacing="0">
      <!-- HEADER -->
      <tr>
        <td style="padding: 0 0 20px 0; text-align: center;">
          <table width="100%">
            <tr>
              <td align="center">
                <div style="display: inline-flex; align-items: center; gap: 8px;">
                  <span style="font-size: 24px; font-weight: 900; color: ${BRAND_DARK}; letter-spacing: -0.5px;">
                    🧺 <span style="color: ${BRAND_PRIMARY};">Laundry</span>Fresh
                  </span>
                </div>
                <div style="font-size: 11px; font-weight: 600; color: ${TEXT_MUTED}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                  Premium Eco-Friendly Care & Dry Cleaning
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- MAIN CONTENT CARD -->
      <tr>
        <td>
          <div class="card">
            ${contentHtml}
          </div>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="text-align: center; padding: 10px 20px; font-size: 12px; color: ${TEXT_MUTED}; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;">
            Need assistance? WhatsApp support available at <strong style="color: ${BRAND_DARK};">+91 98765 43210</strong> or email <a href="mailto:support@laundryfresh.in" style="color: ${BRAND_PRIMARY}; text-decoration: none;">support@laundryfresh.in</a>
          </p>
          <p style="margin: 0; font-size: 11px; color: #94A3B8;">
            © ${new Date().getFullYear()} LaundryFresh Technologies Inc. All rights reserved.<br/>
            HSR Layout, Sector 4, Bangalore, Karnataka 560102
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

// 1. Template: Pickup Scheduled & Order Confirmed
export function getPickupScheduledEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `🧺 Pickup Scheduled! - Order #${data.orderId} Confirmed`;
  const trackingUrl = data.trackingUrl || `https://laundryfresh.in/track/${data.orderId}`;

  const html = getEmailWrapper(
    'Pickup Scheduled',
    `Your laundry pickup for Order #${data.orderId} is confirmed for ${data.pickupDate || 'Today'}, ${data.pickupTimeSlot || 'Morning Slot'}.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background-color: #DCFCE7; color: #16A34A; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">
        🧺
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: ${BRAND_DARK}; margin: 0 0 6px 0;">
        Pickup Scheduled!
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        Hello <strong>${data.customerName}</strong>, our valet driver is assigned for your doorstep pickup.
      </p>
    </div>

    <!-- Order Tag Box -->
    <div style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px dashed #CBD5E1;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size: 11px; color: ${TEXT_MUTED}; font-weight: 700; text-transform: uppercase;">Order Reference</div>
            <div style="font-size: 16px; font-weight: 800; color: ${BRAND_DARK}; font-family: monospace;">#${data.orderId}</div>
          </td>
          <td align="right">
            <span class="badge" style="background-color: #DCFCE7; color: #15803D;">
              Pickup Confirmed
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Schedule Grid -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_DARK}; margin: 0 0 12px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
        📅 Scheduled Timings & Location
      </h3>
      <table width="100%" style="font-size: 13px;" cellpadding="6" cellspacing="0">
        <tr>
          <td width="35%" style="color: ${TEXT_MUTED}; font-weight: 600;">Pickup Slot:</td>
          <td style="font-weight: 700; color: ${BRAND_DARK};">${data.pickupDate || 'Today'}, ${data.pickupTimeSlot || '08:00 AM - 10:00 AM'}</td>
        </tr>
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Pickup Address:</td>
          <td style="font-weight: 600; color: ${BRAND_DARK};">${data.pickupAddress || 'Customer Registered Address'}</td>
        </tr>
        ${data.driverName ? `
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Assigned Driver:</td>
          <td style="font-weight: 700; color: #0284C7;">${data.driverName} ${data.driverPhone ? `(${data.driverPhone})` : ''}</td>
        </tr>
        ` : ''}
        ${data.deliveryDate ? `
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Est. Delivery:</td>
          <td style="font-weight: 700; color: #16A34A;">${data.deliveryDate} (${data.deliveryTimeSlot || 'Standard Delivery'})</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Order Items Breakdown if available -->
    ${data.itemsSummary && data.itemsSummary.length > 0 ? `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: ${BRAND_DARK}; margin: 0 0 12px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
        👔 Selected Garments & Services
      </h3>
      <table width="100%" style="font-size: 13px;" cellpadding="6" cellspacing="0">
        ${data.itemsSummary.map(item => `
          <tr style="border-bottom: 1px solid #F1F5F9;">
            <td style="color: ${BRAND_DARK}; font-weight: 600;">${item.name} ${item.service ? `<span style="font-size: 11px; color: ${TEXT_MUTED};">(${item.service})</span>` : ''}</td>
            <td align="right" style="color: ${TEXT_MUTED}; font-weight: 700;">x${item.qty}</td>
            ${item.price ? `<td align="right" style="font-weight: 700; color: ${BRAND_DARK};">₹${item.price * item.qty}</td>` : ''}
          </tr>
        `).join('')}
      </table>
    </div>
    ` : ''}

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0 12px 0;">
      <a href="${trackingUrl}" class="btn" target="_blank">
        Track Pickup Live →
      </a>
      <div style="font-size: 11px; color: ${TEXT_MUTED}; margin-top: 10px;">
        Keep your laundry bag ready for the driver inspection.
      </div>
    </div>
  `
  );

  const text = `LaundryFresh - Pickup Scheduled\nOrder #${data.orderId}\nHello ${data.customerName}, your laundry pickup is scheduled for ${data.pickupDate || 'Today'} (${data.pickupTimeSlot || 'Morning Slot'}).\nTrack live: ${trackingUrl}`;

  return { subject, html, text };
}

// 2. Template: Pickup Completed / Reached Hub
export function getPickupCompletedEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `🚚 Clothes Collected! - Order #${data.orderId} Arrived at Hub`;
  const trackingUrl = data.trackingUrl || `https://laundryfresh.in/track/${data.orderId}`;

  const html = getEmailWrapper(
    'Clothes Collected',
    `Your laundry items for Order #${data.orderId} have been collected and safely arrived at our processing facility.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background-color: #E0F2FE; color: #0284C7; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">
        🚚
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: ${BRAND_DARK}; margin: 0 0 6px 0;">
        Clothes Safely Collected!
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        Order <strong>#${data.orderId}</strong> has reached our main processing facility.
      </p>
    </div>

    <!-- Info Box -->
    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0F172A;">Next Care Steps:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.7;">
        <li>Fabric sorting according to garment care labels</li>
        <li>Pre-wash stain inspection under high-lumen lighting</li>
        <li>Individual barcode tagging for 100% garment tracking</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${trackingUrl}" class="btn" style="background-color: #0284C7;" target="_blank">
        View Order Status →
      </a>
    </div>
  `
  );

  const text = `LaundryFresh - Clothes Collected\nOrder #${data.orderId}\nYour clothes have been collected and arrived at our hub for sorting. Track: ${trackingUrl}`;

  return { subject, html, text };
}

// 3. Template: Wash In Progress
export function getWashingInProgressEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `🫧 Washing In Progress - Order #${data.orderId}`;
  const trackingUrl = data.trackingUrl || `https://laundryfresh.in/track/${data.orderId}`;

  const html = getEmailWrapper(
    'Washing In Progress',
    `Your clothes for Order #${data.orderId} are currently being cleaned with specialized detergents and steam treatment.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background-color: #F3E8FF; color: #9333EA; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">
        🫧
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: ${BRAND_DARK}; margin: 0 0 6px 0;">
        Washing & Cleaning In Progress
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        Our fabric specialists are cleaning your garments with hypoallergenic, eco-certified detergents.
      </p>
    </div>

    <div style="background-color: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table width="100%">
        <tr>
          <td width="33%" align="center" style="font-size: 12px; color: #6B21A8; font-weight: 700;">
            🧼 Specialized Wash
          </td>
          <td width="33%" align="center" style="font-size: 12px; color: #6B21A8; font-weight: 700;">
            ♨️ Steam Treatment
          </td>
          <td width="33%" align="center" style="font-size: 12px; color: #6B21A8; font-weight: 700;">
            🌿 Fabric Softener
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${trackingUrl}" class="btn" style="background-color: #9333EA;" target="_blank">
        Live Progress Timeline →
      </a>
    </div>
  `
  );

  const text = `LaundryFresh - Washing In Progress\nOrder #${data.orderId}\nYour clothes are undergoing specialized cleaning. Track: ${trackingUrl}`;

  return { subject, html, text };
}

// 4. Template: Wash Completed / Ready for Delivery ("Your wash is complete")
export function getWashCompleteEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `✨ Your Wash is Complete! - Order #${data.orderId} is Fresh & Ready`;
  const trackingUrl = data.trackingUrl || `https://laundryfresh.in/track/${data.orderId}`;

  const html = getEmailWrapper(
    'Wash Complete',
    `Great news! Your wash for Order #${data.orderId} is complete. Your clothes are fresh, crisp, quality-checked, and packed.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%); color: #15803D; border-radius: 50%; font-size: 32px; line-height: 64px; margin: 0 auto 12px auto; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.2);">
        ✨
      </div>
      <span class="badge" style="background-color: #DCFCE7; color: #15803D; margin-bottom: 8px;">
        100% Quality Checked
      </span>
      <h1 style="font-size: 24px; font-weight: 900; color: ${BRAND_DARK}; margin: 8px 0 6px 0;">
        Your Wash is Complete!
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        Hello <strong>${data.customerName}</strong>, your clothes have been freshly laundered, steam pressed, and carefully packed.
      </p>
    </div>

    <!-- Highlights Card -->
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #166534; font-weight: 700;">
            ✓ Multi-Stage QC Inspection: <span style="color: #15803D; font-weight: 800;">Passed</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #166534; font-weight: 700;">
            ✓ Italian Steam Pressing: <span style="color: #15803D; font-weight: 800;">Completed</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #166534; font-weight: 700;">
            ✓ Eco-Friendly Garment Packaging: <span style="color: #15803D; font-weight: 800;">Sealed & Sanitized</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Delivery Expectation -->
    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; border: 1px solid #E2E8F0; margin-bottom: 24px;">
      <table width="100%" style="font-size: 13px;" cellpadding="4" cellspacing="0">
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Order ID:</td>
          <td style="font-weight: 800; color: ${BRAND_DARK}; font-family: monospace;">#${data.orderId}</td>
        </tr>
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Delivery Window:</td>
          <td style="font-weight: 800; color: ${BRAND_PRIMARY};">${data.deliveryDate || 'Scheduled for Next Slot'} (${data.deliveryTimeSlot || 'Standard Slot'})</td>
        </tr>
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Delivery Destination:</td>
          <td style="font-weight: 600; color: ${BRAND_DARK};">${data.pickupAddress || 'Registered Delivery Address'}</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0 12px 0;">
      <a href="${trackingUrl}" class="btn" target="_blank">
        View Delivery Schedule →
      </a>
      <div style="font-size: 11px; color: ${TEXT_MUTED}; margin-top: 10px;">
        You will receive an OTP code when our driver is on the way.
      </div>
    </div>
  `
  );

  const text = `LaundryFresh - Your Wash is Complete!\nOrder #${data.orderId}\nHello ${data.customerName}, your garments are washed, steam-pressed, and packaged. Track: ${trackingUrl}`;

  return { subject, html, text };
}

// 5. Template: Out for Delivery
export function getOutForDeliveryEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `🚀 Out for Delivery! - Order #${data.orderId} is On The Way`;
  const trackingUrl = data.trackingUrl || `https://laundryfresh.in/track/${data.orderId}`;
  const otp = data.deliveryOtp || '4829';

  const html = getEmailWrapper(
    'Out for Delivery',
    `Your clean clothes for Order #${data.orderId} are on the way! Delivery OTP: ${otp}.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background-color: #FEF3C7; color: #D97706; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">
        🚀
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: ${BRAND_DARK}; margin: 0 0 6px 0;">
        Out for Doorstep Delivery!
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        Our in-house delivery rider is heading towards your location.
      </p>
    </div>

    <!-- OTP Code Box -->
    <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px dashed #F59E0B; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #B45309; letter-spacing: 1px; margin-bottom: 6px;">
        Your Delivery Verification OTP
      </div>
      <div style="font-size: 32px; font-weight: 900; color: #92400E; letter-spacing: 8px; font-family: monospace;">
        ${otp}
      </div>
      <div style="font-size: 12px; color: #B45309; margin-top: 8px; font-weight: 600;">
        Please share this OTP with the driver after inspecting your packaged items.
      </div>
    </div>

    <!-- Driver Card -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <table width="100%" style="font-size: 13px;" cellpadding="4">
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Assigned Driver:</td>
          <td style="font-weight: 800; color: ${BRAND_DARK};">${data.driverName || 'Vikram Singh (In-House Fleet)'}</td>
        </tr>
        <tr>
          <td style="color: ${TEXT_MUTED}; font-weight: 600;">Driver Contact:</td>
          <td style="font-weight: 700; color: #0284C7;">${data.driverPhone || '+91 98765 11001'}</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${trackingUrl}" class="btn" style="background-color: #D97706;" target="_blank">
        Track Driver Live Map →
      </a>
    </div>
  `
  );

  const text = `LaundryFresh - Out for Delivery!\nOrder #${data.orderId}\nDelivery OTP: ${otp}\nDriver: ${data.driverName || 'In-House Fleet'}. Track: ${trackingUrl}`;

  return { subject, html, text };
}

// 6. Template: Delivered & Tax Invoice Receipt
export function getOrderDeliveredEmail(data: OrderEmailData): { subject: string; html: string; text: string } {
  const subject = `🎉 Delivered! - Order #${data.orderId} Receipt & Tax Invoice`;
  const trackingUrl = data.trackingUrl || `https://laundryfresh.in/track/${data.orderId}`;

  const html = getEmailWrapper(
    'Order Delivered',
    `Thank you for using LaundryFresh! Order #${data.orderId} has been successfully delivered.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background-color: #DCFCE7; color: #16A34A; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">
        🎉
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: ${BRAND_DARK}; margin: 0 0 6px 0;">
        Delivered Successfully!
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        We hope you love the fresh, crisp feel of your garments.
      </p>
    </div>

    <!-- Invoice Summary -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: ${BRAND_DARK}; margin: 0 0 12px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px;">
        🧾 Invoice Summary (#${data.orderId})
      </h3>
      <table width="100%" style="font-size: 13px;" cellpadding="6" cellspacing="0">
        ${data.itemsSummary && data.itemsSummary.length > 0 ? data.itemsSummary.map(item => `
          <tr>
            <td style="color: ${BRAND_DARK}; font-weight: 600;">${item.name} (x${item.qty})</td>
            <td align="right" style="font-weight: 700; color: ${BRAND_DARK};">₹${item.price ? item.price * item.qty : '—'}</td>
          </tr>
        `).join('') : ''}
        ${data.deliveryFee !== undefined ? `
        <tr>
          <td style="color: ${TEXT_MUTED};">Delivery & Handling</td>
          <td align="right" style="font-weight: 600; color: ${BRAND_DARK};">₹${data.deliveryFee}</td>
        </tr>
        ` : ''}
        ${data.taxAmount !== undefined ? `
        <tr>
          <td style="color: ${TEXT_MUTED};">GST / Tax</td>
          <td align="right" style="font-weight: 600; color: ${BRAND_DARK};">₹${data.taxAmount}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #CBD5E1;">
          <td style="font-size: 15px; font-weight: 900; color: ${BRAND_DARK}; padding-top: 10px;">Total Paid</td>
          <td align="right" style="font-size: 16px; font-weight: 900; color: ${BRAND_PRIMARY}; padding-top: 10px;">
            ₹${data.totalAmount || 0}
          </td>
        </tr>
        <tr>
          <td style="font-size: 11px; color: ${TEXT_MUTED};">Payment Status</td>
          <td align="right" style="font-size: 11px; font-weight: 800; color: #15803D;">
            PAID (${data.paymentMethod || 'Online / UPI'})
          </td>
        </tr>
      </table>
    </div>

    <!-- Rating & Review -->
    <div style="text-align: center; background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 14px; font-weight: 800; color: #92400E; margin-bottom: 4px;">
        How was your laundry experience?
      </div>
      <div style="font-size: 20px; margin: 8px 0;">
        ⭐⭐⭐⭐⭐
      </div>
      <a href="${trackingUrl}" style="font-size: 12px; font-weight: 700; color: #D97706; text-decoration: underline;">
        Leave a Quick Review →
      </a>
    </div>
  `
  );

  const text = `LaundryFresh - Delivered!\nOrder #${data.orderId}\nTotal: ₹${data.totalAmount || 0}. Thank you for choosing LaundryFresh!`;

  return { subject, html, text };
}

// 7. Template: OTP & Login
export function getOtpVerificationEmail(name: string, otp: string): { subject: string; html: string; text: string } {
  const subject = `🔐 ${otp} is your LaundryFresh Verification Code`;

  const html = getEmailWrapper(
    'Verification Code',
    `Your verification code is ${otp}. Valid for 10 minutes.`,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 56px; height: 56px; background-color: #DCFCE7; color: #16A34A; border-radius: 50%; font-size: 28px; line-height: 56px; margin: 0 auto 12px auto;">
        🔐
      </div>
      <h1 style="font-size: 22px; font-weight: 800; color: ${BRAND_DARK}; margin: 0 0 6px 0;">
        Your Login OTP Code
      </h1>
      <p style="font-size: 14px; color: ${TEXT_MUTED}; margin: 0;">
        Hello <strong>${name || 'Valued Customer'}</strong>, use the code below to complete your authentication.
      </p>
    </div>

    <div style="background-color: #F0FDF4; border: 2px dashed #16A34A; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <div style="font-size: 36px; font-weight: 900; color: #15803D; letter-spacing: 10px; font-family: monospace;">
        ${otp}
      </div>
      <div style="font-size: 12px; color: #166534; margin-top: 8px; font-weight: 600;">
        Valid for 10 minutes. Do not share this code with anyone.
      </div>
    </div>
  `
  );

  const text = `LaundryFresh OTP: ${otp}\nValid for 10 minutes.`;

  return { subject, html, text };
}
