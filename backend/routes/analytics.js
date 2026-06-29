// routes/analytics.js
const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/admin/analytics
router.get('/', async (req, res) => {
  try {
    const [totalRows] = await query(
      `SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM generations`, [],
      `SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM generations`, []
    );

    const marketRows = await query(
      `SELECT target_market as market, COUNT(*) as count FROM generations GROUP BY target_market ORDER BY count DESC LIMIT 10`,
      [],
      `SELECT target_market as market, COUNT(*) as count FROM generations GROUP BY target_market ORDER BY count DESC LIMIT 10`,
      []
    );

    const categoryRows = await query(
      `SELECT product_category as category, COUNT(*) as count FROM generations GROUP BY product_category ORDER BY count DESC LIMIT 10`,
      [],
      `SELECT product_category as category, COUNT(*) as count FROM generations GROUP BY product_category ORDER BY count DESC LIMIT 10`,
      []
    );

    const dailyRows = await query(
      `SELECT date(created_at) as date, COUNT(*) as count FROM generations GROUP BY date(created_at) ORDER BY date ASC LIMIT 30`,
      [],
      `SELECT DATE(created_at) as date, COUNT(*) as count FROM generations GROUP BY DATE(created_at) ORDER BY date ASC LIMIT 30`,
      []
    );

    const monthlyRows = await query(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM generations GROUP BY strftime('%Y-%m', created_at) ORDER BY month ASC`,
      [],
      `SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count FROM generations GROUP BY TO_CHAR(created_at, 'YYYY-MM') ORDER BY month ASC`,
      []
    );

    const recentRows = await query(
      `SELECT id, admin_name, product_category, target_market, rating, created_at FROM generations ORDER BY created_at DESC LIMIT 5`,
      [],
      `SELECT id, admin_name, product_category, target_market, rating, created_at FROM generations ORDER BY created_at DESC LIMIT 5`,
      []
    );

    res.json({
      success: true,
      data: {
        totalGenerations: parseInt(totalRows?.total || 0),
        avgRating: parseFloat(totalRows?.avg_rating || 0).toFixed(2),
        topMarkets: marketRows,
        topCategories: categoryRows,
        dailyTrend: dailyRows,
        monthlyTrend: monthlyRows,
        recentActivity: recentRows
      }
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load analytics.' });
  }
});

// GET /api/analytics/quality
router.get('/quality', async (req, res) => {
  try {
    const ratingDist = await query(
      `SELECT rating, COUNT(*) as count FROM generations WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating`,
      [],
      `SELECT rating, COUNT(*) as count FROM generations WHERE rating IS NOT NULL GROUP BY rating ORDER BY rating`,
      []
    );

    const avgResponseTime = await query(
      `SELECT AVG(response_time_ms) as avg_ms, MIN(response_time_ms) as min_ms, MAX(response_time_ms) as max_ms FROM generations`,
      [],
      `SELECT AVG(response_time_ms) as avg_ms, MIN(response_time_ms) as min_ms, MAX(response_time_ms) as max_ms FROM generations`,
      []
    );

    const thumbsStats = await query(
      `SELECT is_thumbs_up, COUNT(*) as count FROM feedback WHERE is_thumbs_up IS NOT NULL GROUP BY is_thumbs_up`,
      [],
      `SELECT is_thumbs_up, COUNT(*) as count FROM feedback WHERE is_thumbs_up IS NOT NULL GROUP BY is_thumbs_up`,
      []
    );

    const feedbackRows = await query(
      `SELECT f.rating, f.comment, f.is_thumbs_up, f.created_at, g.target_market, g.product_category
       FROM feedback f JOIN generations g ON f.generation_id = g.id ORDER BY f.created_at DESC LIMIT 10`,
      [],
      `SELECT f.rating, f.comment, f.is_thumbs_up, f.created_at, g.target_market, g.product_category
       FROM feedback f JOIN generations g ON f.generation_id = g.id ORDER BY f.created_at DESC LIMIT 10`,
      []
    );

    res.json({
      success: true,
      data: {
        ratingDistribution: ratingDist,
        responseTimeStats: avgResponseTime[0] || {},
        thumbsStats,
        recentFeedback: feedbackRows
      }
    });
  } catch (err) {
    console.error('Quality analytics error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load quality analytics.' });
  }
});

module.exports = router;
