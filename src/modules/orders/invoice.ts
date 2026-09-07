import type { Order, PricingSettings } from '../../types';

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cleanGarmentName(item: any): string {
  if (item?.clothName && !item.clothName.includes('null')) {
    const sName = item?.serviceName && !item.serviceName.includes('null') ? item.serviceName : 'Steam Care & Press';
    return `${item.clothName} • ${sName}`;
  }
  const raw = item?.serviceName || item?.name || '';
  if (!raw || raw.includes('null') || raw.trim() === '(null)' || raw.trim() === 'null') {
    if (item?.pricingModel === 'PER_KG' || item?.unit === 'KG') {
      return 'Everyday Wash & Fold (Bulk)';
    }
    return item?.categoryName ? `${item.categoryName} Garment Care` : 'Premium Garment Care';
  }
  return raw.replace(/null\s*\(null\)/gi, 'Premium Garment Care').replace(/\(null\)/gi, '').trim();
}

export function renderTaxInvoiceHtml(order: Order, settings?: PricingSettings): string {
  // Use dynamic laundry hub details
  const storeName = settings?.storeName || 'Anjani Laundry';
  const storeAddress = settings?.storeAddress || 'D.No 4-12, Main Road, Danavaipeta, Rajahmundry, AP - 533103';
  const storeGSTIN = '37AAACA1234F1Z5'; // Should be added to settings in future
  const storePhone = '+91 91219 99999';
  const storeEmail = 'anushabazaar4@gmail.com';
  
  const invoiceNo = `INV-${order.id.replace(/\D/g, '').slice(-8) || order.id.slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const subtotal = order.itemTotal || 0;
  const deliveryFee = order.pickupDeliveryFee || 0;
  const expressFee = order.expressFee || 0;
  const discount = order.discountAmount || 0;
  const totalTax = order.taxAmount || 0;
  const cgst = (totalTax / 2).toFixed(2);
  const sgst = (totalTax / 2).toFixed(2);
  const grandTotal = order.totalAmount || 0;

  const itemsRows = (order.items || []).map((item, idx) => {
    const name = escapeHtml(cleanGarmentName(item));
    const qty = item.quantity || 1;
    const unit = escapeHtml(item.unit || (item.pricingModel === 'PER_KG' ? 'KG' : 'Pcs'));
    const rate = Number(item.unitPrice || 0).toFixed(2);
    const amount = Number(item.subtotal || 0).toFixed(2);

    return `
      <tr>
        <td style="text-align: center; color: #64748b;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${name}</div>
          <div style="font-size: 11px; color: #64748b;">Category: ${escapeHtml(item.categoryName || 'Garments')}</div>
        </td>
        <td style="text-align: center; font-family: monospace; color: #475569;">998814</td>
        <td style="text-align: center; font-weight: 600;">${qty} ${unit}</td>
        <td style="text-align: right; font-family: monospace;">₹${rate}</td>
        <td style="text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">₹${amount}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - #${escapeHtml(order.id)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #1e293b;
      padding: 24px;
      line-height: 1.5;
    }
    .invoice-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e2e8f0;
    }
    .action-bar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #ea580c;
      color: #ffffff;
    }
    .btn-primary:hover { background: #c2410c; }
    .btn-secondary {
      background: #ffffff;
      color: #334155;
      border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover { background: #f8fafc; }
    
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .company-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .company-logo {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.25);
      flex-shrink: 0;
    }
    .company-info {
      flex: 1;
    }
    .company-title {
      font-size: 24px;
      font-weight: 900;
      color: #ea580c;
      letter-spacing: -0.5px;
    }
    .company-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.4;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-tag {
      display: inline-block;
      background: #fef3c7;
      color: #b45309;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .invoice-number {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .invoice-date {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }

    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #f1f5f9;
    }
    .party-col h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .party-name {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .party-text {
      font-size: 12px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.4;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 14px;
      border-bottom: 2px solid #e2e8f0;
      text-align: left;
    }
    td {
      padding: 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      vertical-align: middle;
    }

    .summary-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .summary-box {
      width: 320px;
      background: #fafafa;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .summary-val {
      font-weight: 700;
      color: #1e293b;
      font-family: monospace;
    }
    .summary-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 10px 0;
    }
    .summary-grand {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      align-items: center;
    }
    .summary-grand-val {
      color: #ea580c;
      font-size: 20px;
      font-family: monospace;
    }

    .footer-note {
      text-align: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      font-size: 11px;
      color: #94a3b8;
    }

    @media print {
      body { background: #ffffff; padding: 0; }
      .action-bar { display: none !important; }
      .invoice-container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn btn-secondary" onclick="window.history.length > 1 ? window.history.back() : window.close()">← Return</button>
    <button class="btn btn-primary" onclick="window.print()">📥 Print / Download PDF</button>
  </div>

  <div class="invoice-container">
    <div class="header-row">
      <div class="company-section">
        <div class="company-logo">
          ${escapeHtml(storeName.substring(0, 1).toUpperCase())}
        </div>
        <div class="company-info">
          <div class="company-title">${escapeHtml(storeName)}</div>
          <div class="company-sub">
            <strong>${escapeHtml(storeName)} & Dry Cleaning Hub</strong><br>
            ${escapeHtml(storeAddress)}<br>
            GSTIN: <strong>${escapeHtml(storeGSTIN)}</strong> • Phone: ${escapeHtml(storePhone)}<br>
            Email: ${escapeHtml(storeEmail)}
          </div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-tag">TAX INVOICE (GST-COMPLIANT)</div>
        <div class="invoice-number">${escapeHtml(invoiceNo)}</div>
        <div class="invoice-date">Order ID: <strong>#${escapeHtml(order.id)}</strong></div>
        <div class="invoice-date">Date: ${escapeHtml(orderDate)}</div>
      </div>
    </div>

    <div class="parties-grid">
      <div class="party-col">
        <h4>BILLED TO (CUSTOMER)</h4>
        <div class="party-name">${escapeHtml(order.customerName || 'Customer')}</div>
        <div class="party-text">
          Phone: <strong>${escapeHtml(order.customerPhone || 'N/A')}</strong><br>
          ${order.customerEmail ? `Email: ${escapeHtml(order.customerEmail)}<br>` : ''}
          Address: ${escapeHtml(order.address ? `${order.address.street}, ${order.address.city} - ${order.address.pincode}` : 'Store Pickup')}
        </div>
      </div>
      <div class="party-col">
        <h4>ORDER & DISPATCH DETAILS</h4>
        <div class="party-text">
          Pickup Slot: <strong>${escapeHtml(order.pickupSlot?.date || 'N/A')} (${escapeHtml(order.pickupSlot?.slot || 'Morning')})</strong><br>
          Payment Mode: <strong>${escapeHtml(order.paymentMethod === 'ONLINE_RAZORPAY' ? 'Razorpay Online' : order.paymentMethod === 'WALLET' ? 'LaundryFresh Wallet' : 'Cash on Delivery')}</strong><br>
          Payment Status: <strong style="color: ${order.paymentStatus === 'PAID' ? '#16a34a' : '#ea580c'}">${escapeHtml(order.paymentStatus || 'PENDING')}</strong><br>
          Service Tier: <strong>${escapeHtml(order.expressTier || 'REGULAR')}</strong>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>Garment & Service Description</th>
          <th style="width: 90px; text-align: center;">SAC Code</th>
          <th style="width: 100px; text-align: center;">Quantity</th>
          <th style="width: 110px; text-align: right;">Unit Rate</th>
          <th style="width: 120px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary-wrap">
      <div class="summary-box">
        <div class="summary-line">
          <span>Garments Subtotal</span>
          <span class="summary-val">₹${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-line">
          <span>Doorstep Pickup & Delivery</span>
          <span class="summary-val" style="color: ${deliveryFee === 0 ? '#16a34a' : '#1e293b'}">${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee.toFixed(2)}</span>
        </div>
        ${expressFee > 0 ? `
        <div class="summary-line">
          <span>${order.expressTier === 'SAME_DAY' ? '12H Same-Day Emergency Surcharge' : '24H Express Surcharge'}</span>
          <span class="summary-val">+₹${expressFee.toFixed(2)}</span>
        </div>` : ''}
        ${discount > 0 ? `
        <div class="summary-line">
          <span style="color: #16a34a;">Discount Applied ${order.couponCode ? `(${escapeHtml(order.couponCode)})` : ''}</span>
          <span class="summary-val" style="color: #16a34a;">-₹${discount.toFixed(2)}</span>
        </div>` : ''}
        <div class="summary-line">
          <span>CGST (2.5%)</span>
          <span class="summary-val">₹${cgst}</span>
        </div>
        <div class="summary-line">
          <span>SGST (2.5%)</span>
          <span class="summary-val">₹${sgst}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-grand">
          <span>Total Amount</span>
          <span class="summary-grand-val">₹${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      <p>This is a computer-generated tax invoice issued in accordance with the Goods and Services Tax Act. No physical signature is required.</p>
      <p style="margin-top: 4px;">Thank you for trusting ${escapeHtml(storeName)} for your premium garment care!</p>
    </div>
  </div>

  <script>
    // Automatically invoke print dialog when loaded if URL has ?print=true or on standalone view
    if (window.location.search.includes('print=true')) {
      window.onload = function() {
        setTimeout(function() { window.print(); }, 400);
      };
    }
  </script>
</body>
</html>`;
}
