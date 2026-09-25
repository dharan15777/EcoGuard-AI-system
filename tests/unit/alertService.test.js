const assert = require('assert');
const alertService = require('../../backend/services/alertService');

console.log('🧪 Running Unit Test: alertService.test.js');
const alerts = alertService.getAlerts();
assert.ok(alerts.length >= 2, 'Should initialize with default alerts');
console.log('✅ PASS: alertService unit test verified successfully!');
