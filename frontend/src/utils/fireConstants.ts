import {
  FireRiskTier,
  FireSensor,
  FireAlert,
  AIFirePredictionData,
  AIFireRecommendation,
  HistoricalFireReading,
  NearbyVillage,
  ResponseBase
} from '../types/fire';

export const FIRE_RISK_COLORS: Record<
  FireRiskTier,
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
  EXTREME: {
    name: 'Extreme',
    color: '#ef4444', // red
    bg: 'rgba(239, 68, 68, 0.22)',
    border: 'rgba(239, 68, 68, 0.55)',
    glow: '0 0 28px rgba(239, 68, 68, 0.5)',
    text: '#f87171',
    badge: 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
  }
};

/**
 * Exact Forest Fire Risk Classification Engine:
 * - LOW: Temperature < 30°C, Humidity > 45%, Smoke < 25 ppm, CO < 8 ppm
 * - MODERATE: Temperature 30 - 36°C, Humidity 30 - 45%, Smoke 25 - 60 ppm
 * - HIGH: Temperature 36 - 42°C, Humidity 20 - 30%, Smoke 60 - 110 ppm, CO 15 - 25 ppm
 * - EXTREME: Temperature >= 42°C OR Humidity <= 20% OR Smoke >= 110 ppm OR CO >= 25 ppm
 */
export const classifyFireRisk = (
  temp: number,
  humidity: number,
  smokePPM: number,
  coPPM = 8,
  windSpeed = 15
): FireRiskTier => {
  // Extreme conditions: combustion breakout or severe desiccation + heat
  if (
    temp >= 42.0 ||
    smokePPM >= 110 ||
    coPPM >= 24 ||
    (temp >= 38.0 && humidity <= 20.0) ||
    (smokePPM >= 75 && windSpeed >= 24)
  ) {
    return 'EXTREME';
  }

  // High conditions: critical fire weather
  if (
    temp >= 36.0 ||
    smokePPM >= 60 ||
    coPPM >= 15 ||
    (temp >= 33.0 && humidity <= 28.0) ||
    (smokePPM >= 40 && windSpeed >= 20)
  ) {
    return 'HIGH';
  }

  // Moderate conditions: elevated dryness and moderate heat
  if (
    temp >= 30.0 ||
    humidity <= 42.0 ||
    smokePPM >= 25 ||
    coPPM >= 8 ||
    windSpeed >= 18
  ) {
    return 'MODERATE';
  }

  // Low conditions: nominal safe forest baseline
  return 'LOW';
};

/**
 * Continuous 0 to 100 Forest Fire Risk Score calculation
 */
export const calculateFireRiskScore = (
  temp: number,
  humidity: number,
  smokePPM: number,
  coPPM = 8,
  windSpeed = 15
): number => {
  // Temperature factor (20°C to 46°C): weight 0.28
  const tempNorm = Math.min(1, Math.max(0, (temp - 20) / 26));

  // Humidity inverse factor (75% down to 10%): weight 0.24
  const humNorm = Math.min(1, Math.max(0, (75 - humidity) / 65));

  // Smoke & Combustion factor (0 to 150 ppm): weight 0.30
  const smokeNorm = Math.min(1, Math.max(0, (smokePPM / 140) * 0.7 + (coPPM / 28) * 0.3));

  // Wind speed factor (0 to 45 km/h): weight 0.18
  const windNorm = Math.min(1, Math.max(0, windSpeed / 40));

  const rawScore = (tempNorm * 0.28 + humNorm * 0.24 + smokeNorm * 0.30 + windNorm * 0.18) * 100;
  return Math.min(100, Math.max(5, Math.round(rawScore)));
};

