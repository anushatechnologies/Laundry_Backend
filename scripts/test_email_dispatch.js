const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SMTP_HOST = process.env.SMTP_HOST || 'sg2plzcpnl508172.prod.sin2.secureserver.net';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || 'laundry@anushatechnologies.com';
const SMTP_PASS = process.env.SMTP_PASS || 'Anjibabu@2244';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const EMAIL_FROM = process.env.EMAIL_FROM || `"LaundryFresh" <${SMTP_USER}>`;

async function testHost(host, port, secure) {
  console.log(`Testing host: ${host}:${port} secure=${secure}`);
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: 'laundry@anushatechnologies.com',
      pass: 'Anjibabu@2244',
    },
    tls: {
      rejectUnauthorized: false,
    },
    pool: false,
  });

  try {
    const info = await transporter.sendMail({
      from: `"LaundryFresh" <laundry@anushatechnologies.com>`,
      to: 'laundry@anushatechnologies.com',
      subject: `Direct Test via ${host}:${port}`,
      text: 'Hello from LaundryFresh notification system!',
    });
    console.log(`>>> SUCCESS Sent via ${host}:${port}! ID: ${info.messageId} <<<`);
    return true;
  } catch (err) {
    console.log(`✗ Failed on ${host}:${port}: ${err.message}`);
    return false;
  }
}

async function testGmailSmtp() {
  console.log('Waiting 3 seconds for rate limiter to clear...');
  await new Promise(r => setTimeout(r, 3000));
  if (await testHost('anushatechnologies.com', 465, true)) return;
  if (await testHost('anushatechnologies.com', 587, false)) return;
  if (await testHost('sg2plzcpnl508172.prod.sin2.secureserver.net', 465, true)) return;
  if (await testHost('sg2plzcpnl508172.prod.sin2.secureserver.net', 587, false)) return;
}

testGmailSmtp();
