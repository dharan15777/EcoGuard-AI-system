const express = require('express');
const cors = require('cors');
const env = require('../config/environment');
const database = require('../config/database');
const errorHandler = require('../middleware/errorHandler');

// Import routes
const sensorsRouter = require('./routes/sensors');
const alertsRouter = require('./routes/alerts');
const dashboardRouter = require('./routes/dashboard');
const locationsRouter = require('./routes/locations');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck Route
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'EcoGuard AI Backend Microservice',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use(`${env.apiPrefix}/sensors`, sensorsRouter);
app.use(`${env.apiPrefix}/alerts`, alertsRouter);
app.use(`${env.apiPrefix}/dashboard`, dashboardRouter);
app.use(`${env.apiPrefix}/locations`, locationsRouter);
app.use(`${env.apiPrefix}/users`, usersRouter);

// Global Error Handler
app.use(errorHandler);

// Initialize DB and start server if executed directly
if (require.main === module) {
  database.connect().then(() => {
    app.listen(env.port, () => {
      console.log(`====================================================`);
      console.log(`🌱 EcoGuard AI Backend Microservice Online!`);
      console.log(`🌐 Server running at: http://localhost:${env.port}`);
      console.log(`📌 API Endpoint prefix: http://localhost:${env.port}${env.apiPrefix}`);
      console.log(`====================================================`);
    });
  });
}

module.exports = app;
