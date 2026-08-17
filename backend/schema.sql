-- ============================================================
-- TEPIA GROUP — database schema
-- Run via: npm run migrate  (executes this file statement by statement)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- users (admin panel accounts) ----------
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('admin','content_manager','leads_manager')),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  totp_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  totp_secret    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- vacancies (executive search mandates) ----------
CREATE TABLE IF NOT EXISTS vacancies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL,
  lang           TEXT NOT NULL DEFAULT 'en',
  title          TEXT NOT NULL,
  employer       TEXT,
  country        TEXT,
  city           TEXT,
  category       TEXT,
  salary_from    NUMERIC,
  salary_to      NUMERIC,
  currency       TEXT DEFAULT 'EUR',
  schedule       TEXT,
  accommodation  TEXT,
  description    TEXT,
  requirements   TEXT[] DEFAULT '{}',
  conditions     TEXT[] DEFAULT '{}',
  is_hot         BOOLEAN NOT NULL DEFAULT FALSE,
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_vacancies_lang_published ON vacancies (lang, is_published);

-- extra fields for the Apolo-style catalog: gender filter, region facet, listing photo
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'any' CHECK (gender IN ('male','female','any'));
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE vacancies ADD COLUMN IF NOT EXISTS photo_url TEXT;
-- NOTE: the existing `conditions TEXT[]` column is reused as "bonuses" in the admin UI (e.g. "free transport", "housing compensation") — no migration needed, just a different label.
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS quote TEXT;

-- ---------- leads (consultation / apply / contact forms) ----------
CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  message         TEXT,
  source_form     TEXT NOT NULL CHECK (source_form IN ('consultation','partnership','vacancy_apply','contact_page')),
  vacancy_id      UUID REFERENCES vacancies(id) ON DELETE SET NULL,
  attachment_url  TEXT,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','done')),
  manager_comment TEXT,
  email_sent      BOOLEAN,
  email_error     TEXT,
  email_attempts  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- ---------- articles (insights / blog) ----------
CREATE TABLE IF NOT EXISTS articles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT NOT NULL,
  lang              TEXT NOT NULL DEFAULT 'en',
  title             TEXT NOT NULL,
  excerpt           TEXT,
  body              TEXT,
  category          TEXT,
  cover_image_url   TEXT,
  author_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  published_at      TIMESTAMPTZ,
  seo_title         TEXT,
  seo_description   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);
CREATE INDEX IF NOT EXISTS idx_articles_lang_published ON articles (lang, is_published);

-- ---------- countries (markets TEPIA operates in) ----------
CREATE TABLE IF NOT EXISTS countries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL,
  lang            TEXT NOT NULL DEFAULT 'en',
  name            TEXT NOT NULL,
  flag_emoji      TEXT,
  flag_image_url  TEXT,
  price_from      NUMERIC,
  currency        TEXT DEFAULT 'EUR',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);

-- ---------- reviews (client / candidate testimonials) ----------
CREATE TABLE IF NOT EXISTS reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name   TEXT NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text          TEXT NOT NULL,
  vacancy_id    UUID REFERENCES vacancies(id) ON DELETE SET NULL,
  screenshots   TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  moderated_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  moderated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- offices ----------
CREATE TABLE IF NOT EXISTS offices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang           TEXT NOT NULL DEFAULT 'en',
  slug           TEXT NOT NULL,
  city_name      TEXT NOT NULL,
  address        TEXT,
  phone          TEXT,
  hours          TEXT,
  manager_name   TEXT,
  photo_url      TEXT,
  map_embed_url  TEXT,
  is_main        BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);

-- ---------- process steps (search methodology) ----------
CREATE TABLE IF NOT EXISTS process_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang            TEXT NOT NULL DEFAULT 'en',
  slug            TEXT NOT NULL,
  step_number     INTEGER NOT NULL DEFAULT 1,
  title           TEXT NOT NULL,
  description     TEXT,
  duration_label  TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);

-- ---------- team members ----------
CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang        TEXT NOT NULL DEFAULT 'en',
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  position    TEXT,
  photo_url   TEXT,
  bio         TEXT,
  quote       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);

-- ---------- licenses / memberships / certifications ----------
CREATE TABLE IF NOT EXISTS licenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang         TEXT NOT NULL DEFAULT 'en',
  slug         TEXT NOT NULL,
  icon         TEXT,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);

-- ---------- FAQs ----------
CREATE TABLE IF NOT EXISTS faqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang        TEXT NOT NULL DEFAULT 'en',
  slug        TEXT NOT NULL,
  question    TEXT NOT NULL,
  answer      TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, lang)
);

-- ---------- newsletter / vacancy-alert subscribers ----------
CREATE TABLE IF NOT EXISTS subscribers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  lang        TEXT NOT NULL DEFAULT 'en',
  country     TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- media library ----------
CREATE TABLE IF NOT EXISTS media (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url       TEXT NOT NULL,
  file_type      TEXT,
  original_name  TEXT,
  size_bytes     BIGINT,
  category       TEXT DEFAULT 'general',
  uploaded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- site-wide key/value settings ----------
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- social links ----------
CREATE TABLE IF NOT EXISTS social_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform    TEXT NOT NULL,
  icon        TEXT,
  url         TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- free-form content blocks (page builder) ----------
CREATE TABLE IF NOT EXISTS content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page        TEXT NOT NULL,
  block_key   TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'en',
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page, block_key, lang)
);

-- ---------- audit log ----------
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- seed: default public settings ----------
INSERT INTO settings (key, value) VALUES
  ('site_phone', '+48 22 123 45 67'),
  ('site_email', 'office@tepiagroup.pl'),
  ('telegram_url', 'https://t.me/tepiagroup'),
  ('whatsapp_url', 'https://wa.me/48221234567'),
  ('viber_url', ''),
  ('logo_url', '/assets/img/logo.png'),
  ('leads_notification_email', 'office@tepiagroup.pl')
ON CONFLICT (key) DO NOTHING;
