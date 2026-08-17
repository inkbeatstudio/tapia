const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'en';
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(30, Number(req.query.pageSize) || 6);
  const offset = (page - 1) * pageSize;

  const { rows } = await db.query(
    `SELECT id, slug, title, excerpt, cover_image_url, category, published_at
     FROM articles WHERE lang = $1 AND is_published = TRUE
     ORDER BY published_at DESC LIMIT $2 OFFSET $3`,
    [lang, pageSize, offset]
  );
  const countRes = await db.query(
    `SELECT COUNT(*) FROM articles WHERE lang = $1 AND is_published = TRUE`, [lang]
  );
  res.json({ items: rows, total: Number(countRes.rows[0].count), page, pageSize });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'en';
  const { rows } = await db.query(
    `SELECT * FROM articles WHERE slug = $1 AND lang = $2 AND is_published = TRUE`,
    [req.params.slug, lang]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Article not found' });
  res.json(rows[0]);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.get('/admin/all', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, slug, lang, title, category, author_id, is_published, published_at, updated_at
     FROM articles ORDER BY updated_at DESC`
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const a = req.body || {};
  if (!a.title || !a.slug) return res.status(400).json({ error: 'title and slug are required' });
  const { rows } = await db.query(
    `INSERT INTO articles (slug, lang, title, excerpt, body, category, cover_image_url, author_id, is_published, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [a.slug, a.lang || 'en', a.title, a.excerpt, a.body, a.category, a.coverImageUrl || null, req.user.sub,
     !!a.isPublished, a.isPublished ? new Date() : null]
  );
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'create','article',$2)`,
    [req.user.sub, rows[0].id]
  );
  res.status(201).json(rows[0]);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['title', 'excerpt', 'body', 'category', 'cover_image_url', 'is_published', 'seo_title', 'seo_description'];
  const fields = [];
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    if (allowed.includes(column)) { params.push(value); fields.push(`${column} = $${params.length}`); }
  }
  if (req.body.isPublished) {
    fields.push(`published_at = COALESCE(published_at, now())`);
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE articles SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Article not found' });

  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'update','article',$2)`,
    [req.user.sub, req.params.id]
  );
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'delete','article',$2)`,
    [req.user.sub, req.params.id]
  );
  res.status(204).send();
}));

module.exports = router;
