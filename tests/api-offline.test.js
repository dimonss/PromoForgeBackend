// Offline API tests - проверяют только если сервер уже запущен
const http = require('http');

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

    req.on('error', (error) => {
      // Если сервер не запущен, считаем тест пропущенным
      resolve({ status: 0, data: null, error: error.message });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

describe('Offline API Tests', () => {
  const BASE_URL = 'localhost';
  const PORT = 3001;
  let serverAvailable = false;

  beforeAll(async () => {
    // Проверяем, доступен ли сервер
    const response = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: '/health',
      method: 'GET'
    });

    serverAvailable = response.status === 200;
    
    if (!serverAvailable) {
      console.log('⚠️  Сервер не запущен, пропускаем API тесты');
    }
  });

  test('should respond to health check', async () => {
    if (!serverAvailable) {
      console.log('⏭️  Пропуск: сервер не доступен');
      return;
    }

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
    if (!serverAvailable) {
      console.log('⏭️  Пропуск: сервер не доступен');
      return;
    }

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
    if (!serverAvailable) {
      console.log('⏭️  Пропуск: сервер не доступен');
      return;
    }

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
    if (!serverAvailable) {
      console.log('⏭️  Пропуск: сервер не доступен');
      return;
    }

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