export const INITIAL_FIRE_SENSORS: FireSensor[] = [
  {
    id: 'FS-FIRE-01',
    name: 'Bandipur Core Canopy Sentinel',
    type: 'FIRE_THERMAL_GAS',
    locationName: 'Bandipur Core Ridge - Sector 4 Watchtower',
    forestZone: 'Central Nilgiri Biosphere Core',
    latitude: 11.6620,
    longitude: 76.6340,
    temperature: 36.8,
    maxTempToday: 42.4,
    humidity: 24,
    smokePPM: 64,
    carbonMonoxide: 14.8,
    carbonDioxide: 620,
    windSpeed: 21,
    windDirection: 'NW (315°)',
    batteryLevel: 94.2,
    status: 'ONLINE',
    riskScore: 68,
    riskTier: 'HIGH',
    lastPing: new Date().toISOString(),
    firmwareVersion: 'v4.1.2-FireSense',
    signalStrength: '-68 dBm (LoRaWAN CH04)'
  },
  {
    id: 'FS-FIRE-02',
    name: 'Moyar Gorge Dry Deciduous Station',
    type: 'FIRE_THERMAL_GAS',
    locationName: 'Moyar Canyon Flank & Fuel Bed Sector 2',
    forestZone: 'Moyar Escarpment Reach',
    latitude: 11.5840,
    longitude: 76.7150,
    temperature: 42.6,
    maxTempToday: 44.1,
    humidity: 16,
    smokePPM: 138,
    carbonMonoxide: 28.5,
    carbonDioxide: 840,
    windSpeed: 28,
    windDirection: 'NNW (330°)',
    batteryLevel: 88.0,
    status: 'ONLINE',
    riskScore: 91,
    riskTier: 'EXTREME',
    lastPing: new Date(Date.now() - 35000).toISOString(),
    firmwareVersion: 'v4.0.8-FireSense',
    signalStrength: '-72 dBm (NB-IoT)'
  },
  {
    id: 'FS-FIRE-03',
    name: 'Masinagudi Foothill Forest Watch',
    type: 'FIRE_THERMAL_GAS',
    locationName: 'Masinagudi Dry Scrub & Elephant Path',
    forestZone: 'Southern Fringe Foothills',
    latitude: 11.5720,
    longitude: 76.6430,
    temperature: 34.2,
    maxTempToday: 38.0,
    humidity: 32,
    smokePPM: 38,
    carbonMonoxide: 8.6,
    carbonDioxide: 510,
    windSpeed: 17,
    windDirection: 'WNW (290°)',
    batteryLevel: 96.5,
    status: 'ONLINE',
    riskScore: 46,
    riskTier: 'MODERATE',
    lastPing: new Date(Date.now() - 15000).toISOString(),
    firmwareVersion: 'v4.2.0-FireSense',
    signalStrength: '-64 dBm (LoRaWAN CH02)'
  },
  {
    id: 'FS-FIRE-04',
    name: 'Gundlupet Buffer Zone Sentinel',
    type: 'FIRE_THERMAL_GAS',
    locationName: 'Northern Gundlupet Agricultural Buffer',
    forestZone: 'Northern Agro-Forest Border',
    latitude: 11.7820,
    longitude: 76.6850,
    temperature: 28.2,
    maxTempToday: 31.0,
    humidity: 58,
    smokePPM: 12,
    carbonMonoxide: 2.4,
    carbonDioxide: 410,
    windSpeed: 12,
    windDirection: 'W (270°)',
    batteryLevel: 91.0,
    status: 'ONLINE',
    riskScore: 18,
    riskTier: 'LOW',
    lastPing: new Date(Date.now() - 60000).toISOString(),
    firmwareVersion: 'v3.9.4-FireSense',
    signalStrength: '-75 dBm (LoRaWAN CH01)'
  },
  {
    id: 'FS-FIRE-05',
    name: 'Theppakadu Riverine Corridor Station',
    type: 'FIRE_THERMAL_GAS',
    locationName: 'Theppakadu Moisture Sump & Bamboo Thicket',
    forestZone: 'Riverine Riparian Reach',
    latitude: 11.5950,
    longitude: 76.5920,
    temperature: 32.5,
    maxTempToday: 35.8,
    humidity: 40,
    smokePPM: 26,
    carbonMonoxide: 6.8,
    carbonDioxide: 480,
    windSpeed: 15,
    windDirection: 'NW (310°)',
    batteryLevel: 84.7,
    status: 'ONLINE',
    riskScore: 38,
    riskTier: 'MODERATE',
    lastPing: new Date(Date.now() - 45000).toISOString(),
    firmwareVersion: 'v4.1.0-FireSense',
    signalStrength: '-81 dBm (NB-IoT)'
  },
  {
    id: 'FS-FIRE-06',
    name: 'Wayanad Border Deciduous Ridge',
    type: 'FIRE_THERMAL_GAS',
    locationName: 'Western Forest Boundary Ridge Marker 12',
    forestZone: 'Wayanad High-Fuel Flank',
    latitude: 11.6910,
    longitude: 76.4950,
    temperature: 39.8,
    maxTempToday: 42.5,
    humidity: 20,
    smokePPM: 92,
    carbonMonoxide: 21.0,
    carbonDioxide: 730,
    windSpeed: 24,
    windDirection: 'NW (315°)',
    batteryLevel: 78.4,
    status: 'ONLINE',
    riskScore: 82,
    riskTier: 'HIGH',
    lastPing: new Date(Date.now() - 20000).toISOString(),
    firmwareVersion: 'v4.2.0-FireSense',
    signalStrength: '-70 dBm (LoRaWAN CH03)'
  }
];

