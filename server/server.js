const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { ensureReady: initEmail, getMode: getEmailMode } = require('./config/email');
const autoSeed = require('./config/autoSeed');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { handleWebhook, handleRazorpayWebhook } = require('./controllers/paymentController');

const app = express();
app.set('trust proxy', 1);

// ---- CORS ----
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true); // permissive in dev; tighten for production
    },
    credentials: true,
  })
);

// ---- Stripe webhook (MUST be before express.json, needs the raw body) ----
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ---- Razorpay webhook (also needs the raw body for signature verification) ----
app.post('/api/payment/razorpay/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

// ---- Body parsing for everything else ----
app.use(express.json({ limit: '1mb' }));

// ---- Rate limiting ----
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
  })
);

// ---- Health check ----
app.get('/api/health', (req, res) => {
  // `email` surfaces the active delivery path so production email failures are
  // diagnosable without shell access: brevoApi=true means the HTTPS provider
  // (the only one that works on Render) is configured. mode 'smtp'/'ethereal'/
  // 'disabled' reflects the fallback transporter.
  res.json({
    status: 'ok',
    service: 'CineSnap API',
    time: new Date().toISOString(),
    email: {
      gmailApi: !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN),
      brevoApi: !!process.env.BREVO_API_KEY,
      smtpConfigured: !!(process.env.EMAIL_USER && (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS)),
      mode: getEmailMode(),
    },
  });
});

// ---- Routes ----
app.use('/api/movies', require('./routes/movies'));
app.use('/api/shows', require('./routes/shows'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));

// ---- 404 + error handling ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB, then start listening.
connectDB()
  .then(() => {
    initEmail(); // warm up the email transporter (Ethereal/SMTP) in the background
    autoSeed(); // sync movies/shows from seedData.js in the background (idempotent)

    const server = app.listen(PORT, () => {
      console.log(`\n🎬 CineSnap API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });

    // Friendly, actionable message instead of an unhandled 'error' crash.
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `\n✗ Port ${PORT} is already in use.\n` +
            `  Another CineSnap server (or a leftover process) is still running.\n` +
            `  Fix it with one of:\n` +
            `    • Windows:  npx kill-port ${PORT}\n` +
            `    • PowerShell: Get-NetTCPConnection -LocalPort ${PORT} | %{ Stop-Process -Id $_.OwningProcess -Force }\n` +
            `    • Or set a different port:  PORT=5001 npm run dev\n`
        );
      } else {
        console.error('✗ Server error:', err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

module.exports = app;
