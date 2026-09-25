const NotificationLog = require('../models/NotificationLog');

class NotificationService {
  constructor() {
    this.logs = [];
  }

  async sendSms(recipient, message, alertId) {
    console.log(`[SMS Dispatcher] Sent to ${recipient} for Alert ${alertId}: ${message}`);
    const log = new NotificationLog({
      alertId,
      channel: 'SMS',
      recipient,
      status: 'DELIVERED',
      payload: { message }
    });
    this.logs.push(log);
    return log;
  }

  async sendEmail(recipient, subject, htmlBody, alertId) {
    console.log(`[Email Dispatcher] Sent to ${recipient} [${subject}] for Alert ${alertId}`);
    const log = new NotificationLog({
      alertId,
      channel: 'EMAIL',
      recipient,
      status: 'DELIVERED',
      payload: { subject, htmlBody }
    });
    this.logs.push(log);
    return log;
  }

  async sendPushNotification(deviceToken, title, body, alertId) {
    console.log(`[Push Dispatcher] Pushed to ${deviceToken}: "${title}" - ${body}`);
    const log = new NotificationLog({
      alertId,
      channel: 'PUSH',
      recipient: deviceToken,
      status: 'DELIVERED',
      payload: { title, body }
    });
    this.logs.push(log);
    return log;
  }

  async triggerPhysicalSiren(zoneId, sirenLevel = 'HIGH') {
    console.log(`[Siren Controller] Triggered siren array in zone ${zoneId} at level ${sirenLevel}`);
    const log = new NotificationLog({
      alertId: `SIREN-${zoneId}`,
      channel: 'SIREN',
      recipient: `ZONE-${zoneId}`,
      status: 'ACTIVATED',
      payload: { zoneId, sirenLevel }
    });
    this.logs.push(log);
    return log;
  }

  getLogs() {
    return this.logs;
  }
}

module.exports = new NotificationService();
