const express = require('express');
const rateLimit = require('express-rate-limit');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

router.post('/', subscribeLimiter, asyncHandler(async (req, res) => {
  const { email, lang, country } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  const { rows } = await db.query(
    `INSERT INTO subscribers (email, lang, country) VALUES ($1,$2,$3)
     ON CONFLICT (email) DO UPDATE SET is_active = TRUE, lang = EXCLUDED.lang, country = EXCLUDED.country
     RETURNING id`,
    [email.toLowerCase().trim(), lang || 'en', country || null]
  );
  res.status(201).json({ id: rows[0].id, status: 'subscribed' });
}));

router.use(requireAuth, requireRole('admin', 'content_manager', 'leads_manager'));

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 1000');
  res.json(rows);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM subscribers WHERE id = $1', [req.params.id]);
  res.status(204).send();
}));

module.exports = router;
