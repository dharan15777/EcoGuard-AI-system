import {
  FloodSensor,
  FloodAlert,
  AIPredictionData,
  AIRecommendedAction,
  HistoricalReading,
  FloodRiskTier,
  HourlyPrediction
} from '../types/flood';

export const RISK_COLORS = {
  SAFE: {
    name: 'Safe',
    color: '#10b981', // green
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: '0 0 16px rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
  },
  WATCH: {
    name: 'Watch',
    color: '#f59e0b', // yellow
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    glow: '0 0 16px rgba(245, 158, 11, 0.3)',
    text: '#fbbf24',
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
  },
  WARNING: {
    name: 'Warning',
    color: '#f97316', // orange
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)',
    glow: '0 0 18px rgba(249, 115, 22, 0.35)',
    text: '#fb923c',
    badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
  },
  DANGER: {
    name: 'Danger',
    color: '#ef4444', // red
    bg: 'rgba(239, 68, 68, 0.18)',
    border: 'rgba(239, 68, 68, 0.5)',
    glow: '0 0 24px rgba(239, 68, 68, 0.45)',
    text: '#f87171',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
  }
};

/**
 * Exact flood risk classification based on user requirements:
 * SAFE: Water Level < 2.0 m, Rainfall < 10 mm/hr
 * WATCH: Water Level 2.0 - 3.5 m, Rainfall 10 - 25 mm/hr
 * WARNING: Water Level 3.5 - 4.2 m, Rainfall 25 - 40 mm/hr
 * DANGER: Water Level > 4.2 m, Rainfall > 40 mm/hr
 */
export const classifyFloodRisk = (
  waterLevel: number,
  rainfallRate: number,
  riseRate = 0.05
): FloodRiskTier => {
  // Danger conditions
  if (waterLevel >= 4.2 || rainfallRate >= 40.0 || (waterLevel >= 4.0 && riseRate >= 0.30)) {
    return 'DANGER';
  }
  // Warning conditions
  if (waterLevel >= 3.5 || rainfallRate >= 25.0 || (waterLevel >= 3.2 && riseRate >= 0.20)) {
    return 'WARNING';
  }
  // Watch conditions
  if (waterLevel >= 2.0 || rainfallRate >= 10.0 || (waterLevel >= 1.9 && riseRate >= 0.10)) {
    return 'WATCH';
  }
  // Safe conditions
  return 'SAFE';
};

/**
 * Continuous 0 to 100 risk score calculation
 */
export const calculateRiskScore = (
  waterLevel: number,
  rainfallRate: number,
  riseRate = 0.05,
  soilMoisture = 50
): number => {
  const tier = classifyFloodRisk(waterLevel, rainfallRate, riseRate);

  if (tier === 'SAFE') {
    const fraction = Math.min(1, Math.max(0, (waterLevel / 2.0) * 0.6 + (rainfallRate / 10.0) * 0.4));
    return Math.round(5 + fraction * 20); // 5 to 25
  }
  if (tier === 'WATCH') {
    const fraction = Math.min(1, Math.max(0, ((waterLevel - 2.0) / 1.5) * 0.6 + ((rainfallRate - 10.0) / 15.0) * 0.4));
    return Math.round(26 + fraction * 24); // 26 to 50
  }
  if (tier === 'WARNING') {
    const fraction = Math.min(1, Math.max(0, ((waterLevel - 3.5) / 0.7) * 0.6 + ((rainfallRate - 25.0) / 15.0) * 0.4));
    return Math.round(51 + fraction * 24); // 51 to 75
  }
  // DANGER
  const fraction = Math.min(1, Math.max(0, ((waterLevel - 4.2) / 0.8) * 0.6 + ((rainfallRate - 40.0) / 25.0) * 0.4));
  return Math.round(76 + fraction * 24); // 76 to 100
};

export const getRiskTierFromScore = (score: number): FloodRiskTier => {
  if (score >= 76) return 'DANGER';
  if (score >= 51) return 'WARNING';
  if (score >= 26) return 'WATCH';
  return 'SAFE';
};

