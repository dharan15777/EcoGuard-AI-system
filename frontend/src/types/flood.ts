export type FloodRiskTier = 'SAFE' | 'WATCH' | 'WARNING' | 'DANGER';

export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';

export interface FloodSensor {
  id: string;
  name: string;
  type: string;
  locationName: string;
  basin: string;
  latitude: number;
  longitude: number;
  waterLevel: number; // in meters
  floodThreshold: number; // danger limit in meters (4.2m)
  warningThreshold: number; // watch/warning limit in meters (3.5m)
  rainfallRate: number; // in mm/hr
  riseRate: number; // in m/hr
  soilMoisture: number; // 0-100%
  riverFlowRate: number; // in m³/s
  batteryLevel: number; // 0-100%
  status: SensorStatus;
  riskScore: number; // 0-100
  riskTier: FloodRiskTier;
  lastPing: string;
  firmwareVersion?: string;
  signalStrength?: string;
}

export interface FloodAlert {
  id: string;
  alertType: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  detectionTime: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';
  waterLevel?: number;
  rainfall?: number;
  confidenceScore?: number;
  description: string;
  sensorId?: string;
}

export interface HourlyPrediction {
  horizonHours: number; // 1, 3, 6, 12, 24, 30
  hour: string; // "1 Hour", "3 Hours", etc.
  timeLabel: string;
  waterLevel: number;
  rainfall: number;
  riskScore: number;
  riskTier: FloodRiskTier;
  summary: string;
}

export interface AIPredictionData {
  confidence: number; // e.g. 94%
  currentRisk: FloodRiskTier;
  predictedRisk24h: FloodRiskTier;
  predictedRisk30h: FloodRiskTier;
  reason: string;
  modelName: string;
  latencyMs: number;
  projectedPeakLevel: number;
  projectedPeakTime: string;
  hourlyForecast: HourlyPrediction[];
}

export interface AIRecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL_NOW' | 'HIGH_PRIORITY' | 'TACTICAL_ADVISORY' | 'PREPAREDNESS';
  icon: string;
  status: 'PENDING' | 'DISPATCHED' | 'COMPLETED';
  category: 'Evacuation' | 'Infrastructure' | 'Authority' | 'Livestock' | 'Barriers' | 'Monitoring';
}

export interface HistoricalReading {
  timestamp: string;
  waterLevel: number;
  rainfall: number;
  riskScore: number;
}
