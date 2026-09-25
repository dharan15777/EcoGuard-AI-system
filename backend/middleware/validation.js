// Request Payload Validator Middleware

const validateSensorRegistration = (req, res, next) => {
  const { name, type, latitude, longitude } = req.body;
  if (!name || !type || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      error: 'Invalid Payload: Sensor requires name, type, latitude, and longitude fields.'
    });
  }
  next();
};

const validateTelemetryData = (req, res, next) => {
  const { sensorId, telemetry } = req.body;
  if (!sensorId || !telemetry) {
    return res.status(400).json({
      error: 'Invalid Telemetry: sensorId and telemetry object are required.'
    });
  }
  next();
};

module.exports = {
  validateSensorRegistration,
  validateTelemetryData
};
