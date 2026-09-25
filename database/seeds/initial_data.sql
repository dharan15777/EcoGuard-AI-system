-- EcoGuard Initial Database Seed Data

INSERT INTO locations (id, name, region, center_lat, center_lng, radius_km, risk_level) VALUES
('LOC-101', 'Pine River Flood Plain', 'North Basin Sector', 37.7749, -122.4194, 12.5, 'HIGH'),
('LOC-102', 'Sierra Thermal Reserve', 'East Mountain Ridge', 37.7695, -122.4467, 25.0, 'CRITICAL'),
('LOC-103', 'Metro Bay Area Air Corridor', 'Urban Industrial', 37.7510, -122.4180, 30.0, 'LOW');

INSERT INTO sensors (id, name, type, location_id, latitude, longitude, status, battery_level, edge_ai_model) VALUES
('SN-FLD-01', 'Pine River Hydro Node Alpha', 'FLOOD_WATER_LEVEL', 'LOC-101', 37.7749, -122.4194, 'ONLINE', 94.2, 'flood_detection.tflite'),
('SN-FIR-01', 'Sierra Thermal Optics Node 04', 'WILDFIRE_THERMAL', 'LOC-102', 37.7695, -122.4467, 'ALERTING', 99.1, 'fire_detection.tflite'),
('SN-AQI-01', 'Metropolitan Air Station Central', 'AIR_QUALITY_AQI', 'LOC-103', 37.7510, -122.4180, 'ONLINE', 100.0, 'pollution_detection.tflite');

INSERT INTO users (id, name, email, password_hash, role, department) VALUES
('USR-1001', 'Dr. Elena Rostova', 'elena.rostova@ecoguard.ai', '$2b$10$e8w...mockhash', 'ADMIN', 'Chief Environmental Scientist'),
('USR-1002', 'Marcus Thorne', 'marcus.t@ecoguard.ai', '$2b$10$x9q...mockhash', 'OPERATOR', 'Disaster Response Command');
