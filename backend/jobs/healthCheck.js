// Scheduled Job: Monitor sensor node ping heartbeats and flag offline nodes
const sensorService = require('../services/sensorService');

class HealthCheckJob {
  static checkSensors() {
    console.log(`[Job: HealthCheck] Checking heartbeats across all Edge AI sensor nodes...`);
    const sensors = sensorService.getAllSensors();
    let offlineCount = 0;
    const now = Date.now();

    sensors.forEach(sensor => {
      const pingTime = new Date(sensor.lastPing).getTime();
      if (now - pingTime > 15 * 60 * 1000) { // 15 mins without ping
        sensorService.updateSensorStatus(sensor.id, 'OFFLINE');
        offlineCount++;
      }
    });

    console.log(`[Job: HealthCheck] Heartbeat verification complete. ${offlineCount} sensor(s) marked offline.`);
    return { checkedTotal: sensors.length, offlineDetected: offlineCount };
  }
}

module.exports = HealthCheckJob;
