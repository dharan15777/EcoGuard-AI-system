class Sensor {
  constructor(data) {
    this.id = data.id || `SN-${Math.floor(1000 + Math.random() * 9000)}`;
    this.name = data.name;
    this.type = data.type; // FLOOD_WATER_LEVEL, WILDFIRE_THERMAL, AIR_QUALITY_AQI, LANDSLIDE_SOIL_MOISTURE
    this.locationId = data.locationId;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.altitude = data.altitude || 120.5;
    this.status = data.status || 'ACTIVE'; // ONLINE, OFFLINE, MAINTENANCE, ALERTING
    this.batteryLevel = data.batteryLevel !== undefined ? data.batteryLevel : 98.5;
    this.signalStrength = data.signalStrength || -65; // dBm
    this.firmwareVersion = data.firmwareVersion || 'v2.4.1';
    this.edgeAiModel = data.edgeAiModel || 'flood_detection.tflite';
    this.lastPing = data.lastPing || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Sensor;
