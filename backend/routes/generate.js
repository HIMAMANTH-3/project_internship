// routes/generate.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { generateRecommendation } = require('../ai/engine');
const { run, parseJSON } = require('../db');

// Input sanitizer
function sanitize(str, maxLen = 2000) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLen).replace(/[<>]/g, '');
}

// POST /api/generate
router.post('/', async (req, res) => {
  try {
    const { adminName, productCategory, productDescription, targetMarket, businessGoals, specialRequirements, notes } = req.body;

    // Validation
    const errors = {};
    if (!adminName || adminName.trim().length < 2) errors.adminName = 'Admin name must be at least 2 characters.';
    if (!productCategory || productCategory.trim().length < 2) errors.productCategory = 'Product category is required.';
    if (!productDescription || productDescription.trim().length < 20) errors.productDescription = 'Product description must be at least 20 characters.';
    if (!targetMarket || targetMarket.trim().length < 2) errors.targetMarket = 'Target export market is required.';
    if (!businessGoals || businessGoals.trim().length < 10) errors.businessGoals = 'Business goals must be at least 10 characters.';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const sanitizedData = {
      adminName: sanitize(adminName, 100),
      productCategory: sanitize(productCategory, 100),
      productDescription: sanitize(productDescription, 2000),
      targetMarket: sanitize(targetMarket, 100),
      businessGoals: sanitize(businessGoals, 1000),
      specialRequirements: sanitize(specialRequirements, 500),
      notes: sanitize(notes, 500),
    };

    const { aiResponse, responseTime, promptVersion } = await generateRecommendation(sanitizedData);
    const id = uuidv4();

    await run(
      `INSERT INTO generations (id, admin_name, product_category, product_description, target_market, business_goals, special_requirements, notes, prompt_version, ai_response, response_time_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, sanitizedData.adminName, sanitizedData.productCategory, sanitizedData.productDescription,
       sanitizedData.targetMarket, sanitizedData.businessGoals, sanitizedData.specialRequirements,
       sanitizedData.notes, promptVersion, JSON.stringify(aiResponse), responseTime],
      `INSERT INTO generations (id, admin_name, product_category, product_description, target_market, business_goals, special_requirements, notes, prompt_version, ai_response, response_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, sanitizedData.adminName, sanitizedData.productCategory, sanitizedData.productDescription,
       sanitizedData.targetMarket, sanitizedData.businessGoals, sanitizedData.specialRequirements,
       sanitizedData.notes, promptVersion, aiResponse, responseTime]
    );

    res.json({
      success: true,
      data: {
        id,
        aiResponse,
        responseTime,
        promptVersion,
        inputs: sanitizedData,
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Generate error:', err.message);
    if (err.message.includes('API key') || err.message.includes('configured')) {
      return res.status(503).json({ success: false, error: err.message });
    }
    if (err.message.includes('quota') || err.message.includes('rate') || err.message.includes('429') || err.message.includes('Too Many')) {
      return res.status(429).json({ success: false, error: '⚠️ Gemini API quota exceeded for today. The free tier has a daily limit. Please wait until tomorrow, or upgrade your Google AI account at https://ai.google.dev/gemini-api/docs/rate-limits' });
    }
    res.status(500).json({ success: false, error: 'AI generation failed. Please try again.' });
  }
});

module.exports = router;