export const INITIAL_FLOOD_SENSORS: FloodSensor[] = [
  {
    id: 'SN-FLD-01',
    name: 'Brahmaputra Hydro Node Alpha (Guwahati)',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Guwahati Pandu Port Embankment - Sector 4',
    basin: 'Lower Brahmaputra River Basin',
    latitude: 26.1920,
    longitude: 91.7450,
    waterLevel: 4.82,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 48.5,
    riseRate: 0.34,
    soilMoisture: 92,
    riverFlowRate: 320,
    batteryLevel: 94.2,
    status: 'ONLINE',
    riskScore: 88,
    riskTier: 'DANGER',
    lastPing: new Date().toISOString(),
    firmwareVersion: 'v3.2.1-HydroEdge',
    signalStrength: '-68 dBm (LoRaWAN CH04)'
  },
  {
    id: 'SN-FLD-02',
    name: 'Subansiri Spillway Sensor (North Lakhimpur)',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Subansiri Dam Crest & Spillway Gate #3',
    basin: 'Subansiri Tributary Basin',
    latitude: 27.2350,
    longitude: 94.1050,
    waterLevel: 3.85,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 38.2,
    riseRate: 0.24,
    soilMoisture: 84,
    riverFlowRate: 240,
    batteryLevel: 88.0,
    status: 'ONLINE',
    riskScore: 72,
    riskTier: 'WARNING',
    lastPing: new Date(Date.now() - 35000).toISOString(),
    firmwareVersion: 'v3.1.8-HydroEdge',
    signalStrength: '-72 dBm (NB-IoT)'
  },
  {
    id: 'SN-FLD-03',
    name: 'Kaziranga Floodplain Gauge (Bokakhat)',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Kaziranga National Park Wetland Sector 2',
    basin: 'Central Assam Floodplain',
    latitude: 26.5800,
    longitude: 93.4200,
    waterLevel: 2.95,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 21.0,
    riseRate: 0.12,
    soilMoisture: 68,
    riverFlowRate: 140,
    batteryLevel: 96.5,
    status: 'ONLINE',
    riskScore: 46,
    riskTier: 'WATCH',
    lastPing: new Date(Date.now() - 15000).toISOString(),
    firmwareVersion: 'v3.2.0-HydroEdge',
    signalStrength: '-64 dBm (LoRaWAN CH02)'
  },
  {
    id: 'SN-FLD-04',
    name: 'Majuli Island Hydro Station (Kamalabari)',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Majuli River Island South Dyke Marker 08',
    basin: 'Majuli Island Fluvial Network',
    latitude: 26.9600,
    longitude: 94.2200,
    waterLevel: 1.85,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 8.5,
    riseRate: 0.03,
    soilMoisture: 42,
    riverFlowRate: 65,
    batteryLevel: 91.0,
    status: 'ONLINE',
    riskScore: 21,
    riskTier: 'SAFE',
    lastPing: new Date(Date.now() - 60000).toISOString(),
    firmwareVersion: 'v3.0.4-HydroEdge',
    signalStrength: '-75 dBm (LoRaWAN CH01)'
  },
  {
    id: 'SN-FLD-05',
    name: 'Tezpur Kalia-Bhomora Hydro Station',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Bhomoraguri Brahmaputra Bridge Station',
    basin: 'Mid-Brahmaputra Hydrological Reach',
    latitude: 26.6300,
    longitude: 92.7900,
    waterLevel: 3.20,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 24.0,
    riseRate: 0.15,
    soilMoisture: 72,
    riverFlowRate: 165,
    batteryLevel: 84.7,
    status: 'ONLINE',
    riskScore: 48,
    riskTier: 'WATCH',
    lastPing: new Date(Date.now() - 45000).toISOString(),
    firmwareVersion: 'v3.1.2-HydroEdge',
    signalStrength: '-81 dBm (NB-IoT)'
  },
  {
    id: 'SN-FLD-06',
    name: 'Dibrugarh Dyke Hydro Probe',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Dibrugarh Brahmaputra Protection Embankment',
    basin: 'Upper Assam Inundation Reach',
    latitude: 27.4800,
    longitude: 94.9100,
    waterLevel: 4.65,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 46.0,
    riseRate: 0.36,
    soilMoisture: 95,
    riverFlowRate: 310,
    batteryLevel: 78.4,
    status: 'ONLINE',
    riskScore: 84,
    riskTier: 'DANGER',
    lastPing: new Date(Date.now() - 20000).toISOString(),
    firmwareVersion: 'v3.2.0-HydroEdge',
    signalStrength: '-70 dBm (LoRaWAN CH03)'
  }
];

