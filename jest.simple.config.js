export default {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/simple.test.js',
    '**/tests/api-offline.test.js'
  ],
  
  // Timeout for tests
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // ES modules support
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Transform configuration
  transform: {},
  
  // Module name mapping
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
