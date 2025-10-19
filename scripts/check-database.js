import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDatabase, closeDatabase } from '../database/init.js';

// ES6 modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkDatabase() {
  console.log('🔍 Checking PromoForge database status...');
  
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file does not exist');
      console.log(`   Expected location: ${dbPath}`);
      console.log('\n📋 To fix this issue:');
      console.log('   Run: npm run setup-db');
      return false;
    }

    // Check file size
    const stats = fs.statSync(dbPath);
    console.log(`✅ Database file exists: ${dbPath}`);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`);

    // Try to connect to database
    try {
      const db = getDatabase();
      
      // Check if tables exist
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('❌ Error checking database tables:', err);
          return false;
        }

        console.log(`\n📋 Database tables (${tables.length}):`);
        tables.forEach(table => {
          console.log(`   - ${table.name}`);
        });

        // Check users table
        db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
          if (err) {
            console.log('⚠️  Could not check users table');
          } else {
            console.log(`\n👥 Users: ${result.count}`);
          }

          // Check promo codes table
          db.get("SELECT COUNT(*) as count FROM promo_codes", (err, result) => {
            if (err) {
              console.log('⚠️  Could not check promo codes table');
            } else {
              console.log(`🎫 Promo codes: ${result.count}`);
            }

            // Check active promo codes
            db.get("SELECT COUNT(*) as count FROM promo_codes WHERE is_active = 1", (err, result) => {
              if (err) {
                console.log('⚠️  Could not check active promo codes');
              } else {
                console.log(`✅ Active promo codes: ${result.count}`);
              }

              // Check deactivated promo codes
              db.get("SELECT COUNT(*) as count FROM promo_codes WHERE is_active = 0", (err, result) => {
                if (err) {
                  console.log('⚠️  Could not check deactivated promo codes');
                } else {
                  console.log(`❌ Deactivated promo codes: ${result.count}`);
                }

                console.log('\n✅ Database is healthy and ready to use!');
                closeDatabase();
              });
            });
          });
        });
      });

    } catch (dbError) {
      console.error('❌ Error connecting to database:', dbError);
      return false;
    }

    return true;
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
    return false;
  }
}

// Run check if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase();
}

export { checkDatabase };
