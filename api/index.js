// api/index.js - Vercel serverless backend
require('dotenv').config({ path: '../backend/.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Get database from backend
let db = null;
let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;
  try {
    const { initDB } = require('../backend/db');
    await initDB();
    dbInitialized = true;
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('⚠️ Database init error:', err.message);
  }
}

// ── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    /vercel\.app$/,  // Allow all Vercel deployments
    process.env.FRONTEND_URL || ''
  ],
  credentials: true,
  optionsSuccessStatus: 200
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
  skip: (req) => req.method === 'OPTIONS' // Skip preflight requests
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: 'AI generation rate limit reached. Please wait 1 minute.' },
  skip: (req) => req.method === 'OPTIONS'
});

app.use('/api/', generalLimiter);
app.use('/api/generate', generateLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AI Export Market Product Positioning Advisor API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ── Routes (loaded after middleware) ──────────────────────────────────────────
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/generate', require('../backend/routes/generate'));
app.use('/api/feedback', require('../backend/routes/feedback'));
app.use('/api/history', require('../backend/routes/history'));
app.use('/api/templates', require('../backend/routes/templates'));
app.use('/api/admin/analytics', require('../backend/routes/analytics'));
app.use('/api/analytics/quality', require('../backend/routes/analytics'));

// ── OPTIONS Handler for CORS ──────────────────────────────────────────────────
app.options('*', cors());

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected server error occurred.'
      : err.message
  });
});

// ── Export for Vercel ─────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  // Initialize database on first request
  if (!dbInitialized) {
    await initializeDatabase();
  }
  
  // Pass request to Express app
  return app(req, res);
};
