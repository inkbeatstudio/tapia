const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { page } = req.query;
  const lang = req.query.lang || 'en';
  if (!page) return res.status(400).json({ error: 'page query param is required' });
  const { rows } = await db.query(
    `SELECT block_key, value FROM content_blocks WHERE page = $1 AND lang = $2`,
    [page, lang]
  );
  const out = {};
  rows.forEach((r) => { out[r.block_key] = r.value; });
  res.json(out);
}));

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.get('/admin/all', asyncHandler(async (req, res) => {
  const { page } = req.query;
  const params = [];
  let where = '';
  if (page) { params.push(page); where = 'WHERE page = $1'; }
  const { rows } = await db.query(`SELECT * FROM content_blocks ${where} ORDER BY page, block_key, lang`, params);
  res.json(rows);
}));

router.put('/', asyncHandler(async (req, res) => {
  const { page, blockKey, lang, value } = req.body || {};
  if (!page || !blockKey || !lang) {
    return res.status(400).json({ error: 'page, blockKey and lang are required' });
  }
  const { rows } = await db.query(
    `INSERT INTO content_blocks (page, block_key, lang, value) VALUES ($1,$2,$3,$4)
     ON CONFLICT (page, block_key, lang) DO UPDATE SET value = EXCLUDED.value
     RETURNING *`,
    [page, blockKey, lang, value || '']
  );
  res.json(rows[0]);
}));

module.exports = router;
