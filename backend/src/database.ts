// Database setup and management
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'dev.db');
export const db = new Database(dbPath);

// Initialize database tables
export const initializeDatabase = () => {
  console.log('Initializing database...');

  // Target schema: users(id, email UNIQUE, universityId, created_at)
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      universityId INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    db.exec(createUsersTable);
    console.log('Users table created/verified');

    // Introspect current columns
    const cols = db.prepare("PRAGMA table_info('users')").all() as Array<{ name: string }>;
    const names = new Set(cols.map(c => c.name));
    const hasPassword = names.has('password');
    const hasIsVerified = names.has('isVerified');
    const hasVerificationToken = names.has('verificationToken');
    const hasVerificationExpires = names.has('verificationExpires');
    const hasUniversityId = names.has('universityId');
    const hasCreatedAt = names.has('created_at');

    // If legacy columns exist or universityId/created_at missing, migrate to the new minimal schema
    const needsMigration = hasPassword || hasIsVerified || hasVerificationToken || hasVerificationExpires || !hasUniversityId || !hasCreatedAt;
    if (needsMigration) {
      console.log('Migrating users table to minimal schema (id, email, universityId, created_at)...');
      db.exec('BEGIN TRANSACTION');
      db.exec(`CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        universityId INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Move data from old table if it exists
      try {
        const rows = db.prepare('SELECT * FROM users').all() as any[];
        const insertWithCreated = db.prepare('INSERT INTO users_new (id, email, universityId, created_at) VALUES (?, ?, ?, ?)');
        const insertNoCreated = db.prepare('INSERT INTO users_new (id, email, universityId) VALUES (?, ?, ?)');
        for (const r of rows) {
          const uniId = typeof r.universityId === 'number' ? r.universityId : null;
          if (typeof r.created_at === 'string' || typeof r.created_at === 'number') {
            insertWithCreated.run(r.id, r.email, uniId, r.created_at);
          } else {
            insertNoCreated.run(r.id, r.email, uniId);
          }
        }
      } catch (moveErr) {
        console.warn('No existing rows to migrate or read error:', moveErr);
      }

      db.exec('DROP TABLE users');
      db.exec('ALTER TABLE users_new RENAME TO users');
      db.exec('COMMIT');
      console.log('Users table migrated to minimal schema');
    }

  } catch (error) {
    console.error('Error creating/migrating tables:', error);
  }
};

// User database operations (created after table initialization)
export const createUserQueries = () => {
  return {
    // Insert new user (password/verification removed)
    createUser: db.prepare(`
      INSERT INTO users (email, universityId)
      VALUES (?, ?)
    `),

    // Find user by email
    findUserByEmail: db.prepare(`
      SELECT * FROM users WHERE email = ?
    `),

    // Find user by id (no DB join; university info resolved from JSON dataset elsewhere)
    findUserById: db.prepare(`
      SELECT id, email, created_at, universityId
      FROM users
      WHERE id = ?
    `),

    // Get all users
    getAllUsers: db.prepare(`
      SELECT id, email, created_at, universityId
      FROM users
    `),
  };
};

// Deprecated: university DB operations removed; universities are JSON-backed.

// Close database connection on process exit
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));