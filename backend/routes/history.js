// routes/history.js
const express = require('express');
const router = express.Router();
const { query, queryOne, run, parseJSON } = require('../db');

// GET /api/history
router.get('/', async (req, res) => {
  try {
    const { search, market, category, limit = 50, offset = 0 } = req.query;

    let sqlSqlite = `SELECT id, admin_name, product_category, target_market, business_goals, prompt_version, response_time_ms, rating, created_at FROM generations WHERE 1=1`;
    let sqlPG = sqlSqlite;
    const params = [];
    const pgParams = [];
    let idx = 1;

    if (search) {
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      sqlSqlite += ` AND (admin_name LIKE ? OR product_category LIKE ? OR target_market LIKE ?)`;
      pgParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      sqlPG += ` AND (admin_name ILIKE $${idx++} OR product_category ILIKE $${idx++} OR target_market ILIKE $${idx++})`;
    }
    if (market) {
      params.push(`%${market}%`);
      sqlSqlite += ` AND target_market LIKE ?`;
      pgParams.push(`%${market}%`);
      sqlPG += ` AND target_market ILIKE $${idx++}`;
    }
    if (category) {
      params.push(`%${category}%`);
      sqlSqlite += ` AND product_category LIKE ?`;
      pgParams.push(`%${category}%`);
      sqlPG += ` AND product_category ILIKE $${idx++}`;
    }

    sqlSqlite += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    sqlPG += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    pgParams.push(parseInt(limit), parseInt(offset));

    const rows = await query(sqlSqlite, params, sqlPG, pgParams);
    const total = await query(
      `SELECT COUNT(*) as count FROM generations`,
      [],
      `SELECT COUNT(*) as count FROM generations`,
      []
    );

    res.json({ success: true, data: rows, total: parseInt(total[0]?.count || 0) });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load history.' });
  }
});

// GET /api/history/:id
router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne(
      `SELECT * FROM generations WHERE id = ?`,
      [req.params.id],
      `SELECT * FROM generations WHERE id = $1`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ success: false, error: 'Generation not found.' });

    const feedback = await query(
      `SELECT * FROM feedback WHERE generation_id = ? ORDER BY created_at DESC`,
      [req.params.id],
      `SELECT * FROM feedback WHERE generation_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );

    row.ai_response = parseJSON(row.ai_response);
    res.json({ success: true, data: { ...row, feedback } });
  } catch (err) {
    console.error('History detail error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load generation details.' });
  }
});

// DELETE /api/history/:id
router.delete('/:id', async (req, res) => {
  try {
    await run(
      `DELETE FROM generations WHERE id = ?`,
      [req.params.id],
      `DELETE FROM generations WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true, message: 'Generation deleted successfully.' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete generation.' });
  }
});

// PATCH /api/history/:id/rating
router.patch('/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
    }
    await run(
      `UPDATE generations SET rating = ? WHERE id = ?`,
      [rating, req.params.id],
      `UPDATE generations SET rating = $1 WHERE id = $2`,
      [rating, req.params.id]
    );
    res.json({ success: true, message: 'Rating saved.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update rating.' });
  }
});

module.exports = router;
