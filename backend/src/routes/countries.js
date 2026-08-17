const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'en';
  const { rows } = await db.query(
    `SELECT id, slug, name, flag_emoji, flag_image_url, price_from, currency
     FROM countries
     WHERE lang = $1 AND is_published = TRUE
     ORDER BY sort_order ASC, name ASC`,
    [lang]
  );
  res.json(rows);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.get('/admin/all', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT * FROM countries ORDER BY slug ASC, lang ASC`
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const c = req.body || {};
  if (!c.slug || !c.lang || !c.name) {
    return res.status(400).json({ error: 'slug, lang and name are required' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO countries (slug, lang, name, flag_emoji, flag_image_url, price_from, currency, sort_order, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [c.slug, c.lang, c.name, c.flagEmoji || null, c.flagImageUrl || null,
       c.priceFrom || null, c.currency || 'EUR', c.sortOrder || 0, c.isPublished !== false]
    );
    await db.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'create','country',$2)`,
      [req.user.sub, rows[0].id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This country already has an entry for that language' });
    }
    console.error('[countries] create error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = ['name', 'flag_emoji', 'flag_image_url', 'price_from', 'currency', 'sort_order', 'is_published'];
  const fields = [];
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    const column = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
    if (allowed.includes(column)) {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    }
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE countries SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Country not found' });

  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'update','country',$2)`,
    [req.user.sub, req.params.id]
  );
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM countries WHERE id = $1', [req.params.id]);
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'delete','country',$2)`,
    [req.user.sub, req.params.id]
  );
  res.status(204).send();
}));

module.exports = router;
