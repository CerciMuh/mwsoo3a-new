// Infrastructure Layer - Concrete Repository Implementations
import Database from 'better-sqlite3';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/interfaces';

export class SqliteUserRepository implements IUserRepository {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
    this.initializeTable();
  }

  private initializeTable(): void {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        university_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    this.db.exec(createTableQuery);
  }

  public async findById(id: number): Promise<User | null> {
    const query = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = query.get(id) as any;
    
    if (!row) return null;
    
    return User.fromDatabase(row.id, row.email, row.university_id, row.created_at);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const query = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = query.get(email) as any;
    
    if (!row) return null;
    
    return User.fromDatabase(row.id, row.email, row.university_id, row.created_at);
  }

  public async create(user: User): Promise<User> {
    const query = this.db.prepare(`
      INSERT INTO users (email, university_id) 
      VALUES (?, ?) 
      RETURNING *
    `);
    
    const row = query.get(user.email, user.universityId || null) as any;
    
    return User.fromDatabase(row.id, row.email, row.university_id, row.created_at);
  }

  public async update(id: number, userData: Partial<Pick<User, 'universityId'>>): Promise<User> {
    const query = this.db.prepare(`
      UPDATE users 
      SET university_id = ? 
      WHERE id = ?
      RETURNING *
    `);
    
    const row = query.get(userData.universityId || null, id) as any;
    
    if (!row) {
      throw new Error('User not found for update');
    }
    
    return User.fromDatabase(row.id, row.email, row.university_id, row.created_at);
  }

  public async delete(id: number): Promise<void> {
    const query = this.db.prepare('DELETE FROM users WHERE id = ?');
    const result = query.run(id);
    
    if (result.changes === 0) {
      throw new Error('User not found for deletion');
    }
  }

  public async findAll(): Promise<User[]> {
    const query = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const rows = query.all() as any[];
    
    return rows.map(row => 
      User.fromDatabase(row.id, row.email, row.university_id, row.created_at)
    );
  }
}