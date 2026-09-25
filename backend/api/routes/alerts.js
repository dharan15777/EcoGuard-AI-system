const express = require('express');
const router = express.Router();
const alertService = require('../../services/alertService');

// GET /api/v1/alerts - Get all alerts
router.get('/', (req, res) => {
  const { status, severity } = req.query;
  const alerts = alertService.getAlerts({ status, severity });
  res.json({ status: 'success', count: alerts.length, data: alerts });
});

// POST /api/v1/alerts - Manual trigger alert
router.post('/', (req, res) => {
  const alert = alertService.createAlert(req.body);
  res.status(201).json({ status: 'success', data: alert });
});

// PATCH /api/v1/alerts/:id/acknowledge - Acknowledge alert
router.patch('/:id/acknowledge', (req, res) => {
  const { userName } = req.body;
  const alert = alertService.acknowledgeAlert(req.params.id, userName);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json({ status: 'success', message: 'Alert acknowledged', data: alert });
});

// PATCH /api/v1/alerts/:id/resolve - Resolve alert
router.patch('/:id/resolve', (req, res) => {
  const alert = alertService.resolveAlert(req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json({ status: 'success', message: 'Alert resolved', data: alert });
});

module.exports = router;
