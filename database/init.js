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
      // Create cashiers table
      database.run(`
        CREATE TABLE IF NOT EXISTS cashiers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create activated_promo_codes table
      database.run(`
        CREATE TABLE IF NOT EXISTS activated_promo_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          promo_code TEXT UNIQUE NOT NULL,
          cashier_id INTEGER NOT NULL,
          activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          customer_info TEXT,
          notes TEXT,
          FOREIGN KEY (cashier_id) REFERENCES cashiers (id)
        )
      `);

      // Create promo_code_requests table (for logging external API calls)
      database.run(`
        CREATE TABLE IF NOT EXISTS promo_code_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_type TEXT NOT NULL,
          promo_code TEXT,
          external_response TEXT,
          status TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default cashier if none exists
      database.get('SELECT COUNT(*) as count FROM cashiers', async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          const defaultPassword = 'admin123';
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);
          
          database.run(
            'INSERT INTO cashiers (username, password_hash, full_name) VALUES (?, ?, ?)',
            ['admin', hashedPassword, 'Administrator'],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              console.log('Default cashier created:');
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
