const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const { asyncHandler } = require('../utils/asyncHandler');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { sendLeadNotification } = require('../mailer');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const VALID_SOURCES = ['consultation', 'partnership', 'vacancy_apply', 'contact_page'];

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = crypto.randomBytes(16).toString('hex');
    cb(null, `${safeName}${ext}`);
  },
});
const ATTACHMENT_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ATTACHMENT_TYPES.includes(file.mimetype)) {
      return cb(new Error('This file type is not allowed. Supported: JPG, PNG, PDF, Word.'));
    }
    cb(null, true);
  },
});

const leadsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LEADS_RATE_LIMIT_PER_15MIN || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

router.post('/', leadsLimiter, uploadAttachment.single('attachment'), asyncHandler(async (req, res) => {
  const { name, phone, email, message, sourceForm, vacancyId } = req.body || {};

  if (!name || !sourceForm || !VALID_SOURCES.includes(sourceForm)) {
    return res.status(400).json({ error: 'name and a valid sourceForm are required' });
  }
  if (!phone && !email) {
    return res.status(400).json({ error: 'Provide at least a phone number or an email' });
  }

  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const insert = await db.query(
      `INSERT INTO leads (name, phone, email, message, source_form, vacancy_id, attachment_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, phone, email, message, source_form, attachment_url, created_at`,
      [name, phone || null, email || null, message || null, sourceForm, vacancyId || null, attachmentUrl]
    );
    const lead = insert.rows[0];

    let vacancyTitle = null;
    if (vacancyId) {
      const v = await db.query('SELECT title FROM vacancies WHERE id = $1', [vacancyId]);
      vacancyTitle = v.rows[0]?.title || null;
    }

    const result = await sendLeadNotification({ ...lead, vacancy_title: vacancyTitle });
    await db.query(
      `UPDATE leads SET email_sent = $1, email_error = $2, email_attempts = email_attempts + 1
       WHERE id = $3`,
      [result.ok, result.ok ? null : result.error, lead.id]
    );

    res.status(201).json({ id: lead.id, status: 'received' });
  } catch (err) {
    console.error('[leads] create error', err);
    res.status(500).json({ error: 'Could not save your request. Please try again.' });
  }
}));

router.use(requireAuth, requireRole('admin', 'leads_manager'));

router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Number(req.query.pageSize) || 25);
  const offset = (page - 1) * pageSize;

  const where = [];
  const params = [];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  params.push(pageSize, offset);
  const { rows } = await db.query(
    `SELECT id, name, phone, email, source_form, status, email_sent, email_error, attachment_url, created_at
     FROM leads ${whereSql}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const countRes = await db.query(`SELECT COUNT(*) FROM leads ${whereSql}`, params.slice(0, where.length));
  res.json({ items: rows, total: Number(countRes.rows[0].count), page, pageSize });
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  const { rows } = await db.query("SELECT COUNT(*) FROM leads WHERE status = 'new'");
  res.json({ count: Number(rows[0].count) });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { status, managerComment } = req.body || {};
  const fields = [];
  const params = [];

  if (status) {
    params.push(status);
    fields.push(`status = $${params.length}`);
  }
  if (managerComment !== undefined) {
    params.push(managerComment);
    fields.push(`manager_comment = $${params.length}`);
  }
  if (!fields.length) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE leads SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'Lead not found' });

  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1,'update',$2,$3,$4)`,
    [req.user.sub, 'lead', req.params.id, JSON.stringify({ status, managerComment })]
  );

  res.json(rows[0]);
}));

router.post('/:id/resend-email', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
  const lead = rows[0];
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const result = await sendLeadNotification(lead);
  await db.query(
    `UPDATE leads SET email_sent = $1, email_error = $2, email_attempts = email_attempts + 1 WHERE id = $3`,
    [result.ok, result.ok ? null : result.error, lead.id]
  );

  res.json({ ok: result.ok, error: result.error || null });
}));

module.exports = router;
