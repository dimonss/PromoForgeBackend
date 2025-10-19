import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';
import { getDatabase, closeDatabase } from '../database/init.js';

// ES6 modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Добавляет пользователя по умолчанию (admin) в базу данных
 * @param {string} username - Имя пользователя (по умолчанию 'admin')
 * @param {string} password - Пароль (по умолчанию 'admin123')
 * @param {string} fullName - Полное имя (по умолчанию 'Administrator')
 */
async function addDefaultUser(username = 'admin', password = 'admin123', fullName = 'Administrator') {
  console.log('👤 Adding default user to PromoForge...');
  
  try {
    // Проверяем существование базы данных
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database file does not exist');
      console.log(`   Expected location: ${dbPath}`);
      console.log('\n📋 To fix this issue:');
      console.log('   Run: npm run setup-db');
      return false;
    }

    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
      // Проверяем, не существует ли уже пользователь с таким именем
      db.get(
        'SELECT id FROM users WHERE username = ?',
        [username],
        async (err, existingUser) => {
          if (err) {
            console.error('❌ Database error:', err);
            closeDatabase();
            reject(err);
            return;
          }

          if (existingUser) {
            console.log(`✅ Default user "${username}" already exists`);
            closeDatabase();
            resolve(true);
            return;
          }

          try {
            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Добавляем пользователя в базу данных
            db.run(
              'INSERT INTO users (username, password_hash, full_name, is_active) VALUES (?, ?, ?, ?)',
              [username, hashedPassword, fullName, 1],
              function(err) {
                if (err) {
                  console.error('❌ Error adding default user:', err);
                  closeDatabase();
                  reject(err);
                  return;
                }

                console.log('✅ Default user created successfully!');
                console.log(`   ID: ${this.lastID}`);
                console.log(`   Username: ${username}`);
                console.log(`   Password: ${password}`);
                console.log(`   Full Name: ${fullName}`);
                console.log(`   Created: ${new Date().toLocaleString()}`);
                console.log('\n⚠️  IMPORTANT: Please change the default password after first login!');
                
                closeDatabase();
                resolve(true);
              }
            );
          } catch (hashError) {
            console.error('❌ Error hashing password:', hashError);
            closeDatabase();
            reject(hashError);
          }
        }
      );
    });

  } catch (error) {
    console.error('❌ Add default user failed:', error.message);
    closeDatabase();
    return false;
  }
}

/**
 * Интерактивный режим для добавления пользователя по умолчанию
 */
async function interactiveAddDefaultUser() {
  const readline = await import('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  try {
    console.log('👤 Interactive Default User Setup');
    console.log('=================================\n');

    const username = await question('Enter username (default: admin): ') || 'admin';
    const password = await question('Enter password (default: admin123): ') || 'admin123';
    const fullName = await question('Enter full name (default: Administrator): ') || 'Administrator';

    console.log('\n📋 Default user details:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Full Name: ${fullName}`);
    
    const confirm = await question('\nCreate this default user? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      const success = await addDefaultUser(username, password, fullName);
      if (success) {
        console.log('\n🎉 Default user created successfully!');
      } else {
        console.log('\n❌ Failed to create default user');
      }
    } else {
      console.log('\n❌ Default user creation cancelled');
    }

  } catch (error) {
    console.error('❌ Interactive mode failed:', error);
  } finally {
    rl.close();
  }
}

/**
 * Показывает справку по использованию скрипта
 */
function showHelp() {
  console.log('👤 PromoForge Default User Setup Script');
  console.log('=======================================\n');
  console.log('Usage:');
  console.log('  node scripts/add-default-user.js [options]');
  console.log('  npm run add-default-user [options]\n');
  console.log('Options:');
  console.log('  --username <username>    Username (default: admin)');
  console.log('  --password <password>    Password (default: admin123)');
  console.log('  --fullname <fullname>    Full name (default: Administrator)');
  console.log('  --interactive           Interactive mode');
  console.log('  --help                  Show this help\n');
  console.log('Examples:');
  console.log('  npm run add-default-user');
  console.log('  npm run add-default-user -- --username root --password rootpass123 --fullname "Root User"');
  console.log('  npm run add-default-user -- --interactive\n');
  console.log('Note: This script creates the initial admin user for the system.');
  console.log('      If a user with the same username already exists, it will be skipped.');
}

// Основная функция
async function main() {
  const args = process.argv.slice(2);
  
  // Показываем справку
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Интерактивный режим
  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveAddDefaultUser();
    return;
  }

  // Парсим аргументы командной строки
  let username = 'admin';
  let password = 'admin123';
  let fullName = 'Administrator';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--username':
        username = args[++i];
        break;
      case '--password':
        password = args[++i];
        break;
      case '--fullname':
        fullName = args[++i];
        break;
    }
  }

  // Добавляем пользователя по умолчанию
  const success = await addDefaultUser(username, password, fullName);
  process.exit(success ? 0 : 1);
}

// Запускаем скрипт, если он выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { addDefaultUser, interactiveAddDefaultUser };
