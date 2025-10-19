import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { initializeDatabase, closeDatabase, getDatabase } from '../database/init.js';
import { startTestServer, stopTestServer } from './test-server.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test database path
const TEST_DB_PATH = path.join(__dirname, '../test-database.sqlite');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = TEST_DB_PATH;
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.EXTERNAL_API_BASE_URL = 'https://test-api.example.com';
process.env.EXTERNAL_API_KEY = 'test-api-key';

let testServer;
let testDb;

export const setupTestEnvironment = async () => {
  // Clean up any existing test database
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  // Start test server
  await startTestServer();
  
  // Initialize test database
  await initializeDatabase();
  testDb = getDatabase();
  
  console.log('🧪 Test environment setup complete');
};

export const cleanupTestEnvironment = async () => {
  // Close database connection
  if (testDb) {
    closeDatabase();
  }

  // Stop test server
  await stopTestServer();

  // Clean up test database file
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  console.log('🧹 Test environment cleanup complete');
};

export const clearTestData = () => {
  return new Promise((resolve, reject) => {
    testDb.serialize(() => {
      testDb.run('DELETE FROM activated_promo_codes', (err) => {
        if (err) return reject(err);
        
        testDb.run('DELETE FROM promo_code_requests', (err) => {
          if (err) return reject(err);
          
          testDb.run('DELETE FROM cashiers WHERE username != "admin"', (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    });
  });
};

export const createTestCashier = async (username = 'testuser', password = 'testpass123') => {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return new Promise((resolve, reject) => {
    testDb.run(
      'INSERT INTO cashiers (username, password_hash, full_name) VALUES (?, ?, ?)',
      [username, hashedPassword, 'Test User'],
      function(err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, username, fullName: 'Test User' });
      }
    );
  });
};

export const getTestCashierToken = async (username = 'admin', password = 'admin123') => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  return data.token;
};

export { testDb, TEST_DB_PATH };
