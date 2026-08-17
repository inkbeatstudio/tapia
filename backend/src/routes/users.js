const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const VALID_ROLES = ['admin', 'content_manager', 'leads_manager'];

router.use(requireAuth, requireRole('admin'));

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, name, email, role, is_active, totp_enabled, created_at
     FROM users ORDER BY created_at ASC`
  );
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password and role are required' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if (password.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 characters long' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email.toLowerCase().trim(), passwordHash, role]
    );
    await db.query(
      `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'create','user',$2)`,
      [req.user.sub, rows[0].id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A user with this email already exists' });
    console.error('[users] create error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const { name, role, isActive, password } = req.body || {};

  if (req.params.id === req.user.sub && isActive === false) {
    return res.status(400).json({ error: 'You cannot deactivate your own account' });
  }
  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` });
  }
  if (password && password.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 characters long' });
  }

  const fields = [];
  const params = [];
  if (name !== undefined) { params.push(name); fields.push(`name = $${params.length}`); }
  if (role !== undefined) { params.push(role); fields.push(`role = $${params.length}`); }
  if (isActive !== undefined) { params.push(isActive); fields.push(`is_active = $${params.length}`); }
  if (password) {
    const passwordHash = await bcrypt.hash(password, 12);
    params.push(passwordHash);
    fields.push(`password_hash = $${params.length}`);
  }
  if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });

  params.push(req.params.id);
  const { rows } = await db.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = now() WHERE id = $${params.length}
     RETURNING id, name, email, role, is_active, created_at`,
    params
  );
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });

  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES ($1,'update','user',$2,$3)`,
    [req.user.sub, req.params.id, JSON.stringify({ role, isActive, passwordChanged: !!password })]
  );
  res.json(rows[0]);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  if (req.params.id === req.user.sub) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'delete','user',$2)`,
    [req.user.sub, req.params.id]
  );
  res.status(204).send();
}));

module.exports = router;