export const INITIAL_FLOOD_ALERTS: FloodAlert[] = [
  {
    id: 'ALT-FLD-8801',
    alertType: 'Critical Flood Warning',
    location: 'Guwahati Pandu Port Embankment & Lowland Basin',
    severity: 'CRITICAL',
    detectionTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    waterLevel: 4.82,
    rainfall: 48.5,
    confidenceScore: 0.96,
    description: 'Brahmaputra stage height breached Danger Stage (4.82m vs 4.20m max threshold). Continuous upstream rainfall generating rapid runoff surge.',
    sensorId: 'SN-FLD-01'
  },
  {
    id: 'ALT-FLD-8802',
    alertType: 'Prepare Evacuation: Danger Level Expected',
    location: 'Dibrugarh Brahmaputra Protection Embankment Causeway',
    severity: 'CRITICAL',
    detectionTime: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    waterLevel: 4.65,
    rainfall: 51.5,
    confidenceScore: 0.93,
    description: 'Roadway submersion detected. Ultrasonic sensor submerged by +55cm above embankment deck. Vehicle access must be barred immediately.',
    sensorId: 'SN-FLD-06'
  },
  {
    id: 'ALT-FLD-8803',
    alertType: 'Flood Risk Expected Within 6 Hours',
    location: 'Subansiri Dam Crest & Spillway Gate #3',
    severity: 'HIGH',
    detectionTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    waterLevel: 3.85,
    rainfall: 41.2,
    confidenceScore: 0.89,
    description: 'Reservoir inflow rate exceeds outflow capacity. Crest height approaching warning threshold within 45 minutes.',
    sensorId: 'SN-FLD-02'
  }
];

/**
 * Generate historical time-series with water level curve matching the active condition
 */
export const generateHistoricalData = (
  count = 16,
  targetLevel = 4.82,
  targetRain = 48.5
): HistoricalReading[] => {
  const readings: HistoricalReading[] = [];
  const now = Date.now();
  const stepMs = 30 * 60 * 1000; // 30 min intervals

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Smooth curve culminating at targetLevel and targetRain
    const progress = 1 - (i / count);
    const startLevel = Math.max(1.2, targetLevel * 0.45);
    const startRain = Math.max(2.0, targetRain * 0.25);

    const water = startLevel + (targetLevel - startLevel) * Math.pow(progress, 1.4) + (Math.random() - 0.5) * 0.05;
    const rain = startRain + (targetRain - startRain) * progress + (Math.random() - 0.5) * 1.5;
    const score = calculateRiskScore(water, rain);

    readings.push({
      timestamp: timeStr,
      waterLevel: parseFloat(water.toFixed(2)),
      rainfall: parseFloat(Math.max(0, rain).toFixed(1)),
      riskScore: score
    });
  }

  return readings;
};

/**
 * AI Flood Prediction Module for 1h, 3h, 6h, 12h, 24h, 30h
 */