export const NEARBY_VILLAGES: NearbyVillage[] = [
  {
    id: 'VIL-01',
    name: 'Moyar Valley Tribal Settlement',
    population: 1450,
    distanceKm: 2.1,
    bearing: 'East-Southeast',
    riskLevel: 'EXTREME',
    evacuationStatus: 'STANDBY'
  },
  {
    id: 'VIL-02',
    name: 'Masinagudi Hamlet & Forest Colony',
    population: 4200,
    distanceKm: 3.4,
    bearing: 'South',
    riskLevel: 'HIGH',
    evacuationStatus: 'STANDBY'
  },
  {
    id: 'VIL-03',
    name: 'Theppakadu Camp Community',
    population: 850,
    distanceKm: 1.8,
    bearing: 'Southwest',
    riskLevel: 'HIGH',
    evacuationStatus: 'STANDBY'
  },
  {
    id: 'VIL-04',
    name: 'Gundlupet Fringe Farming Village',
    population: 9600,
    distanceKm: 7.8,
    bearing: 'North',
    riskLevel: 'MODERATE',
    evacuationStatus: 'NOMINAL'
  }
];

export const RESPONSE_BASES: ResponseBase[] = [
  {
    id: 'BASE-01',
    name: 'Bandipur Wildfire Command Post Alpha',
    type: 'RANGER_STATION',
    latitude: 11.6680,
    longitude: 76.6280,
    personnelOnDuty: 28,
    status: 'DEPLOYED'
  },
  {
    id: 'BASE-02',
    name: 'Mudumalai Quick Response Helitack Depot',
    type: 'HELITACK_BASE',
    latitude: 11.5900,
    longitude: 76.5850,
    personnelOnDuty: 14,
    status: 'READY'
  },
  {
    id: 'BASE-03',
    name: 'Moyar Gorge Firebreak Tactical Crew',
    type: 'QUICK_RESPONSE_CREW',
    latitude: 11.5800,
    longitude: 76.7080,
    personnelOnDuty: 18,
    status: 'EN_ROUTE'
  }
];

/**
 * AI Forest Fire Prediction with 1h, 3h, 6h, 12h, 24h Horizons
 */
