import {
  LandslideRiskTier,
  LandslideSensor,
  LandslideAlert,
  AILandslidePredictionData,
  LandslideImpactAssessment,
  AILandslideRecommendation,
  HistoricalLandslideReading,
  NearbyHillVillage,
  HillRoad,
  SoilSaturationLevel,
  VibrationStatus,
  DisplacementStatus
} from '../types/landslide';

export const LANDSLIDE_RISK_COLORS: Record<
  LandslideRiskTier,
  {
    name: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    text: string;
    badge: string;
  }
> = {
  LOW: {
    name: 'Low',
    color: '#10b981', // emerald
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    glow: '0 0 16px rgba(16, 185, 129, 0.25)',
    text: '#34d399',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
  },
  MODERATE: {
    name: 'Moderate',
    color: '#f59e0b', // amber
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    glow: '0 0 20px rgba(245, 158, 11, 0.3)',
    text: '#fbbf24',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
  },
  HIGH: {
    name: 'High',
    color: '#f97316', // orange
    bg: 'rgba(249, 115, 22, 0.18)',
    border: 'rgba(249, 115, 22, 0.45)',
    glow: '0 0 22px rgba(249, 115, 22, 0.38)',
    text: '#fb923c',
    badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
  },
  CRITICAL: {
    name: 'Critical',
    color: '#ef4444', // crimson red
    bg: 'rgba(239, 68, 68, 0.22)',
    border: 'rgba(239, 68, 68, 0.55)',
    glow: '0 0 28px rgba(239, 68, 68, 0.5)',
    text: '#f87171',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
  }
};

export const classifySoilSaturation = (moisture: number): SoilSaturationLevel => {
  if (moisture >= 85) return 'HIGHLY_SATURATED';
  if (moisture >= 65) return 'SATURATED';
  if (moisture >= 40) return 'MODERATE';
  return 'DRY';
};

export const classifyVibration = (vibration: number): VibrationStatus => {
  if (vibration >= 10.0) return 'CRITICAL';
  if (vibration >= 5.0) return 'ABNORMAL';
  if (vibration >= 2.0) return 'MODERATE';
  return 'NORMAL';
};

export const classifyDisplacement = (displacement: number): DisplacementStatus => {
  if (displacement >= 18.0) return 'CRITICAL';
  if (displacement >= 8.0) return 'UNSTABLE';
  if (displacement >= 3.0) return 'MINOR_SHIFT';
  return 'STABLE';
};

export const classifyLandslideRisk = (
  moisture: number,
  rainRate: number,
  displacement: number,
  vibration = 1.2,
  tilt = 32.0
): LandslideRiskTier => {
  if (
    displacement >= 18.0 ||
    (moisture >= 85 && rainRate >= 40) ||
    (displacement >= 10.0 && vibration >= 7.5) ||
    (moisture >= 88 && displacement >= 12.0)
  ) {
    return 'CRITICAL';
  }

  if (
    displacement >= 8.0 ||
    (moisture >= 75 && rainRate >= 25) ||
    vibration >= 5.0 ||
    (moisture >= 78 && displacement >= 5.0)
  ) {
    return 'HIGH';
  }

  if (
    displacement >= 3.0 ||
    moisture >= 55 ||
    rainRate >= 14 ||
    vibration >= 2.5
  ) {
    return 'MODERATE';
  }

  return 'LOW';
};

export const calculateLandslideRiskScore = (
  moisture: number,
  rainRate: number,
  displacement: number,
  vibration = 1.2,
  tilt = 32.0
): number => {
  // Moisture factor (0 to 100%): weight 0.28
  const moistNorm = Math.min(1, Math.max(0, moisture / 100));

  // Rainfall factor (0 to 80 mm/h): weight 0.24
  const rainNorm = Math.min(1, Math.max(0, rainRate / 70));

  // Displacement factor (0 to 35 mm): weight 0.30 (Critical indicator)
  const dispNorm = Math.min(1, Math.max(0, displacement / 30));

  // Vibration factor (0 to 15 mm/s): weight 0.18
  const vibNorm = Math.min(1, Math.max(0, vibration / 12));

  const rawScore = (dispNorm * 0.32 + moistNorm * 0.28 + rainNorm * 0.24 + vibNorm * 0.16) * 100;
  return Math.min(100, Math.max(5, Math.round(rawScore)));
};

