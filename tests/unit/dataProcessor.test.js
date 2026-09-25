const assert = require('assert');
const dataService = require('../../backend/services/dataService');

console.log('🧪 Running Unit Test: dataProcessor.test.js');
const result = dataService.processIncomingReading({
  sensorId: 'SN-FLD-01',
  telemetry: { waterLevel: 2.1 },
  riskScore: 0.1
});

assert.strictEqual(result.sensorId, 'SN-FLD-01');
console.log('✅ PASS: dataProcessor unit test verified successfully!');
