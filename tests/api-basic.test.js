// Basic API tests without complex setup
import fetch from 'node-fetch';

// Mock fetch for Node.js environment
global.fetch = fetch;

describe('Basic API Tests', () => {
  const BASE_URL = 'http://localhost:3001';
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
    const response = await fetch(`${BASE_URL}/health`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'OK');
    expect(data).toHaveProperty('version', '1.0.0');
  });

  test('should handle 404 for non-existent routes', async () => {
    const response = await fetch(`${BASE_URL}/non-existent`);
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Route not found');
  });

  test('should reject login without credentials', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    expect(response.status).toBe(400);
  });

  test('should reject promo generation without auth', async () => {
    const response = await fetch(`${BASE_URL}/api/promo/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 10, type: 'percentage' })
    });
    
    expect(response.status).toBe(401);
  });
});
