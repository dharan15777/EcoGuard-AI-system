const express = require('express');
const router = express.Router();
const Location = require('../../models/Location');

// Mock storage for zones
const zones = [
  new Location({ id: 'LOC-101', name: 'Pine River Flood Plain', region: 'North Basin Sector', centerLat: 37.7749, centerLng: -122.4194, radiusKm: 12.5, activeSensorsCount: 4, riskLevel: 'HIGH' }),
  new Location({ id: 'LOC-102', name: 'Sierra Thermal Reserve', region: 'East Mountain Ridge', centerLat: 37.7695, centerLng: -122.4467, radiusKm: 25.0, activeSensorsCount: 8, riskLevel: 'CRITICAL' }),
  new Location({ id: 'LOC-103', name: 'Metro Bay Area Air Corridor', region: 'Urban Industrial', centerLat: 37.7510, centerLng: -122.4180, radiusKm: 30.0, activeSensorsCount: 12, riskLevel: 'LOW' }),
  new Location({ id: 'LOC-104', name: 'Pacific Highway Cliffside', region: 'Coastal Slope', centerLat: 37.7300, centerLng: -122.5000, radiusKm: 8.0, activeSensorsCount: 3, riskLevel: 'MODERATE' })
];

// GET /api/v1/locations - List all geographic monitoring zones
router.get('/', (req, res) => {
  res.json({ status: 'success', count: zones.length, data: zones });
});

module.exports = router;
