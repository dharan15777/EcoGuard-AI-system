const assert = require('assert');

function calculateRisk(waterLevel, threshold) {
  if (waterLevel > threshold) return 'CRITICAL';
  if (waterLevel > threshold * 0.8) return 'HIGH';
  return 'LOW';
}

console.log('🧪 Running Unit Test: riskCalculator.test.js');
assert.strictEqual(calculateRisk(5.2, 4.0), 'CRITICAL');
assert.strictEqual(calculateRisk(3.5, 4.0), 'HIGH');
assert.strictEqual(calculateRisk(1.2, 4.0), 'LOW');
console.log('✅ PASS: riskCalculator unit test verified successfully!');
