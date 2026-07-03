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
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  // 1. Real SMTP
  if (looksReal(user, pass)) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user, pass },
    });
    try {
      await transporter.verify();
      mode = 'smtp';
      console.log(`✓ Email ready (SMTP as ${user})`);
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

/** Lazily initialize (once) and return the transporter (or null). */
function ensureReady() {
  if (!initPromise) initPromise = init();
  return initPromise;
}

module.exports = {
  ensureReady,
  getMode: () => mode,
  EMAIL_FROM: process.env.EMAIL_FROM || 'CineSnap <noreply@cinesnap.com>',
};
