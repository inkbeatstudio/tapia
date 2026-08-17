const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const PUBLIC_KEYS = ['site_phone', 'site_email', 'telegram_url', 'viber_url', 'whatsapp_url', 'logo_url'];
const EDITABLE_KEYS = [...PUBLIC_KEYS, 'leads_notification_email'];

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT key, value FROM settings WHERE key = ANY($1)', [PUBLIC_KEYS]);
  const out = {};
  rows.forEach((r) => { out[r.key] = r.value; });
  res.json(out);
}));

router.get('/admin/all', requireAuth, requireRole('admin', 'content_manager'), asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT key, value FROM settings WHERE key = ANY($1)', [EDITABLE_KEYS]);
  const out = {};
  rows.forEach((r) => { out[r.key] = r.value; });
  res.json(out);
}));

router.patch('/', requireAuth, requireRole('admin', 'content_manager'), asyncHandler(async (req, res) => {
  const updates = req.body || {};
  const entries = Object.entries(updates).filter(([key]) => EDITABLE_KEYS.includes(key));
  if (!entries.length) return res.status(400).json({ error: 'No valid settings provided' });

  for (const [key, value] of entries) {
    await db.query(
      `INSERT INTO settings (key, value) VALUES ($1,$2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
  }
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, details) VALUES ($1,'update','settings',$2)`,
    [req.user.sub, JSON.stringify(updates)]
  );
  res.json({ ok: true });
}));

module.exports = router;
