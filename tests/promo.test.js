import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestEnvironment, cleanupTestEnvironment, clearTestData, getTestCashierToken } from './setup.js';

// Mock external API calls
global.fetch = jest.fn();

describe('Promo Code API', () => {
  let authToken;

  beforeAll(async () => {
    await setupTestEnvironment();
    authToken = await getTestCashierToken();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(async () => {
    await clearTestData();
    // Reset fetch mock
    fetch.mockClear();
  });

  describe('POST /api/promo/generate', () => {
    test('should generate promo code successfully', async () => {
      // Mock external API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'TEST123',
          type: 'percentage',
          value: 10,
          expiryDate: '2024-12-31',
          description: 'Test promo code'
        })
      });

      const response = await fetch('http://localhost:3001/api/promo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 10,
          type: 'percentage',
          expiryDate: '2024-12-31',
          description: 'Test promo code'
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Promo code generated successfully');
      expect(data).toHaveProperty('promoCode');
      expect(data.promoCode).toHaveProperty('code', 'TEST123');
    });

    test('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3001/api/promo/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 10,
          type: 'percentage'
        }),
      });

      expect(response.status).toBe(401);
    });

    test('should reject invalid promo code data', async () => {
      const response = await fetch('http://localhost:3001/api/promo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 'invalid',
          type: 'invalid_type'
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });

    test('should handle external API failure', async () => {
      // Mock external API failure
      fetch.mockRejectedValueOnce(new Error('External API error'));

      const response = await fetch('http://localhost:3001/api/promo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 10,
          type: 'percentage'
        }),
      });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Failed to generate promo code');
    });
  });

  describe('GET /api/promo/status/:promoCode', () => {
    test('should check promo code status successfully', async () => {
      // Mock external API response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'TEST123',
          status: 'active',
          type: 'percentage',
          value: 10,
          expiryDate: '2024-12-31'
        })
      });

      const response = await fetch('http://localhost:3001/api/promo/status/TEST123', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Promo code status retrieved successfully');
      expect(data).toHaveProperty('status');
      expect(data.status).toHaveProperty('code', 'TEST123');
      expect(data.status).toHaveProperty('status', 'active');
    });

    test('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3001/api/promo/status/TEST123', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });

    test('should handle external API failure', async () => {
      // Mock external API failure
      fetch.mockRejectedValueOnce(new Error('External API error'));

      const response = await fetch('http://localhost:3001/api/promo/status/TEST123', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Failed to check promo code status');
    });
  });

  describe('POST /api/promo/activate', () => {
    test('should activate promo code successfully', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST123',
          customerInfo: 'John Doe',
          notes: 'Test activation'
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Promo code activated successfully');
      expect(data).toHaveProperty('activationId');
      expect(data).toHaveProperty('activatedAt');
      expect(data).toHaveProperty('activatedBy', 'admin');
    });

    test('should reject duplicate activation', async () => {
      // First activation
      await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST123',
          customerInfo: 'John Doe'
        }),
      });

      // Second activation (should fail)
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST123',
          customerInfo: 'Jane Doe'
        }),
      });

      expect(response.status).toBe(409);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Promo code has already been activated');
      expect(data).toHaveProperty('activatedAt');
    });

    test('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST123'
        }),
      });

      expect(response.status).toBe(401);
    });

    test('should reject empty promo code', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: '',
          customerInfo: 'John Doe'
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });

    test('should activate promo code without optional fields', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST456'
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Promo code activated successfully');
    });
  });

  describe('GET /api/promo/activations', () => {
    test('should return activation history', async () => {
      // Create some test activations
      await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST123',
          customerInfo: 'John Doe'
        }),
      });

      await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'TEST456',
          customerInfo: 'Jane Doe'
        }),
      });

      const response = await fetch('http://localhost:3001/api/promo/activations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('activations');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.activations)).toBe(true);
      expect(data.activations.length).toBe(2);
      expect(data.pagination).toHaveProperty('total', 2);
    });

    test('should support pagination', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activations?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page', 1);
      expect(data.pagination).toHaveProperty('limit', 10);
    });

    test('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activations', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/promo/logs', () => {
    test('should return API request logs', async () => {
      // Generate some logs by making API calls
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 'TEST123' })
      });

      await fetch('http://localhost:3001/api/promo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 10,
          type: 'percentage'
        }),
      });

      const response = await fetch('http://localhost:3001/api/promo/logs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('logs');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.logs)).toBe(true);
    });

    test('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3001/api/promo/logs', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });
  });
});
