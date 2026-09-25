const Alert = require('../models/Alert');
const { ALERT_STATUS, RISK_LEVELS } = require('../config/constants');

class AlertService {
  constructor() {
    this.alerts = new Map();
    this.seedInitialAlerts();
  }

  seedInitialAlerts() {
    const initial = [
      new Alert({
        id: 'ALT-109283',
        sensorId: 'SN-FIR-01',
        sensorName: 'Sierra Thermal Optics Node 04',
        hazardType: 'WILDFIRE',
        severity: RISK_LEVELS.CRITICAL,
        confidenceScore: 0.96,
        title: 'Thermal Anomaly Detected - High Wildfire Risk',
        description: 'IR Sensor registered rapid temperature rise to 84°C accompanied by heavy CO2 spike.',
        locationName: 'Sierra Foothill Reserve',
        latitude: 37.7695,
        longitude: -122.4467,
        status: ALERT_STATUS.ACTIVE
      }),
      new Alert({
        id: 'ALT-109284',
        sensorId: 'SN-FLD-01',
        sensorName: 'Pine River Hydro Node Alpha',
        hazardType: 'FLOOD',
        severity: RISK_LEVELS.HIGH,
        confidenceScore: 0.91,
        title: 'Water Level Exceeded Flood Stage Threshold',
        description: 'River stage height reached 4.8m (Warning threshold: 4.2m). Upstream discharge increasing.',
        locationName: 'Pine River Valley',
        latitude: 37.7749,
        longitude: -122.4194,
        status: ALERT_STATUS.ACTIVE
      })
    ];

    initial.forEach(a => this.alerts.set(a.id, a));
  }

  getAlerts(filter = {}) {
    let result = Array.from(this.alerts.values());
    if (filter.status) {
      result = result.filter(a => a.status === filter.status);
    }
    if (filter.severity) {
      result = result.filter(a => a.severity === filter.severity);
    }
    return result;
  }

  createAlert(alertPayload) {
    const newAlert = new Alert(alertPayload);
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  acknowledgeAlert(id, userName) {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    alert.status = ALERT_STATUS.ACKNOWLEDGED;
    alert.acknowledgedBy = userName || 'Operator Admin';
    alert.acknowledgedAt = new Date().toISOString();
    return alert;
  }

  resolveAlert(id) {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    alert.status = ALERT_STATUS.RESOLVED;
    alert.resolvedAt = new Date().toISOString();
    return alert;
  }
}

module.exports = new AlertService();