export const INITIAL_LANDSLIDE_SENSORS: LandslideSensor[] = [
  {
    id: 'LS-WAY-01',
    name: 'Chooralmala Escarpment Piezometer Node',
    type: 'BOREHOLE_PIEZOMETER_INCLINOMETER',
    locationName: 'Chooralmala Upper Slope - Sector 3 Slip Surface',
    hillZone: 'Vellarmala - Wayanad Western Escarpment',
    latitude: 11.5385,
    longitude: 76.1720,
    soilMoisture: 88.5,
    soilSaturationLevel: 'HIGHLY_SATURATED',
    rainfallRate: 46.2,
    rainfall24h: 215.0,
    groundVibration: 8.8,
    vibrationStatus: 'ABNORMAL',
    groundDisplacement: 22.4,
    slopeTiltAngle: 38.6,
    slopeStabilityScore: 18,
    displacementStatus: 'CRITICAL',
    batteryLevel: 94.0,
    status: 'ONLINE',
    riskScore: 92,
    riskTier: 'CRITICAL',
    lastPing: new Date().toISOString(),
    poreWaterPressure: 64.2,
    firmwareVersion: 'v5.2.1-GeoSense',
    signalStrength: '-64 dBm (LoRaWAN CH01)'
  },
  {
    id: 'LS-WAY-02',
    name: 'Mundakkai Flank Extensometer Array',
    type: 'SURFACE_WIRE_EXTENSOMETER',
    locationName: 'Mundakkai Tea Estate Scarp Face & Sump',
    hillZone: 'Mundakkai Debris Flow Catchment',
    latitude: 11.5490,
    longitude: 76.1830,
    soilMoisture: 79.4,
    soilSaturationLevel: 'SATURATED',
    rainfallRate: 34.0,
    rainfall24h: 178.0,
    groundVibration: 5.6,
    vibrationStatus: 'ABNORMAL',
    groundDisplacement: 12.8,
    slopeTiltAngle: 34.2,
    slopeStabilityScore: 34,
    displacementStatus: 'UNSTABLE',
    batteryLevel: 89.5,
    status: 'ONLINE',
    riskScore: 78,
    riskTier: 'HIGH',
    lastPing: new Date(Date.now() - 25000).toISOString(),
    poreWaterPressure: 48.0,
    firmwareVersion: 'v5.1.0-GeoSense',
    signalStrength: '-69 dBm (NB-IoT)'
  },
  {
    id: 'LS-WAY-03',
    name: 'Meppadi Valley Hydro-Acoustic Station',
    type: 'GEOPHONE_TIPPING_BUCKET',
    locationName: 'Meppadi Roadside Inundation Gully Marker 8',
    hillZone: 'Mid-Elevation Transition Basin',
    latitude: 11.5540,
    longitude: 76.1280,
    soilMoisture: 62.0,
    soilSaturationLevel: 'MODERATE',
    rainfallRate: 22.5,
    rainfall24h: 120.0,
    groundVibration: 3.2,
    vibrationStatus: 'MODERATE',
    groundDisplacement: 5.4,
    slopeTiltAngle: 28.0,
    slopeStabilityScore: 56,
    displacementStatus: 'MINOR_SHIFT',
    batteryLevel: 96.0,
    status: 'ONLINE',
    riskScore: 48,
    riskTier: 'MODERATE',
    lastPing: new Date(Date.now() - 40000).toISOString(),
    poreWaterPressure: 28.5,
    firmwareVersion: 'v5.2.0-GeoSense',
    signalStrength: '-61 dBm (LoRaWAN CH02)'
  },
  {
    id: 'LS-WAY-04',
    name: 'Attamala Ridge Tiltmeter & Geophone',
    type: 'MEMS_TILT_GEOPHONE',
    locationName: 'Attamala Forest Boundary Rockfall Crest',
    hillZone: 'Southern Steep Rockface Ridge',
    latitude: 11.5210,
    longitude: 76.1950,
    soilMoisture: 74.0,
    soilSaturationLevel: 'SATURATED',
    rainfallRate: 31.0,
    rainfall24h: 165.0,
    groundVibration: 4.8,
    vibrationStatus: 'MODERATE',
    groundDisplacement: 9.6,
    slopeTiltAngle: 42.0,
    slopeStabilityScore: 38,
    displacementStatus: 'UNSTABLE',
    batteryLevel: 82.0,
    status: 'ONLINE',
    riskScore: 72,
    riskTier: 'HIGH',
    lastPing: new Date(Date.now() - 55000).toISOString(),
    poreWaterPressure: 42.0,
    firmwareVersion: 'v4.9.8-GeoSense',
    signalStrength: '-74 dBm (LoRaWAN CH03)'
  },
  {
    id: 'LS-WAY-05',
    name: 'Vellarmala Peak Deep Bedrock Sentinel',
    type: 'FIBER_OPTIC_STRAIN_GAUGE',
    locationName: 'Vellarmala Summit Structural Shear Crest',
    hillZone: 'High-Altitude Headwall Sector',
    latitude: 11.5620,
    longitude: 76.1610,
    soilMoisture: 52.0,
    soilSaturationLevel: 'MODERATE',
    rainfallRate: 16.0,
    rainfall24h: 88.0,
    groundVibration: 1.4,
    vibrationStatus: 'NORMAL',
    groundDisplacement: 1.8,
    slopeTiltAngle: 45.0,
    slopeStabilityScore: 78,
    displacementStatus: 'STABLE',
    batteryLevel: 91.0,
    status: 'ONLINE',
    riskScore: 28,
    riskTier: 'LOW',
    lastPing: new Date(Date.now() - 70000).toISOString(),
    poreWaterPressure: 16.0,
    firmwareVersion: 'v5.3.0-GeoSense',
    signalStrength: '-78 dBm (NB-IoT)'
  },
  {
    id: 'LS-WAY-06',
    name: 'Puthumala Catchment Sump Sentinel',
    type: 'PIEZOMETER_SURCHARGE_SENSOR',
    locationName: 'Puthumala Runout Channel Basin & Culvert',
    hillZone: 'Historical Runout Alluvial Fan',
    latitude: 11.5120,
    longitude: 76.1480,
    soilMoisture: 84.0,
    soilSaturationLevel: 'SATURATED',
    rainfallRate: 38.5,
    rainfall24h: 195.0,
    groundVibration: 6.2,
    vibrationStatus: 'ABNORMAL',
    groundDisplacement: 14.5,
    slopeTiltAngle: 31.5,
    slopeStabilityScore: 26,
    displacementStatus: 'UNSTABLE',
    batteryLevel: 87.0,
    status: 'ONLINE',
    riskScore: 84,
    riskTier: 'HIGH',
    lastPing: new Date(Date.now() - 15000).toISOString(),
    poreWaterPressure: 55.0,
    firmwareVersion: 'v5.1.2-GeoSense',
    signalStrength: '-66 dBm (LoRaWAN CH04)'
  }
];

