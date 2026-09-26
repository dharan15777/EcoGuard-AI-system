import { FloodSensor, FloodAlert, AIPredictionData, AIRecommendedAction, HistoricalReading, FloodRiskTier } from '../types/flood';

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

export const getRiskTierFromScore = (score: number): FloodRiskTier => {
  if (score >= 76) return 'DANGER';
  if (score >= 51) return 'WARNING';
  if (score >= 26) return 'WATCH';
  return 'SAFE';
};

export const INITIAL_FLOOD_SENSORS: FloodSensor[] = [
  {
    id: 'SN-FLD-01',
    name: 'Pine River Hydro Node Alpha',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Pine River Valley - Basin Sector 4',
    basin: 'Pine River North Basin',
    latitude: 37.7749,
    longitude: -122.4194,
    waterLevel: 4.82,
    floodThreshold: 4.20,
    warningThreshold: 3.50,
    rainfallRate: 48.5,
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
    name: 'Cascade Dam Spillway Monitor',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Cascade Reservoir Crest Gate #2',
    basin: 'Cascade Dam Spillway',
    latitude: 37.7833,
    longitude: -122.4167,
    waterLevel: 3.85,
    floodThreshold: 4.00,
    warningThreshold: 3.40,
    rainfallRate: 41.2,
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
    name: 'North Basin Inundation Gauge',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'North Delta Lowland Crossing',
    basin: 'Delta Lowlands',
    latitude: 37.7650,
    longitude: -122.4350,
    waterLevel: 2.95,
    floodThreshold: 3.60,
    warningThreshold: 2.80,
    rainfallRate: 28.0,
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
    name: 'South Delta River Confluence',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'South River Embankment Marker 12',
    basin: 'Lower Delta River Basin',
    latitude: 37.7510,
    longitude: -122.4180,
    waterLevel: 1.85,
    floodThreshold: 3.20,
    warningThreshold: 2.50,
    rainfallRate: 14.5,
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
    name: 'Valley Tributary Hydro Station',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'East Ridge Runoff Culvert Station',
    basin: 'East Ridge Tributaries',
    latitude: 37.7920,
    longitude: -122.4050,
    waterLevel: 3.20,
    floodThreshold: 3.80,
    warningThreshold: 3.00,
    rainfallRate: 34.0,
    batteryLevel: 84.7,
    status: 'ONLINE',
    riskScore: 54,
    riskTier: 'WARNING',
    lastPing: new Date(Date.now() - 45000).toISOString(),
    firmwareVersion: 'v3.1.2-HydroEdge',
    signalStrength: '-81 dBm (NB-IoT)'
  },
  {
    id: 'SN-FLD-06',
    name: 'Lowland Causeway Inflow Probe',
    type: 'FLOOD_WATER_LEVEL',
    locationName: 'Old Highway 9 Low Water Bridge',
    basin: 'Bay Marsh Causeway',
    latitude: 37.7400,
    longitude: -122.4450,
    waterLevel: 4.65,
    floodThreshold: 4.10,
    warningThreshold: 3.30,
    rainfallRate: 51.5,
    batteryLevel: 78.4,
    status: 'ONLINE',
    riskScore: 82,
    riskTier: 'DANGER',
    lastPing: new Date(Date.now() - 20000).toISOString(),
    firmwareVersion: 'v3.2.0-HydroEdge',
    signalStrength: '-70 dBm (LoRaWAN CH03)'
  }
];

