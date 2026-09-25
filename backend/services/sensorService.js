const Sensor = require('../models/Sensor');

class SensorService {
  constructor() {
    this.sensors = new Map();
    this.seedInitialSensors();
  }

  seedInitialSensors() {
    const defaultSensors = [
      { id: 'SN-FLD-01', name: 'Pine River Hydro Node Alpha', type: 'FLOOD_WATER_LEVEL', locationId: 'LOC-101', latitude: 37.7749, longitude: -122.4194, batteryLevel: 94.2, status: 'ONLINE', edgeAiModel: 'flood_detection.tflite' },
      { id: 'SN-FLD-02', name: 'Cascade Dam Spillway Monitor', type: 'FLOOD_WATER_LEVEL', locationId: 'LOC-101', latitude: 37.7833, longitude: -122.4167, batteryLevel: 88.0, status: 'ONLINE', edgeAiModel: 'flood_detection.tflite' },
      { id: 'SN-FIR-01', name: 'Sierra Thermal Optics Node 04', type: 'WILDFIRE_THERMAL', locationId: 'LOC-102', latitude: 37.7695, longitude: -122.4467, batteryLevel: 99.1, status: 'ALERTING', edgeAiModel: 'fire_detection.tflite' },
      { id: 'SN-AQI-01', name: 'Metropolitan Air Station Central', type: 'AIR_QUALITY_AQI', locationId: 'LOC-103', latitude: 37.7510, longitude: -122.4180, batteryLevel: 100.0, status: 'ONLINE', edgeAiModel: 'pollution_detection.tflite' },
      { id: 'SN-LND-01', name: 'Coastal Cliff Tilt Sensor 09', type: 'LANDSLIDE_SOIL_MOISTURE', locationId: 'LOC-104', latitude: 37.7300, longitude: -122.5000, batteryLevel: 79.4, status: 'ONLINE', edgeAiModel: 'landslide_detection.tflite' },
      { id: 'SN-WTR-01', name: 'High Alpine Weather Station B', type: 'METEOROLOGICAL', locationId: 'LOC-105', latitude: 37.8000, longitude: -122.4000, batteryLevel: 92.5, status: 'ONLINE', edgeAiModel: 'weather_pred.tflite' }
    ];

    defaultSensors.forEach(s => this.sensors.set(s.id, new Sensor(s)));
  }

  getAllSensors() {
    return Array.from(this.sensors.values());
  }

  getSensorById(id) {
    return this.sensors.get(id) || null;
  }

  registerSensor(sensorData) {
    const sensor = new Sensor(sensorData);
    this.sensors.set(sensor.id, sensor);
    return sensor;
  }

  updateSensorStatus(id, status, batteryLevel) {
    const sensor = this.sensors.get(id);
    if (!sensor) return null;
    if (status) sensor.status = status;
    if (batteryLevel !== undefined) sensor.batteryLevel = batteryLevel;
    sensor.lastPing = new Date().toISOString();
    return sensor;
  }

  deleteSensor(id) {
    return this.sensors.delete(id);
  }
}

module.exports = new SensorService();