export const NEARBY_HILL_VILLAGES: NearbyHillVillage[] = [
  {
    id: 'VIL-WAY-01',
    name: 'Chooralmala Settlement & Plantation Town',
    population: 1450,
    distanceKm: 0.8,
    elevationM: 860,
    riskLevel: 'CRITICAL',
    evacuationStatus: 'EVACUATING'
  },
  {
    id: 'VIL-WAY-02',
    name: 'Mundakkai Hamlet & Estate Quarters',
    population: 820,
    distanceKm: 1.4,
    elevationM: 920,
    riskLevel: 'CRITICAL',
    evacuationStatus: 'STANDBY'
  },
  {
    id: 'VIL-WAY-03',
    name: 'Attamala Tribal Colony & Foothill Reach',
    population: 680,
    distanceKm: 2.2,
    elevationM: 810,
    riskLevel: 'HIGH',
    evacuationStatus: 'STANDBY'
  },
  {
    id: 'VIL-WAY-04',
    name: 'Meppadi Township & Transit Center',
    population: 4100,
    distanceKm: 3.8,
    elevationM: 740,
    riskLevel: 'MODERATE',
    evacuationStatus: 'NOMINAL'
  }
];

export const HILL_ROADS: HillRoad[] = [
  {
    id: 'RD-01',
    name: 'SH-59 Meppadi – Chooralmala Hill Highway',
    status: 'CLOSED',
    lengthKm: 12.4,
    blockProbability: 92
  },
  {
    id: 'RD-02',
    name: 'Attamala Valley Connector Plantation Route',
    status: 'WARNING',
    lengthKm: 6.8,
    blockProbability: 68
  },
  {
    id: 'RD-03',
    name: 'Vellarmala Peak Forest Patrol Road',
    status: 'OPEN',
    lengthKm: 8.2,
    blockProbability: 24
  }
];

