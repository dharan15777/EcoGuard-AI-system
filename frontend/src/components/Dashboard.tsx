import React, { useState, useEffect, useMemo } from 'react';
import { FireSensor, FireAlert, HistoricalFireReading, FireRiskTier } from '../types/fire';
import {
  INITIAL_FIRE_SENSORS,
  FIRE_RISK_COLORS,
  classifyFireRisk,
  calculateFireRiskScore,
  getAIFirePrediction,
  getAIFireRecommendations,
  generateDynamicFireAlerts,
  generateHistoricalFireData
} from '../utils/fireConstants';
import { FireGauge } from './FloodGauge';
import { AIPredictionPanel } from './AIPredictionPanel';
import { AIRecommendedActions } from './AIRecommendedActions';
import { Charts } from './Charts';
import { Map } from './Map';
import { AlertNotification } from './AlertNotification';
import { SensorCard } from './SensorCard';
import {
  Flame,
  Thermometer,
  CloudFog,
  Wind,
  Droplets,
  ShieldAlert,
  BellRing,
  Play,
  Pause,
  Download,
  Filter,
  CheckCircle2,
  Cpu,
  Layers,
  Info,
  ShieldCheck,
  AlertTriangle,
  Home,
  Compass,
  Activity
} from 'lucide-react';

