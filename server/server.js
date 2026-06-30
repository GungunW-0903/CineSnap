const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { handleWebhook } = require('./controllers/paymentController');

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
  res.json({ status: 'ok', service: 'CineSnap API', time: new Date().toISOString() });
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
    app.listen(PORT, () => {
      console.log(`\n🎬 CineSnap API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

module.exports = app;
