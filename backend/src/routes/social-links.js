const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM social_links ORDER BY sort_order ASC');
  res.json(rows);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.post('/', asyncHandler(async (req, res) => {
  const { platform, icon, url, sortOrder } = req.body || {};
  if (!platform || !url) return res.status(400).json({ error: 'platform and url are required' });
  const { rows } = await db.query(
    `INSERT INTO social_links (platform, icon, url, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
    [platform, icon || null, url, sortOrder || 0]
  );
  res.status(201).json(rows[0]);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['platform', 'icon', 'url', 'sort_order'];
  const fields = [];
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    if (allowed.includes(column)) { params.push(value); fields.push(`${column} = $${params.length}`); }
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE social_links SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM social_links WHERE id = $1', [req.params.id]);
  res.status(204).send();
}));

module.exports = router;
