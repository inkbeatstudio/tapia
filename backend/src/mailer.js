const nodemailer = require('nodemailer');
const db = require('./db');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function getNotificationEmail() {
  try {
    const { rows } = await db.query(
      "SELECT value FROM settings WHERE key = 'leads_notification_email' LIMIT 1"
    );
    if (rows[0]?.value) return rows[0].value;
  } catch (err) {
    console.error('[mailer] Could not read leads_notification_email from settings, using .env fallback', err.message);
  }
  return process.env.LEADS_NOTIFICATION_EMAIL;
}

function formatLeadEmailHtml(lead) {
  const rows = [
    ['Name', lead.name],
    ['Phone', lead.phone || '—'],
    ['Email', lead.email || '—'],
    ['Source', lead.source_form],
    ['Vacancy', lead.vacancy_title || '—'],
    ['Message', lead.message || '—'],
  ];
  const rowsHtml = rows
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#8A7862;font-size:13px;">${label}</td><td style="padding:6px 12px;font-weight:600;">${escapeHtml(String(value))}</td></tr>`)
    .join('');
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;">
      <h2 style="color:#241611;">New lead — TEPIA GROUP</h2>
      <table style="border-collapse:collapse;width:100%;">${rowsHtml}</table>
      <p style="margin-top:16px;font-size:12px;color:#8A7862;">
        Open it in the admin panel to update the status and leave a comment.
      </p>
    </div>`;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

async function sendLeadNotification(lead) {
  try {
    const to = await getNotificationEmail();
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM,
      to,
      replyTo: lead.email || undefined,
      subject: `New lead: ${lead.name} (${lead.source_form})`,
      html: formatLeadEmailHtml(lead),
    });
    return { ok: true };
  } catch (error) {
    console.error('[mailer] Failed to send lead notification:', error.message);
    return { ok: false, error: error.message };
  }
}

async function notifyVacancySubscribers(vacancy) {
  try {
    const { rows } = await db.query(
      `SELECT email FROM subscribers WHERE is_active = TRUE AND (country IS NULL OR country = $1)`,
      [vacancy.country]
    );
    if (!rows.length) return { ok: true, sent: 0 };

    const siteUrl = 'https://tepiagroup.pl';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;">
        <h2 style="color:#241611;">New vacancy — TEPIA GROUP</h2>
        <p style="font-size:15px;font-weight:600;">${escapeHtml(vacancy.title)}</p>
        <p style="font-size:13px;color:#8A7862;">${escapeHtml(vacancy.country)}${vacancy.city ? ', ' + escapeHtml(vacancy.city) : ''}${vacancy.salary_from ? ' · from ' + vacancy.salary_from + ' ' + vacancy.currency : ''}</p>
        <a href="${siteUrl}/vacancy.html?slug=${encodeURIComponent(vacancy.slug)}" style="display:inline-block;margin-top:12px;padding:12px 20px;background:#241611;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">View vacancy</a>
        <p style="margin-top:20px;font-size:11px;color:#B39C80;">You are receiving this because you subscribed to vacancy alerts on tepiagroup.pl.</p>
      </div>`;

    const transporter = getTransporter();
    let sent = 0;
    for (const row of rows) {
      try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM,
          to: row.email,
          subject: `New vacancy: ${vacancy.title}`,
          html,
        });
        sent++;
      } catch (err) {
        console.error('[mailer] Failed to notify subscriber', row.email, err.message);
      }
    }
    return { ok: true, sent };
  } catch (error) {
    console.error('[mailer] notifyVacancySubscribers failed:', error.message);
    return { ok: false, error: error.message };
  }
}

module.exports = { sendLeadNotification, notifyVacancySubscribers, getTransporter };
