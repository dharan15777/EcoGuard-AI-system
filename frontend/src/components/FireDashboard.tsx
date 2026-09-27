import React, { useState, useEffect, useMemo } from 'react';
import { FireSensor, FireAlert, HistoricalFireReading, FireRiskTier } from '../types/fire';
import {
  INITIAL_FIRE_SENSORS,
  generateHistoricalFireData,
  getAIFirePrediction,
  getAIFireRecommendations,
  generateDynamicFireAlerts,
  classifyFireRisk,
  calculateFireRiskScore,
  FIRE_RISK_COLORS
} from '../utils/fireConstants';
import { FireGauge } from './FireGauge';
import { AIPredictionPanel as FirePredictionPanel } from './FirePredictionPanel';
import { AIRecommendedActions as FireRecommendations } from './FireRecommendations';
import { Charts as FireCharts } from './FireCharts';
import { Map as FireMap } from './FireMap';
import { AlertNotification as FireAlertNotification } from './FireAlertNotification';
import { SensorCard as FireSensorCard } from './FireSensorCard';
import {
  Flame,
  Wind,
  Thermometer,
  Droplets,
  CloudFog,
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
  Radio,
  Sparkles,
  Compass,
  Activity
} from 'lucide-react';

interface FireDashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
}

export const FireDashboard: React.FC<FireDashboardProps> = ({
  onAcknowledgeAlert: propAcknowledge
}) => {
  // Dynamic sensors state across Bandipur - Western Ghats Reserve, India
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

  // Dynamic raw telemetry inputs (refreshes every 3 seconds)
  const primaryTemp = activeFocusSensor.temperature;
  const primaryHumidity = activeFocusSensor.humidity;
  const primarySmoke = activeFocusSensor.smokePPM;
  const primaryCO = activeFocusSensor.carbonMonoxide;
  const primaryWind = activeFocusSensor.windSpeed;

  // 15–30 Minute Wildfire Thermal Cycle Timeline (simulated minutes 0m to 30m)
  const [cycleMinute, setCycleMinute] = useState<number>(14);

  // Overall Hazard Classification & Risk Scoring:
  // Dynamically and continuously computed DIRECTLY from the live telemetry readings
  const primaryRiskTier = useMemo<FireRiskTier>(() => {
    return classifyFireRisk(primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWind);
  }, [primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWind]);

  const primaryRiskScore = useMemo<number>(() => {
    return calculateFireRiskScore(primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWind);
  }, [primaryTemp, primaryHumidity, primarySmoke, primaryCO, primaryWind]);

  // Unified automatic state machine: computes EXTREME, HIGH, MODERATE, or LOW directly from the reading's risk tier
  const activeState = useMemo<FireRiskTier>(() => {
    return primaryRiskTier;
  }, [primaryRiskTier]);

  const riskMeta = FIRE_RISK_COLORS[primaryRiskTier] || FIRE_RISK_COLORS.LOW;

  // AI 1h to 24h Prediction (based on evaluated hazard classification)
  const prediction = useMemo(
    () => getAIFirePrediction(primaryRiskScore, primaryTemp, primaryHumidity, primarySmoke, primaryWind),
    [primaryRiskScore, primaryTemp, primaryHumidity, primarySmoke, primaryWind]
  );

  // Dynamic AI Recommended Actions strictly based on user rules
  const recommendedActions = useMemo(
    () => getAIFireRecommendations(primaryRiskTier),
    [primaryRiskTier]
  );

  // Dynamic alerts generated based on evaluated hazard conditions
  const [alerts, setAlerts] = useState<FireAlert[]>(() =>
    generateDynamicFireAlerts(primaryRiskTier, primaryTemp, primarySmoke, primaryCO, primaryWind)
  );

  // Synchronize alerts whenever evaluated risk or telemetry changes
  useEffect(() => {
    setAlerts(generateDynamicFireAlerts(primaryRiskTier, primaryTemp, primarySmoke, primaryCO, primaryWind));
  }, [primaryRiskTier, primaryTemp, primarySmoke, primaryCO, primaryWind]);

  // Real-time time series data
  const [historicalData, setHistoricalData] = useState<HistoricalFireReading[]>(() =>
    generateHistoricalFireData(16, primaryTemp, primaryHumidity, primarySmoke)
  );

  // Acknowledge Alert Handler
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    if (propAcknowledge) propAcknowledge(alertId);
  };

  /**
   * 15–30 Minute Forest Fire Diurnal Weather Cycle Model:
   * Computes realistic canopy temperature, relative humidity, wind speed, and smoke ppm over a 30-minute progression.
   * - Minutes 0m - 9m: Morning Baseline / Safe (Low < 30°C, Humidity > 45%, Smoke < 25 ppm) -> LOW
   * - Minutes 9m - 19m: Midday Heat Buildup / Watch (Moderate 30 - 36°C, Humidity 30 - 45%, Smoke 25 - 60 ppm) -> MODERATE
   * - Minutes 19m - 26m: Peak Afternoon Thermal Surge / Breakout (High/Extreme > 38°C, Humidity < 20%, Smoke > 80 ppm) -> HIGH / EXTREME
   * - Minutes 26m - 30m: Evening Suppression / Cool Down (waters/cool winds return to baseline) -> MODERATE -> LOW
   */
  const getCycleBasinTarget = (minute: number) => {
    const norm = ((minute % 30) + 30) % 30;
    if (norm < 9) {
      const p = norm / 9;
      return {
        temperature: 24.5 + p * 4.5,
        humidity: 62 - p * 15,
        smokePPM: 12 + p * 10,
        carbonMonoxide: 2.5 + p * 4.0,
        windSpeed: 10 + p * 4
      };
    } else if (norm < 19) {
      const p = (norm - 9) / 10;
      return {
        temperature: 29.0 + p * 6.5,
        humidity: 47 - p * 17,
        smokePPM: 22 + p * 32,
        carbonMonoxide: 6.5 + p * 7.5,
        windSpeed: 14 + p * 6
      };
    } else if (norm < 26) {
      const p = (norm - 19) / 7;
      return {
        temperature: 35.5 + p * 7.5,
        humidity: 30 - p * 15,
        smokePPM: 54 + p * 75,
        carbonMonoxide: 14.0 + p * 14.0,
        windSpeed: 20 + p * 10
      };
    } else {
      const p = (norm - 26) / 4;
      return {
        temperature: 43.0 - p * 18.5,
        humidity: 15 + p * 47,
        smokePPM: 129 - p * 117,
        carbonMonoxide: 28.0 - p * 25.5,
        windSpeed: 30 - p * 20
      };
    }
  };

  /**
   * CONTINUOUS LIVE TELEMETRY SIMULATION (Ticks every 3 seconds):
   * Moves each sensor towards the dynamic basin target curve with realistic micro-jitter.
   */
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setCycleMinute(prevMin => {
        const nextMin = (prevMin + 0.15) % 30;
        const target = getCycleBasinTarget(nextMin);

        setSensors(prevSensors =>
          prevSensors.map(sensor => {
            const isTarget = sensor.id === activeFocusSensor.id;
            const jitterTemp = (Math.random() - 0.48) * 0.4;
            const jitterHum = (Math.random() - 0.5) * 0.8;
            const jitterSmoke = (Math.random() - 0.48) * 2.5;
            const jitterCO = (Math.random() - 0.48) * 0.6;
            const jitterWind = (Math.random() - 0.5) * 1.0;

            const baseT = isTarget ? target.temperature : sensor.temperature;
            const baseH = isTarget ? target.humidity : sensor.humidity;
            const baseS = isTarget ? target.smokePPM : sensor.smokePPM;
            const baseCO = isTarget ? target.carbonMonoxide : sensor.carbonMonoxide;
            const baseW = isTarget ? target.windSpeed : sensor.windSpeed;

            const newTemp = Math.max(18, Math.min(48, parseFloat((baseT + jitterTemp).toFixed(1))));
            const newHum = Math.max(10, Math.min(90, Math.round(baseH + jitterHum)));
            const newSmoke = Math.max(2, Math.min(220, Math.round(baseS + jitterSmoke)));
            const newCO = Math.max(0.5, Math.min(45, parseFloat((baseCO + jitterCO).toFixed(1))));
            const newWind = Math.max(4, Math.min(50, Math.round(baseW + jitterWind)));

            const newTier = classifyFireRisk(newTemp, newHum, newSmoke, newCO, newWind);
            const newScore = calculateFireRiskScore(newTemp, newHum, newSmoke, newCO, newWind);

            return {
              ...sensor,
              temperature: newTemp,
              humidity: newHum,
              smokePPM: newSmoke,
              carbonMonoxide: newCO,
              windSpeed: newWind,
              riskTier: newTier,
              riskScore: newScore,
              lastPing: new Date().toISOString()
            };
          })
        );

        // Update historical chart time series
        setHistoricalData(prevData => {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newPt: HistoricalFireReading = {
            timestamp: nowStr,
            temperature: target.temperature,
            humidity: target.humidity,
            smokePPM: target.smokePPM,
            windSpeed: target.windSpeed,
            riskScore: calculateFireRiskScore(target.temperature, target.humidity, target.smokePPM, target.carbonMonoxide, target.windSpeed)
          };
          return [...prevData.slice(1), newPt];
        });

        return nextMin;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, activeFocusSensor.id]);

  // Synchronize selected sensor reference with updated sensors array
  useEffect(() => {
    if (selectedSensor) {
      const updated = sensors.find(s => s.id === selectedSensor.id);
      if (updated) setSelectedSensor(updated);
    }
  }, [sensors]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (alertSeverityFilter === 'ALL') return true;
      return a.severity === alertSeverityFilter;
    });
  }, [alerts, alertSeverityFilter]);

  // Filtered Sensors
  const filteredSensors = useMemo(() => {
    return sensors.filter(s => {
      if (sensorHealthFilter === 'ALL') return true;
      if (sensorHealthFilter === 'ONLINE') return s.status === 'ONLINE';
      if (sensorHealthFilter === 'ALERTING') return s.riskTier === 'HIGH' || s.riskTier === 'EXTREME';
      return true;
    });
  }, [sensors, sensorHealthFilter]);

  // Tactical response label
  const disasterResponse = useMemo(() => {
    if (primaryRiskTier === 'EXTREME') return 'STAGE 4 EVACUATION & AIR SUPPRESSION';
    if (primaryRiskTier === 'HIGH') return 'STAGE 3 RESPONSE SQUADS MOBILIZED';
    if (primaryRiskTier === 'MODERATE') return 'STAGE 2 RANGER PATROLS ACCELERATED';
    return 'STAGE 1 ROUTINE AI SURVEILLANCE';
  }, [primaryRiskTier]);

  // Subtitles for Section 1 telemetry cards
  const tempSubtitle = primaryTemp >= 40.0 ? 'Critical Heat Threshold' : primaryTemp >= 35.0 ? 'Elevated Heat Wave' : 'Optimal Canopy Range';
  const humidityStatus = primaryHumidity <= 20 ? 'Critical Desiccation' : primaryHumidity <= 35 ? 'Accelerated Drying' : 'Normal Moisture Level';
  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningAlertsCount = alerts.filter(a => a.severity === 'HIGH').length;

  // Export SITREP JSON Report
  const handleExportData = () => {
    const report = {
      title: 'EcoGuard Wildfire Detection & Perimeter Spread SITREP',
      timestamp: new Date().toISOString(),
      forestZone: 'Bandipur - Western Ghats Reserve (Karnataka, India)',
      evaluation: {
        activeState,
        riskScore: primaryRiskScore,
        riskTier: primaryRiskTier,
        cycleMinute: Math.round(cycleMinute)
      },
      currentReadings: {
        temperature: `${primaryTemp}°C`,
        humidity: `${primaryHumidity}%`,
        smokePPM: `${primarySmoke} ppm`,
        carbonMonoxide: `${primaryCO} ppm`,
        windSpeed: `${primaryWind} km/h`,
        affectedHectares: `${prediction.affectedAreaHectares} ha`,
        predictedSpread24h: `${prediction.predictedSpreadHectares} ha`
      },
      sensors,
      activeAlerts: alerts,
      recommendedActions
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
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
            <Flame size={30} className="text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                ● EARLY WARNING WILDFIRE DISASTER SYSTEM
              </span>
              <span className="text-slate-600 text-xs hidden sm:inline">|</span>
              <span className="text-xs text-orange-400 font-semibold tracking-wide hidden sm:inline">
                NATIONAL FOREST RISK REDUCTION PLATFORM
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
              FOREST FIRE DETECTION MONITORING
            </h1>
          </div>
        </div>

        {/* System-Detected State Machine: Extreme, High, Moderate, Low in one dynamic detector */}
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
                ? 'EXTREME (CRITICAL)'
                : activeState === 'HIGH'
                ? 'HIGH FIRE RISK'
                : activeState === 'MODERATE'
                ? 'MODERATE WATCH'
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
            onClick={handleExportData}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} />
            <span>EXPORT SITREP</span>
          </button>
        </div>
      </div>

      {/* Dynamic Alert Banner: Automatically updates to match active wildfire risk state */}
      {primaryRiskTier === 'EXTREME' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-red-500/15 border-red-500/55">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-500/25 text-red-400 animate-bounce">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                  ⚠️ ACTIVE WILDFIRE BREAKOUT PROTOCOL STAGE 2
                </span>
                <span className="text-xs text-slate-400">· Helitack Aerial Suppression & Ground Crews Mobilized</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Bandipur Sentinel Station recorded canopy temperature at <strong>{primaryTemp.toFixed(1)}°C</strong> with smoke concentration at <strong>{primarySmoke} ppm</strong>. Flamefront advancing towards eastern perimeter.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white animate-pulse shadow-md">
            CRITICAL WILDFIRE CODE #991
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
                  ⚠️ WILDFIRE HIGH RISK ADVISORY · Rapid Thermal Escalation Detected
                </span>
                <span className="text-xs text-slate-400">· Emergency Response Squads On Standby</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Canopy temperature elevated to <strong>{primaryTemp.toFixed(1)}°C</strong> with desiccated humidity at <strong>{primaryHumidity}%</strong>. Quick-response wildfire strike squads placed on 10-minute standby.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-orange-600 text-white shadow-md">
            ORANGE ALERT CODE #620
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
                  ℹ️ WILDFIRE WEATHER WATCH NOTICE · Elevated Dryness & Heat Advisory
                </span>
                <span className="text-xs text-slate-400">· Monitoring Polling Accelerated</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Daytime heat index at <strong>{primaryTemp.toFixed(1)}°C</strong> and relative humidity declining to <strong>{primaryHumidity}%</strong>. Forest patrol frequency doubled across high fuel-accumulation sectors.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-600 text-white shadow-md">
            YELLOW WATCH CODE #340
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
                  ✓ ALL FOREST SECTORS NOMINAL · Continuous AI Wildfire Surveillance Active
                </span>
                <span className="text-xs text-slate-400">· Optimal Microclimate Baseline</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Ambient canopy temperature <strong>{primaryTemp.toFixed(1)}°C</strong> and relative humidity <strong>{primaryHumidity}%</strong> remain within safe seasonal limits.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-md">
            ALL NOMINAL CODE #100
          </span>
        </div>
      )}

      {/* ========================================================
          SECTION 1: TOP SUMMARY CARDS (4 CARDS GRID)
          1. Current Temperature
          2. Current Humidity
          3. Current Fire Risk Level
          4. Number of Active Alerts
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
                  Thermal Canopy Sensor
                </span>
                <div className="text-base font-bold text-white mt-0.5">Canopy Temperature</div>
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
                <span>▲ Max Today: {activeFocusSensor.maxTempToday.toFixed(1)}°C</span>
                <span className="text-slate-500">· {tempSubtitle}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Critical Heat Limit:</span>
              <strong className="text-red-400 font-mono">40.0°C</strong>
            </div>
          </div>

          {/* Card 2: Current Relative Humidity */}
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
                  Atmospheric Moisture
                </span>
                <div className="text-base font-bold text-white mt-0.5">Relative Humidity</div>
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
                <span className="text-sm font-semibold text-slate-400">% RH</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mt-1">
                <span>{humidityStatus}</span>
                <span className="text-slate-500">· Smoke: {primarySmoke} ppm</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Desiccation Danger:</span>
              <strong className="text-amber-400 font-mono">&lt; 25% RH</strong>
            </div>
          </div>

          {/* Card 3: Current Fire Risk Level */}
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
                  ? 'Active Crown Combustion Imminent'
                  : primaryRiskTier === 'HIGH'
                  ? 'Rapid Wind-Driven Surface Spread'
                  : primaryRiskTier === 'MODERATE'
                  ? 'Thermal Spotting & Smolder Watch'
                  : 'Nominal Forest Baseline'}
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Disaster Response:</span>
              <strong style={{ color: riskMeta.text }} className="font-semibold">{disasterResponse}</strong>
            </div>
          </div>

          {/* Card 4: Number of Active Alerts */}
          <div
            className="field-panel p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(150deg, rgba(30,15,15,0.95) 0%, rgba(15,10,10,0.98) 100%)',
              border: alerts.length > 0 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: alerts.length > 0 ? '0 8px 24px rgba(239,68,68,0.15)' : 'none'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-red-400 tracking-wider">
                  Emergency Dispatch
                </span>
                <div className="text-base font-bold text-white mt-0.5">Number of Active Alerts</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <BellRing size={20} className={alerts.length > 0 ? 'animate-bounce' : ''} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-red-400 font-mono tracking-tight">
                  {alerts.length}
                </span>
                <span className="text-sm font-semibold text-slate-400">Active Incidents</span>
              </div>
              <div className="text-xs text-red-300 mt-1">
                <strong>{criticalAlertsCount} Critical Hazards</strong> · {warningAlertsCount} Warning
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Avg Emergency Response:</span>
              <strong className="text-emerald-400 font-semibold">&lt; 5 minutes</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: FIRE RISK INDICATOR (LARGE VISUAL GAUGE - FULL WIDTH)
         ======================================================== */}
      <div>
        <FireGauge
          score={primaryRiskScore}
          tier={primaryRiskTier}
          temperature={primaryTemp}
          humidity={primaryHumidity}
          smokePPM={primarySmoke}
          windSpeed={primaryWind}
        />
      </div>

      {/* ========================================================
          SECTION 3: AI FOREST FIRE SPREAD PREDICTION PANEL (FULL WIDTH)
         ======================================================== */}
      <div>
        <FirePredictionPanel prediction={prediction} />
      </div>

      {/* ========================================================
          SECTIONS 4 & 5: TEMPERATURE & HUMIDITY/WIND TREND CHARTS (FULL WIDTH)
         ======================================================== */}
      <div>
        <FireCharts
          historicalData={historicalData}
          criticalTempThreshold={40.0}
          warningTempThreshold={35.0}
          criticalHumidityThreshold={25.0}
        />
      </div>

      {/* ========================================================
          SECTION 6: INTERACTIVE FOREST FIRE RISK MAP (FULL WIDTH)
         ======================================================== */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Layers size={14} /> SECTION 6 · GEOSPATIAL WILDFIRE SENSOR NETWORK
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Forest Fire Spread Map
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            Displaying all {sensors.length} sentinel stations, active fire perimeter & nearby villages across Bandipur Reserve
          </span>
        </div>

        <FireMap
          sensors={sensors}
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
        />
      </div>

      {/* ========================================================
          SECTION 7: ACTIVE WILDFIRE ALERTS SECTION (FULL WIDTH)
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
                SECTION 7 · EMERGENCY TELEMETRY DISPATCH FEED
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Active Hazard Alerts ({alerts.length})
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
              No active alerts matching filter. All monitored forest sectors nominal.
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <FireAlertNotification
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
        <FireRecommendations
          actions={recommendedActions}
          riskTier={primaryRiskTier}
        />
      </div>

      {/* ========================================================
          SECTION 9: FOREST SENTINEL SENSOR NETWORK (FULL WIDTH)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(249,115,22,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Cpu size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                SECTION 9 · FIELD IOT SENSOR NETWORK
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Bandipur Reserve Sentinel Stations ({sensors.length} Stations Active)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
              {(['ALL', 'ONLINE', 'ALERTING'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSensorHealthFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    sensorHealthFilter === f
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6 Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSensors.map(sensor => (
            <FireSensorCard
              key={sensor.id}
              sensor={sensor}
              isSelected={activeFocusSensor.id === sensor.id}
              onSelect={s => setSelectedSensor(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FireDashboard;
