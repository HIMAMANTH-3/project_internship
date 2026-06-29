// server.js — Main Express application entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '30'),
  message: { success: false, error: 'Too many requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'AI generation rate limit reached. Please wait 1 minute.' },
});

app.use('/api/', generalLimiter);
app.use('/api/generate', generateLimiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/history', require('./routes/history'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/admin/analytics', require('./routes/analytics'));
app.use('/api/analytics/quality', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AI Export Market Product Positioning Advisor API'
  });
});

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
});

// ── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 AI Export Advisor API running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🤖 AI Model: ${process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : process.env.OPENAI_API_KEY ? 'GPT-4o' : '⚠️  No API key configured!'}`);
      console.log(`\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
