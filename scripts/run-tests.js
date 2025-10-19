import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Starting PromoForge API Tests...\n');

// Test configurations
const tests = [
  {
    name: 'Basic Tests',
    file: 'tests/simple.test.js',
    config: 'jest.simple.config.js'
  },
  {
    name: 'API Offline Tests',
    file: 'tests/api-offline.test.js',
    config: 'jest.simple.config.js'
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`📝 Running ${test.name}...`);
    
    const jestProcess = spawn('npx', ['jest', test.file, '--config', test.config], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} passed\n`);
        resolve();
      } else {
        console.log(`❌ ${test.name} failed\n`);
        reject(new Error(`Test ${test.name} failed with code ${code}`));
      }
    });

    jestProcess.on('error', (error) => {
      console.log(`❌ ${test.name} error:`, error.message, '\n');
      reject(error);
    });
  });
}

async function runAllTests() {
  try {
    for (const test of tests) {
      await runTest(test);
    }
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Basic functionality tests');
    console.log('   ✅ API endpoint tests');
    console.log('   ✅ Error handling tests');
    console.log('\n💡 To run individual tests:');
    console.log('   npm run test:simple');
    console.log('   npm run test:api-basic');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

runAllTests();
