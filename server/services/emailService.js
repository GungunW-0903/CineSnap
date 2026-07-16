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
  if (!apiKey) {
    // Missing silently otherwise — this is the one env var that must be set
    // in production, since Render blocks outbound SMTP entirely (see send()).
    console.warn('⚠ BREVO_API_KEY not set — falling back to SMTP, which will not work on Render.');
    return null;
  }

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

/**
 * Shared HTML shell so every email is on-brand. Built from nested <table>s
 * instead of styled <div>s — Outlook desktop (Word rendering engine) and many
 * corporate spam scanners strip div/flex-based layouts and gradients, which
 * can leave a "sent successfully" email looking blank or broken on arrival.
 * Tables + inline styles + a plain background colour render consistently
 * across Gmail, Outlook, Apple Mail and mobile clients.
 */
function shell(title, bodyHtml) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f3f5;padding:32px 0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <span style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#15181f;">
                Cine<span style="color:${BRAND.accent};">Snap</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#15181f;">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:20px;color:#8a94a8;font-size:12px;line-height:1.6;">
              © 2026 CineSnap · Booked in seconds.<br/>
              You're receiving this because you have a CineSnap account.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function btn(label, href) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
    <tr>
      <td align="center" bgcolor="${BRAND.accent}" style="border-radius:9999px;">
        <a href="${href}" style="display:inline-block;padding:13px 26px;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">${label}</a>
      </td>
    </tr>
  </table>`;
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
    // Brevo's HTTPS API has no separate cid field like nodemailer's SMTP
    // transport — it links inline images by matching cid: to the attachment's
    // filename directly, so both must use the same identifier here.
    const qrFilename = 'ticketqr.png';
    attachments.push({
      filename: qrFilename,
      content: Buffer.from(base64, 'base64'),
      cid: qrFilename,
    });
    qrBlock = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
      <tr>
        <td align="center" bgcolor="#f7f7f8" style="border:1px solid #e5e7eb;border-radius:14px;padding:20px;">
          <img src="cid:${qrFilename}" width="200" height="200" alt="Ticket QR code" style="display:block;margin:0 auto;" />
          <p style="color:#15181f;font-size:12px;margin:12px 0 0;font-weight:600;">Scan at the door to check in</p>
          <p style="color:#6b7280;font-size:11px;margin:4px 0 0;font-family:monospace;">${booking.bookingCode}</p>
        </td>
      </tr>
    </table>`;
  }

  const body = `
    <p style="color:#3f4653;font-size:15px;line-height:1.6;margin:0 0 20px;">
      Hi ${booking.userName || 'there'}, your tickets are confirmed. 🎬
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f8;border:1px solid #e5e7eb;border-radius:14px;">
      <tr><td style="padding:14px 20px 0;color:#8a94a8;font-size:13px;">Movie</td><td style="padding:14px 20px 0;text-align:right;font-weight:600;color:#15181f;font-size:13px;">${booking.movieTitle || 'Your movie'}</td></tr>
      <tr><td style="padding:8px 20px 0;color:#8a94a8;font-size:13px;">Date</td><td style="padding:8px 20px 0;text-align:right;color:#15181f;font-size:13px;">${booking.showDate}</td></tr>
      <tr><td style="padding:8px 20px 0;color:#8a94a8;font-size:13px;">Time</td><td style="padding:8px 20px 0;text-align:right;color:#15181f;font-size:13px;">${booking.showTime}</td></tr>
      <tr><td style="padding:8px 20px 0;color:#8a94a8;font-size:13px;">Seats</td><td style="padding:8px 20px 0;text-align:right;font-weight:600;color:#15181f;font-size:13px;">${seats}</td></tr>
      <tr><td style="padding:8px 20px 0;color:#8a94a8;font-size:13px;">Total paid</td><td style="padding:8px 20px 0;text-align:right;font-weight:700;color:${BRAND.accent};font-size:13px;">₹${Number(booking.totalAmount).toFixed(2)}</td></tr>
      <tr><td style="padding:8px 20px 14px;color:#8a94a8;font-size:13px;">Booking code</td><td style="padding:8px 20px 14px;text-align:right;font-family:monospace;color:#15181f;font-size:13px;">${booking.bookingCode}</td></tr>
    </table>
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
    <p style="color:#3f4653;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Hi ${name || 'there'}, you just signed in to CineSnap.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f8;border:1px solid #e5e7eb;border-radius:14px;">
      <tr><td style="padding:14px 20px;color:#8a94a8;font-size:13px;">When</td><td style="padding:14px 20px;text-align:right;color:#15181f;font-size:13px;">${when || 'just now'}</td></tr>
      ${device ? `<tr><td style="padding:0 20px 14px;color:#8a94a8;font-size:13px;">Device</td><td style="padding:0 20px 14px;text-align:right;color:#15181f;font-size:13px;">${device}</td></tr>` : ''}
    </table>
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
    <p style="color:#3f4653;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Welcome to CineSnap, ${name || 'movie lover'}! 🍿 You're all set to discover trending films
      and book seats in seconds.
    </p>
    <p style="color:#8a94a8;font-size:14px;margin:0;">Here's what you can do next:</p>
    <ul style="color:#3f4653;font-size:14px;line-height:1.8;margin:8px 0 0;padding-left:20px;">
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
