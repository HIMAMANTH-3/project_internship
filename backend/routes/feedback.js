// routes/feedback.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, queryOne } = require('../db');

// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const { generationId, rating, comment, isThumbsUp } = req.body;

    if (!generationId) {
      return res.status(400).json({ success: false, error: 'generationId is required.' });
    }

    // Check if generation exists
    const gen = await queryOne(
      `SELECT id FROM generations WHERE id = ?`, [generationId],
      `SELECT id FROM generations WHERE id = $1`, [generationId]
    );
    if (!gen) {
      return res.status(404).json({ success: false, error: 'Generation not found.' });
    }

    const id = uuidv4();
    const sanitizedComment = comment ? String(comment).trim().slice(0, 1000) : null;
    const ratingVal = rating && rating >= 1 && rating <= 5 ? parseInt(rating) : null;
    const thumbsVal = typeof isThumbsUp === 'boolean' ? (isThumbsUp ? 1 : 0) : null;

    await run(
      `INSERT INTO feedback (id, generation_id, rating, comment, is_thumbs_up) VALUES (?, ?, ?, ?, ?)`,
      [id, generationId, ratingVal, sanitizedComment, thumbsVal],
      `INSERT INTO feedback (id, generation_id, rating, comment, is_thumbs_up) VALUES ($1, $2, $3, $4, $5)`,
      [id, generationId, ratingVal, sanitizedComment, typeof isThumbsUp === 'boolean' ? isThumbsUp : null]
    );

    // Update rating on the generation record if star rating provided
    if (ratingVal) {
      await run(
        `UPDATE generations SET rating = ? WHERE id = ?`,
        [ratingVal, generationId],
        `UPDATE generations SET rating = $1 WHERE id = $2`,
        [ratingVal, generationId]
      );
    }

    res.json({ success: true, data: { id, generationId, rating: ratingVal, isThumbsUp, comment: sanitizedComment } });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to save feedback.' });
  }
});

module.exports = router;
