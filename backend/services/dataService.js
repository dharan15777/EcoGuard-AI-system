const SensorReading = require('../models/SensorReading');
const alertService = require('./alertService');
const notificationService = require('./notificationService');

class DataService {
  constructor() {
    this.readingsBuffer = [];
    this.maxBufferSize = 5000;
  }

  processIncomingReading(readingData) {
    const reading = new SensorReading(readingData);
    this.readingsBuffer.push(reading);
    if (this.readingsBuffer.length > this.maxBufferSize) {
      this.readingsBuffer.shift();
    }

    // Automatic hazard check threshold evaluation
    if (reading.riskScore > 0.85) {
      const createdAlert = alertService.createAlert({
        sensorId: reading.sensorId,
        hazardType: this.inferHazardType(reading),
        severity: reading.riskScore > 0.92 ? 'CRITICAL' : 'HIGH',
        confidenceScore: reading.riskScore,
        title: `Automatic Threshold Alert for Sensor ${reading.sensorId}`,
        description: `Risk score evaluate to ${(reading.riskScore * 100).toFixed(1)}% by Edge AI node.`
      });

      // Dispatch emergency notifications
      notificationService.sendSms('+15550199', createdAlert.title, createdAlert.id);
      notificationService.sendEmail('command@ecoguard.ai', createdAlert.title, createdAlert.description, createdAlert.id);
    }

    return reading;
  }

  inferHazardType(reading) {
    if (reading.telemetry.waterLevel && reading.telemetry.waterLevel > 4.0) return 'FLOOD';
    if (reading.telemetry.temperature && reading.telemetry.temperature > 50) return 'WILDFIRE';
    if (reading.telemetry.soilMoisture && reading.telemetry.soilMoisture > 85) return 'LANDSLIDE';
    if (reading.telemetry.pm25 && reading.telemetry.pm25 > 150) return 'AIR_POLLUTION';
    return 'GENERAL_HAZARD';
  }

  getRecentReadings(sensorId = null, limit = 50) {
    let result = this.readingsBuffer;
    if (sensorId) {
      result = result.filter(r => r.sensorId === sensorId);
    }
    return result.slice(-limit);
  }
}

module.exports = new DataService();
