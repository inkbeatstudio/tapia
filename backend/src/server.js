require('dotenv').config();

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection (request continues, process stays alive):', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception (process stays alive):', err);
});

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const vacanciesRoutes = require('./routes/vacancies');
const countriesRoutes = require('./routes/countries');
const reviewsRoutes = require('./routes/reviews');
const articlesRoutes = require('./routes/articles');
const mediaRoutes = require('./routes/media');
const usersRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const socialLinksRoutes = require('./routes/social-links');
const officesRoutes = require('./routes/offices');
const processStepsRoutes = require('./routes/process-steps');
const teamRoutes = require('./routes/team');
const licensesRoutes = require('./routes/licenses');
const faqsRoutes = require('./routes/faqs');
const subscribersRoutes = require('./routes/subscribers');
const twofaRoutes = require('./routes/twofa');
const contentBlocksRoutes = require('./routes/content-blocks');

const app = express();
app.disable('x-powered-by');
app.disable('etag');
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/vacancies', vacanciesRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/offices', officesRoutes);
app.use('/api/process-steps', processStepsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/licenses', licensesRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/auth/2fa', twofaRoutes);
app.use('/api/content-blocks', contentBlocksRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  const message = process.env.NODE_ENV === 'production' && (err.status || 500) === 500
    ? 'Internal server error'
    : (err.message || 'Internal server error');
  res.status(err.status || 500).json({ error: message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`TEPIA GROUP API listening on port ${port} (${process.env.NODE_ENV || 'development'})`);
});
