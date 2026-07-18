const nodemailer = require('nodemailer');

/**
 * Email transporter with three modes, chosen automatically:
 *
 *   1. SMTP    — real EMAIL_USER / EMAIL_PASSWORD are set (e.g. Gmail app
 *                password). Emails are actually delivered.
 *   2. ETHEREAL — dev fallback. No real creds, but not production: a free
 *                nodemailer test inbox is created on the fly. Emails "send"
 *                and a preview URL is logged so you can view every message in
 *                the browser — perfect for local testing without Gmail setup.
 *   3. DISABLED — production with no creds, or offline: emails are logged only.
 *
 * Initialization is async (Ethereal needs a network round-trip), so callers
 * await `ensureReady()` before sending.
 */

let transporter = null;
let mode = 'disabled';
let initPromise = null;

function looksReal(user, pass) {
  return (
    user &&
    pass &&
    !user.includes('your-email') &&
    !pass.includes('your-app') &&
    !pass.includes('your_')
  );
}

async function init() {
  // 0. Brevo HTTPS API — the real delivery path in every environment. When it's
  // configured, send() delivers over port 443 and never touches SMTP, so don't
  // waste a startup round-trip verifying an SMTP transporter that won't be used
  // (and would log a misleading "SMTP verification failed" warning on a stale
  // Gmail app password or on Render, where outbound SMTP is blocked anyway).
  if (process.env.BREVO_API_KEY) {
    mode = 'brevo-api';
    console.log('✓ Email ready (Brevo HTTPS API)');
    return null; // send() calls the Brevo API directly; no nodemailer transporter needed
  }

  const user = process.env.EMAIL_USER;
  // Accept either EMAIL_PASSWORD or EMAIL_PASS — both names appear in the wild
  // and mixing them up silently disables real SMTP, so support both.
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST; // set this for non-Gmail SMTP relays (Brevo, SendGrid, Mailgun, ...)

  // 1. Real SMTP
  if (looksReal(user, pass)) {
    // Gmail's SMTP silently times out most connections from cloud-host IP
    // ranges (Render, AWS, etc.) as an anti-abuse measure — EMAIL_HOST lets
    // ops point at a relay provider's SMTP server instead of Gmail directly.
    const transportConfig = host
      ? {
          host,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: { user, pass },
        }
      : {
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: { user, pass },
        };
    transporter = nodemailer.createTransport(transportConfig);
    try {
      await transporter.verify();
      mode = 'smtp';
      console.log(`✓ Email ready (SMTP as ${user}${host ? ` via ${host}` : ''})`);
      return transporter;
    } catch (err) {
      console.warn(`⚠ SMTP verification failed (${err.message}). Falling back…`);
      transporter = null;
    }
  }

  // 2. Ethereal dev inbox
  if (!transporter && process.env.NODE_ENV !== 'production') {
    try {
      const acct = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: acct.user, pass: acct.pass },
      });
      mode = 'ethereal';
      console.log('✓ Email ready (Ethereal test inbox — preview links will be logged for each email)');
      return transporter;
    } catch (err) {
      console.warn(`⚠ Could not create test email account (${err.message}).`);
    }
  }

  // 3. Disabled
  console.warn('⚠ Email disabled — messages will be logged, not sent.');
  mode = 'disabled';
  return null;
}

/**
 * Lazily initialize and return the transporter (or null). A successful init
 * is cached forever, but a failed one is retried on the next call instead of
 * disabling email for the rest of the process's life — useful if the relay
 * had a transient hiccup.
 */
function ensureReady() {
  if (transporter) return Promise.resolve(transporter);
  if (!initPromise) {
    initPromise = init().finally(() => {
      if (!transporter) initPromise = null;
    });
  }
  return initPromise;
}

module.exports = {
  ensureReady,
  getMode: () => mode,
  EMAIL_FROM: process.env.EMAIL_FROM || 'CineSnap <noreply@cinesnap.com>',
};
