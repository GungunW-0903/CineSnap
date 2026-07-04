const nodemailer = require('nodemailer');
const { ensureReady, EMAIL_FROM } = require('../config/email');

const BRAND = {
  name: 'CineSnap',
  accent: '#ff5a3d',
  gold: '#ffc24a',
  bg: '#070b14',
};

// Read fresh on every call, not cached at require()-time — a bare env-var
// update (no code deploy) wouldn't otherwise reach an already-running process.
function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:5173';
}

function parseFrom(fromStr) {
  const m = /^(.*)<(.+)>$/.exec(fromStr || '');
  if (m) return { name: m[1].trim().replace(/^"|"$/g, ''), email: m[2].trim() };
  return { email: (fromStr || '').trim() };
}

/**
 * Send via Brevo's HTTPS API (port 443) instead of raw SMTP — cloud hosts
 * like Render silently drop outbound SMTP (ports 587/465) even to non-Gmail
 * relays, so plain nodemailer SMTP never gets through from there. Returns
 * null (not an error) when BREVO_API_KEY isn't set, so callers fall back.
 */
async function sendViaBrevoApi({ to, subject, html, attachments }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const payload = {
    sender: parseFrom(EMAIL_FROM),
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
  if (attachments?.length) {
    payload.attachment = attachments.map((a) => ({
      name: a.filename,
      content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : a.content,
    }));
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo API ${res.status}: ${body}`);
  }
  const data = await res.json().catch(() => ({}));
  return { sent: true, messageId: data.messageId };
}

/**
 * Core send helper. Never throws into the request path — failures are logged
 * and swallowed so a flaky mail provider can't break a booking.
 */
async function send({ to, subject, html, attachments }) {
  try {
    const viaApi = await sendViaBrevoApi({ to, subject, html, attachments });
    if (viaApi) {
      console.log(`✓ Email sent via Brevo API → ${to} (${viaApi.messageId})`);
      return viaApi;
    }
  } catch (err) {
    console.error(`✗ Brevo API send failed → ${to}:`, err.message);
    return { error: err.message };
  }

  const transporter = await ensureReady();
  if (!transporter) {
    console.log(`✉ [email skipped] → ${to} | ${subject}`);
    return { skipped: true };
  }
  try {
    const info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, html, attachments });
    const preview = nodemailer.getTestMessageUrl(info); // set only for Ethereal
    if (preview) {
      console.log(`✉ Email sent → ${to}\n   📬 Preview: ${preview}`);
    } else {
      console.log(`✓ Email sent → ${to} (${info.messageId})`);
    }
    return { sent: true, messageId: info.messageId, preview };
  } catch (err) {
    console.error(`✗ Email failed → ${to}:`, err.message);
    return { error: err.message };
  }
}

/** Shared HTML shell so every email is on-brand. */
function shell(title, bodyHtml) {
  return `
  <div style="margin:0;padding:0;background:${BRAND.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#fff;">
          Cine<span style="color:${BRAND.accent};">Snap</span>
        </span>
      </div>
      <div style="background:linear-gradient(160deg,#121829,#0d1320);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;color:#fff;">${title}</h1>
        ${bodyHtml}
      </div>
      <p style="text-align:center;color:#5b6680;font-size:12px;margin-top:24px;">
        © ${'2026'} CineSnap · Booked in seconds.<br/>
        You're receiving this because you have a CineSnap account.
      </p>
    </div>
  </div>`;
}

function btn(label, href) {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:13px 26px;border-radius:9999px;background:linear-gradient(95deg,${BRAND.accent},${BRAND.gold});color:#fff;text-decoration:none;font-weight:700;font-size:14px;">${label}</a>`;
}

/** Booking confirmation (sent after successful payment). */
async function sendBookingConfirmation(booking) {
  const seats = (booking.seats || []).join(', ');

  // Turn the stored QR data-URL into an inline attachment (CID) — Gmail and
  // most clients block data:image src, but reliably render cid: attachments.
  const attachments = [];
  let qrBlock = '';
  if (booking.qrCode && booking.qrCode.startsWith('data:image')) {
    const base64 = booking.qrCode.split(',')[1];
    attachments.push({
      filename: 'cinesnap-ticket-qr.png',
      content: Buffer.from(base64, 'base64'),
      cid: 'ticketqr',
    });
    qrBlock = `
    <div style="text-align:center;margin-top:22px;padding:20px;background:#ffffff;border-radius:16px;">
      <img src="cid:ticketqr" width="200" height="200" alt="Ticket QR code" style="display:block;margin:0 auto;" />
      <p style="color:#0b0f1a;font-size:12px;margin:12px 0 0;font-weight:600;">Scan at the door to check in</p>
      <p style="color:#5b6680;font-size:11px;margin:4px 0 0;font-family:monospace;">${booking.bookingCode}</p>
    </div>`;
  }

  const body = `
    <p style="color:#c4ccda;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${booking.userName || 'there'}, your tickets are confirmed. 🎬
    </p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;">
      <table style="width:100%;border-collapse:collapse;color:#fff;font-size:14px;">
        <tr><td style="padding:6px 0;color:#8a94a8;">Movie</td><td style="padding:6px 0;text-align:right;font-weight:600;">${booking.movieTitle || 'Your movie'}</td></tr>
        <tr><td style="padding:6px 0;color:#8a94a8;">Date</td><td style="padding:6px 0;text-align:right;">${booking.showDate}</td></tr>
        <tr><td style="padding:6px 0;color:#8a94a8;">Time</td><td style="padding:6px 0;text-align:right;">${booking.showTime}</td></tr>
        <tr><td style="padding:6px 0;color:#8a94a8;">Seats</td><td style="padding:6px 0;text-align:right;font-weight:600;">${seats}</td></tr>
        <tr><td style="padding:6px 0;color:#8a94a8;">Total paid</td><td style="padding:6px 0;text-align:right;font-weight:700;color:${BRAND.gold};">$${Number(booking.totalAmount).toFixed(2)}</td></tr>
        <tr><td style="padding:6px 0;color:#8a94a8;">Booking code</td><td style="padding:6px 0;text-align:right;font-family:monospace;">${booking.bookingCode}</td></tr>
      </table>
    </div>
    ${qrBlock}
    <p style="color:#8a94a8;font-size:13px;margin:18px 0 0;">Show this QR at the door — no printing needed.</p>
    ${btn('View my bookings', `${frontendUrl()}/my-bookings`)}
  `;
  return send({
    to: booking.userEmail,
    subject: `🎟 Your CineSnap tickets — ${booking.movieTitle || 'Booking confirmed'}`,
    html: shell('Booking confirmed!', body),
    attachments,
  });
}

/** Login / sign-in alert. */
async function sendLoginAlert({ to, name, when, device }) {
  const body = `
    <p style="color:#c4ccda;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Hi ${name || 'there'}, you just signed in to CineSnap.
    </p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;color:#fff;font-size:14px;">
      <div style="padding:4px 0;"><span style="color:#8a94a8;">When:</span> ${when || 'just now'}</div>
      ${device ? `<div style="padding:4px 0;"><span style="color:#8a94a8;">Device:</span> ${device}</div>` : ''}
    </div>
    <p style="color:#8a94a8;font-size:13px;margin:16px 0 0;">If this wasn't you, please secure your account.</p>
    ${btn('Go to CineSnap', frontendUrl())}
  `;
  return send({
    to,
    subject: '🔐 New sign-in to your CineSnap account',
    html: shell('Welcome back 👋', body),
  });
}

/** Welcome email on first registration. */
async function sendWelcomeEmail({ to, name }) {
  const body = `
    <p style="color:#c4ccda;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Welcome to CineSnap, ${name || 'movie lover'}! 🍿 You're all set to discover trending films
      and book seats in seconds.
    </p>
    <p style="color:#8a94a8;font-size:14px;margin:0;">Here's what you can do next:</p>
    <ul style="color:#c4ccda;font-size:14px;line-height:1.8;">
      <li>Browse what's now showing</li>
      <li>Save favorites to your watchlist</li>
      <li>Lock your perfect seats before they sell out</li>
    </ul>
    ${btn('Explore movies', `${frontendUrl()}/movies`)}
  `;
  return send({
    to,
    subject: '🎬 Welcome to CineSnap',
    html: shell('You\'re in!', body),
  });
}

module.exports = {
  send,
  sendBookingConfirmation,
  sendLoginAlert,
  sendWelcomeEmail,
};
