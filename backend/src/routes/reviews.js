const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, author_name, rating, text, screenshots, created_at
     FROM reviews WHERE status = 'published' ORDER BY created_at DESC LIMIT 30`
  );
  res.json(rows);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.get('/admin/all', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) { params.push(status); where = 'WHERE status = $1'; }
  const { rows } = await db.query(
    `SELECT * FROM reviews ${where} ORDER BY created_at DESC`, params
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const r = req.body || {};
  if (!r.authorName || !r.rating || !r.text) {
    return res.status(400).json({ error: 'authorName, rating and text are required' });
  }
  const { rows } = await db.query(
    `INSERT INTO reviews (author_name, rating, text, vacancy_id, screenshots, status)
     VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
    [r.authorName, r.rating, r.text, r.vacancyId || null, r.screenshots || []]
  );
  res.status(201).json(rows[0]);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['status', 'text', 'rating', 'screenshots'];
  const fields = [];
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    if (allowed.includes(key)) { params.push(value); fields.push(`${key} = $${params.length}`); }
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  if (req.body.status) {
    params.push(req.user.sub);
    fields.push(`moderated_by = $${params.length}`);
    fields.push(`moderated_at = now()`);
  }

  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Review not found' });

  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1,'update','review',$2,$3)`,
    [req.user.sub, req.params.id, JSON.stringify({ status: req.body.status })]
  );
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
  res.status(204).send();
}));

module.exports = router;
