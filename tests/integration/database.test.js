const assert = require('assert');
const db = require('../../backend/config/database');

console.log('🧪 Running Integration Test: database.test.js');
db.connect().then(() => {
  assert.strictEqual(db.isConnected, true);
  console.log('✅ PASS: Database pool integration test passed!');
});
