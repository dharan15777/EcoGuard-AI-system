const config = require('./mqttConfig');

class EcoGuardMQTTClient {
  constructor() {
    this.isConnected = false;
  }

  connect() {
    console.log(`[MQTT Client] Connecting to broker at ${config.brokerUrl} with ClientID: ${config.clientId}...`);
    this.isConnected = true;
    console.log(`[MQTT Client] Connected! Subscribing to topics: ${Object.values(config.topics).join(', ')}`);
  }

  publish(topic, payload) {
    if (!this.isConnected) this.connect();
    console.log(`[MQTT Publish] Topic: ${topic} | Payload:`, JSON.stringify(payload));
  }
}

module.exports = new EcoGuardMQTTClient();
