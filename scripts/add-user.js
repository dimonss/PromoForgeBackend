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
 * Добавляет нового пользователя в базу данных
 * @param {string} username - Имя пользователя
 * @param {string} password - Пароль
 * @param {string} fullName - Полное имя
 * @param {boolean} isActive - Активен ли пользователь (по умолчанию true)
 */
async function addUser(username, password, fullName, isActive = true) {
  console.log('👤 Adding new user to PromoForge...');
  
  try {
    // Валидация входных данных
    if (!username || !password || !fullName) {
      throw new Error('Username, password, and full name are required');
    }

    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

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
            reject(err);
            return;
          }

          if (existingUser) {
            console.log(`❌ User with username "${username}" already exists`);
            closeDatabase();
            resolve(false);
            return;
          }

          try {
            // Хешируем пароль
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Добавляем пользователя в базу данных
            db.run(
              'INSERT INTO users (username, password_hash, full_name, is_active) VALUES (?, ?, ?, ?)',
              [username, hashedPassword, fullName, isActive ? 1 : 0],
              function(err) {
                if (err) {
                  console.error('❌ Error adding user:', err);
                  closeDatabase();
                  reject(err);
                  return;
                }

                console.log('✅ User added successfully!');
                console.log(`   ID: ${this.lastID}`);
                console.log(`   Username: ${username}`);
                console.log(`   Full Name: ${fullName}`);
                console.log(`   Active: ${isActive ? 'Yes' : 'No'}`);
                console.log(`   Created: ${new Date().toLocaleString()}`);
                
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
    console.error('❌ Add user failed:', error.message);
    closeDatabase();
    return false;
  }
}

/**
 * Интерактивный режим для добавления пользователя
 */
async function interactiveAddUser() {
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
    console.log('👤 Interactive User Addition');
    console.log('============================\n');

    const username = await question('Enter username: ');
    const password = await question('Enter password: ');
    const fullName = await question('Enter full name: ');
    const isActiveInput = await question('Is user active? (y/n, default: y): ');
    
    const isActive = isActiveInput.toLowerCase() !== 'n';

    console.log('\n📋 User details:');
    console.log(`   Username: ${username}`);
    console.log(`   Full Name: ${fullName}`);
    console.log(`   Active: ${isActive ? 'Yes' : 'No'}`);
    
    const confirm = await question('\nAdd this user? (y/n): ');
    
    if (confirm.toLowerCase() === 'y') {
      const success = await addUser(username, password, fullName, isActive);
      if (success) {
        console.log('\n🎉 User added successfully!');
      } else {
        console.log('\n❌ Failed to add user');
      }
    } else {
      console.log('\n❌ User addition cancelled');
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
  console.log('👤 PromoForge User Management Script');
  console.log('====================================\n');
  console.log('Usage:');
  console.log('  node scripts/add-user.js [options]');
  console.log('  npm run add-user [options]\n');
  console.log('Options:');
  console.log('  --username <username>    Username (required)');
  console.log('  --password <password>    Password (required)');
  console.log('  --fullname <fullname>    Full name (required)');
  console.log('  --inactive              Create inactive user (default: active)');
  console.log('  --interactive           Interactive mode');
  console.log('  --help                  Show this help\n');
  console.log('Examples:');
  console.log('  npm run add-user -- --username john --password secret123 --fullname "John Doe"');
  console.log('  npm run add-user -- --interactive');
  console.log('  npm run add-user -- --username jane --password pass123 --fullname "Jane Smith" --inactive\n');
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
    await interactiveAddUser();
    return;
  }

  // Парсим аргументы командной строки
  let username = null;
  let password = null;
  let fullName = null;
  let isActive = true;

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
      case '--inactive':
        isActive = false;
        break;
    }
  }

  // Проверяем обязательные параметры
  if (!username || !password || !fullName) {
    console.log('❌ Missing required parameters\n');
    showHelp();
    process.exit(1);
  }

  // Добавляем пользователя
  const success = await addUser(username, password, fullName, isActive);
  process.exit(success ? 0 : 1);
}

// Запускаем скрипт, если он выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { addUser, interactiveAddUser };
