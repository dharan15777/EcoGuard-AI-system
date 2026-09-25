const express = require('express');
const router = express.Router();
const analyticsService = require('../../services/analyticsService');
const sensorService = require('../../services/sensorService');
const alertService = require('../../services/alertService');

// GET /api/v1/dashboard/summary - Unified Dashboard KPI Data
router.get('/summary', (req, res) => {
  const metrics = analyticsService.getSystemMetrics();
  const activeAlerts = alertService.getAlerts({ status: 'ACTIVE' });
  const sensors = sensorService.getAllSensors();
  const historical = analyticsService.getHistoricalTrend('24h');

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: {
      metrics,
      activeAlerts,
      sensorSummary: {
        total: sensors.length,
        online: sensors.filter(s => s.status === 'ONLINE').length,
        alerting: sensors.filter(s => s.status === 'ALERTING').length,
        offline: sensors.filter(s => s.status === 'OFFLINE').length
      },
      chartData: historical
    }
  });
});

module.exports = router;
