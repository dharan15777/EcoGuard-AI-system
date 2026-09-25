class NotificationLog {
  constructor(data) {
    this.id = data.id || `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.alertId = data.alertId;
    this.channel = data.channel; // SMS, EMAIL, PUSH, SIREN
    this.recipient = data.recipient;
    this.status = data.status || 'DELIVERED'; // SENT, DELIVERED, FAILED
    this.sentAt = data.sentAt || new Date().toISOString();
    this.payload = data.payload || {};
  }
}

module.exports = NotificationLog;
