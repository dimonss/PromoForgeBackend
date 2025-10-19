import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initializeDatabase, closeDatabase } from '../database/init.js';

// ES6 modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  console.log('🗄️  Setting up PromoForge database...');
  
  try {
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(process.env.DATABASE_PATH || './database.sqlite');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Created database directory: ${dbDir}`);
    }

    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized successfully!');
    
    // Close database connection
    closeDatabase();
    console.log('🔒 Database connection closed.');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   Run: npm run add-default-user');
    console.log('   Or: npm run add-user -- --interactive');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase };
