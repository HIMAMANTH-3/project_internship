// middleware/auth.js — JWT authentication & role guards
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ai-export-advisor-secret-key-2024';

/**
 * requireAuth — verifies Bearer JWT token and attaches req.user
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
}

/**
 * requireAdmin — allows only admin users through
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, JWT_SECRET };
