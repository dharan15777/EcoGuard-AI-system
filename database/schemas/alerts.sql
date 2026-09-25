CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    sensor_id VARCHAR(50) REFERENCES sensors(id),
    hazard_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    confidence_score FLOAT DEFAULT 0.0,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location_name VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);
