require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let dollarTag = null;

  const lines = sql.split('\n');
  for (const line of lines) {
    current += line + '\n';

    const dollarMatches = line.match(/\$\$/g) || [];
    if (dollarMatches.length % 2 === 1) {
      dollarTag = dollarTag ? null : '$$';
    }

    if (!dollarTag && line.trim().endsWith(';')) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  const statements = splitStatements(sql);

  console.log(`Applying schema.sql — ${statements.length} statements...`);

  let okCount = 0;
  let failCount = 0;
  for (const [i, stmt] of statements.entries()) {
    try {
      await pool.query(stmt);
      okCount++;
    } catch (err) {
      failCount++;
      const preview = stmt.split('\n')[0].slice(0, 90);
      console.error(`  [${i + 1}/${statements.length}] FAILED: ${preview}`);
      console.error(`  -> ${err.message}`);
    }
  }

  console.log(`Done. ${okCount} statements applied, ${failCount} failed.`);
  if (failCount > 0) {
    console.log('Some statements failed — see errors above. This is often safe to ignore for');
    console.log('"already exists" style messages, but please review anything else.');
  }
  await pool.end();
  if (failCount > 0 && okCount === 0) process.exit(1);
}

main().catch((err) => {
  console.error('Migration failed to run:', err);
  process.exit(1);
});
