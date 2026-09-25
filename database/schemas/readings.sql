CREATE TABLE IF NOT EXISTS sensor_readings (
    id VARCHAR(100) PRIMARY KEY,
    sensor_id VARCHAR(50) REFERENCES sensors(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    water_level FLOAT,
    temperature FLOAT,
    humidity FLOAT,
    co2_level FLOAT,
    pm25 FLOAT,
    soil_moisture FLOAT,
    ground_tilt FLOAT,
    wind_speed FLOAT,
    risk_score FLOAT DEFAULT 0.0,
    inference_result VARCHAR(50)
);

CREATE INDEX idx_readings_sensor_time ON sensor_readings(sensor_id, timestamp DESC);
