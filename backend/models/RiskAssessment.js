class RiskAssessment {
  constructor(data) {
    this.id = data.id || `RISK-${Date.now()}`;
    this.locationId = data.locationId;
    this.zoneName = data.zoneName;
    this.overallRiskScore = data.overallRiskScore || 0.15; // 0 to 1
    this.riskLevel = data.riskLevel || 'LOW';
    this.hazardBreakdown = data.hazardBreakdown || {
      flood: 0.12,
      wildfire: 0.05,
      landslide: 0.08,
      airQuality: 0.22
    };
    this.recommendedActions = data.recommendedActions || [
      'Maintain standard sensor polling frequency (5m)',
      'Inspect battery power reserves for Edge nodes'
    ];
    this.assessedAt = data.assessedAt || new Date().toISOString();
  }
}

module.exports = RiskAssessment;
