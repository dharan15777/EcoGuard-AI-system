const express = require('express');
const router = express.Router();
const sensorService = require('../../services/sensorService');
const dataService = require('../../services/dataService');
const { validateSensorRegistration, validateTelemetryData } = require('../../middleware/validation');

// GET /api/v1/sensors - Get all sensors
router.get('/', (req, res) => {
  const sensors = sensorService.getAllSensors();
  res.json({ status: 'success', count: sensors.length, data: sensors });
});

// GET /api/v1/sensors/:id - Get sensor details
router.get('/:id', (req, res) => {
  const sensor = sensorService.getSensorById(req.params.id);
  if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
  const recentReadings = dataService.getRecentReadings(sensor.id, 20);
  res.json({ status: 'success', data: { ...sensor, recentReadings } });
});

// POST /api/v1/sensors - Register new sensor
router.post('/', validateSensorRegistration, (req, res) => {
  const newSensor = sensorService.registerSensor(req.body);
  res.status(201).json({ status: 'success', message: 'Sensor registered', data: newSensor });
});

// POST /api/v1/sensors/telemetry - Ingest Edge AI telemetry
router.post('/telemetry', validateTelemetryData, (req, res) => {
  const reading = dataService.processIncomingReading(req.body);
  sensorService.updateSensorStatus(req.body.sensorId, 'ONLINE', req.body.batteryLevel);
  res.status(200).json({ status: 'success', message: 'Telemetry ingested', data: reading });
});

// PATCH /api/v1/sensors/:id - Update sensor config/status
router.patch('/:id', (req, res) => {
  const { status, batteryLevel } = req.body;
  const updated = sensorService.updateSensorStatus(req.params.id, status, batteryLevel);
  if (!updated) return res.status(404).json({ error: 'Sensor not found' });
  res.json({ status: 'success', data: updated });
});

// DELETE /api/v1/sensors/:id - Remove sensor
router.delete('/:id', (req, res) => {
  const deleted = sensorService.deleteSensor(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Sensor not found' });
  res.json({ status: 'success', message: 'Sensor unregistered' });
});

module.exports = router;