export const getAIFirePrediction = (
  currentScore: number,
  temp: number,
  humidity: number,
  smokePPM: number,
  windSpeed: number
): AIFirePredictionData => {
  const currentRisk =
    currentScore >= 76 ? 'EXTREME' : currentScore >= 51 ? 'HIGH' : currentScore >= 26 ? 'MODERATE' : 'LOW';

  const isDryingOut = humidity <= 25 && windSpeed >= 20;

  // Hourly forecasts for 1h, 3h, 6h, 12h, 24h
  const horizons = [1, 3, 6, 12, 24];
  const hourlyForecast = horizons.map(h => {
    const tempDelta = h === 1 ? 0.4 : h === 3 ? 1.6 : h === 6 ? 3.2 : h === 12 ? -1.8 : 0.8;
    const humDelta = h === 1 ? -1.5 : h === 3 ? -3.5 : h === 6 ? -6.0 : h === 12 ? 8.0 : -2.0;
    const windDelta = h === 1 ? 1 : h === 3 ? 3 : h === 6 ? 6 : h === 12 ? -4 : 2;

    const projectedTemp = parseFloat((temp + tempDelta).toFixed(1));
    const projectedHum = Math.max(10, Math.round(humidity + humDelta));
    const projectedWind = Math.max(5, Math.round(windSpeed + windDelta));
    const projectedSmoke = Math.max(5, Math.round(smokePPM + (h <= 6 ? h * 8 : h * 4)));

    const projectedScore = calculateFireRiskScore(projectedTemp, projectedHum, projectedSmoke, 12, projectedWind);
    const projectedTier = classifyFireRisk(projectedTemp, projectedHum, projectedSmoke, 12, projectedWind);

    return {
      horizonHours: h,
      hour: `${h} Hour${h > 1 ? 's' : ''}`,
      timeLabel: `+${h}h Horizon`,
      temperature: projectedTemp,
      humidity: projectedHum,
      windSpeed: projectedWind,
      riskScore: projectedScore,
      riskTier: projectedTier,
      summary:
        projectedTier === 'EXTREME'
          ? 'Active crown fire spread & severe ember transport expected'
          : projectedTier === 'HIGH'
          ? 'Rapid surface fire expansion along dry scrub ridges'
          : projectedTier === 'MODERATE'
          ? 'Heightened smolder risk with thermal spotting'
          : 'Low baseline danger with stable humidity'
    };
  });

  const pred6h = hourlyForecast.find(h => h.horizonHours === 6)?.riskTier || currentRisk;
  const pred24h = hourlyForecast.find(h => h.horizonHours === 24)?.riskTier || currentRisk;

  // Impact calculations
  const affectedAreaHectares = currentRisk === 'EXTREME' ? 18.5 : currentRisk === 'HIGH' ? 8.2 : currentRisk === 'MODERATE' ? 2.5 : 0.4;
  const predictedSpreadHectares = currentRisk === 'EXTREME' ? 42.0 : currentRisk === 'HIGH' ? 24.5 : currentRisk === 'MODERATE' ? 7.8 : 1.2;
  const villagesAtRiskCount = currentRisk === 'EXTREME' ? 4 : currentRisk === 'HIGH' ? 3 : currentRisk === 'MODERATE' ? 1 : 0;
  const projectedSpreadVelocity = currentRisk === 'EXTREME' ? 4.8 : currentRisk === 'HIGH' ? 2.6 : currentRisk === 'MODERATE' ? 1.1 : 0.3;

  let reason = '';
  if (currentRisk === 'EXTREME') {
    reason = `Severe thermal escalation (${temp.toFixed(1)}°C) coupled with critical desiccated humidity (${humidity}%) and high wind gusts (${windSpeed} km/h) indicates active crown fire expansion towards eastern forest perimeters.`;
  } else if (currentRisk === 'HIGH') {
    reason = `Elevated heat index and abnormal smoke particulate buildup (${smokePPM} ppm) indicate rapid surface fire propagation along dry deciduous understory.`;
  } else if (currentRisk === 'MODERATE') {
    reason = `Sustained daytime temperatures above 32°C and decreasing canopy moisture increase vulnerability to smoldering spot ignitions.`;
  } else {
    reason = `Forest moisture reserves and relative humidity (${humidity}%) remain optimal. All sectors operating under routine baseline surveillance.`;
  }

  return {
    confidence: isDryingOut ? 94 : 91,
    currentRisk,
    predictedRisk6h: pred6h,
    predictedRisk24h: pred24h,
    reason,
    modelName: 'DeepForest-PyroNet v4.2 Edge Ensemble',
    latencyMs: 142,
    projectedSpreadVelocity,
    projectedPeakTime: '14:30 IST (+5h 30m)',
    hourlyForecast,
    affectedAreaHectares,
    predictedSpreadHectares,
    villagesAtRiskCount
  };
};

/**
 * AI Recommended Actions strictly adhering to user specifications:
 * - Low Risk: Continue Monitoring
 * - Moderate Risk: Increase Forest Patrols
 * - High Risk: Deploy Forest Response Teams
 * - Extreme Risk: Initiate Fire Suppression, Notify Authorities, Issue Public Warnings, Prepare Evacuation Measures
 */
