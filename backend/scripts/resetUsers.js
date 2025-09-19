// Utility script to delete all users from the SQLite database for local testing
// Usage: npm run reset:users

const path = require('path');
const Database = require('better-sqlite3');

// Resolve DB path (allow override via env var)
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'dev.db');

function main() {
  const db = new Database(dbPath);
  try {
    // Ensure users table exists
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableInfo) {
      console.error("users table doesn't exist at:", dbPath);
      process.exit(1);
    }

    const before = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const del = db.prepare('DELETE FROM users');
    const result = del.run();

    // Reset AUTOINCREMENT sequence if present
    try {
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'users'").run();
    } catch (_) {
      // ignore if sqlite_sequence doesn't exist
    }

    const after = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    console.log(`[resetUsers] DB: ${dbPath}`);
    console.log(`[resetUsers] Deleted rows: ${result.changes} (before=${before}, after=${after})`);
    process.exit(0);
  } catch (err) {
    console.error('[resetUsers] Failed to reset users:', err);
    process.exit(1);
  }
}

main();