export const getAILandslidePrediction = (
  currentScore: number,
  moisture: number,
  rainRate: number,
  displacement: number,
  vibration: number
): AILandslidePredictionData => {
  const currentRisk: LandslideRiskTier =
    currentScore >= 76 ? 'CRITICAL' : currentScore >= 51 ? 'HIGH' : currentScore >= 26 ? 'MODERATE' : 'LOW';

  const horizons = [1, 3, 6, 12, 24];
  const hourlyForecast = horizons.map(h => {
    const dispDelta = h === 1 ? 1.5 : h === 3 ? 5.2 : h === 6 ? 11.4 : h === 12 ? 18.0 : 6.0;
    const moistDelta = h === 1 ? 1.0 : h === 3 ? 3.5 : h === 6 ? 5.0 : h === 12 ? -2.0 : -8.0;
    const rainDelta = h === 1 ? 2.0 : h === 3 ? 6.0 : h === 6 ? 12.0 : h === 12 ? -15.0 : -25.0;
    const vibDelta = h === 1 ? 0.4 : h === 3 ? 1.2 : h === 6 ? 2.8 : h === 12 ? 1.0 : -1.0;

    const projectedDisp = parseFloat((displacement + dispDelta).toFixed(1));
    const projectedMoist = Math.min(100, Math.max(20, Math.round(moisture + moistDelta)));
    const projectedRain = Math.max(0, Math.round(rainRate + rainDelta));
    const projectedVib = Math.max(0.5, parseFloat((vibration + vibDelta).toFixed(1)));

    const projectedScore = calculateLandslideRiskScore(projectedMoist, projectedRain, projectedDisp, projectedVib);
    const projectedTier = classifyLandslideRisk(projectedMoist, projectedRain, projectedDisp, projectedVib);

    return {
      horizonHours: h,
      hour: `${h} Hour${h > 1 ? 's' : ''}`,
      timeLabel: `+${h}h Forecast`,
      soilMoisture: projectedMoist,
      rainfallRate: projectedRain,
      groundDisplacement: projectedDisp,
      groundVibration: projectedVib,
      riskScore: projectedScore,
      riskTier: projectedTier,
      summary:
        projectedTier === 'CRITICAL'
          ? 'Catastrophic slope shear failure & high-velocity debris avalanche expected'
          : projectedTier === 'HIGH'
          ? 'Rapid progressive shear creep along saturated slip planes'
          : projectedTier === 'MODERATE'
          ? 'Elevated pore pressure with localized rotational slump hazard'
          : 'Stable geotechnical equilibrium with nominal pore pressure'
    };
  });

  const pred6h = hourlyForecast.find(h => h.horizonHours === 6)?.riskTier || currentRisk;
  const pred24h = hourlyForecast.find(h => h.horizonHours === 24)?.riskTier || currentRisk;

  let reason = '';
  if (currentRisk === 'CRITICAL') {
    reason = `Critical ground displacement (${displacement.toFixed(1)} mm) coupled with extreme soil pore saturation (${moisture}%) and heavy rainfall (${rainRate.toFixed(1)} mm/h) indicates active slip-surface liquefaction towards Chooralmala and Mundakkai valley corridors.`;
  } else if (currentRisk === 'HIGH') {
    reason = `Elevated shear strain (${displacement.toFixed(1)} mm) and sustained high rainfall induce progressive weakening of colluvial slope mantles.`;
  } else if (currentRisk === 'MODERATE') {
    reason = `Continuous monsoon saturation approaching 65% soil moisture threshold; minor creep displacement recorded on upper scarps.`;
  } else {
    reason = `Pore water pressure and ground displacement remain well within factor of safety limits (> 1.8). Routine real-time telemetry surveillance active.`;
  }

  return {
    confidence: 95,
    currentRisk,
    predictedRisk6h: pred6h,
    predictedRisk24h: pred24h,
    reason,
    modelName: 'GeoSlope-Net v3.8 Geotechnical Edge Ensemble',
    latencyMs: 138,
    projectedRunoutVelocity: currentRisk === 'CRITICAL' ? 14.5 : currentRisk === 'HIGH' ? 6.2 : currentRisk === 'MODERATE' ? 1.5 : 0.2,
    projectedPeakFailureTime: 'T+4h 15m (15:00 IST)',
    hourlyForecast
  };
};

