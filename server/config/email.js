const nodemailer = require('nodemailer');

/**
 * Email transporter.
 * Configured from env. If credentials are missing the app still runs — emails
 * are skipped (and logged) so local development never breaks on missing SMTP.
 */
let transporter = null;
let emailEnabled = false;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  emailEnabled = true;

  transporter.verify((err) => {
    if (err) {
      console.warn('⚠ Email transporter verification failed:', err.message);
      emailEnabled = false;
    } else {
      console.log('✓ Email service ready');
    }
  });
} else {
  console.warn('⚠ EMAIL_USER / EMAIL_PASSWORD not set — emails will be logged, not sent.');
}

module.exports = {
  getTransporter: () => transporter,
  isEmailEnabled: () => emailEnabled,
  EMAIL_FROM: process.env.EMAIL_FROM || 'CineSnap <noreply@cinesnap.com>',
};
