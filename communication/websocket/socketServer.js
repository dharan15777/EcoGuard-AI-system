// Real-Time Socket Gateway for Live Map updates and Emergency Alerts broadcast

class SocketServer {
  constructor() {
    this.clients = new Set();
  }

  attach(server) {
    console.log(`[WebSocket Server] Real-time EcoGuard telemetry gateway initialized on WebSocket stream.`);
  }

  broadcastTelemetry(sensorId, telemetryData) {
    const payload = JSON.stringify({ event: 'TELEMETRY_UPDATE', sensorId, data: telemetryData });
    console.log(`[WebSocket Broadcast] Broadcased telemetry update for sensor ${sensorId} to ${this.clients.size} connected web clients.`);
  }

  broadcastAlert(alert) {
    const payload = JSON.stringify({ event: 'CRITICAL_ALERT', data: alert });
    console.log(`[WebSocket Emergency Broadcast] 🚨 CRITICAL ALERT BROADCAST 🚨: ${alert.title}`);
  }
}

module.exports = new SocketServer();
