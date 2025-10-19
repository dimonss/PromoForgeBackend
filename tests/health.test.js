import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestEnvironment, cleanupTestEnvironment } from './setup.js';

describe('Health Check API', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('status', 'OK');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('version', '1.0.0');
      expect(typeof data.timestamp).toBe('string');
      
      // Verify timestamp is valid ISO string
      expect(() => new Date(data.timestamp)).not.toThrow();
    });

    test('should be accessible without authentication', async () => {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
    });

    test('should return consistent response format', async () => {
      const response1 = await fetch('http://localhost:3001/health');
      const response2 = await fetch('http://localhost:3001/health');
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.status).toBe(data2.status);
      expect(data1.version).toBe(data2.version);
      expect(data1.timestamp).not.toBe(data2.timestamp); // Should be different timestamps
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await fetch('http://localhost:3001/non-existent-route', {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Route not found');
    });

    test('should return 404 for non-existent API routes', async () => {
      const response = await fetch('http://localhost:3001/api/non-existent', {
        method: 'GET',
      });

      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Route not found');
    });
  });

  describe('CORS Headers', () => {
    test('should include CORS headers', async () => {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      
      // Check for CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        expect(response.headers.get(header)).toBeTruthy();
      });
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await fetch('http://localhost:3001/health', {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      
      // Check for security headers (helmet.js)
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ];
      
      securityHeaders.forEach(header => {
        expect(response.headers.get(header)).toBeTruthy();
      });
    });
  });
});