export const getAILandslideImpact = (riskTier: LandslideRiskTier): LandslideImpactAssessment => {
  if (riskTier === 'CRITICAL') {
    return {
      villagesAtRisk: 4,
      populationAtRisk: 3200,
      roadsAffected: 2,
      schoolsAffected: 3,
      hospitalsAffected: 1,
      impactAreaKm2: 15.0,
      criticalEvacuationCorridors: ['SH-59 Emergency Route A', 'Meppadi High Ground Camp Route']
    };
  }
  if (riskTier === 'HIGH') {
    return {
      villagesAtRisk: 3,
      populationAtRisk: 2100,
      roadsAffected: 1,
      schoolsAffected: 2,
      hospitalsAffected: 1,
      impactAreaKm2: 8.5,
      criticalEvacuationCorridors: ['Mundakkai East Exit Path']
    };
  }
  if (riskTier === 'MODERATE') {
    return {
      villagesAtRisk: 1,
      populationAtRisk: 680,
      roadsAffected: 1,
      schoolsAffected: 1,
      hospitalsAffected: 0,
      impactAreaKm2: 3.2,
      criticalEvacuationCorridors: ['Attamala Foothill Buffer']
    };
  }
  return {
    villagesAtRisk: 0,
    populationAtRisk: 0,
    roadsAffected: 0,
    schoolsAffected: 0,
    hospitalsAffected: 0,
    impactAreaKm2: 0.5,
    criticalEvacuationCorridors: ['All Regional Corridors Clear']
  };
};

