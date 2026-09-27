export type FireRiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';

export interface FireSensor {
  id: string;
  name: string;
  type: string;
  locationName: string;
  forestZone: string;
  latitude: number;
  longitude: number;
  temperature: number; // °C
  maxTempToday: number; // °C
  humidity: number; // %
  smokePPM: number; // ppm
  carbonMonoxide: number; // ppm (CO)
  carbonDioxide: number; // ppm (CO2)
  windSpeed: number; // km/h
  windDirection: string; // e.g. "NW", "ENE"
  batteryLevel: number; // 0-100%
  status: SensorStatus;
  riskScore: number; // 0-100
  riskTier: FireRiskTier;
  lastPing: string;
  firmwareVersion?: string;
  signalStrength?: string;
}

export interface FireAlert {
  id: string;
  alertType: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  detectionTime: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';
  temperature?: number;
  humidity?: number;
  smokePPM?: number;
  confidenceScore?: number;
  description: string;
  sensorId?: string;
}

export interface HourlyFirePrediction {
  horizonHours: number; // 1, 3, 6, 12, 24
  hour: string; // "1 Hour", "3 Hours", "6 Hours", etc.
  timeLabel: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  riskScore: number;
  riskTier: FireRiskTier;
  summary: string;
}

export interface AIFirePredictionData {
  confidence: number; // e.g. 93%
  currentRisk: FireRiskTier;
  predictedRisk6h: FireRiskTier;
  predictedRisk24h: FireRiskTier;
  reason: string;
  modelName: string;
  latencyMs: number;
  projectedSpreadVelocity: number; // km/h
  projectedPeakTime: string;
  hourlyForecast: HourlyFirePrediction[];
  affectedAreaHectares: number;
  predictedSpreadHectares: number;
  villagesAtRiskCount: number;
}

export interface AIFireRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL_NOW' | 'HIGH_PRIORITY' | 'TACTICAL_ADVISORY' | 'PREPAREDNESS';
  icon: string;
  status: 'PENDING' | 'DISPATCHED' | 'COMPLETED';
  category: 'Suppression' | 'Evacuation' | 'Patrol' | 'Authorities' | 'Firebreaks' | 'Surveillance';
}

export interface HistoricalFireReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  smokePPM: number;
  windSpeed: number;
  riskScore: number;
}

export interface NearbyVillage {
  id: string;
  name: string;
  population: number;
  distanceKm: number;
  bearing: string;
  riskLevel: FireRiskTier;
  evacuationStatus: 'NOMINAL' | 'STANDBY' | 'EVACUATING' | 'COMPLETED';
}

export interface ResponseBase {
  id: string;
  name: string;
  type: 'RANGER_STATION' | 'HELITACK_BASE' | 'QUICK_RESPONSE_CREW';
  latitude: number;
  longitude: number;
  personnelOnDuty: number;
  status: 'READY' | 'DEPLOYED' | 'EN_ROUTE';
}
