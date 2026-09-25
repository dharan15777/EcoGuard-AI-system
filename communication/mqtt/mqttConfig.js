module.exports = {
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  clientId: `ecoguard_backend_${Math.random().toString(16).substring(2, 8)}`,
  topics: {
    telemetry: 'ecoguard/telemetry/+',
    alerts: 'ecoguard/alerts/high',
    systemStatus: 'ecoguard/system/status'
  },
  qos: 1
};
