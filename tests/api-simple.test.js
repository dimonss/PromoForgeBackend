// Simple API tests without complex imports
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Helper function to wait for server to be ready
function waitForServer(port, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkServer() {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/health',
        method: 'GET',
        timeout: 1000
      }, (res) => {
        resolve();
      });
      
      req.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Server did not start within timeout'));
        } else {
          setTimeout(checkServer, 100);
        }
      });
      
      req.end();
    }
    
    checkServer();
  });
}

describe('Simple API Tests', () => {
  const BASE_URL = 'localhost';
  const PORT = 3001;
  let serverProcess;

  beforeAll(async () => {
    // Start test server
    console.log('🚀 Starting test server...');
    
    serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { 
        ...process.env, 
        NODE_ENV: 'test',
        PORT: PORT.toString()
      },
      stdio: 'pipe'
    });

    // Wait for server to start
    try {
      await waitForServer(PORT, 15000);
      console.log('✅ Test server is ready');
    } catch (error) {
      console.error('❌ Failed to start test server:', error.message);
      throw error;
    }
  }, 20000);

  afterAll(async () => {
    // Stop test server
    if (serverProcess) {
      console.log('🛑 Stopping test server...');
      serverProcess.kill();
      
      // Wait for process to exit
      await new Promise((resolve) => {
        serverProcess.on('exit', resolve);
        setTimeout(resolve, 2000); // Force exit after 2 seconds
      });
    }
  });

  test('should respond to health check', async () => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/health',
      method: 'GET'
    };

    const response = await makeRequest(options);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'OK');
    expect(response.data).toHaveProperty('version', '1.0.0');
  });

  test('should handle 404 for non-existent routes', async () => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/non-existent',
      method: 'GET'
    };

    const response = await makeRequest(options);
    expect(response.status).toBe(404);
    expect(response.data).toHaveProperty('error', 'Route not found');
  });

  test('should reject login without credentials', async () => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, {});
    expect(response.status).toBe(400);
  });

  test('should reject promo generation without auth', async () => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/api/promo/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(options, { value: 10, type: 'percentage' });
    expect(response.status).toBe(401);
  });
});