export const getAIFireRecommendations = (riskTier: FireRiskTier): AIFireRecommendation[] => {
  if (riskTier === 'EXTREME') {
    return [
      {
        id: 'REC-EXT-01',
        title: 'Initiate Immediate Fire Suppression',
        description: 'Authorize tactical ground water tenders, bulldozer firebreak cutting, and Helitack aerial retardant bombing on Sector 4 front.',
        priority: 'CRITICAL_NOW',
        icon: 'Flame',
        status: 'DISPATCHED',
        category: 'Suppression'
      },
      {
        id: 'REC-EXT-02',
        title: 'Notify District & State Authorities',
        description: 'Send high-priority wildfire incident flash bulletin to District Collector, State Forest Dept, and Disaster Management Agency.',
        priority: 'CRITICAL_NOW',
        icon: 'BellRing',
        status: 'DISPATCHED',
        category: 'Authorities'
      },
      {
        id: 'REC-EXT-03',
        title: 'Issue Public Warnings to Settlements',
        description: 'Trigger emergency broadcast siren and automated SMS hazard warnings to Moyar, Masinagudi, and Theppakadu residents.',
        priority: 'CRITICAL_NOW',
        icon: 'AlertTriangle',
        status: 'PENDING',
        category: 'Evacuation'
      },
      {
        id: 'REC-EXT-04',
        title: 'Prepare Evacuation Measures & Corridors',
        description: 'Mobilize 12 emergency transport coaches, stage paramedics at north boundary gate, and clear Highway 67 evacuation route.',
        priority: 'HIGH_PRIORITY',
        icon: 'ShieldAlert',
        status: 'PENDING',
        category: 'Evacuation'
      }
    ];
  }

  if (riskTier === 'HIGH') {
    return [
      {
        id: 'REC-HIGH-01',
        title: 'Deploy Forest Response Teams',
        description: 'Mobilize 3 quick-response wildfire strike squads with high-pressure portable spray units to Moyar Gorge and Western Ridge.',
        priority: 'CRITICAL_NOW',
        icon: 'Users',
        status: 'DISPATCHED',
        category: 'Suppression'
      },
      {
        id: 'REC-HIGH-02',
        title: 'Cut Peripheral Firebreaks & Bulldoze Lines',
        description: 'Widen eastern and southern reserve fire lines to 15 meters to arrest potential wind-driven ground surface spread.',
        priority: 'HIGH_PRIORITY',
        icon: 'Axe',
        status: 'PENDING',
        category: 'Firebreaks'
      },
      {
        id: 'REC-HIGH-03',
        title: 'Pre-position Water Bombers & Helitack Crews',
        description: 'Put Mudumalai Helitack aerial crew on 10-minute airborne readiness; ensure water sumps and dip ponds are at 100% capacity.',
        priority: 'HIGH_PRIORITY',
        icon: 'Crosshair',
        status: 'PENDING',
        category: 'Suppression'
      },
      {
        id: 'REC-HIGH-04',
        title: 'Restrict Public & Tourist Access',
        description: 'Halt all safari vehicles, close trekking routes, and establish manned checkpoints at Gundlupet and Masinagudi entrances.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'ShieldCheck',
        status: 'COMPLETED',
        category: 'Patrol'
      }
    ];
  }

  if (riskTier === 'MODERATE') {
    return [
      {
        id: 'REC-MOD-01',
        title: 'Increase Forest Patrols',
        description: 'Double motorcycle and watchtower ranger patrol frequency across Sector 2 and Sector 4 dry scrub zones to spot early smoke plumes.',
        priority: 'HIGH_PRIORITY',
        icon: 'Footprints',
        status: 'DISPATCHED',
        category: 'Patrol'
      },
      {
        id: 'REC-MOD-02',
        title: 'Accelerate Thermal Drone Surveillance',
        description: 'Deploy autonomous FLIR thermal mapping UAVs on 30-minute search patterns over high fuel-accumulation canopies.',
        priority: 'TACTICAL_ADVISORY',
        icon: 'Scan',
        status: 'PENDING',
        category: 'Surveillance'
      },
      {
        id: 'REC-MOD-03',
        title: 'Wet High-Risk Roadside Underbrush',
        description: 'Spray treated retardant foam along primary tourist corridors and transformer poles susceptible to spark ignition.',
        priority: 'PREPAREDNESS',
        icon: 'Droplets',
        status: 'PENDING',
        category: 'Firebreaks'
      }
    ];
  }

  // LOW
  return [
    {
      id: 'REC-LOW-01',
      title: 'Continue Monitoring',
      description: 'Maintain continuous 24/7 AI multi-sensor network telemetry and automated satellite hotspot cross-referencing.',
      priority: 'PREPAREDNESS',
      icon: 'ShieldCheck',
      status: 'COMPLETED',
      category: 'Surveillance'
    },
    {
      id: 'REC-LOW-02',
      title: 'Maintain Fire Equipment & Water Hydrants',
      description: 'Conduct routine weekly pressure tests on forest water tanks, portable pumps, and communication repeaters.',
      priority: 'PREPAREDNESS',
      icon: 'CheckCircle',
      status: 'COMPLETED',
      category: 'Suppression'
    }
  ];
};

/**
 * Generate Dynamic Alerts for Forest Fire
 */
