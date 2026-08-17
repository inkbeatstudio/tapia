const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/setup', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT email, totp_enabled FROM users WHERE id = $1', [req.user.sub]);
  const user = rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.totp_enabled) return res.status(400).json({ error: 'Two-factor authentication is already enabled' });

  const secret = authenticator.generateSecret();
  await db.query('UPDATE users SET totp_secret = $1 WHERE id = $2', [secret, req.user.sub]);

  const otpauth = authenticator.keyuri(user.email, 'TEPIA GROUP Admin', secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  res.json({ secret, qrDataUrl });
}));

router.post('/verify-setup', asyncHandler(async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const { rows } = await db.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.sub]);
  const secret = rows[0]?.totp_secret;
  if (!secret) return res.status(400).json({ error: 'Call /setup first' });

  const isValid = authenticator.check(String(code).trim(), secret);
  if (!isValid) return res.status(400).json({ error: 'Invalid code. Please try again.' });

  await db.query('UPDATE users SET totp_enabled = TRUE WHERE id = $1', [req.user.sub]);
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'enable','2fa',$1)`,
    [req.user.sub]
  );
  res.json({ ok: true });
}));

router.post('/disable', asyncHandler(async (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password is required to disable 2FA' });

  const { rows } = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.sub]);
  const ok = rows[0] && await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Incorrect password' });

  await db.query('UPDATE users SET totp_enabled = FALSE, totp_secret = NULL WHERE id = $1', [req.user.sub]);
  await db.query(
    `INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES ($1,'disable','2fa',$1)`,
    [req.user.sub]
  );
  res.json({ ok: true });
}));

router.get('/status', asyncHandler(async (req, res) => {
  const { rows } = await db.query('SELECT totp_enabled FROM users WHERE id = $1', [req.user.sub]);
  res.json({ enabled: !!rows[0]?.totp_enabled });
}));

module.exports = router;