export const INITIAL_FLOOD_ALERTS: FloodAlert[] = [
  {
    id: 'ALT-FLD-8801',
    alertType: 'Flash Flood Emergency Warning',
    location: 'Pine River Valley Sector 4 & Lowland Basin',
    severity: 'CRITICAL',
    detectionTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    waterLevel: 4.82,
    rainfall: 48.5,
    confidenceScore: 0.96,
    description: 'River water level breached Danger Stage (4.82m vs 4.20m max threshold). Continuous upstream rainfall generating rapid runoff surge.',
    sensorId: 'SN-FLD-01'
  },
  {
    id: 'ALT-FLD-8802',
    alertType: 'Causeway Inundation Barrier Alert',
    location: 'Old Highway 9 Low Water Bridge (Causeway)',
    severity: 'CRITICAL',
    detectionTime: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    waterLevel: 4.65,
    rainfall: 51.5,
    confidenceScore: 0.93,
    description: 'Roadway submersion detected. Ultrasonic sensor submerged by +55cm above bridge deck. Vehicle access must be barred immediately.',
    sensorId: 'SN-FLD-06'
  },
  {
    id: 'ALT-FLD-8803',
    alertType: 'Dam Spillway Crest Warning',
    location: 'Cascade Reservoir Spillway Gate #2',
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

export const generateHistoricalData = (count = 14): HistoricalReading[] => {
  const readings: HistoricalReading[] = [];
  const now = Date.now();
  const stepMs = 30 * 60 * 1000; // 30 min intervals

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Simulate realistic storm surge progression: starts low, ramps up significantly
    const progress = 1 - (i / count);
    const baseWater = 2.1 + progress * 2.6 + Math.sin(progress * 4) * 0.2;
    const baseRain = 8 + progress * 38 + Math.cos(progress * 3) * 4;
    const baseRisk = Math.min(100, Math.round(15 + progress * 72));

    readings.push({
      timestamp: timeStr,
      waterLevel: parseFloat(baseWater.toFixed(2)),
      rainfall: parseFloat(baseRain.toFixed(1)),
      riskScore: baseRisk
    });
  }

  return readings;
};

export const getAIPrediction = (currentRiskScore: number, currentWaterLevel: number, currentRainfall: number): AIPredictionData => {
  const now = new Date();
  const hourly: AIPredictionData['hourlyForecast'] = [];
  
  // Project next 6 hours (+1h to +6h)
  const horizons = [
    { offsetH: 1, rainDelta: +3.2, levelDelta: +0.28, riskMultiplier: 1.06 },
    { offsetH: 2, rainDelta: +5.5, levelDelta: +0.45, riskMultiplier: 1.12 },
    { offsetH: 3, rainDelta: +2.1, levelDelta: +0.58, riskMultiplier: 1.15 }, // Peak Inundation
    { offsetH: 4, rainDelta: -8.0, levelDelta: +0.35, riskMultiplier: 1.08 },
    { offsetH: 5, rainDelta: -16.4, levelDelta: -0.15, riskMultiplier: 0.94 },
    { offsetH: 6, rainDelta: -24.0, levelDelta: -0.45, riskMultiplier: 0.82 },
  ];

  horizons.forEach(h => {
    const forecastTime = new Date(now.getTime() + h.offsetH * 3600 * 1000);
    const timeLabel = forecastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const projLevel = Math.max(1.0, parseFloat((currentWaterLevel + h.levelDelta).toFixed(2)));
    const projRain = Math.max(0, parseFloat((currentRainfall + h.rainDelta).toFixed(1)));
    const projScore = Math.min(100, Math.max(10, Math.round(currentRiskScore * h.riskMultiplier)));
    const tier = getRiskTierFromScore(projScore);

    let summary = 'Rising water level with sustained catchment runoff.';
    if (h.offsetH === 3) summary = 'CRITICAL INUNDATION PEAK EXPECTED. River crests at highest stage.';
    else if (h.offsetH <= 2) summary = 'Rapid stage rise due to continuous upstream precipitation.';
    else if (h.offsetH >= 5) summary = 'Rainfall easing; downstream discharge begins gradual recession.';

    hourly.push({
      hour: `+${h.offsetH}h`,
      timeLabel,
      waterLevel: projLevel,
      rainfall: projRain,
      riskScore: projScore,
      riskTier: tier,
      summary
    });
  });

  const peakLevel = Math.max(...hourly.map(h => h.waterLevel));

  return {
    confidence: 94.6,
    reason: 'Heavy rainfall (48.5 mm/h) and rapidly rising upstream water level (+34 cm/h) detected in Pine River catchment basin. Hydro-sensor telemetry indicates soil saturation index at 92%, driving accelerated overland runoff into primary river channel.',
    modelName: 'Edge-AI HydroNet v3.2 (Quantized TFLite)',
    latencyMs: 12,
    projectedPeakLevel: peakLevel,
    projectedPeakTime: '+3 Hours (16:30)',
    hourlyForecast: hourly
  };
};

export const getAIRecommendedActions = (riskTier: FloodRiskTier): AIRecommendedAction[] => {
  if (riskTier === 'DANGER') {
    return [
      {
        id: 'ACT-01',
        title: 'Prepare Evacuation Protocols',
        description: 'Initiate Stage 2 immediate evacuation for Pine River Valley, Sector 4 riverside communities, and low-elevation clusters. Alert local rescue units.',
        priority: 'CRITICAL_NOW',
        icon: 'evacuate',
        status: 'PENDING',
        category: 'Evacuation'
      },
      {
        id: 'ACT-02',
        title: 'Avoid & Bar River Crossings',
        description: 'Automate barricade drop at Old Highway 9 Low Water Bridge and Sector 4 causeways. Deploy traffic enforcement to prevent vehicle crossing.',
        priority: 'CRITICAL_NOW',
        icon: 'road',
        status: 'PENDING',
        category: 'Infrastructure'
      },
      {
        id: 'ACT-03',
        title: 'Notify Local Disaster Authorities',
        description: 'Transmit automated CAP XML alert and real-time hydrological telemetry dispatch to District Disaster Management Authority (DDMA) & NDRF.',
        priority: 'CRITICAL_NOW',
        icon: 'siren',
        status: 'DISPATCHED',
        category: 'Authority'
      },
      {
        id: 'ACT-04',
        title: 'Move Livestock to Higher Ground',
        description: 'Issue targeted broadcast SMS to farmers in Pine River Basin flood zone to relocate cattle and livestock to High Ridge designated shelter.',
        priority: 'HIGH_PRIORITY',
        icon: 'shield',
        status: 'PENDING',
        category: 'Livestock'
      },
      {
        id: 'ACT-05',
        title: 'Deploy Sandbag Flood Barriers',
        description: 'Deploy rapid-response municipal crew with mobile sandbag barriers to bolster Cascade Dam drainage canal and Lowland culverts.',
        priority: 'HIGH_PRIORITY',
        icon: 'barrier',
        status: 'PENDING',
        category: 'Barriers'
      }
    ];
  }

  if (riskTier === 'WARNING') {
    return [
      {
        id: 'ACT-02',
        title: 'Restrict Vulnerable River Crossings',
        description: 'Set up warning signage and prepare physical barricades at flood-prone causeways and river bridge crossings.',
        priority: 'HIGH_PRIORITY',
        icon: 'road',
        status: 'PENDING',
        category: 'Infrastructure'
      },
      {
        id: 'ACT-03',
        title: 'Notify Local Authorities & Emergency Standby',
        description: 'Transmit advisory status update to DDMA. Put quick-response rescue boats and pumping squads on 15-minute standby.',
        priority: 'HIGH_PRIORITY',
        icon: 'siren',
        status: 'PENDING',
        category: 'Authority'
      },
      {
        id: 'ACT-04',
        title: 'Alert Livestock Owners on Flood Plain',
        description: 'Broadcast early advisory to agrarian cooperatives regarding potential inundation in low pastures within 6 hours.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'shield',
        status: 'PENDING',
        category: 'Livestock'
      },
      {
        id: 'ACT-05',
        title: 'Inspect Drainage Outflows and Spillways',
        description: 'Verify automated sluice gates on Cascade Dam and clear trash racks at urban culverts to maximize flow throughput.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'barrier',
        status: 'PENDING',
        category: 'Barriers'
      }
    ];
  }

  if (riskTier === 'WATCH') {
    return [
      {
        id: 'ACT-03',
        title: 'Notify Regional Monitoring Cell',
        description: 'Issue internal hydro-meteorological watch notice to regional command staff. Heighten polling frequency from 5m to 1m.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'siren',
        status: 'DISPATCHED',
        category: 'Authority'
      },
      {
        id: 'ACT-02',
        title: 'Inspect River Crossing Sensors',
        description: 'Run automated ping and sensor calibration on low-water crossing hydrostatic gauges.',
        priority: 'PREPAREDNESS',
        icon: 'road',
        status: 'PENDING',
        category: 'Infrastructure'
      },
      {
        id: 'ACT-05',
        title: 'Pre-position Sandbag Supplies',
        description: 'Check municipal stockpiles for barrier materials in case precipitation exceeds 35 mm/h.',
        priority: 'PREPAREDNESS',
        icon: 'barrier',
        status: 'PENDING',
        category: 'Barriers'
      }
    ];
  }

  // SAFE
  return [
    {
      id: 'ACT-06',
      title: 'Routine Hydro-Mesh Telemetry Health Check',
      description: 'All river basins and reservoir spillways within nominal baseline levels. Continuous automated AI surveillance active.',
      priority: 'PREPAREDNESS',
      icon: 'shield',
      status: 'COMPLETED',
      category: 'Authority'
    }
  ];
};