export const generateDynamicFireAlerts = (
  riskTier: FireRiskTier,
  temp: number,
  smokePPM: number,
  coPPM: number,
  windSpeed: number
): FireAlert[] => {
  const alerts: FireAlert[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (riskTier === 'EXTREME') {
    alerts.push({
      id: 'ALT-FIRE-01',
      alertType: 'Active Wildfire Detected',
      location: 'Bandipur Core Ridge - Sector 4 Watchtower',
      severity: 'CRITICAL',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      smokePPM,
      confidenceScore: 96,
      description: `Active crown flamefront confirmed. Temperature breached ${temp.toFixed(1)}°C with severe smoke particulate at ${smokePPM} ppm. Rapid wind-driven expansion in progress.`
    });
    alerts.push({
      id: 'ALT-FIRE-02',
      alertType: 'Extreme Heat & Desiccation Alert',
      location: 'Moyar Gorge & Dry Escarpment Reach',
      severity: 'CRITICAL',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      smokePPM,
      confidenceScore: 94,
      description: `Ambient temperature exceeded 42°C with canopy humidity under 18%. Spontaneous ignition and ember spotting threat is severe.`
    });
    alerts.push({
      id: 'ALT-FIRE-03',
      alertType: 'High Fire Spread Probability',
      location: 'Moyar Valley & Masinagudi Perimeter Zone',
      severity: 'HIGH',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      confidenceScore: 91,
      description: `Sustained wind gusts of ${windSpeed} km/h driving fire perimeter toward residential settlements. Immediate tactical containment required.`
    });
  } else if (riskTier === 'HIGH') {
    alerts.push({
      id: 'ALT-FIRE-01',
      alertType: 'Smoke Detected · Potential Fire Source',
      location: 'Bandipur Core Ridge - Sector 4 Watchtower',
      severity: 'HIGH',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      smokePPM,
      confidenceScore: 89,
      description: `Smoke concentration elevated to ${smokePPM} ppm with carbon monoxide at ${coPPM.toFixed(1)} ppm. Ground response crews dispatched for verification.`
    });
    alerts.push({
      id: 'ALT-FIRE-02',
      alertType: 'Critical Thermal Rise Warning',
      location: 'Wayanad Boundary Dry Deciduous Ridge',
      severity: 'HIGH',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      confidenceScore: 88,
      description: `Canopy heat sensor registered rapid rise rate (+2.4°C/hr), reaching ${temp.toFixed(1)}°C.`
    });
  } else if (riskTier === 'MODERATE') {
    alerts.push({
      id: 'ALT-FIRE-01',
      alertType: 'Smoke Detected · Smolder Advisory',
      location: 'Masinagudi Foothill Forest Watch',
      severity: 'MODERATE',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      smokePPM,
      confidenceScore: 78,
      description: `Localized smoke concentration at ${smokePPM} ppm detected. Possible dry leaf litter smolder.`
    });
    alerts.push({
      id: 'ALT-FIRE-02',
      alertType: 'Low Humidity & Wind Gust Advisory',
      location: 'Theppakadu Riverine Buffer',
      severity: 'MODERATE',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      confidenceScore: 82,
      description: `Relative humidity decreased below 35% with sustained 18 km/h wind gusts. Patrol frequency escalated.`
    });
  } else {
    alerts.push({
      id: 'ALT-FIRE-01',
      alertType: 'Routine Thermal Surveillance Nominal',
      location: 'All Forest Reserve Sectors',
      severity: 'LOW',
      detectionTime: `Today, ${now}`,
      status: 'ACTIVE',
      temperature: temp,
      smokePPM,
      confidenceScore: 95,
      description: `All optical, gas, and thermal telemetry sensors within safe baseline limits. No active hotspots identified.`
    });
  }

  return alerts;
};

/**
 * Generate Realistic Historical Readings for Forest Fire Charts
 */
export const generateHistoricalFireData = (
  count = 16,
  baseTemp = 36.8,
  baseHumidity = 24,
  baseSmoke = 64,
  baseWind = 21
): HistoricalFireReading[] => {
  const data: HistoricalFireReading[] = [];
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * 180000); // 3-minute steps
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const factor = (count - i) / count;

    const temp = parseFloat((baseTemp - 3.5 + factor * 3.5 + (Math.random() - 0.5) * 0.8).toFixed(1));
    const humidity = Math.max(12, Math.round(baseHumidity + 8 - factor * 8 + (Math.random() - 0.5) * 2));
    const smoke = Math.max(8, Math.round(baseSmoke - 20 + factor * 20 + (Math.random() - 0.5) * 5));
    const wind = Math.max(5, Math.round(baseWind - 4 + factor * 4 + (Math.random() - 0.5) * 3));
    const score = calculateFireRiskScore(temp, humidity, smoke, 10, wind);

    data.push({
      timestamp: timeStr,
      temperature: temp,
      humidity,
      smokePPM: smoke,
      windSpeed: wind,
      riskScore: score
    });
  }

  return data;
};
