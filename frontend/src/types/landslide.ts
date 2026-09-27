export type LandslideRiskTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type SensorStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';

export type SoilSaturationLevel = 'DRY' | 'MODERATE' | 'SATURATED' | 'HIGHLY_SATURATED';

export type VibrationStatus = 'NORMAL' | 'MODERATE' | 'ABNORMAL' | 'CRITICAL';

export type DisplacementStatus = 'STABLE' | 'MINOR_SHIFT' | 'UNSTABLE' | 'CRITICAL';

export interface LandslideSensor {
  id: string;
  name: string;
  type: string;
  locationName: string;
  hillZone: string;
  latitude: number;
  longitude: number;
  soilMoisture: number; // % (0 - 100)
  soilSaturationLevel: SoilSaturationLevel;
  rainfallRate: number; // mm/h
  rainfall24h: number; // mm (cumulative last 24h)
  groundVibration: number; // mm/s (Peak Particle Velocity PPV)
  vibrationStatus: VibrationStatus;
  groundDisplacement: number; // mm (cumulative slope shear displacement)
  slopeTiltAngle: number; // degrees (e.g. 34.5°)
  slopeStabilityScore: number; // 0 - 100 (or Factor of Safety 0.5 - 2.5 normalized)
  displacementStatus: DisplacementStatus;
  batteryLevel: number; // %
  status: SensorStatus;
  riskScore: number; // 0 - 100
  riskTier: LandslideRiskTier;
  lastPing: string;
  poreWaterPressure?: number; // kPa
  firmwareVersion?: string;
  signalStrength?: string;
}

export interface LandslideAlert {
  id: string;
  alertType: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  detectionTime: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESOLVED';
  soilMoisture?: number;
  groundDisplacement?: number;
  rainfallRate?: number;
  groundVibration?: number;
  confidenceScore?: number;
  description: string;
  sensorId?: string;
}

export interface HourlyLandslidePrediction {
  horizonHours: number; // 1, 3, 6, 12, 24
  hour: string; // "1 Hour", "3 Hours", "6 Hours", etc.
  timeLabel: string;
  soilMoisture: number;
  rainfallRate: number;
  groundDisplacement: number;
  groundVibration: number;
  riskScore: number;
  riskTier: LandslideRiskTier;
  summary: string;
}

export interface AILandslidePredictionData {
  confidence: number; // e.g. 95%
  currentRisk: LandslideRiskTier;
  predictedRisk6h: LandslideRiskTier;
  predictedRisk24h: LandslideRiskTier;
  reason: string;
  modelName: string;
  latencyMs: number;
  projectedRunoutVelocity: number; // m/s or km/h
  projectedPeakFailureTime: string;
  hourlyForecast: HourlyLandslidePrediction[];
}

export interface LandslideImpactAssessment {
  villagesAtRisk: number; // e.g. 4
  populationAtRisk: number; // e.g. 3,200
  roadsAffected: number; // e.g. 2
  schoolsAffected: number; // e.g. 3
  hospitalsAffected: number; // e.g. 1
  impactAreaKm2: number; // e.g. 15 km²
  criticalEvacuationCorridors: string[];
}

export interface AILandslideRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL_NOW' | 'HIGH_PRIORITY' | 'TACTICAL_ADVISORY' | 'PREPAREDNESS';
  icon: string;
  status: 'PENDING' | 'DISPATCHED' | 'COMPLETED';
  category: 'Evacuation' | 'Roads' | 'Rescue' | 'Monitoring' | 'Alerts' | 'Infrastructure';
}

export interface HistoricalLandslideReading {
  timestamp: string;
  soilMoisture: number; // %
  rainfallRate: number; // mm/h
  rainfall24h: number; // mm
  groundVibration: number; // mm/s
  groundDisplacement: number; // mm
  riskScore: number; // 0 - 100
}

export interface NearbyHillVillage {
  id: string;
  name: string;
  population: number;
  distanceKm: number;
  elevationM: number;
  riskLevel: LandslideRiskTier;
  evacuationStatus: 'NOMINAL' | 'STANDBY' | 'EVACUATING' | 'COMPLETED';
}

export interface HillRoad {
  id: string;
  name: string;
  status: 'OPEN' | 'WARNING' | 'CLOSED';
  lengthKm: number;
  blockProbability: number; // %
}
