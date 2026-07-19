const MailComposer = require('nodemailer/lib/mail-composer');

/**
 * Send email through the Gmail API (HTTPS, port 443) using OAuth2 — free up to
 * ~500 recipients/day on a personal Gmail account.
 *
 * Why this exists: Render blocks outbound SMTP, and free relay providers
 * (Brevo etc.) send from a *shared* domain whose reputation causes Gmail to
 * defer/rate-limit mail. The Gmail API sends from the user's real Gmail
 * account through Google's own servers, so Gmail trusts it fully — no shared
 * domain, no deferrals, straight to the inbox.
 *
 * Required env vars (all free to create — Google Cloud Console + OAuth playground):
 *   GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET — an OAuth client of your own GCP project
 *   GMAIL_REFRESH_TOKEN — long-lived token authorized with the gmail.send scope
 *   EMAIL_USER — the Gmail address the token belongs to (used as From)
 */
const clientId = (process.env.GMAIL_CLIENT_ID || '').trim();
const clientSecret = (process.env.GMAIL_CLIENT_SECRET || '').trim();
const refreshToken = (process.env.GMAIL_REFRESH_TOKEN || '').trim();

const isGmailEnabled = Boolean(clientId && clientSecret && refreshToken);

// Access tokens live ~1h; cache and refresh 2 min early.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 2 * 60 * 1000) return cachedToken;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gmail token refresh failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

/**
 * Send one email. Returns { sent, messageId } or null when Gmail isn't
 * configured (so callers fall through to the next provider).
 * `attachments` uses nodemailer's shape — cid: inline images work as-is.
 */
async function sendViaGmailApi({ to, subject, html, attachments, from }) {
  if (!isGmailEnabled) return null;

  // Build a full RFC 2822 MIME message (handles HTML + inline cid attachments)
  // with nodemailer's composer — no second mail library needed.
  const mime = await new MailComposer({
    from,
    to,
    subject,
    html,
    attachments,
  })
    .compile()
    .build();

  const raw = mime.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const token = await getAccessToken();
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gmail API ${res.status}: ${body}`);
  }
  const data = await res.json().catch(() => ({}));
  return { sent: true, messageId: data.id };
}

module.exports = { isGmailEnabled, sendViaGmailApi };
