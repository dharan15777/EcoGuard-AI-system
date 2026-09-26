import React, { useState, useEffect, useMemo } from 'react';
import { FloodSensor, FloodAlert, HistoricalReading } from '../types/flood';
import {
  INITIAL_FLOOD_SENSORS,
  generateHistoricalData,
  getAIPrediction,
  getAIRecommendedActions,
  generateDynamicAlerts,
  classifyFloodRisk,
  calculateRiskScore,
  RISK_COLORS
} from '../utils/floodConstants';
import { FloodGauge } from './FloodGauge';
import { AIPredictionPanel } from './AIPredictionPanel';
import { AIRecommendedActions } from './AIRecommendedActions';
import { Charts } from './Charts';
import { Map } from './Map';
import { AlertNotification } from './AlertNotification';
import { SensorCard } from './SensorCard';
import {
  Waves,
  CloudRain,
  ShieldAlert,
  BellRing,
  Play,
  Pause,
  Download,
  Sliders,
  Filter,
  CheckCircle2,
  Cpu,
  Layers,
  Info,
  ShieldCheck,
  AlertTriangle
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
  // Scenario state: 'SURGE' (Danger), 'MODERATE' (Watch), 'SAFE' (Normal)
  const [activeScenario, setActiveScenario] = useState<'SURGE' | 'MODERATE' | 'SAFE'>('SURGE');

  // Core real-time input telemetry for primary node (Pine River Alpha)
  const [telemetry, setTelemetry] = useState({
    waterLevel: 4.78, // m
    rainfallRate: 50.9, // mm/hr
    riseRate: 0.38, // m/hr
    soilMoisture: 94, // %
    riverFlowRate: 340 // m³/s
  });

  // Dynamic sensors state across the entire basin
  const [sensors, setSensors] = useState<FloodSensor[]>(() => {
    return INITIAL_FLOOD_SENSORS.map(s => {
      const tier = classifyFloodRisk(s.waterLevel, s.rainfallRate, s.riseRate);
      const score = calculateRiskScore(s.waterLevel, s.rainfallRate, s.riseRate, s.soilMoisture);
      return { ...s, riskTier: tier, riskScore: score };
    });
  });

  const [selectedSensor, setSelectedSensor] = useState<FloodSensor | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [sensorHealthFilter, setSensorHealthFilter] = useState<'ALL' | 'ONLINE' | 'ALERTING'>('ALL');

  // Derive active focus sensor
  const activeFocusSensor = selectedSensor || sensors[0];

  // Dynamic classification based on primary telemetry inputs
  const primaryWaterLevel = activeFocusSensor.waterLevel;
  const primaryRainfall = activeFocusSensor.rainfallRate;
  const primaryRiseRate = activeFocusSensor.riseRate;
  const primarySoilMoisture = activeFocusSensor.soilMoisture;

  const primaryRiskTier = useMemo(
    () => classifyFloodRisk(primaryWaterLevel, primaryRainfall, primaryRiseRate),
    [primaryWaterLevel, primaryRainfall, primaryRiseRate]
  );

  const primaryRiskScore = useMemo(
    () => calculateRiskScore(primaryWaterLevel, primaryRainfall, primaryRiseRate, primarySoilMoisture),
    [primaryWaterLevel, primaryRainfall, primaryRiseRate, primarySoilMoisture]
  );

  const riskMeta = RISK_COLORS[primaryRiskTier] || RISK_COLORS.SAFE;

  // AI 1h to 30h Prediction
  const prediction = useMemo(
    () => getAIPrediction(primaryRiskScore, primaryWaterLevel, primaryRainfall, primaryRiseRate),
    [primaryRiskScore, primaryWaterLevel, primaryRainfall, primaryRiseRate]
  );

  // Dynamic AI Recommended Actions strictly based on user rules
  const recommendedActions = useMemo(
    () => getAIRecommendedActions(primaryRiskTier),
    [primaryRiskTier]
  );

  // Dynamic alerts generated based on current & predicted conditions
  const [alerts, setAlerts] = useState<FloodAlert[]>(() =>
    generateDynamicAlerts(primaryRiskTier, prediction, primaryWaterLevel, primaryRainfall)
  );

  // Synchronize alerts whenever risk or prediction changes
  useEffect(() => {
    setAlerts(generateDynamicAlerts(primaryRiskTier, prediction, primaryWaterLevel, primaryRainfall));
  }, [primaryRiskTier, prediction, primaryWaterLevel, primaryRainfall]);

  // Real-time time series data
  const [historicalData, setHistoricalData] = useState<HistoricalReading[]>(() =>
    generateHistoricalData(16, primaryWaterLevel, primaryRainfall)
  );

  // Acknowledge Alert Handler
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    if (propAcknowledge) propAcknowledge(alertId);
  };

  /**
   * Scenario Switcher:
   * Normal: Generate safe river conditions (water < 2.0m, rain < 10 mm/hr) -> SAFE
   * Watch: Generate moderate flood-risk conditions (water 2.0-3.5m, rain 10-25 mm/hr) -> WATCH
   * Surge: Generate severe flood-risk conditions (water > 4.2m, rain > 40 mm/hr) -> DANGER
   */
  const applyScenario = (scenario: 'SURGE' | 'MODERATE' | 'SAFE') => {
    setActiveScenario(scenario);

    if (scenario === 'SAFE') {
      const newWater = 1.75;
      const newRain = 5.2;
      const newRise = 0.02;
      const newSoil = 36;
      const newFlow = 55;

      setTelemetry({
        waterLevel: newWater,
        rainfallRate: newRain,
        riseRate: newRise,
        soilMoisture: newSoil,
        riverFlowRate: newFlow
      });

      // Update all sensors to Safe conditions
      setSensors(prev =>
        prev.map(s => {
          const w = parseFloat((1.4 + Math.random() * 0.45).toFixed(2));
          const r = parseFloat((3.0 + Math.random() * 4.5).toFixed(1));
          const t = classifyFloodRisk(w, r, 0.02);
          const sc = calculateRiskScore(w, r, 0.02, 35);
          return {
            ...s,
            waterLevel: w,
            rainfallRate: r,
            riseRate: 0.02,
            soilMoisture: 35,
            riverFlowRate: 50,
            riskTier: t,
            riskScore: sc
          };
        })
      );

      setHistoricalData(generateHistoricalData(16, newWater, newRain));
    } else if (scenario === 'MODERATE') {
      const newWater = 2.95;
      const newRain = 19.5;
      const newRise = 0.14;
      const newSoil = 66;
      const newFlow = 150;

      setTelemetry({
        waterLevel: newWater,
        rainfallRate: newRain,
        riseRate: newRise,
        soilMoisture: newSoil,
        riverFlowRate: newFlow
      });

      // Update sensors to Watch conditions
      setSensors(prev =>
        prev.map(s => {
          const isHigh = s.id === 'SN-FLD-01' || s.id === 'SN-FLD-05';
          const w = parseFloat((isHigh ? 2.9 + Math.random() * 0.3 : 2.2 + Math.random() * 0.4).toFixed(2));
          const r = parseFloat((isHigh ? 18.0 + Math.random() * 5.0 : 12.0 + Math.random() * 4.0).toFixed(1));
          const t = classifyFloodRisk(w, r, 0.12);
          const sc = calculateRiskScore(w, r, 0.12, 65);
          return {
            ...s,
            waterLevel: w,
            rainfallRate: r,
            riseRate: 0.12,
            soilMoisture: 65,
            riverFlowRate: 145,
            riskTier: t,
            riskScore: sc
          };
        })
      );

      setHistoricalData(generateHistoricalData(16, newWater, newRain));
    } else {
      // SURGE -> DANGER
      const newWater = 4.82;
      const newRain = 51.5;
      const newRise = 0.38;
      const newSoil = 94;
      const newFlow = 340;

      setTelemetry({
        waterLevel: newWater,
        rainfallRate: newRain,
        riseRate: newRise,
        soilMoisture: newSoil,
        riverFlowRate: newFlow
      });

      // Update sensors to severe Danger conditions
      setSensors(prev =>
        prev.map(s => {
          const isDanger = s.id === 'SN-FLD-01' || s.id === 'SN-FLD-06' || s.id === 'SN-FLD-02';
          const w = parseFloat((isDanger ? 4.6 + Math.random() * 0.35 : 3.6 + Math.random() * 0.3).toFixed(2));
          const r = parseFloat((isDanger ? 46.0 + Math.random() * 8.0 : 32.0 + Math.random() * 6.0).toFixed(1));
          const t = classifyFloodRisk(w, r, 0.35);
          const sc = calculateRiskScore(w, r, 0.35, 92);
          return {
            ...s,
            waterLevel: w,
            rainfallRate: r,
            riseRate: 0.35,
            soilMoisture: 92,
            riverFlowRate: 330,
            riskTier: t,
            riskScore: sc
          };
        })
      );

      setHistoricalData(generateHistoricalData(16, newWater, newRain));
    }
  };

  // Continuous 3.5s Live Telemetry Stream
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Small real-time jitter based on scenario
      const jitterFactor = activeScenario === 'SURGE' ? 0.05 : activeScenario === 'MODERATE' ? 0.03 : 0.02;

      setSensors(prev =>
        prev.map(s => {
          const jitter = (Math.random() - 0.48) * jitterFactor;
          const newLevel = Math.max(0.8, parseFloat((s.waterLevel + jitter).toFixed(2)));
          const rainJitter = (Math.random() - 0.5) * (jitterFactor * 15);
          const newRain = Math.max(0, parseFloat((s.rainfallRate + rainJitter).toFixed(1)));
          const newTier = classifyFloodRisk(newLevel, newRain, s.riseRate);
          const newScore = calculateRiskScore(newLevel, newRain, s.riseRate, s.soilMoisture);

          return {
            ...s,
            waterLevel: newLevel,
            rainfallRate: newRain,
            riskTier: newTier,
            riskScore: newScore,
            lastPing: new Date().toISOString()
          };
        })
      );

      setHistoricalData(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const last = prev[prev.length - 1];
        const newWater = parseFloat((last.waterLevel + (Math.random() - 0.48) * jitterFactor).toFixed(2));
        const newRain = parseFloat((last.rainfall + (Math.random() - 0.5) * (jitterFactor * 10)).toFixed(1));
        const newScore = calculateRiskScore(newWater, newRain);

        return [...prev.slice(1), {
          timestamp: timeStr,
          waterLevel: newWater,
          rainfall: newRain,
          riskScore: newScore
        }];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, activeScenario]);

  // Dynamic text generators for Top Summary Cards
  const getRainfallSubtitle = (rain: number) => {
    if (rain >= 40) return { title: 'Torrential Downpour', accum: '24h: 114.2mm' };
    if (rain >= 25) return { title: 'Heavy Rainfall', accum: '24h: 84.5mm' };
    if (rain >= 10) return { title: 'Moderate Rain', accum: '24h: 46.8mm' };
    return { title: 'Light Precipitation', accum: '24h: 12.4mm' };
  };

  const getWaterLevelSubtitle = (rise: number) => {
    if (rise >= 0.30) return 'Rapid Upstream Inflow';
    if (rise >= 0.15) return 'Steady Stage Elevation';
    if (rise >= 0.05) return 'Moderate Inflow';
    return 'Stable Channel Conditions';
  };

  const getDisasterResponseText = (tier: string) => {
    if (tier === 'DANGER') return 'PHASE-II ACTIVE';
    if (tier === 'WARNING') return 'TACTICAL STANDBY';
    if (tier === 'WATCH') return 'HEIGHTENED WATCH';
    return 'ROUTINE MONITORING';
  };

  const getSoilMoistureText = (moisture: number) => {
    if (moisture >= 85) return `${moisture}% Extreme`;
    if (moisture >= 65) return `${moisture}% High`;
    if (moisture >= 45) return `${moisture}% Moderate`;
    return `${moisture}% Nominal`;
  };

  const rainInfo = getRainfallSubtitle(primaryRainfall);
  const waterSubtitle = getWaterLevelSubtitle(primaryRiseRate);
  const disasterResponse = getDisasterResponseText(primaryRiskTier);
  const soilMoistureDisplay = getSoilMoistureText(primarySoilMoisture);

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
    if (sensorHealthFilter === 'ALERTING') return s.riskTier === 'DANGER' || s.riskTier === 'WARNING';
    return true;
  });

  // Export Situation Report
  const handleExportSitRep = () => {
    const sitrep = {
      reportType: 'DISASTER INCIDENT SITUATION REPORT (SITREP)',
      timestamp: new Date().toISOString(),
      basin: 'Pine River Catchment & Bay-Delta Flood Basin',
      telemetrySummary: {
        primaryWaterLevel: `${primaryWaterLevel}m`,
        primaryRainfall: `${primaryRainfall} mm/h`,
        riskScore: primaryRiskScore,
        riskTier: primaryRiskTier,
        activeAlertsCount: activeAlerts.length,
      },
      aiPrediction: {
        confidence: `${prediction.confidence}%`,
        currentRisk: prediction.currentRisk,
        predictedRisk24h: prediction.predictedRisk24h,
        reason: prediction.reason,
        peakCrestForecast: `${prediction.projectedPeakLevel}m at ${prediction.projectedPeakTime}`,
      },
      sensors: sensors.map(s => ({
        id: s.id,
        name: s.name,
        waterLevel: s.waterLevel,
        rainfall: s.rainfallRate,
        battery: s.batteryLevel,
        status: s.status,
        riskTier: s.riskTier
      }))
    };

    const blob = new Blob([JSON.stringify(sitrep, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoGuard_Flood_SITREP_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1700px] mx-auto w-full pb-14 font-sans">
      {/* ========================================================
          DISASTER OPERATIONS COMMAND CONSOLE HEADER
         ======================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Waves size={30} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                ● EARLY WARNING DISASTER SYSTEM
              </span>
              <span className="text-slate-600 text-xs hidden sm:inline">|</span>
              <span className="text-xs text-cyan-400 font-semibold tracking-wide hidden sm:inline">
                NATIONAL DISASTER RISK REDUCTION PLATFORM
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
              Hydrological Flood Monitoring & Edge-AI Inundation System
            </h1>
          </div>
        </div>

        {/* Existing Simulation Buttons: Surge, Watch, Normal */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-950/90 p-1.5 rounded-xl border border-white/10 text-xs shadow-inner">
            <span className="text-[11px] text-slate-400 uppercase px-2 font-bold flex items-center gap-1.5">
              <Sliders size={13} className="text-cyan-400" /> SIMULATION:
            </span>
            <button
              onClick={() => applyScenario('SURGE')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                activeScenario === 'SURGE' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Surge
            </button>
            <button
              onClick={() => applyScenario('MODERATE')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                activeScenario === 'MODERATE' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Watch
            </button>
            <button
              onClick={() => applyScenario('SAFE')}
              className={`px-3 py-1 rounded-lg transition-all font-bold ${
                activeScenario === 'SAFE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal
            </button>
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
            {isLiveStreaming ? 'LIVE TICK (3.5s)' : 'PAUSED'}
          </button>

          <button
            onClick={handleExportSitRep}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={14} /> Export SITREP
          </button>
        </div>
      </div>

      {/* Dynamic Alert Banner: Automatically updates to match active risk state */}
      {primaryRiskTier === 'DANGER' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-red-500/15 border-red-500/55">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-500/25 text-red-400 animate-bounce">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                  ⚠️ ACTIVE FLOOD EVACUATION PROTOCOL STAGE 2
                </span>
                <span className="text-xs text-slate-400">· District Disaster Response Activated</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Pine River Hydro Node Alpha recorded stage height at <strong>{primaryWaterLevel.toFixed(2)}m</strong> (breaching 4.20m max safety limit). Inundation peak expected within 45 minutes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white animate-pulse shadow-md">
            RED ALERT CODE #882
          </span>
        </div>
      )}

      {primaryRiskTier === 'WARNING' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-orange-500/15 border-orange-500/50">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-orange-500/25 text-orange-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-orange-400 tracking-wider">
                  ⚠️ FLOOD WARNING ADVISORY · Rapid River Rise Detected
                </span>
                <span className="text-xs text-slate-400">· Emergency Response Standby</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Water level reached <strong>{primaryWaterLevel.toFixed(2)}m</strong> (approaching 4.20m danger limit). Quick-response boat squads and mobile pumps placed on 15-minute standby.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-orange-600 text-white shadow-md">
            ORANGE ALERT CODE #540
          </span>
        </div>
      )}

      {primaryRiskTier === 'WATCH' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-amber-500/10 border-amber-500/40">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Info size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  ℹ️ HYDROLOGICAL WATCH NOTICE · Catchment Precipitation Advisory
                </span>
                <span className="text-xs text-slate-400">· Monitoring Polling Accelerated</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                River stage elevated to <strong>{primaryWaterLevel.toFixed(2)}m</strong> with rainfall rate <strong>{primaryRainfall.toFixed(1)} mm/h</strong>. Polling frequency increased to 1-minute automated sync.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-600 text-white shadow-md">
            YELLOW WATCH CODE #210
          </span>
        </div>
      )}

      {primaryRiskTier === 'SAFE' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-emerald-500/10 border-emerald-500/35">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                  ✓ ALL BASIN SECTORS NOMINAL · Continuous AI Surveillance Active
                </span>
                <span className="text-xs text-slate-400">· Seasonal Hydrological Baseline</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Current water level <strong>{primaryWaterLevel.toFixed(2)}m</strong> and rainfall rate <strong>{primaryRainfall.toFixed(1)} mm/h</strong> remain well below watch thresholds.
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
          1. Current Water Level
          2. Current Rainfall
          3. Current Flood Risk Level
          4. Number of Active Alerts
         ======================================================== */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-3 px-1">
          SECTION 1 · REAL-TIME TELEMETRIC SUMMARY
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Water Level */}
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
                  Hydrological Sensor
                </span>
                <div className="text-base font-bold text-white mt-0.5">Current Water Level</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Waves size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-cyan-300 font-mono tracking-tight">
                  {primaryWaterLevel.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-400">meters</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mt-1">
                <span>▲ +{primaryRiseRate.toFixed(2)} m/hr</span>
                <span className="text-slate-500">· {waterSubtitle}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Danger Limit:</span>
              <strong className="text-red-400 font-mono">{activeFocusSensor.floodThreshold.toFixed(2)}m</strong>
            </div>
          </div>

          {/* Card 2: Current Rainfall */}
          <div
            className="field-panel p-5 rounded-xl relative overflow-hidden flex flex-col justify-between"
            style={{
              background: 'linear-gradient(150deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
              border: '1px solid rgba(129,140,248,0.3)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider">
                  Precipitation Gauge
                </span>
                <div className="text-base font-bold text-white mt-0.5">Current Rainfall</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <CloudRain size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-indigo-300 font-mono tracking-tight">
                  {primaryRainfall.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">mm/hr</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mt-1">
                <span>{rainInfo.title}</span>
                <span className="text-slate-500">· {rainInfo.accum}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Runoff Saturation:</span>
              <strong className="text-amber-400 font-mono">{soilMoistureDisplay}</strong>
            </div>
          </div>

          {/* Card 3: Current Flood Risk Level */}
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
                <div className="text-base font-bold text-white mt-0.5">Current Flood Risk Level</div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: riskMeta.bg, border: `1px solid ${riskMeta.border}` }}
              >
                <ShieldAlert size={20} color={riskMeta.color} />
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
                {primaryRiskTier === 'DANGER'
                  ? 'Severe Inundation Imminent'
                  : primaryRiskTier === 'WARNING'
                  ? 'Spillway & River Surge Warning'
                  : primaryRiskTier === 'WATCH'
                  ? 'Heightened Basin Watch'
                  : 'Catchment Flow Nominal'}
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
              border: activeAlerts.length > 0 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: activeAlerts.length > 0 ? '0 8px 24px rgba(239,68,68,0.15)' : 'none'
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
                <BellRing size={20} className={activeAlerts.length > 0 ? 'animate-bounce' : ''} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-red-400 font-mono tracking-tight">
                  {activeAlerts.length}
                </span>
                <span className="text-sm font-semibold text-slate-400">Active Incidents</span>
              </div>
              <div className="text-xs text-red-300 mt-1">
                <strong>{criticalAlertsCount} Critical Hazards</strong> · {warningAlertsCount} Warning
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Avg Emergency Response:</span>
              <strong className="text-emerald-400 font-semibold">&lt; 4 minutes</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: FLOOD RISK INDICATOR (LARGE VISUAL GAUGE)
         ======================================================== */}
      <div>
        <FloodGauge
          score={primaryRiskScore}
          tier={primaryRiskTier}
          waterLevel={primaryWaterLevel}
          rateOfRise={primaryRiseRate}
        />
      </div>

      {/* ========================================================
          SECTION 3: AI FLOOD PREDICTION PANEL (1h to 30h FORECAST)
         ======================================================== */}
      <div>
        <AIPredictionPanel prediction={prediction} />
      </div>

      {/* ========================================================
          SECTIONS 4 & 5: WATER LEVEL TREND CHART & RAINFALL TREND CHART
         ======================================================== */}
      <div>
        <Charts
          historicalData={historicalData}
          floodThreshold={activeFocusSensor.floodThreshold}
          warningThreshold={activeFocusSensor.warningThreshold}
          heavyRainThreshold={35.0}
        />
      </div>

      {/* ========================================================
          SECTION 6: INTERACTIVE FLOOD RISK MAP (FULL WIDTH)
         ======================================================== */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers size={14} /> SECTION 6 · GEOSPATIAL HYDROLOGY NETWORK
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Flood Risk Map
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            Displaying all {sensors.length} sensor locations across river basin and dam spillways
          </span>
        </div>

        <Map
          sensors={sensors}
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
        />
      </div>

      {/* ========================================================
          SECTION 7: ACTIVE ALERTS SECTION (FULL WIDTH)
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
                Active Hazard Alerts ({activeAlerts.length})
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
              No active alerts matching filter. All monitored sectors nominal.
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
                SECTION 9 · HYDROLOGICAL SENSOR NETWORK STATUS
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
                sensorHealthFilter === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
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
              Elevated Risk ({sensors.filter(s => s.riskTier === 'DANGER' || s.riskTier === 'WARNING').length})
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