export const getAIPrediction = (
  currentRiskScore: number,
  currentWaterLevel: number,
  currentRainfall: number,
  riseRate = 0.05
): AIPredictionData => {
  const now = new Date();
  const currentRisk = classifyFloodRisk(currentWaterLevel, currentRainfall, riseRate);

  // Time horizons required: 1 Hour, 3 Hours, 6 Hours, 12 Hours, 24 Hours, 30 Hours
  const horizonsConfig = [
    { hours: 1, label: '1 Hour' },
    { hours: 3, label: '3 Hours' },
    { hours: 6, label: '6 Hours' },
    { hours: 12, label: '12 Hours' },
    { hours: 24, label: '24 Hours' },
    { hours: 30, label: '30 Hours' }
  ];

  const hourlyForecast: HourlyPrediction[] = horizonsConfig.map(h => {
    const futureTime = new Date(now.getTime() + h.hours * 3600 * 1000);
    const timeLabel = futureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    let projLevel: number;
    let projRain: number;

    if (currentRisk === 'DANGER') {
      // In surge: rises up to peak around 6h-12h, then remains severe through 24h-30h
      if (h.hours === 1) projLevel = currentWaterLevel + 0.20;
      else if (h.hours === 3) projLevel = currentWaterLevel + 0.45;
      else if (h.hours === 6) projLevel = currentWaterLevel + 0.60; // Peak
      else if (h.hours === 12) projLevel = currentWaterLevel + 0.40;
      else if (h.hours === 24) projLevel = currentWaterLevel + 0.15;
      else projLevel = currentWaterLevel - 0.20; // 30h

      projRain = Math.max(15, currentRainfall - (h.hours > 6 ? (h.hours - 6) * 1.2 : 0));
    } else if (currentRisk === 'WARNING') {
      // In warning: rises towards danger over 6h to 24h
      if (h.hours === 1) projLevel = currentWaterLevel + 0.15;
      else if (h.hours === 3) projLevel = currentWaterLevel + 0.35;
      else if (h.hours === 6) projLevel = currentWaterLevel + 0.55; // breaches danger
      else if (h.hours === 12) projLevel = currentWaterLevel + 0.80;
      else if (h.hours === 24) projLevel = currentWaterLevel + 1.05;
      else projLevel = currentWaterLevel + 0.90;

      projRain = Math.max(10, currentRainfall + (h.hours <= 6 ? 5 : -5));
    } else if (currentRisk === 'WATCH') {
      // In watch: user example shows current 3.2m -> 1h: 3.4m, 3h: 3.8m, 6h: 4.1m, 12h: 4.4m, 24h: 4.8m, 30h: 5.2m
      if (h.hours === 1) projLevel = currentWaterLevel + 0.20;
      else if (h.hours === 3) projLevel = currentWaterLevel + 0.55;
      else if (h.hours === 6) projLevel = currentWaterLevel + 0.85;
      else if (h.hours === 12) projLevel = currentWaterLevel + 1.20;
      else if (h.hours === 24) projLevel = currentWaterLevel + 1.55;
      else projLevel = currentWaterLevel + 1.90; // 30h

      projRain = currentRainfall + (h.hours * 1.1);
    } else {
      // In SAFE: conditions remain stable and within safe limits through 30h
      projLevel = Math.max(1.1, currentWaterLevel + Math.sin(h.hours / 4) * 0.15);
      projRain = Math.max(1.0, currentRainfall + Math.cos(h.hours / 3) * 1.5);
    }

    const projTier = classifyFloodRisk(projLevel, projRain, 0.05);
    const projScore = calculateRiskScore(projLevel, projRain);

    let summary = 'Water level within safe parameters.';
    if (projTier === 'DANGER') {
      summary = h.hours >= 24
        ? 'Severe flooding predicted. Evacuation planning mandated.'
        : 'Danger stage reached. Overflow of primary channel expected.';
    } else if (projTier === 'WARNING') {
      summary = 'Rapid water rise detected. Spillway capacity at risk.';
    } else if (projTier === 'WATCH') {
      summary = 'Moderate catchment runoff increase. Continuous watch.';
    }

    return {
      horizonHours: h.hours,
      hour: h.label,
      timeLabel,
      waterLevel: parseFloat(projLevel.toFixed(2)),
      rainfall: parseFloat(projRain.toFixed(1)),
      riskScore: projScore,
      riskTier: projTier,
      summary
    };
  });

  const pred24 = hourlyForecast.find(h => h.horizonHours === 24);
  const pred30 = hourlyForecast.find(h => h.horizonHours === 30);
  const predictedRisk24h = pred24 ? pred24.riskTier : 'DANGER';
  const predictedRisk30h = pred30 ? pred30.riskTier : 'DANGER';
  const peakLevel = Math.max(...hourlyForecast.map(h => h.waterLevel));
  const peakItem = hourlyForecast.find(h => h.waterLevel === peakLevel) || hourlyForecast[2];

  let reason = '';
  if (currentRisk === 'DANGER') {
    reason = `Heavy rainfall (${currentRainfall.toFixed(1)} mm/h) and rapidly rising upstream water level (+${riseRate.toFixed(2)} m/h) detected in Brahmaputra River catchment. Flood danger threshold 4.20m breached.`;
  } else if (currentRisk === 'WARNING') {
    reason = `Sustained rainfall (${currentRainfall.toFixed(1)} mm/h) and high soil saturation driving river level towards flood danger threshold within 6 to 12 hours.`;
  } else if (currentRisk === 'WATCH') {
    reason = `Moderate rainfall intensity (${currentRainfall.toFixed(1)} mm/h) and steady river stage elevation detected. AI projects transition to Warning/Danger within 12-24 hours if precipitation persists.`;
  } else {
    reason = `Hydrological baseline is nominal. Upstream rainfall (${currentRainfall.toFixed(1)} mm/h) and water level (${currentWaterLevel.toFixed(2)}m) remain well below watch thresholds.`;
  }

  const confidence = currentRisk === 'SAFE' ? 96 : currentRisk === 'DANGER' ? 95 : 94;

  return {
    confidence,
    currentRisk,
    predictedRisk24h,
    predictedRisk30h,
    reason,
    modelName: 'Edge-AI HydroNet v3.2 (Quantized TFLite)',
    latencyMs: 12,
    projectedPeakLevel: peakLevel,
    projectedPeakTime: `${peakItem.hour} (${peakItem.timeLabel})`,
    hourlyForecast
  };
};

