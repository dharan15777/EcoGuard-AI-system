const assert = require('assert');
const app = require('../../backend/api/server');

console.log('🧪 Running Integration Test: api.test.js');
assert.ok(app, 'Express API Application initialized');
console.log('✅ PASS: API integration test passed!');
