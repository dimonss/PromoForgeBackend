import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES6 modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resetDatabase() {
  console.log('🔄 Resetting PromoForge database...');
  
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
    
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      // Backup existing database
      const backupPath = `${dbPath}.backup.${Date.now()}`;
      fs.copyFileSync(dbPath, backupPath);
      console.log(`💾 Database backed up to: ${backupPath}`);
      
      // Remove existing database
      fs.unlinkSync(dbPath);
      console.log('🗑️  Removed existing database file');
    } else {
      console.log('ℹ️  No existing database file found');
    }

    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Created database directory: ${dbDir}`);
    }

    console.log('✅ Database reset completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run "npm run setup-db" to initialize the database');
    console.log('   2. Or run "npm start" to start the server (will auto-initialize)');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

// Run reset if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase();
}

export { resetDatabase };