/**
 * AI Recommendations generator strictly matching the user requirement:
 * SAFE: Continue Monitoring
 * WATCH: Increase Monitoring Frequency
 * WARNING: Prepare Emergency Response Teams
 * DANGER: Start Evacuation Planning, Send Public Warning Alerts, Deploy Rescue Resources
 */
export const getAIRecommendedActions = (riskTier: FloodRiskTier): AIRecommendedAction[] => {
  if (riskTier === 'DANGER') {
    return [
      {
        id: 'ACT-01',
        title: 'Start Evacuation Planning',
        description: 'Initiate emergency evacuation planning and protocols for low-lying Brahmaputra River Valley sectors and vulnerable riverside communities.',
        priority: 'CRITICAL_NOW',
        icon: 'evacuate',
        status: 'PENDING',
        category: 'Evacuation'
      },
      {
        id: 'ACT-02',
        title: 'Send Public Warning Alerts',
        description: 'Broadcast high-priority emergency CAP XML and SMS cell-broadcast flood warning alerts to downstream residents and motorists.',
        priority: 'CRITICAL_NOW',
        icon: 'siren',
        status: 'DISPATCHED',
        category: 'Authority'
      },
      {
        id: 'ACT-03',
        title: 'Deploy Rescue Resources',
        description: 'Mobilize National Disaster Response Force (NDRF), emergency rescue boat squads, and deploy sandbag barrier crews to submerged river crossings.',
        priority: 'CRITICAL_NOW',
        icon: 'shield',
        status: 'PENDING',
        category: 'Barriers'
      }
    ];
  }

  if (riskTier === 'WARNING') {
    return [
      {
        id: 'ACT-04',
        title: 'Prepare Emergency Response Teams',
        description: 'Place rapid-deployment water rescue squads, medical units, and heavy mobile pumping stations on 15-minute emergency standby.',
        priority: 'HIGH_PRIORITY',
        icon: 'shield',
        status: 'PENDING',
        category: 'Authority'
      },
      {
        id: 'ACT-05',
        title: 'Pre-position Barrier Equipment at River Crossings',
        description: 'Stage automated flood barricades and sandbag stockpiles at Dibrugarh Embankment and Pandu Port causeways.',
        priority: 'HIGH_PRIORITY',
        icon: 'road',
        status: 'PENDING',
        category: 'Infrastructure'
      }
    ];
  }

  if (riskTier === 'WATCH') {
    return [
      {
        id: 'ACT-06',
        title: 'Increase Monitoring Frequency',
        description: 'Accelerate hydrological sensor polling interval from standard 15-minute cycle to real-time 1-minute automated telemetry sync.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'shield',
        status: 'DISPATCHED',
        category: 'Monitoring'
      },
      {
        id: 'ACT-07',
        title: 'Alert Regional Hydro-Meteorological Cell',
        description: 'Issue preliminary watch advisory to district disaster management control room regarding potential river crest within 12 to 24 hours.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'siren',
        status: 'PENDING',
        category: 'Authority'
      }
    ];
  }

  // SAFE
  return [
    {
      id: 'ACT-08',
      title: 'Continue Monitoring',
      description: 'Maintain continuous automated hydro-meteorological baseline surveillance across all Brahmaputra River basin nodes and dam spillways in Assam.',
      priority: 'PREPAREDNESS',
      icon: 'shield',
      status: 'COMPLETED',
      category: 'Monitoring'
    }
  ];
};

/**
 * Intelligent Dynamic Alert Generator based on user rules:
 * - If flood risk expected within 6h: "Flood Risk Expected Within 6 Hours"
 * - If danger level expected within 24h: "Prepare Evacuation"
 * - If severe flooding predicted within 30h: "Critical Flood Warning"
 */
