const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'en';
  const { rows } = await db.query(
    `SELECT * FROM faqs WHERE lang = $1 ORDER BY sort_order ASC`,
    [lang]
  );
  res.json(rows);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.get('/admin/all', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM faqs ORDER BY slug ASC, lang ASC');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const f = req.body || {};
  if (!f.slug || !f.question) return res.status(400).json({ error: 'slug and question are required' });
  const { rows } = await db.query(
    `INSERT INTO faqs (lang, slug, question, answer, sort_order)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [f.lang || 'en', f.slug, f.question, f.answer, f.sortOrder || 0]
  );
  res.status(201).json(rows[0]);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['question', 'answer', 'sort_order'];
  const fields = [];
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    if (allowed.includes(column)) { params.push(value); fields.push(`${column} = $${params.length}`); }
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE faqs SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'FAQ not found' });
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM faqs WHERE id = $1', [req.params.id]);
  res.status(204).send();
}));

module.exports = router;