export const getAILandslideRecommendations = (riskTier: LandslideRiskTier): AILandslideRecommendation[] => {
  if (riskTier === 'CRITICAL') {
    return [
      {
        id: 'REC-LS-01',
        title: 'Evacuate Residents Immediately',
        description: 'Sound emergency acoustic sirens across Chooralmala and Mundakkai settlements. Mobilize NDRF and Kerala Fire & Rescue for immediate mandatory evacuation to Meppadi relief centers.',
        priority: 'CRITICAL_NOW',
        icon: 'Users',
        status: 'DISPATCHED',
        category: 'Evacuation'
      },
      {
        id: 'REC-LS-02',
        title: 'Close Mountain Roads & Bridges',
        description: 'Enforce complete traffic barricades on SH-59 Hill Highway and Chooralmala Bailey Bridge to prevent vehicular entrapment in debris paths.',
        priority: 'CRITICAL_NOW',
        icon: 'ShieldAlert',
        status: 'DISPATCHED',
        category: 'Roads'
      },
      {
        id: 'REC-LS-03',
        title: 'Deploy Heavy Rescue Teams & Earthmovers',
        description: 'Position 4 NDRF battalions, military disaster engineering squads, and hydraulic excavators at Meppadi staging junction for rapid debris clearance.',
        priority: 'HIGH_PRIORITY',
        icon: 'Truck',
        status: 'PENDING',
        category: 'Rescue'
      },
      {
        id: 'REC-LS-04',
        title: 'Issue Public Sirens & Cell Broadcast Alerts',
        description: 'Send localized high-priority multilingual CAP emergency broadcast messages to all mobile phones within the 15 km² runout hazard perimeter.',
        priority: 'HIGH_PRIORITY',
        icon: 'BellRing',
        status: 'PENDING',
        category: 'Alerts'
      }
    ];
  }

  if (riskTier === 'HIGH') {
    return [
      {
        id: 'REC-LS-01',
        title: 'Alert Local Authorities & District Disaster Cell',
        description: 'Dispatch urgent red bulletin to District Collector, State Disaster Management Authority (KSDMA), and National Disaster Response Force (NDRF).',
        priority: 'CRITICAL_NOW',
        icon: 'PhoneCall',
        status: 'DISPATCHED',
        category: 'Alerts'
      },
      {
        id: 'REC-LS-02',
        title: 'Prepare Emergency Teams & Shelters',
        description: 'Pre-position 3 mobile rescue units with satellite comms at Meppadi Higher Secondary School and configure relief camps with medical rations.',
        priority: 'HIGH_PRIORITY',
        icon: 'Shield',
        status: 'PENDING',
        category: 'Rescue'
      },
      {
        id: 'REC-LS-03',
        title: 'Issue Slope Movement Advisory',
        description: 'Direct tea estate workers and residents living within 500m of scarp toes to suspend operations and assemble at high-ground muster points.',
        priority: 'HIGH_PRIORITY',
        icon: 'AlertTriangle',
        status: 'PENDING',
        category: 'Evacuation'
      },
      {
        id: 'REC-LS-04',
        title: 'Restrict Heavy Commercial Vehicles on Hill Highway',
        description: 'Bar multi-axle freight trucks from traversing SH-59 to minimize dynamic ground vibration loading on sensitive saturated slip surfaces.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'Road',
        status: 'COMPLETED',
        category: 'Roads'
      }
    ];
  }

  if (riskTier === 'MODERATE') {
    return [
      {
        id: 'REC-LS-01',
        title: 'Increase Monitoring Frequency',
        description: 'Accelerate inclinometer and pore pressure sensor telemetry polling from 15 minutes to 3-second continuous real-time streaming.',
        priority: 'HIGH_PRIORITY',
        icon: 'Activity',
        status: 'DISPATCHED',
        category: 'Monitoring'
      },
      {
        id: 'REC-LS-02',
        title: 'Inspect Slope Drainage & Catchment Benches',
        description: 'Deploy highway maintenance crews to clear blocked weep-holes and hillside culverts to alleviate hydrostatic pore pressure buildup.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'CheckCircle',
        status: 'PENDING',
        category: 'Infrastructure'
      },
      {
        id: 'REC-LS-03',
        title: 'Alert Forest Rangers & Village Defense Teams',
        description: 'Brief local ward panchayat heads and disaster volunteers on early tension crack identification along vulnerable slope crests.',
        priority: 'PREPAREDNESS',
        icon: 'Users',
        status: 'PENDING',
        category: 'Monitoring'
      }
    ];
  }

  // LOW
  return [
    {
      id: 'REC-LS-01',
      title: 'Continue Routine Monitoring',
      description: 'Maintain 24/7 geotechnical sensor telemetry and satellite InSAR ground displacement cross-validation.',
      priority: 'PREPAREDNESS',
      icon: 'ShieldCheck',
      status: 'COMPLETED',
      category: 'Monitoring'
    },
    {
      id: 'REC-LS-02',
      title: 'Verify Geotechnical Sensor Calibration',
      description: 'Run automated acoustic self-tests on borehole piezometers and MEMS tiltmeters across all 6 monitoring stations.',
      priority: 'PREPAREDNESS',
      icon: 'CheckCircle2',
      status: 'COMPLETED',
      category: 'Infrastructure'
    }
  ];
};