export const generateDynamicAlerts = (
  currentRisk: FloodRiskTier,
  prediction: AIPredictionData,
  currentWaterLevel: number,
  currentRainfall: number
): FloodAlert[] => {
  const alerts: FloodAlert[] = [];
  const now = new Date();

  const pred6 = prediction.hourlyForecast.find(h => h.horizonHours === 6);
  const pred24 = prediction.hourlyForecast.find(h => h.horizonHours === 24);
  const pred30 = prediction.hourlyForecast.find(h => h.horizonHours === 30);

  // Severe flooding at present or predicted within 30 hours
  if (currentRisk === 'DANGER' || pred30?.riskTier === 'DANGER') {
    alerts.push({
      id: 'ALT-DYN-01',
      alertType: 'Critical Flood Warning',
      location: 'Guwahati Pandu Port Embankment & Lowland Basin',
      severity: 'CRITICAL',
      detectionTime: now.toISOString(),
      status: 'ACTIVE',
      waterLevel: currentWaterLevel,
      rainfall: currentRainfall,
      confidenceScore: 0.96,
      description: `Stage height ${currentWaterLevel.toFixed(2)}m (breaches 4.20m flood threshold). Severe catchment flooding expected to persist through next 30 hours.`,
      sensorId: 'SN-FLD-01'
    });
  }

  // Danger level expected within 24 hours
  if (currentRisk === 'DANGER' || currentRisk === 'WARNING' || pred24?.riskTier === 'DANGER') {
    alerts.push({
      id: 'ALT-DYN-02',
      alertType: 'Prepare Evacuation: Danger Level Expected',
      location: 'Dibrugarh Brahmaputra Lowlands & Majuli River Dyke',
      severity: currentRisk === 'DANGER' ? 'CRITICAL' : 'HIGH',
      detectionTime: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      waterLevel: pred24?.waterLevel || currentWaterLevel + 0.8,
      rainfall: currentRainfall,
      confidenceScore: 0.94,
      description: `AI prediction forecasts water level reaching ${pred24 ? pred24.waterLevel.toFixed(2) : 4.8}m within 24 hours. Lowland residents instructed to prepare evacuation.`,
      sensorId: 'SN-FLD-06'
    });
  }

  // Flood risk expected within 6 hours
  if (currentRisk === 'DANGER' || currentRisk === 'WARNING' || pred6?.riskTier === 'WARNING' || pred6?.riskTier === 'DANGER') {
    alerts.push({
      id: 'ALT-DYN-03',
      alertType: 'Flood Risk Expected Within 6 Hours',
      location: 'Subansiri Dam Crest & Spillway Gate #3',
      severity: 'HIGH',
      detectionTime: new Date(now.getTime() - 28 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      waterLevel: pred6?.waterLevel || currentWaterLevel + 0.4,
      rainfall: currentRainfall,
      confidenceScore: 0.91,
      description: `Inundation trajectory indicates rapid water level rise (+${prediction.hourlyForecast[2]?.waterLevel.toFixed(2)}m by +6 Hours). Automated spillway watch triggered.`,
      sensorId: 'SN-FLD-02'
    });
  }

  // If in WATCH and no danger/warning alerts triggered
  if (currentRisk === 'WATCH' && alerts.length === 0) {
    alerts.push({
      id: 'ALT-DYN-04',
      alertType: 'Flood Watch Advisory: Moderate River Stage Rise',
      location: 'Kaziranga Wetland Basin - Bokakhat Reach',
      severity: 'MODERATE',
      detectionTime: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      waterLevel: currentWaterLevel,
      rainfall: currentRainfall,
      confidenceScore: 0.88,
      description: `Water level at ${currentWaterLevel.toFixed(2)}m with rainfall rate ${currentRainfall.toFixed(1)} mm/h. Polling frequency increased; monitoring for surge developments.`,
      sensorId: 'SN-FLD-03'
    });
  }

  // If in SAFE and no alerts
  if (currentRisk === 'SAFE' && alerts.length === 0) {
    alerts.push({
      id: 'ALT-DYN-05',
      alertType: 'Hydrological Sector Nominal',
      location: 'Brahmaputra Basin Hydro-Telemetry Mesh',
      severity: 'LOW',
      detectionTime: now.toISOString(),
      status: 'RESOLVED',
      waterLevel: currentWaterLevel,
      rainfall: currentRainfall,
      confidenceScore: 0.98,
      description: `All river stage markers below 2.0m. Rainfall rate below 10 mm/h. Catchment basin operating within safe seasonal baseline.`,
      sensorId: 'SN-FLD-04'
    });
  }

  return alerts;
};
