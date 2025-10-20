import fetch from 'node-fetch';
import { getApiBaseUrl, getApiUrl } from '../config/urls.js';

const BASE_URL = getApiBaseUrl();

// Test data
const testUser = {
  username: 'admin',
  password: 'admin123'
};

const testPromoData = {
  campaignId: 'TEST2024',
  value: 15,
  type: 'percentage',
  expiryDate: '2024-12-31T23:59:59.000Z'
};

async function testSwaggerEndpoints() {
  console.log('🧪 Testing PromoForge API endpoints...\n');

  try {
    // 1. Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(getApiUrl('/health'));
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // 2. Test Login
    console.log('2️⃣ Testing Login...');
    const loginResponse = await fetch(getApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', {
      message: loginData.message,
      role: loginData.role,
      tokenLength: loginData.token?.length || 0
    });
    console.log('');

    const token = loginData.token;

    // 3. Test Get User Info
    console.log('3️⃣ Testing Get User Info...');
    const userResponse = await fetch(getApiUrl('/auth/me'), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Get user info failed: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    console.log('✅ User Info:', userData);
    console.log('');

    // 4. Test Generate Promo Code
    console.log('4️⃣ Testing Generate Promo Code...');
    const generateResponse = await fetch(getApiUrl('/promo/generate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testPromoData)
    });
    
    if (!generateResponse.ok) {
      const errorData = await generateResponse.json();
      console.log('⚠️ Generate Promo Code (expected to fail with external API):', errorData);
    } else {
      const generateData = await generateResponse.json();
      console.log('✅ Generate Promo Code:', generateData);
    }
    console.log('');

    // 5. Test Get Activations
    console.log('5️⃣ Testing Get Activations...');
    const activationsResponse = await fetch(getApiUrl('/promo/activations?page=1&limit=5'), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!activationsResponse.ok) {
      throw new Error(`Get activations failed: ${activationsResponse.status}`);
    }
    
    const activationsData = await activationsResponse.json();
    console.log('✅ Activations:', {
      total: activationsData.total,
      activations: activationsData.activations?.length || 0
    });
    console.log('');

    // 6. Test Get Logs
    console.log('6️⃣ Testing Get Logs...');
    const logsResponse = await fetch(getApiUrl('/promo/logs?page=1&limit=5'), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!logsResponse.ok) {
      throw new Error(`Get logs failed: ${logsResponse.status}`);
    }
    
    const logsData = await logsResponse.json();
    console.log('✅ Logs:', {
      total: logsData.total,
      logs: logsData.logs?.length || 0
    });
    console.log('');

    // 7. Test Logout
    console.log('7️⃣ Testing Logout...');
    const logoutResponse = await fetch(getApiUrl('/auth/logout'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!logoutResponse.ok) {
      throw new Error(`Logout failed: ${logoutResponse.status}`);
    }
    
    const logoutData = await logoutResponse.json();
    console.log('✅ Logout:', logoutData);
    console.log('');

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📚 Swagger documentation is available at:');
    console.log(`   ${getApiUrl('/api-docs')}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testSwaggerEndpoints();