interface DashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  onAcknowledgeAlert: propAcknowledge
}) => {
  // Dynamic sensors state across the forest reserve (Bandipur - Western Ghats, India)
  const [sensors, setSensors] = useState<FireSensor[]>(() => {
    return INITIAL_FIRE_SENSORS.map(s => {
      const tier = classifyFireRisk(s.temperature, s.humidity, s.smokePPM, s.carbonMonoxide, s.windSpeed);
      const score = calculateFireRiskScore(s.temperature, s.humidity, s.smokePPM, s.carbonMonoxide, s.windSpeed);
      return { ...s, riskTier: tier, riskScore: score };
    });
  });

  const [selectedSensor, setSelectedSensor] = useState<FireSensor | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [sensorHealthFilter, setSensorHealthFilter] = useState<'ALL' | 'ONLINE' | 'ALERTING'>('ALL');

  // Derive active focus sensor
  const activeFocusSensor = selectedSensor || sensors[0];

  // Dynamic raw telemetry inputs (refreshes continuously every 3 seconds)
  const primaryTemp = activeFocusSensor.temperature;
  const primaryMaxTemp = activeFocusSensor.maxTempToday;
  const primaryHumidity = activeFocusSensor.humidity;
  const primarySmoke = activeFocusSensor.smokePPM;
  const primaryCO = activeFocusSensor.carbonMonoxide;
  const primaryCO2 = activeFocusSensor.carbonDioxide;
  const primaryWindSpeed = activeFocusSensor.windSpeed;
  const primaryWindDir = activeFocusSensor.windDirection;

  // 15–30 Minute Fire Weather Danger Cycle Timeline (simulated minutes 0m to 30m)
  const [cycleMinute, setCycleMinute] = useState<number>(14);

  // Overall Hazard Classification & Risk Scoring:
  // Dynamically and continuously computed DIRECTLY from the live telemetry readings
  const primaryRiskTier = useMemo<FireRiskTier>(() => {
    return classifyFireRisk(primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWindSpeed);
  }, [primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWindSpeed]);

  const primaryRiskScore = useMemo<number>(() => {
    return calculateFireRiskScore(primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWindSpeed);
  }, [primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWindSpeed]);

  // Unified automatic state machine: computes EXTREME, HIGH, MODERATE, or LOW directly from readings
  const activeState = useMemo<FireRiskTier>(() => {
    return primaryRiskTier;
  }, [primaryRiskTier]);

  const riskMeta = FIRE_RISK_COLORS[primaryRiskTier] || FIRE_RISK_COLORS.LOW;

  // AI 1h to 24h Prediction (based on evaluated hazard classification)
  const prediction = useMemo(
    () => getAIFirePrediction(primaryRiskScore, primaryTemp, primaryHumidity, primarySmoke, primaryWindSpeed),
    [primaryRiskScore, primaryTemp, primaryHumidity, primarySmoke, primaryWindSpeed]
  );

  // Dynamic AI Recommended Actions strictly based on user rules
  const recommendedActions = useMemo(
    () => getAIFireRecommendations(primaryRiskTier),
    [primaryRiskTier]
  );

  // Dynamic alerts generated based on evaluated hazard conditions
  const [alerts, setAlerts] = useState<FireAlert[]>(() =>
    generateDynamicFireAlerts(primaryRiskTier, primaryTemp, primarySmoke, primaryCO, primaryWindSpeed)
  );

  // Synchronize alerts whenever evaluated risk or reading changes
  useEffect(() => {
    setAlerts(generateDynamicFireAlerts(primaryRiskTier, primaryTemp, primarySmoke, primaryCO, primaryWindSpeed));
  }, [primaryRiskTier, primaryTemp, primarySmoke, primaryCO, primaryWindSpeed]);

  // Real-time time series data for charts
  const [historicalData, setHistoricalData] = useState<HistoricalFireReading[]>(() =>
    generateHistoricalFireData(16, primaryTemp, primaryHumidity, primarySmoke, primaryWindSpeed)
  );

  // Acknowledge Alert Handler
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    if (propAcknowledge) propAcknowledge(alertId);
  };

  /**
   * 15–30 Minute Fire Weather Hydrograph Model:
   * Computes realistic canopy temperature elevation, humidity desiccation, and smoke buildup over 30 min.
   * - Minutes 0m - 9m: Baseline / Routine Morning (Low < 30°C, > 45% hum, < 25 ppm smoke) -> LOW
   * - Minutes 9m - 19m: Solar Heating & Dry Wind Influx (Moderate 30 - 36°C, 30 - 45% hum, 25 - 60 ppm smoke) -> MODERATE
   * - Minutes 19m - 26m: Peak Heat & Combustion Flamefront (High/Extreme >= 38°C, <= 22% hum, >= 75 ppm smoke) -> HIGH / EXTREME
   * - Minutes 26m - 30m: Evening Humidity Recovery (waters/moisture recover towards baseline) -> LOW
   */
  const getCycleFireTarget = (minute: number) => {
    const norm = ((minute % 30) + 30) % 30;
    if (norm < 9) {
      // Low / Safe Baseline
      const p = norm / 9;
      return {
        temperature: 28.0 + p * 2.8,       // 28.0 -> 30.8°C
        humidity: Math.round(58 - p * 14), // 58% -> 44%
        smokePPM: Math.round(14 + p * 12), // 14 -> 26 ppm
        carbonMonoxide: 2.5 + p * 4.5,     // 2.5 -> 7.0 ppm
        windSpeed: Math.round(12 + p * 5), // 12 -> 17 km/h
      };
    } else if (norm < 19) {
      // Moderate / Heightened Dry Watch (e.g. at minute 14: temp ~34.5°C, hum ~32%, smoke ~42 ppm)
      const p = (norm - 9) / 10;
      return {
        temperature: 31.0 + p * 5.5,        // 31.0 -> 36.5°C
        humidity: Math.round(44 - p * 18),  // 44% -> 26%
        smokePPM: Math.round(26 + p * 36),  // 26 -> 62 ppm
        carbonMonoxide: 7.0 + p * 8.5,      // 7.0 -> 15.5 ppm
        windSpeed: Math.round(17 + p * 7),  // 17 -> 24 km/h
      };
    } else if (norm < 26) {
      // High to Extreme / Active Wildfire Breakout (>= 38°C, <= 20% hum, >= 75 ppm smoke)
      const p = (norm - 19) / 7;
      return {
        temperature: 37.0 + p * 5.8,        // 37.0 -> 42.8°C
        humidity: Math.round(25 - p * 10),  // 25% -> 15% (Critical Desiccation)
        smokePPM: Math.round(65 + p * 75),  // 65 -> 140 ppm (Dense Smoke)
        carbonMonoxide: 16.0 + p * 13.0,    // 16.0 -> 29.0 ppm
        windSpeed: Math.round(24 + p * 8),  // 24 -> 32 km/h
      };
    } else {
      // Evening Moisture Recovery
      const p = (norm - 26) / 4;
      return {
        temperature: 42.0 - p * 13.5,       // 42.0 -> 28.5°C
        humidity: Math.round(16 + p * 40),  // 16% -> 56%
        smokePPM: Math.round(135 - p * 115),// 135 -> 20 ppm
        carbonMonoxide: 28.0 - p * 24.5,    // 28.0 -> 3.5 ppm
        windSpeed: Math.round(30 - p * 17), // 30 -> 13 km/h
      };
    }
  };

  // Continuous 3.0s Live Telemetry Refresh:
  // Automatically updates sensor readings every 3s with natural fluctuations, progressing along the 15-30m cycle.
  // Hazard classification and detection badge are 100% reading-driven (not manual).
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Advance hydrological/weather cycle timeline
      let nextMin = 14;
      setCycleMinute(prev => {
        nextMin = prev >= 30 ? 0.5 : Number((prev + 0.3).toFixed(2));
        return nextMin;
      });

      const target = getCycleFireTarget(nextMin);

      setSensors(prev =>
        prev.map(s => {
          const isNodeAlpha = s.id === 'FS-FIRE-01';
          const offsetTemp = isNodeAlpha ? 0 : s.id === 'FS-FIRE-02' ? 3.5 : s.id === 'FS-FIRE-04' ? -5.5 : 1.2;
          const offsetHum = isNodeAlpha ? 0 : s.id === 'FS-FIRE-02' ? -6 : s.id === 'FS-FIRE-04' ? 18 : -2;
          const offsetSmoke = isNodeAlpha ? 0 : s.id === 'FS-FIRE-02' ? 45 : s.id === 'FS-FIRE-04' ? -18 : 10;

          const targetTemp = Math.max(20, target.temperature + offsetTemp);
          const targetHum = Math.min(85, Math.max(10, target.humidity + offsetHum));
          const targetSmoke = Math.max(5, target.smokePPM + offsetSmoke);

          // Small natural live fluctuation (+/- 0.2°C, +/- 1% hum, +/- 2 ppm smoke)
          const tempJitter = (Math.random() - 0.49) * 0.3;
          const humJitter = Math.round((Math.random() - 0.5) * 1.5);
          const smokeJitter = Math.round((Math.random() - 0.5) * 3);
          const windJitter = Math.round((Math.random() - 0.5) * 2);

          // Smooth convergence to target
          const newTemp = Math.max(18, parseFloat((s.temperature * 0.90 + targetTemp * 0.10 + tempJitter).toFixed(1)));
          const newHum = Math.min(95, Math.max(10, Math.round(s.humidity * 0.90 + targetHum * 0.10 + humJitter)));
          const newSmoke = Math.max(5, Math.round(s.smokePPM * 0.90 + targetSmoke * 0.10 + smokeJitter));
          const newCO = Math.max(1, parseFloat((s.carbonMonoxide * 0.90 + target.carbonMonoxide * 0.10 + (Math.random() - 0.5) * 0.4).toFixed(1)));
          const newWind = Math.max(5, Math.round(s.windSpeed * 0.90 + target.windSpeed * 0.10 + windJitter));
          const newMaxTemp = Math.max(s.maxTempToday, newTemp);

          const tier = classifyFireRisk(newTemp, newHum, newSmoke, newCO, newWind);
          const score = calculateFireRiskScore(newTemp, newHum, newSmoke, newCO, newWind);

          return {
            ...s,
            temperature: newTemp,
            maxTempToday: newMaxTemp,
            humidity: newHum,
            smokePPM: newSmoke,
            carbonMonoxide: newCO,
            windSpeed: newWind,
            riskTier: tier,
            riskScore: score,
            lastPing: new Date().toISOString()
          };
        })
      );

      // Historical chart point appends every 3 seconds
      setHistoricalData(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const last = prev[prev.length - 1];
        const newTemp = parseFloat((last.temperature * 0.90 + target.temperature * 0.10 + (Math.random() - 0.49) * 0.3).toFixed(1));
        const newHum = Math.min(95, Math.max(10, Math.round(last.humidity * 0.90 + target.humidity * 0.10 + (Math.random() - 0.5) * 1.5)));
        const newSmoke = Math.max(5, Math.round(last.smokePPM * 0.90 + target.smokePPM * 0.10 + (Math.random() - 0.5) * 3));
        const newWind = Math.max(5, Math.round(last.windSpeed * 0.90 + target.windSpeed * 0.10 + (Math.random() - 0.5) * 2));
        const newScore = calculateFireRiskScore(newTemp, newHum, newSmoke, 10, newWind);

        return [...prev.slice(1), {
          timestamp: timeStr,
          temperature: newTemp,
          humidity: newHum,
          smokePPM: newSmoke,
          windSpeed: newWind,
          riskScore: newScore
        }];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Dynamic text generators for Top Summary Cards
  const getTempSubtitle = (temp: number) => {
    if (temp >= 42) return { title: 'Extreme Thermal Runaway', trend: '▲ +2.8°C/hr' };
    if (temp >= 36) return { title: 'Critical Canopy Heating', trend: '▲ +1.6°C/hr' };
    if (temp >= 30) return { title: 'Elevated Daytime Heat', trend: '▲ +0.8°C/hr' };
    return { title: 'Stable Canopy Temperature', trend: '● Nominal Baseline' };
  };

  const getHumiditySubtitle = (hum: number) => {
    if (hum <= 20) return 'Severe Canopy Desiccation';
    if (hum <= 30) return 'Low Moisture Alert';
    if (hum <= 45) return 'Moderate Drying Rate';
    return 'Adequate Fuel Moisture';
  };

  const getSmokeSubtitle = (smoke: number, co: number) => {
    if (smoke >= 110) return { title: 'Dense Smoke Plume Detected', status: 'Active Combustion' };
    if (smoke >= 60) return { title: 'High Particulate Concentration', status: 'Potential Fire Source' };
    if (smoke >= 25) return { title: 'Localized Smolder Advisory', status: 'Elevated Aerosols' };
    return { title: 'Optical Transparency Clear', status: 'Nominal Baseline' };
  };

  const getDisasterResponseText = (tier: FireRiskTier) => {
    if (tier === 'EXTREME') return 'STAGE-2 SUPPRESSION ACTIVE';
    if (tier === 'HIGH') return 'DEPLOY RESPONSE TEAMS';
    if (tier === 'MODERATE') return 'INCREASE FOREST PATROLS';
    return 'ROUTINE SURVEILLANCE';
  };

  const tempInfo = getTempSubtitle(primaryTemp);
  const humSubtitle = getHumiditySubtitle(primaryHumidity);
  const smokeInfo = getSmokeSubtitle(primarySmoke, primaryCO);
  const disasterResponse = getDisasterResponseText(primaryRiskTier);

  // Active alerts count
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningAlertsCount = activeAlerts.filter(a => a.severity === 'HIGH' || a.severity === 'MODERATE').length;

  const filteredAlerts = alerts.filter(a => {
    if (alertSeverityFilter === 'ALL') return true;
    return a.severity === alertSeverityFilter;
  });

  const filteredSensors = sensors.filter(s => {
    if (sensorHealthFilter === 'ALL') return true;
    if (sensorHealthFilter === 'ONLINE') return s.status === 'ONLINE';
    if (sensorHealthFilter === 'ALERTING') return s.riskTier === 'EXTREME' || s.riskTier === 'HIGH';
    return true;
  });

  // Export Situation Report
  const handleExportSitRep = () => {
    const sitrep = {
      reportType: 'WILDFIRE DISASTER INCIDENT SITUATION REPORT (SITREP)',
      timestamp: new Date().toISOString(),
      reserve: 'Bandipur - Mudumalai Western Ghats Biosphere Reserve',
      telemetrySummary: {
        primaryTemperature: `${primaryTemp.toFixed(1)}°C`,
        primaryHumidity: `${primaryHumidity}%`,
        primarySmokePPM: `${primarySmoke} ppm`,
        primaryCarbonMonoxide: `${primaryCO} ppm`,
        primaryWind: `${primaryWindSpeed} km/h ${primaryWindDir}`,
        riskScore: primaryRiskScore,
        riskTier: primaryRiskTier,
        affectedAreaHectares: prediction.affectedAreaHectares,
        predictedSpreadHectares: prediction.predictedSpreadHectares,
        villagesAtRiskCount: prediction.villagesAtRiskCount,
        activeAlertsCount: activeAlerts.length,
      },
      aiPrediction: {
        confidence: `${prediction.confidence}%`,
        currentRisk: prediction.currentRisk,
        predictedRisk6h: prediction.predictedRisk6h,
        predictedRisk24h: prediction.predictedRisk24h,
        reason: prediction.reason,
        projectedSpreadVelocity: `${prediction.projectedSpreadVelocity} km/h`,
      },
      sensors: sensors.map(s => ({
        id: s.id,
        name: s.name,
        temperature: `${s.temperature}°C`,
        humidity: `${s.humidity}%`,
        smokePPM: `${s.smokePPM} ppm`,
        battery: s.batteryLevel,
        status: s.status,
        riskTier: s.riskTier
      }))
    };

    const blob = new Blob([JSON.stringify(sitrep, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoGuard_Wildfire_SITREP_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1700px] mx-auto w-full pb-14 font-sans">
      {/* ========================================================
          DISASTER OPERATIONS COMMAND CONSOLE HEADER
         ======================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-orange-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-orange-950/80 border border-orange-500/50 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-950/50">
            <Flame size={32} className="text-orange-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                ● EARLY WARNING DISASTER SYSTEM
              </span>
              <span className="text-slate-600 text-xs hidden sm:inline">|</span>
              <span className="text-xs text-orange-400 font-semibold tracking-wide hidden sm:inline">
                NATIONAL WILDFIRE RISK REDUCTION PLATFORM
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
              FOREST FIRE DETECTION MONITORING
            </h1>
          </div>
        </div>

        {/* System-Detected State Machine: Automated Readout driven strictly by sensor readings */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            title="Real-time detection: automatically updates between LOW, MODERATE, HIGH, and EXTREME based on live telemetry readings"
            className="flex items-center bg-slate-950/90 p-1.5 rounded-xl border border-white/10 text-xs shadow-inner gap-2 select-none"
          >
            <span className="text-[11px] text-slate-400 uppercase px-1.5 font-bold flex items-center gap-1.5">
              <Cpu size={13} className="text-orange-400" /> DETECTION:
            </span>
            <span
              className={`px-3.5 py-1 rounded-lg font-black transition-all shadow flex items-center gap-2 ${
                activeState === 'EXTREME'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 ring-1 ring-red-400/50'
                  : activeState === 'HIGH'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60 ring-1 ring-orange-400/50'
                  : activeState === 'MODERATE'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60 ring-1 ring-amber-400/50'
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {activeState === 'EXTREME'
                ? 'EXTREME (ACTIVE FIRE)'
                : activeState === 'HIGH'
                ? 'HIGH FIRE RISK'
                : activeState === 'MODERATE'
                ? 'MODERATE (WATCH)'
                : 'LOW (SAFE)'}
            </span>
            <span className="text-[10px] text-orange-400 font-mono px-1.5 border-l border-white/10 hidden sm:inline">
              15-30m Cycle: T+{Math.round(cycleMinute)}m
            </span>
          </div>

          <button
            onClick={() => setIsLiveStreaming(v => !v)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
              isLiveStreaming
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {isLiveStreaming ? <Pause size={14} /> : <Play size={14} />}
            {isLiveStreaming ? 'LIVE TICK (3s)' : 'PAUSED'}
          </button>

          <button
            onClick={handleExportSitRep}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} /> Export SITREP
          </button>
        </div>
      </div>

      {/* Dynamic Alert Banner: Automatically updates to match active fire risk state */}
      {primaryRiskTier === 'EXTREME' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-red-500/15 border-red-500/55">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-500/25 text-red-400 animate-bounce">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                  ⚠️ ACTIVE WILDFIRE SUPPRESSION PROTOCOL STAGE 2
                </span>
                <span className="text-xs text-slate-400">· District Fire & Rescue Services Mobilized</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Active crown fire confirmed at <strong>{activeFocusSensor.locationName}</strong>. Ambient temperature reached <strong>{primaryTemp.toFixed(1)}°C</strong> with smoke particulate at <strong>{primarySmoke} ppm</strong>. Flamefront spread velocity estimated at 4.8 km/h.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white animate-pulse shadow-md">
            RED ALERT CODE #882
          </span>
        </div>
      )}

      {primaryRiskTier === 'HIGH' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-orange-500/15 border-orange-500/50">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-orange-500/25 text-orange-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-orange-400 tracking-wider">
                  ⚠️ WILDFIRE HIGH RISK ADVISORY · Extreme Dry Fuel & Smoke Influx
                </span>
                <span className="text-xs text-slate-400">· Quick Response Strike Teams on Standby</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Canopy temperature elevated to <strong>{primaryTemp.toFixed(1)}°C</strong> with humidity depleted to <strong>{primaryHumidity}%</strong>. Smoke concentration reached <strong>{primarySmoke} ppm</strong> with CO at <strong>{primaryCO.toFixed(1)} ppm</strong>.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-orange-600 text-white shadow-md">
            ORANGE ALERT CODE #540
          </span>
        </div>
      )}

      {primaryRiskTier === 'MODERATE' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-amber-500/10 border-amber-500/40">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Info size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  ℹ️ FOREST FIRE WATCH NOTICE · Low Humidity & High Wind Advisory
                </span>
                <span className="text-xs text-slate-400">· Ranger Patrols Accelerated</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Canopy temperature at <strong>{primaryTemp.toFixed(1)}°C</strong> with relative humidity at <strong>{primaryHumidity}%</strong> and sustained wind gusts at <strong>{primaryWindSpeed} km/h {primaryWindDir}</strong>. Heightened watch over dry deciduous undergrowth.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-600 text-white shadow-md">
            YELLOW WATCH CODE #210
          </span>
        </div>
      )}

      {primaryRiskTier === 'LOW' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-emerald-500/10 border-emerald-500/35">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  ✓ ALL FOREST SECTORS NOMINAL · Continuous AI Thermal Surveillance Active
                </span>
                <span className="text-xs text-slate-400">· Optimal Canopy Moisture Baseline</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Current temperature <strong>{primaryTemp.toFixed(1)}°C</strong>, humidity <strong>{primaryHumidity}%</strong>, and smoke concentration <strong>{primarySmoke} ppm</strong> remain well within safe baseline thresholds.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-md">
            ALL NOMINAL CODE #100
          </span>
        </div>
      )}

      {/* ========================================================
          SECTION 1: TOP SUMMARY CARDS
          1. Current Temperature (Thermal Sensor)
          2. Current Humidity & Wind (Atmospheric Sensor)
          3. Smoke & Gas Monitoring (Combustion Sensor)
          4. Current Fire Risk Level (Hazard Classification)
         ======================================================== */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 mb-3 px-1">
          SECTION 1 · REAL-TIME TELEMETRIC SUMMARY
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Temperature */}
          <div
            className="field-panel p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(150deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
              border: '1px solid rgba(249,115,22,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-orange-400 tracking-wider">
                  Thermal Sensor
                </span>
                <div className="text-base font-bold text-white mt-0.5">Current Temperature</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Thermometer size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-orange-300 font-mono tracking-tight">
                  {primaryTemp.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">°C</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mt-1">
                <span>{tempInfo.trend}</span>
                <span className="text-slate-500">· {tempInfo.title}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Maximum Today:</span>
              <strong className="text-red-400 font-mono">{primaryMaxTemp.toFixed(1)}°C</strong>
            </div>
          </div>

          {/* Card 2: Current Humidity & Wind */}
          <div
            className="field-panel p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(150deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
              border: '1px solid rgba(56,189,248,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-cyan-400 tracking-wider">
                  Atmospheric Sensor
                </span>
                <div className="text-base font-bold text-white mt-0.5">Current Humidity</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Droplets size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-cyan-300 font-mono tracking-tight">
                  {primaryHumidity}
                </span>
                <span className="text-sm font-semibold text-slate-400">%</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mt-1">
                <span>Wind: {primaryWindSpeed} km/h {primaryWindDir}</span>
                <span className="text-slate-500">· {humSubtitle}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Critical Desiccation:</span>
              <strong className={primaryHumidity <= 25 ? 'text-red-400 font-mono' : 'text-amber-400 font-mono'}>
                {primaryHumidity <= 25 ? '⚠️ < 25% Critical' : 'Safe > 30%'}
              </strong>
            </div>
          </div>

          {/* Card 3: Smoke & Gas Monitoring */}
          <div
            className="field-panel p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(150deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
              border: '1px solid rgba(245,158,11,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                  Combustion Sensor
                </span>
                <div className="text-base font-bold text-white mt-0.5">Smoke & Gas Detection</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CloudFog size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-300 font-mono tracking-tight">
                  {primarySmoke}
                </span>
                <span className="text-sm font-semibold text-slate-400">ppm</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mt-1">
                <span>CO: {primaryCO.toFixed(1)} ppm</span>
                <span className="text-slate-500">· CO₂: {primaryCO2} ppm</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Smoke Alert Status:</span>
              <strong className={primarySmoke >= 60 ? 'text-red-400 font-mono' : 'text-emerald-400 font-mono'}>
                {smokeInfo.status}
              </strong>
            </div>
          </div>

          {/* Card 4: Current Fire Risk Level */}
          <div
            className="field-panel p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              background: `linear-gradient(150deg, ${riskMeta.bg} 0%, rgba(10,15,26,0.98) 100%)`,
              border: `1px solid ${riskMeta.border}`,
              boxShadow: riskMeta.glow
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Hazard Classification
                </span>
                <div className="text-base font-bold text-white mt-0.5">Current Fire Risk Level</div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: riskMeta.bg, border: `1px solid ${riskMeta.border}` }}
              >
                <Flame size={20} color={riskMeta.color} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black uppercase tracking-tight" style={{ color: riskMeta.text }}>
                  {primaryRiskTier}
                </span>
                <span className="text-sm font-bold text-slate-400 font-mono">
                  ({primaryRiskScore}/100)
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                {primaryRiskTier === 'EXTREME'
                  ? 'Active Wildfire Inundation'
                  : primaryRiskTier === 'HIGH'
                  ? 'High Surface Fire Ignition'
                  : primaryRiskTier === 'MODERATE'
                  ? 'Heightened Forest Dry Watch'
                  : 'Canopy Conditions Nominal'}
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Disaster Response:</span>
              <strong style={{ color: riskMeta.text }} className="font-semibold">{disasterResponse}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 1B: AFFECTED AREA ESTIMATION & RAPID DISPATCH (FEATURE 10)
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Affected Area</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {prediction.affectedAreaHectares} <span className="text-xs text-slate-400 font-normal">Hectares</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Flame size={16} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Spread (6 Hours)</span>
            <div className="text-lg font-black text-orange-400 font-mono mt-0.5">
              {prediction.predictedSpreadHectares} <span className="text-xs text-slate-400 font-normal">Hectares</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Compass size={16} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Nearby Villages at Risk</span>
            <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
              {prediction.villagesAtRiskCount} <span className="text-xs text-slate-400 font-normal">Settlements</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Home size={16} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Fire Alerts</span>
            <div className="text-lg font-black text-red-400 font-mono mt-0.5">
              {activeAlerts.length} <span className="text-xs text-slate-400 font-normal">({criticalAlertsCount} Critical)</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <BellRing size={16} />
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: FIRE RISK INDICATOR (LARGE VISUAL GAUGE)
         ======================================================== */}
      <div>
        <FireGauge
          score={primaryRiskScore}
          tier={primaryRiskTier}
          temperature={primaryTemp}
          humidity={primaryHumidity}
          smokePPM={primarySmoke}
          windSpeed={primaryWindSpeed}
        />
      </div>

      {/* ========================================================
          SECTION 3: AI FOREST FIRE PREDICTION PANEL (1h, 3h, 6h, 12h, 24h)
         ======================================================== */}
      <div>
        <AIPredictionPanel prediction={prediction} />
      </div>

      {/* ========================================================
          SECTIONS 4 & 5: TEMPERATURE, SMOKE, HUMIDITY & WIND CHARTS
         ======================================================== */}
      <div>
        <Charts
          historicalData={historicalData}
          criticalTempThreshold={40.0}
          warningTempThreshold={35.0}
          criticalHumidityThreshold={25.0}
        />
      </div>

      {/* ========================================================
          SECTION 6: INTERACTIVE FIRE SPREAD PREDICTION MAP (FULL WIDTH)
         ======================================================== */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Layers size={14} /> SECTION 6 · GEOSPATIAL WILDFIRE SPREAD NETWORK
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Fire Spread Prediction Map
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            Displaying all {sensors.length} forest sensors, active fire zones, predicted spread perimeters, nearby villages & response bases
          </span>
        </div>

        <Map
          sensors={sensors}
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
        />
      </div>

      {/* ========================================================
          SECTION 7: ACTIVE FIRE ALERTS SECTION (FULL WIDTH)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(239,68,68,0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                SECTION 7 · EMERGENCY WILDFIRE DISPATCH FEED
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Active Fire Alerts ({activeAlerts.length})
              </h2>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-400 px-2 font-semibold flex items-center gap-1">
              <Filter size={12} /> Severity:
            </span>
            <button
              onClick={() => setAlertSeverityFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                alertSeverityFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setAlertSeverityFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                alertSeverityFilter === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical ({alerts.filter(a => a.severity === 'CRITICAL').length})
            </button>
            <button
              onClick={() => setAlertSeverityFilter('HIGH')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                alertSeverityFilter === 'HIGH' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Warning ({alerts.filter(a => a.severity === 'HIGH').length})
            </button>
          </div>
        </div>

        {/* List of alert cards */}
        <div className="flex flex-col gap-3.5">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/50 border border-white/5 text-center text-slate-400 text-sm">
              <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
              No active fire alerts matching filter. All monitored sectors nominal.
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <AlertNotification
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </div>
      </div>

      {/* ========================================================
          SECTION 8: AI RECOMMENDED ACTIONS (FULL WIDTH)
         ======================================================== */}
      <div>
        <AIRecommendedActions
          actions={recommendedActions}
          riskTier={primaryRiskTier}
        />
      </div>

      {/* ========================================================
          SECTION 9: SENSOR HEALTH MONITORING (FULL WIDTH)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(16,185,129,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                SECTION 9 · FOREST SENSOR NETWORK TELEMETRY STATUS
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Sensor Health Monitoring
              </h2>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-400 px-2 font-semibold flex items-center gap-1">
              <Filter size={12} /> Status Filter:
            </span>
            <button
              onClick={() => setSensorHealthFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                sensorHealthFilter === 'ALL' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Nodes ({sensors.length})
            </button>
            <button
              onClick={() => setSensorHealthFilter('ONLINE')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                sensorHealthFilter === 'ONLINE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Online ({sensors.filter(s => s.status === 'ONLINE').length})
            </button>
            <button
              onClick={() => setSensorHealthFilter('ALERTING')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                sensorHealthFilter === 'ALERTING' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Elevated Risk ({sensors.filter(s => s.riskTier === 'EXTREME' || s.riskTier === 'HIGH').length})
            </button>
          </div>
        </div>

        {/* Full-Width Grid of Sensor Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSensors.map(sensor => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              isSelected={activeFocusSensor.id === sensor.id}
              onSelect={setSelectedSensor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
