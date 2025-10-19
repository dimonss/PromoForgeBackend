import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestEnvironment, cleanupTestEnvironment, clearTestData, createTestCashier } from './setup.js';

// Mock external API calls
global.fetch = jest.fn();

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('username', 'admin');
      expect(data.user).toHaveProperty('fullName');
      expect(typeof data.token).toBe('string');
    });

    test('should reject invalid username', async () => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'invaliduser',
          password: 'admin123',
        }),
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject empty credentials', async () => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: '',
          password: '',
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });

    test('should reject short password', async () => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: '123',
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return user info with valid token', async () => {
      // First login to get token
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

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test /me endpoint
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('username', 'admin');
      expect(data.user).toHaveProperty('fullName');
    });

    test('should reject request without token', async () => {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
      });

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Access token required');
    });

    test('should reject request with invalid token', async () => {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('POST /api/auth/change-password', () => {
    test('should change password with valid current password', async () => {
      // First login to get token
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

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Change password
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
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

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Password changed successfully');

      // Verify new password works
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
    });

    test('should reject change password with wrong current password', async () => {
      // First login to get token
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

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Try to change password with wrong current password
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Current password is incorrect');
    });

    test('should reject short new password', async () => {
      // First login to get token
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

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Try to change password with short new password
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: 'admin123',
          newPassword: '123',
        }),
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully with valid token', async () => {
      // First login to get token
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

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Logout
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Logout successful');
    });
  });
});
