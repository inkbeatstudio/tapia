const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { notifyVacancySubscribers } = require('../mailer');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { lang = 'en', country, category, hot } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 12);
  const offset = (page - 1) * pageSize;

  const where = ['is_published = TRUE', 'lang = $1'];
  const params = [lang];
  if (country) { params.push(country); where.push(`country = $${params.length}`); }
  if (category) { params.push(category); where.push(`category = $${params.length}`); }
  if (hot === 'true') { where.push('is_hot = TRUE'); }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  params.push(pageSize, offset);

  const { rows } = await db.query(
    `SELECT id, slug, title, employer, country, city, region, category, salary_from, salary_to,
            currency, schedule, accommodation, gender, conditions, photo_url, is_hot, updated_at
     FROM vacancies ${whereSql}
     ORDER BY is_hot DESC, updated_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  const countRes = await db.query(`SELECT COUNT(*) FROM vacancies ${whereSql}`, params.slice(0, params.length - 2));

  res.json({ items: rows, total: Number(countRes.rows[0].count), page, pageSize });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'en';
  const { rows } = await db.query(
    `SELECT * FROM vacancies WHERE slug = $1 AND lang = $2 AND is_published = TRUE`,
    [req.params.slug, lang]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Vacancy not found' });
  res.json(rows[0]);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.get('/admin/all', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, slug, lang, title, country, city, salary_from, currency, is_hot, is_published, updated_at
     FROM vacancies ORDER BY updated_at DESC`
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const v = req.body || {};
  if (!v.title || !v.slug || !v.country || !v.city) {
    return res.status(400).json({ error: 'title, slug, country and city are required' });
  }
  const { rows } = await db.query(
    `INSERT INTO vacancies
      (slug, lang, title, employer, country, city, region, category, salary_from, salary_to,
       currency, schedule, accommodation, description, requirements, conditions,
       gender, photo_url, is_hot, is_published, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING *`,
    [v.slug, v.lang || 'en', v.title, v.employer, v.country, v.city, v.region, v.category,
     v.salaryFrom, v.salaryTo, v.currency || 'EUR', v.schedule, v.accommodation,
     v.description, v.requirements || [], v.conditions || [],
     v.gender || 'any', v.photoUrl, !!v.isHot, !!v.isPublished, req.user.sub]
  );
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'create','vacancy',$2)`,
    [req.user.sub, rows[0].id]
  );
  if (rows[0].is_published && rows[0].lang === 'en') {
    notifyVacancySubscribers(rows[0]).catch((err) => {
      console.error('[vacancies] subscriber notification failed:', err.message);
    });
  }
  res.status(201).json(rows[0]);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const allowed = [
    'title', 'employer', 'country', 'city', 'region', 'category', 'salary_from', 'salary_to',
    'currency', 'schedule', 'accommodation', 'description', 'requirements',
    'conditions', 'gender', 'photo_url', 'is_hot', 'is_published',
  ];
  const before = await db.query('SELECT is_published FROM vacancies WHERE id = $1', [req.params.id]);
  const wasPublished = before.rows[0]?.is_published;

  const fields = [];
  const params = [];
  for (const [key, value] of Object.entries(req.body || {})) {
    const column = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    if (allowed.includes(column)) {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    }
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE vacancies SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Vacancy not found' });

  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'update','vacancy',$2)`,
    [req.user.sub, req.params.id]
  );
  if (!wasPublished && rows[0].is_published && rows[0].lang === 'en') {
    notifyVacancySubscribers(rows[0]).catch((err) => {
      console.error('[vacancies] subscriber notification failed:', err.message);
    });
  }
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await db.query('DELETE FROM vacancies WHERE id = $1', [req.params.id]);
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'delete','vacancy',$2)`,
    [req.user.sub, req.params.id]
  );
  res.status(204).send();
}));

module.exports = router;
