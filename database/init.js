import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES6 modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { verbose } = sqlite3;

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');

let db;

function getDatabase() {
  if (!db) {
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Created database directory: ${dbDir}`);
    }

    db = new (verbose().Database)(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log(`🗄️  Connected to SQLite database: ${dbPath}`);
    });
  }
  return db;
}

async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Drop existing tables to start fresh
      database.run('DROP TABLE IF EXISTS promo_code_requests');
      database.run('DROP TABLE IF EXISTS activated_promo_codes');
      database.run('DROP TABLE IF EXISTS cashiers');

      // Create users table (renamed from cashiers for clarity)
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create promo_codes table (simplified)
      database.run(`
        CREATE TABLE IF NOT EXISTS promo_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deactivated_at DATETIME,
          deactivated_by INTEGER,
          deactivation_reason TEXT,
          FOREIGN KEY (deactivated_by) REFERENCES users (id)
        )
      `);

      // Insert default user if none exists
      database.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          const defaultPassword = 'admin123';
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);
          
          database.run(
            'INSERT INTO users (username, password_hash, full_name) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'Administrator'],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              console.log('Default user created:');
              console.log('Username: admin');
              console.log('Password: admin123');
              console.log('⚠️  Please change the default password after first login!');
              resolve();
            }
          );
        } else {
          resolve();
        }
      });
    });
  });
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export {
  getDatabase,
  initializeDatabase,
  closeDatabase
};
