const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || `"LaundryFresh" <${SMTP_USER}>`;

async function testGmailSmtp() {
  console.log(`=== Testing Gmail SMTP Connection ===`);
  console.log(`Host: ${SMTP_HOST}:${SMTP_PORT}`);
  console.log(`User: ${SMTP_USER}`);
  console.log(`From: ${EMAIL_FROM}`);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // 587 uses STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    console.log('Verifying SMTP credentials...');
    await transporter.verify();
    console.log('✓ SMTP Connection Verified Successfully!');

    console.log(`Sending a test "Your Wash is Complete!" email to ${SMTP_USER}...`);
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: SMTP_USER,
      subject: '✨ Your Wash is Complete! - Order #TEST-8829 is Fresh & Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 32px; margin-bottom: 8px;">🧺✨</div>
            <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 8px 0; font-weight: 800;">Your Wash is Complete!</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Hello <strong>Valued Customer</strong>, your clothes have been freshly laundered, steam pressed, and packed in sanitized bags.</p>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 4px;">✓ 100% Quality Inspection Passed</div>
            <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 4px;">✓ Italian Steam Pressing Completed</div>
            <div style="font-weight: 700; color: #166534; font-size: 13px;">✓ Sealed & Sanitized Garment Packaging</div>
          </div>

          <div style="background: #f8fafc; border-radius: 10px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px; font-size: 13px;">
            <table width="100%">
              <tr><td style="color: #64748b;">Order Reference:</td><td style="font-weight: bold; color: #0f172a;">#TEST-8829</td></tr>
              <tr><td style="color: #64748b;">Delivery Window:</td><td style="font-weight: bold; color: #16a34a;">Tomorrow, 04:00 PM - 06:00 PM</td></tr>
            </table>
          </div>

          <div style="text-align: center;">
            <a href="https://laundryfresh.in/track/TEST-8829" style="background: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Track Delivery Status →
            </a>
          </div>
        </div>
      `,
    });

    console.log('✓ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('✗ SMTP Error:', err.message);
  }
}

testGmailSmtp();
