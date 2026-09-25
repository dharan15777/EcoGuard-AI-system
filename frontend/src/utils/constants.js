export const SENSOR_TYPES = {
  FLOOD: 'FLOOD_WATER_LEVEL',
  WILDFIRE: 'WILDFIRE_THERMAL',
  AIR_QUALITY: 'AIR_QUALITY_AQI',
  LANDSLIDE: 'LANDSLIDE_SOIL_MOISTURE',
  WEATHER: 'METEOROLOGICAL'
};

export const HAZARD_COLORS = {
  FLOOD: '#06b6d4',
  WILDFIRE: '#ef4444',
  AIR_QUALITY: '#a855f7',
  LANDSLIDE: '#f59e0b',
  METEOROLOGICAL: '#10b981'
};

export const MOCK_SENSORS = [
  { id: 'SN-FLD-01', name: 'Pine River Hydro Node Alpha', type: 'FLOOD_WATER_LEVEL', latitude: 37.7749, longitude: -122.4194, batteryLevel: 94.2, status: 'ONLINE', val: '2.8m' },
  { id: 'SN-FIR-01', name: 'Sierra Thermal Optics Node 04', type: 'WILDFIRE_THERMAL', latitude: 37.7695, longitude: -122.4467, batteryLevel: 99.1, status: 'ALERTING', val: '84°C' },
  { id: 'SN-AQI-01', name: 'Metropolitan Air Station Central', type: 'AIR_QUALITY_AQI', latitude: 37.7510, longitude: -122.4180, batteryLevel: 100.0, status: 'ONLINE', val: 'AQI 38' },
  { id: 'SN-LND-01', name: 'Coastal Cliff Tilt Sensor 09', type: 'LANDSLIDE_SOIL_MOISTURE', latitude: 37.7300, longitude: -122.5000, batteryLevel: 79.4, status: 'ONLINE', val: 'Moisture 44%' }
];
