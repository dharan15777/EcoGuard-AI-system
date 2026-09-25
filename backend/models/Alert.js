const { ALERT_STATUS, RISK_LEVELS } = require('../config/constants');

class Alert {
  constructor(data) {
    this.id = data.id || `ALT-${Math.floor(100000 + Math.random() * 900000)}`;
    this.sensorId = data.sensorId;
    this.sensorName = data.sensorName || 'EcoGuard Edge Node';
    this.hazardType = data.hazardType; // FLOOD, WILDFIRE, LANDSLIDE, AIR_POLLUTION
    this.severity = data.severity || RISK_LEVELS.HIGH;
    this.confidenceScore = data.confidenceScore || 0.94;
    this.title = data.title;
    this.description = data.description;
    this.locationName = data.locationName || 'Zone Alpha';
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.status = data.status || ALERT_STATUS.ACTIVE;
    this.triggeredAt = data.triggeredAt || new Date().toISOString();
    this.acknowledgedBy = data.acknowledgedBy || null;
    this.acknowledgedAt = data.acknowledgedAt || null;
    this.resolvedAt = data.resolvedAt || null;
  }
}

module.exports = Alert;
