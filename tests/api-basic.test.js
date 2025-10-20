// Basic API tests without complex setup
import fetch from 'node-fetch';
import { BASE_URL, testUtils } from './test-config.js';

// Mock fetch for Node.js environment
global.fetch = fetch;

describe('Basic API Tests', () => {
  let serverProcess;

  beforeAll(async () => {
    // Start server for testing
    const { spawn } = await import('child_process');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  test('should respond to health check', async () => {
    const response = await fetch(testUtils.getApiUrl('/health'));
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'OK');
    expect(data).toHaveProperty('version', '1.0.0');
  });

  test('should handle 404 for non-existent routes', async () => {
    const response = await fetch(testUtils.getApiUrl('/non-existent'));
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Route not found');
  });

  test('should reject login without credentials', async () => {
    const response = await fetch(testUtils.getApiUrl('/auth/login'), {
      method: 'POST',
      headers: testUtils.getBaseHeaders(),
      body: JSON.stringify({})
    });
    
    expect(response.status).toBe(400);
  });

  test('should reject promo generation without auth', async () => {
    const response = await fetch(testUtils.getApiUrl('/promo/generate'), {
      method: 'POST',
      headers: testUtils.getBaseHeaders(),
      body: JSON.stringify({ value: 10, type: 'percentage' })
    });
    
    expect(response.status).toBe(401);
  });
});
