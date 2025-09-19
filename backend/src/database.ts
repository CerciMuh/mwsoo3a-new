// Database setup and management
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'dev.db');
export const db = new Database(dbPath);

// Initialize database tables
export const initializeDatabase = () => {
  console.log('Initializing database...');
  
  // NOTE: We no longer use a DB-backed universities table; universities come from a JSON dataset.
  // Keep users in SQLite only. The universityId stored in users refers to the JSON dataset's id, not a DB FK.
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      universityId INTEGER,
      isVerified INTEGER DEFAULT 0,
      verificationToken TEXT,
      verificationExpires DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    db.exec(createUsersTable);
    console.log('Users table created/verified');
    
    // Add columns for existing databases if missing
    const addUniversityIdColumn = `
      ALTER TABLE users ADD COLUMN universityId INTEGER
    `;
    
    try {
      db.exec(addUniversityIdColumn);
      console.log('Added universityId column to existing users table');
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log('universityId column already exists');
      } else {
        console.log('universityId column setup complete');
      }
    }

    // Add email verification columns if missing
    const tryAddColumn = (sql: string, label: string) => {
      try {
        db.exec(sql);
        console.log(`Added ${label} column to existing users table`);
      } catch (error: any) {
        if (typeof error.message === 'string' && error.message.includes('duplicate column name')) {
          // already exists
        } else {
          // ignore other errors silently to avoid noisy logs
        }
      }
    };
    tryAddColumn(`ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0`, 'isVerified');
    tryAddColumn(`ALTER TABLE users ADD COLUMN verificationToken TEXT`, 'verificationToken');
    tryAddColumn(`ALTER TABLE users ADD COLUMN verificationExpires DATETIME`, 'verificationExpires');
    
    // If an older schema had a foreign key on users.universityId, migrate to drop the FK constraint
    try {
      const fkList = db.prepare("PRAGMA foreign_key_list('users')").all() as any[];
      if (Array.isArray(fkList) && fkList.length > 0) {
        console.log('Detected foreign key on users.universityId; migrating schema to drop FK...');
        db.exec('BEGIN TRANSACTION');
        db.exec(`CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          universityId INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.exec(`INSERT INTO users_new (id, email, password, universityId, created_at)
                 SELECT id, email, password, universityId, created_at FROM users`);
        db.exec('DROP TABLE users');
        db.exec('ALTER TABLE users_new RENAME TO users');
        db.exec('COMMIT');
        console.log('Users table migrated: foreign key removed');
      }
    } catch (err) {
      console.warn('Could not check/migrate users foreign keys:', err);
    }
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

// User database operations (created after table initialization)
export const createUserQueries = () => {
  return {
    // Insert new user
    createUser: db.prepare(`
      INSERT INTO users (email, password, universityId)
      VALUES (?, ?, ?)
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
    
    // Get all users (without passwords)
    getAllUsers: db.prepare(`
      SELECT id, email, created_at, universityId
      FROM users
    `),

    // Verification helpers
    setVerification: db.prepare(`
      UPDATE users SET verificationToken = ?, verificationExpires = ? WHERE id = ?
    `),
    verifyByToken: db.prepare(`
      UPDATE users SET isVerified = 1, verificationToken = NULL, verificationExpires = NULL WHERE verificationToken = ? AND verificationExpires > CURRENT_TIMESTAMP
    `),
    findByVerificationToken: db.prepare(`
      SELECT * FROM users WHERE verificationToken = ?
    `),
    markVerifiedById: db.prepare(`
      UPDATE users SET isVerified = 1, verificationToken = NULL, verificationExpires = NULL WHERE id = ?
    `),
  };
};

// Deprecated: university DB operations removed; universities are JSON-backed.

// Close database connection on process exit
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));