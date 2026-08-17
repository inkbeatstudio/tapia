const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticator } = require('otplib');
const db = require('../db');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, name, email, password_hash, role, is_active, totp_enabled FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    if (user.totp_enabled) {
      const tempToken = jwt.sign(
        { sub: user.id, stage: '2fa-pending' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ requiresTwoFactor: true, tempToken });
    }

    const token = issueToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[auth] login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

router.post('/login-2fa', loginLimiter, asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body || {};
  if (!tempToken || !code) {
    return res.status(400).json({ error: 'tempToken and code are required' });
  }

  let payload;
  try {
    payload = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
  if (payload.stage !== '2fa-pending') {
    return res.status(401).json({ error: 'Invalid session. Please log in again.' });
  }

  const { rows } = await db.query(
    'SELECT id, name, email, role, is_active, totp_secret, totp_enabled FROM users WHERE id = $1',
    [payload.sub]
  );
  const user = rows[0];
  if (!user || !user.is_active || !user.totp_enabled || !user.totp_secret) {
    return res.status(401).json({ error: 'Two-factor authentication is not available for this account.' });
  }

  const isValid = authenticator.check(String(code).trim(), user.totp_secret);
  if (!isValid) {
    return res.status(401).json({ error: 'Incorrect code. Please try again.' });
  }

  const token = issueToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}));

module.exports = router;
