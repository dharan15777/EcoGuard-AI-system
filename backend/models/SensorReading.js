class SensorReading {
  constructor(data) {
    this.id = data.id || `RDG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.sensorId = data.sensorId;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.telemetry = {
      waterLevel: data.telemetry?.waterLevel ?? null,       // meters
      temperature: data.telemetry?.temperature ?? null,     // Celsius
      humidity: data.telemetry?.humidity ?? null,           // %
      co2Level: data.telemetry?.co2Level ?? null,           // ppm
      pm25: data.telemetry?.pm25 ?? null,                   // ug/m3
      soilMoisture: data.telemetry?.soilMoisture ?? null,   // %
      groundTilt: data.telemetry?.groundTilt ?? null,       // degrees
      windSpeed: data.telemetry?.windSpeed ?? null          // km/h
    };
    this.riskScore = data.riskScore ?? 0.0; // 0.0 to 1.0
    this.inferenceResult = data.inferenceResult || 'NORMAL';
  }
}

module.exports = SensorReading;
