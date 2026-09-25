/**
 * EcoGuard Environmental Sensor Telemetry Simulator
 * Simulates 20+ IoT Edge nodes streaming multi-modal telemetry to backend.
 */

const http = require('http');

const SENSORS = [
  { id: 'SN-FLD-01', name: 'Pine River Hydro Node Alpha', type: 'FLOOD_WATER_LEVEL', baseVal: 2.5, spikeChance: 0.15 },
  { id: 'SN-FLD-02', name: 'Cascade Dam Spillway Monitor', type: 'FLOOD_WATER_LEVEL', baseVal: 1.8, spikeChance: 0.05 },
  { id: 'SN-FIR-01', name: 'Sierra Thermal Optics Node 04', type: 'WILDFIRE_THERMAL', baseVal: 24.5, spikeChance: 0.25 },
  { id: 'SN-AQI-01', name: 'Metropolitan Air Station Central', type: 'AIR_QUALITY_AQI', baseVal: 35.0, spikeChance: 0.1 },
  { id: 'SN-LND-01', name: 'Coastal Cliff Tilt Sensor 09', type: 'LANDSLIDE_SOIL_MOISTURE', baseVal: 45.0, spikeChance: 0.08 }
];

console.log('🌱 Starting EcoGuard Live Telemetry Simulator...');

function generateTelemetry(sensor) {
  const isSpike = Math.random() < sensor.spikeChance;
  let telemetry = {};
  let riskScore = 0.1;

  if (sensor.type === 'FLOOD_WATER_LEVEL') {
    const waterLevel = isSpike ? parseFloat((4.5 + Math.random() * 1.5).toFixed(2)) : parseFloat((sensor.baseVal + (Math.random() - 0.5) * 0.4).toFixed(2));
    telemetry = { waterLevel, temperature: 16.5, humidity: 85.0 };
    riskScore = waterLevel > 4.2 ? 0.95 : 0.15;
  } else if (sensor.type === 'WILDFIRE_THERMAL') {
    const temperature = isSpike ? parseFloat((78.0 + Math.random() * 15.0).toFixed(1)) : parseFloat((sensor.baseVal + (Math.random() - 0.5) * 3.0).toFixed(1));
    telemetry = { temperature, co2Level: isSpike ? 1450 : 410, humidity: 30.0 };
    riskScore = temperature > 60.0 ? 0.96 : 0.10;
  } else if (sensor.type === 'AIR_QUALITY_AQI') {
    const pm25 = isSpike ? parseFloat((165.0 + Math.random() * 40.0).toFixed(1)) : parseFloat((sensor.baseVal + (Math.random() - 0.5) * 8.0).toFixed(1));
    telemetry = { pm25, temperature: 22.0, humidity: 55.0 };
    riskScore = pm25 > 100.0 ? 0.88 : 0.08;
  } else {
    const soilMoisture = isSpike ? parseFloat((88.0 + Math.random() * 8.0).toFixed(1)) : parseFloat((sensor.baseVal + (Math.random() - 0.5) * 5.0).toFixed(1));
    telemetry = { soilMoisture, groundTilt: isSpike ? 18.4 : 1.2 };
    riskScore = soilMoisture > 80.0 ? 0.91 : 0.12;
  }

  return {
    sensorId: sensor.id,
    telemetry,
    riskScore,
    inferenceResult: riskScore > 0.8 ? 'CRITICAL_HAZARD' : 'NORMAL',
    batteryLevel: parseFloat((90.0 + Math.random() * 9.0).toFixed(1))
  };
}

function sendTelemetry() {
  const sensor = SENSORS[Math.floor(Math.random() * SENSORS.length)];
  const payload = JSON.stringify(generateTelemetry(sensor));

  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/sensors/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    console.log(`[Simulator TX] Sensor ${sensor.id} -> HTTP ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.log(`[Simulator TX] Sensor ${sensor.id} -> Backend offline (${err.message})`);
  });

  req.write(payload);
  req.end();
}

setInterval(sendTelemetry, 3000);
sendTelemetry();
