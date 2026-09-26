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
  floodThreshold: number; // danger limit in meters
  warningThreshold: number; // watch/warning limit in meters
  rainfallRate: number; // in mm/hr
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
  hour: string;
  timeLabel: string;
  waterLevel: number;
  rainfall: number;
  riskScore: number;
  riskTier: FloodRiskTier;
  summary: string;
}

export interface AIPredictionData {
  confidence: number; // e.g. 94.6
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
  category: 'Evacuation' | 'Infrastructure' | 'Authority' | 'Livestock' | 'Barriers';
}

export interface HistoricalReading {
  timestamp: string;
  waterLevel: number;
  rainfall: number;
  riskScore: number;
}