export const generateDynamicLandslideAlerts = (
  riskTier: LandslideRiskTier,
  moisture: number,
  displacement: number,
  rainRate: number,
  vibration: number
): LandslideAlert[] => {
  const alerts: LandslideAlert[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (riskTier === 'CRITICAL') {
    alerts.push({
      id: 'ALT-LS-01',
      alertType: 'Critical Landslide Warning · Immediate Failure Imminent',
      location: 'Chooralmala Upper Slope - Sector 3 Slip Surface',
      severity: 'CRITICAL',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      soilMoisture: moisture,
      groundDisplacement: displacement,
      rainfallRate: rainRate,
      confidenceScore: 97,
      description: `Displacement velocity breached emergency threshold (${displacement.toFixed(1)} mm) with soil saturation at ${moisture}%. Catastrophic debris flow failure expected along upper scarp.`
    });
    alerts.push({
      id: 'ALT-LS-02',
      alertType: 'Ground Movement & Shear Slip Detected',
      location: 'Mundakkai Debris Flow Catchment Scarp',
      severity: 'CRITICAL',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      groundDisplacement: displacement,
      groundVibration: vibration,
      confidenceScore: 95,
      description: `Borehole extensometers detected rapid shear slip of ${displacement.toFixed(1)} mm with abnormal seismic vibration (${vibration.toFixed(1)} mm/s PPV). Immediate valley evacuation mandatory.`
    });
    alerts.push({
      id: 'ALT-LS-03',
      alertType: 'Road Closure & Debris Hazard Alert',
      location: 'SH-59 Meppadi – Chooralmala Hill Highway',
      severity: 'HIGH',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      confidenceScore: 92,
      description: `Slope failure imminent over 1.2 km road segment. All traffic stopped; diversion established via alternative foothill route.`
    });
  } else if (riskTier === 'HIGH') {
    alerts.push({
      id: 'ALT-LS-01',
      alertType: 'High Landslide Probability Detected',
      location: 'Chooralmala Upper Slope & Mundakkai Ridge',
      severity: 'HIGH',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      soilMoisture: moisture,
      groundDisplacement: displacement,
      confidenceScore: 89,
      description: `Cumulative slope displacement reached ${displacement.toFixed(1)} mm with intense sustained precipitation (${rainRate.toFixed(1)} mm/h). Ground squads on high alert.`
    });
    alerts.push({
      id: 'ALT-LS-02',
      alertType: 'Heavy Rainfall & Soil Surcharge Alert',
      location: 'Puthumala Runout Channel Basin',
      severity: 'HIGH',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      soilMoisture: moisture,
      rainfallRate: rainRate,
      confidenceScore: 88,
      description: `Extreme rainfall intensity (${rainRate.toFixed(1)} mm/h) accelerating soil saturation to ${moisture}%. Piezometric pressure exceeding normal stability limits.`
    });
  } else if (riskTier === 'MODERATE') {
    alerts.push({
      id: 'ALT-LS-01',
      alertType: 'Soil Moisture Saturation Advisory',
      location: 'Meppadi Valley Hydro-Acoustic Station',
      severity: 'MODERATE',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      soilMoisture: moisture,
      confidenceScore: 84,
      description: `Soil moisture elevated to ${moisture}% following continuous monsoon rain. Minor creep displacement observed; telemetry polling frequency increased.`
    });
  }

  return alerts;
};

export const generateHistoricalLandslideData = (
  count = 16,
  baseMoisture = 78,
  baseRain = 32,
  baseDisp = 14
): HistoricalLandslideReading[] => {
  const data: HistoricalLandslideReading[] = [];
  const now = Date.now();
  const stepMs = 3 * 60 * 1000;

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const frac = (count - 1 - i) / count;
    const moist = Math.min(100, Math.max(30, Math.round(baseMoisture - 15 + frac * 16 + (Math.random() - 0.5) * 4)));
    const rain = Math.max(0, parseFloat((baseRain - 18 + frac * 20 + (Math.random() - 0.5) * 5).toFixed(1)));
    const disp = Math.max(0, parseFloat((baseDisp - 10 + frac * 12 + (Math.random() - 0.5) * 1.5).toFixed(1)));
    const vib = Math.max(0.4, parseFloat((1.0 + frac * 4.5 + (Math.random() - 0.5) * 0.8).toFixed(1)));
    const score = calculateLandslideRiskScore(moist, rain, disp, vib);

    data.push({
      timestamp: timeStr,
      soilMoisture: moist,
      rainfallRate: rain,
      rainfall24h: Math.round(rain * 6 + 45),
      groundVibration: vib,
      groundDisplacement: disp,
      riskScore: score
    });
  }

  return data;
};
