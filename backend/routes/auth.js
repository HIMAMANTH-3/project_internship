// routes/auth.js — Login and session endpoints
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne } = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    // Find user
    const user = await queryOne(
      `SELECT * FROM users WHERE username = ?`, [username.trim().toLowerCase()],
      `SELECT * FROM users WHERE username = $1`, [username.trim().toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT id, username, role, created_at FROM users WHERE id = ?`, [req.user.id],
      `SELECT id, username, role, created_at FROM users WHERE id = $1`, [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;
