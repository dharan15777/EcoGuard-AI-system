class AnalyticsService {
  getSystemMetrics() {
    return {
      activeSensors: 24,
      offlineSensors: 1,
      maintenanceSensors: 2,
      activeAlertsCount: 2,
      acknowledgedAlertsCount: 5,
      resolvedAlertsCount: 42,
      averageBatteryHealth: 92.4, // %
      totalReadings24h: 172800,
      systemUptimePercent: 99.98,
      riskIndexSummary: {
        floodRisk: 'MODERATE',
        wildfireRisk: 'HIGH',
        landslideRisk: 'LOW',
        airQualityRisk: 'LOW'
      }
    };
  }

  getHistoricalTrend(range = '24h') {
    // Generates historical time series for visual analytics
    const points = [];
    const now = Date.now();
    const stepMs = range === '24h' ? 3600 * 1000 : 86400 * 1000;
    const count = range === '24h' ? 24 : 30;

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * stepMs).toISOString();
      points.push({
        timestamp: time,
        avgWaterLevel: parseFloat((2.1 + Math.sin(i / 3) * 0.8 + Math.random() * 0.2).toFixed(2)),
        avgTemperature: parseFloat((24.5 + Math.cos(i / 4) * 5 + Math.random()).toFixed(1)),
        avgSoilMoisture: parseFloat((45.0 + Math.sin(i / 2) * 12).toFixed(1)),
        avgAQI: Math.floor(35 + Math.random() * 40),
        riskScoreAverage: parseFloat((0.15 + Math.sin(i / 5) * 0.1).toFixed(2))
      });
    }

    return points;
  }
}

module.exports = new AnalyticsService();
