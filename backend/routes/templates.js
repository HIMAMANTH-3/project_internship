// routes/templates.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { query, run, parseJSON } = require('../db');

// GET /api/templates
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      `SELECT * FROM templates ORDER BY created_at ASC`,
      [],
      `SELECT * FROM templates ORDER BY created_at ASC`,
      []
    );
    const templates = rows.map(r => ({ ...r, preset_data: parseJSON(r.preset_data) }));
    res.json({ success: true, data: templates });
  } catch (err) {
    console.error('Templates error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load templates.' });
  }
});

// POST /api/templates
router.post('/', async (req, res) => {
  try {
    const { templateName, category, market, presetData } = req.body;
    if (!templateName || !category || !market || !presetData) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    const id = uuidv4();
    await run(
      `INSERT INTO templates (id, template_name, category, market, preset_data) VALUES (?, ?, ?, ?, ?)`,
      [id, templateName.trim(), category.trim(), market.trim(), JSON.stringify(presetData)],
      `INSERT INTO templates (id, template_name, category, market, preset_data) VALUES ($1, $2, $3, $4, $5)`,
      [id, templateName.trim(), category.trim(), market.trim(), presetData]
    );
    res.json({ success: true, data: { id, templateName, category, market, presetData } });
  } catch (err) {
    console.error('Template create error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create template.' });
  }
});

module.exports = router;
