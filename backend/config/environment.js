const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config/.env.example') });

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  dbUrl: process.env.DATABASE_URL || 'postgres://localhost:5432/ecoguard_db',
  jwtSecret: process.env.JWT_SECRET || 'ecoguard_default_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mqttUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  edgeAiSecret: process.env.EDGE_AI_SECRET || 'edge_node_auth_token_8877'
};
