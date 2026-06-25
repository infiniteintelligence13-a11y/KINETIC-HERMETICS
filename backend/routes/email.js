const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER || 'apikey',
    pass: process.env.EMAIL_PASS
  }
});

const FROM = `"${process.env.EMAIL_FROM_NAME || 'Kinetic Hermetics'}" <${process.env.EMAIL_FROM || 'hello@kinetichemetics.com'}>`;

// Webinar registration confirmation
async function sendWebinarConfirmation(to, firstName, webinarDate) {
  if (!process.env.EMAIL_PASS) return; // Skip in dev without credentials
  await transporter.sendMail({
    from: FROM,
    to,
    subject: '🌿 You\'re registered! Your webinar access + $497 in bonuses',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2c1810;">
        <div style="background:#1a3a2a;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:1.6rem;">🌿 Kinetic Hermetics</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a3a2a;">Hi ${firstName}, you're in! 🎉</h2>
          <p>Your spot for <strong>The Infinite Intelligence Method</strong> webinar is confirmed.</p>
          <p><strong>When:</strong> ${webinarDate || 'Monday at 7:00 PM EST'}</p>
          <p>Your $497 in bonuses are attached to this email and will be accessible via the link below:</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${process.env.FRONTEND_URL}/pages/webinar-registration.html" style="background:#c9a84c;color:#1a3a2a;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;">Access Your Bonuses →</a>
          </div>
          <p style="color:#888;font-size:0.85rem;">Can't make the live time? You'll receive the replay link automatically within 2 hours of the webinar ending.</p>
        </div>
        <div style="background:#f5f0e8;padding:20px 32px;font-size:0.8rem;color:#888;">
          <p>© 2026 Kinetic Hermetics · <a href="${process.env.FRONTEND_URL}/pages/privacy.html" style="color:#888;">Privacy Policy</a></p>
        </div>
      </div>
    `
  });
}

// Order confirmation
async function sendOrderConfirmation(to, firstName, orderId, items, total) {
  if (!process.env.EMAIL_PASS) return;
  const itemRows = items.map(i =>
    `<tr><td style="padding:8px 0;color:#444;">${i.name}</td><td style="padding:8px 0;text-align:right;font-weight:bold;">$${(i.price * i.qty).toFixed(2)}</td></tr>`
  ).join('');

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `🌿 Order Confirmed #${orderId} — Kinetic Hermetics`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2c1810;">
        <div style="background:#1a3a2a;padding:32px;text-align:center;">
          <h1 style="color:#c9a84c;margin:0;font-size:1.6rem;">🌿 Kinetic Hermetics</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="color:#1a3a2a;">Thank you, ${firstName}! ✅</h2>
          <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
          <table style="width:100%;border-top:1px solid #eee;margin:20px 0;">
            ${itemRows}
            <tr style="border-top:2px solid #1a3a2a;">
              <td style="padding:12px 0;font-weight:bold;color:#1a3a2a;">Total</td>
              <td style="padding:12px 0;text-align:right;font-weight:bold;font-size:1.1rem;color:#c9a84c;">$${total.toFixed(2)}</td>
            </tr>
          </table>
          <p>Digital products are accessible immediately. Physical orders ship within 24 hours with tracking.</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${process.env.FRONTEND_URL}/pages/order-confirmation.html?order=${orderId}" style="background:#c9a84c;color:#1a3a2a;padding:14px 32px;border-radius:6px;font-weight:bold;text-decoration:none;">View Your Order →</a>
          </div>
        </div>
        <div style="background:#f5f0e8;padding:20px 32px;font-size:0.8rem;color:#888;">
          <p>Questions? Email <a href="mailto:hello@kinetichemetics.com" style="color:#2d5a3d;">hello@kinetichemetics.com</a></p>
          <p>© 2026 Kinetic Hermetics</p>
        </div>
      </div>
    `
  });
}

// POST /api/email/webinar-confirmation
router.post('/webinar-confirmation', async (req, res) => {
  const { to, firstName, webinarDate } = req.body;
  try {
    await sendWebinarConfirmation(to, firstName, webinarDate);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/email/order-confirmation
router.post('/order-confirmation', async (req, res) => {
  const { to, firstName, orderId, items, total } = req.body;
  try {
    await sendOrderConfirmation(to, firstName, orderId, items, total);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = { router, sendWebinarConfirmation, sendOrderConfirmation };
