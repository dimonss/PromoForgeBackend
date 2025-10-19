import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestEnvironment, cleanupTestEnvironment, clearTestData, getTestCashierToken } from './setup.js';

// Mock external API calls
global.fetch = jest.fn();

describe('Integration Tests', () => {
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
    fetch.mockClear();
  });

  describe('Complete Promo Code Workflow', () => {
    test('should handle complete promo code lifecycle', async () => {
      // Step 1: Generate promo code
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'WORKFLOW123',
          type: 'percentage',
          value: 15,
          expiryDate: '2024-12-31',
          description: 'Integration test promo code'
        })
      });

      const generateResponse = await fetch('http://localhost:3001/api/promo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 15,
          type: 'percentage',
          expiryDate: '2024-12-31',
          description: 'Integration test promo code'
        }),
      });

      expect(generateResponse.status).toBe(200);
      const generateData = await generateResponse.json();
      expect(generateData.promoCode.code).toBe('WORKFLOW123');

      // Step 2: Check promo code status
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'WORKFLOW123',
          status: 'active',
          type: 'percentage',
          value: 15,
          expiryDate: '2024-12-31'
        })
      });

      const statusResponse = await fetch('http://localhost:3001/api/promo/status/WORKFLOW123', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(statusResponse.status).toBe(200);
      const statusData = await statusResponse.json();
      expect(statusData.status.status).toBe('active');

      // Step 3: Activate promo code
      const activateResponse = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'WORKFLOW123',
          customerInfo: 'Integration Test Customer',
          notes: 'Complete workflow test'
        }),
      });

      expect(activateResponse.status).toBe(200);
      const activateData = await activateResponse.json();
      expect(activateData.message).toBe('Promo code activated successfully');

      // Step 4: Verify activation in history
      const historyResponse = await fetch('http://localhost:3001/api/promo/activations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(historyResponse.status).toBe(200);
      const historyData = await historyResponse.json();
      expect(historyData.activations.length).toBe(1);
      expect(historyData.activations[0].promo_code).toBe('WORKFLOW123');
      expect(historyData.activations[0].customer_info).toBe('Integration Test Customer');

      // Step 5: Try to activate again (should fail)
      const duplicateResponse = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promoCode: 'WORKFLOW123',
          customerInfo: 'Another Customer'
        }),
      });

      expect(duplicateResponse.status).toBe(409);
      const duplicateData = await duplicateResponse.json();
      expect(duplicateData.error).toBe('Promo code has already been activated');
    });
  });

  describe('Authentication Flow', () => {
    test('should handle complete authentication workflow', async () => {
      // Step 1: Login
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      expect(loginResponse.status).toBe(200);
      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Step 2: Access protected endpoint
      const meResponse = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(meResponse.status).toBe(200);
      const meData = await meResponse.json();
      expect(meData.user.username).toBe('admin');

      // Step 3: Change password
      const changePasswordResponse = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: 'admin123',
          newPassword: 'newpassword123',
        }),
      });

      expect(changePasswordResponse.status).toBe(200);

      // Step 4: Login with new password
      const newLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'newpassword123',
        }),
      });

      expect(newLoginResponse.status).toBe(200);

      // Step 5: Logout
      const logoutResponse = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(logoutResponse.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    test('should handle external API failures gracefully', async () => {
      // Mock external API failure
      fetch.mockRejectedValueOnce(new Error('Network error'));

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
      expect(data).toHaveProperty('error');
    });

    test('should handle invalid JSON gracefully', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
    });

    test('should handle missing required fields', async () => {
      const response = await fetch('http://localhost:3001/api/promo/activate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Missing promoCode
          customerInfo: 'John Doe'
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });
  });

  describe('Rate Limiting', () => {
    test('should handle multiple rapid requests', async () => {
      const requests = [];
      
      // Make 10 rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          fetch('http://localhost:3001/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // All requests should succeed (rate limit is 100 per 15 minutes)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Data Consistency', () => {
    test('should maintain data consistency across operations', async () => {
      // Create multiple activations
      const activations = ['TEST001', 'TEST002', 'TEST003'];
      
      for (const code of activations) {
        const response = await fetch('http://localhost:3001/api/promo/activate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promoCode: code,
            customerInfo: `Customer ${code}`
          }),
        });
        expect(response.status).toBe(200);
      }

      // Verify all activations are recorded
      const historyResponse = await fetch('http://localhost:3001/api/promo/activations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(historyResponse.status).toBe(200);
      const historyData = await historyResponse.json();
      expect(historyData.activations.length).toBe(3);
      
      // Verify each activation exists
      const codes = historyData.activations.map(a => a.promo_code);
      expect(codes).toContain('TEST001');
      expect(codes).toContain('TEST002');
      expect(codes).toContain('TEST003');
    });
  });
});
