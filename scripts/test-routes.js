import express from 'express';

console.log('🧪 Testing route imports...');

try {
  // Test auth routes import
  console.log('📝 Testing auth routes...');
  const authRoutes = await import('../routes/auth.js');
  console.log('✅ Auth routes imported successfully');
  console.log('   Type:', typeof authRoutes.default);
  console.log('   Is function:', typeof authRoutes.default === 'function');
  
  // Test promo routes import
  console.log('📝 Testing promo routes...');
  const promoRoutes = await import('../routes/promo.js');
  console.log('✅ Promo routes imported successfully');
  console.log('   Type:', typeof promoRoutes.default);
  console.log('   Is function:', typeof promoRoutes.default === 'function');
  
  // Test authenticateToken import
  console.log('📝 Testing authenticateToken...');
  const { authenticateToken } = await import('../routes/auth.js');
  console.log('✅ authenticateToken imported successfully');
  console.log('   Type:', typeof authenticateToken);
  console.log('   Is function:', typeof authenticateToken === 'function');
  
  // Test database import
  console.log('📝 Testing database init...');
  const { initializeDatabase } = await import('../database/init.js');
  console.log('✅ Database init imported successfully');
  console.log('   Type:', typeof initializeDatabase);
  console.log('   Is function:', typeof initializeDatabase === 'function');
  
  console.log('\n🎉 All imports are working correctly!');
  
} catch (error) {
  console.error('❌ Import test failed:', error);
  process.exit(1);
}
