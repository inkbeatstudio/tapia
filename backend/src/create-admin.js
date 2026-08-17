require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const VALID_ROLES = ['admin', 'content_manager', 'leads_manager'];

async function main() {
  const [name, email, password, roleArg] = process.argv.slice(2);
  const role = roleArg || 'admin';

  if (!name || !email || !password) {
    console.error('Usage: node src/create-admin.js "Full Name" email@example.com "password" [admin|content_manager|leads_manager]');
    process.exit(1);
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role "${role}". Must be one of: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, role = EXCLUDED.role`,
    [name, email.toLowerCase().trim(), passwordHash, role]
  );

  console.log(`User ready: ${email} (role: ${role})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
