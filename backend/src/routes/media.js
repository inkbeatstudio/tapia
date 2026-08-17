const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString('hex');
    cb(null, `${safeName}${ext}`);
  },
});

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error('This file type is not allowed. Supported: images, PDF, Word, Excel.'));
    }
    cb(null, true);
  },
});

router.use(requireAuth, requireRole('admin', 'content_manager'));

router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded (field name must be "file")' });

  const fileUrl = `/uploads/${req.file.filename}`;
  const { rows } = await db.query(
    `INSERT INTO media (file_url, file_type, original_name, size_bytes, category, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [fileUrl, req.file.mimetype, req.file.originalname, req.file.size, req.body.category || 'general', req.user.sub]
  );
  res.status(201).json(rows[0]);
}));

router.get('/', asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const params = [];
  const where = [];
  if (category && category !== 'all') { params.push(category); where.push(`category = $${params.length}`); }
  if (search) { params.push('%' + search + '%'); where.push(`original_name ILIKE $${params.length}`); }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const { rows } = await db.query(
    `SELECT * FROM media ${whereSql} ORDER BY created_at DESC LIMIT 500`, params
  );
  res.json(rows);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT file_url FROM media WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'File not found' });

  const filePath = path.join(UPLOAD_DIR, path.basename(rows[0].file_url));
  fs.unlink(filePath, () => {});

  await db.query('DELETE FROM media WHERE id = $1', [req.params.id]);
  res.status(204).send();
}));

router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
