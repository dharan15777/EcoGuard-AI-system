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
  Sparkles
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
      // Low / Safe Baseline
      const p = norm / 9;
      return {
        temperature: 24.5 + p * 4.5, // 24.5°C -> 29.0°C
        humidity: 62 - p * 15, // 62% -> 47%
        smokePPM: 12 + p * 10, // 12 -> 22 ppm
        carbonMonoxide: 2.5 + p * 4.0, // 2.5 -> 6.5 ppm
        windSpeed: 10 + p * 4 // 10 -> 14 km/h
      };
    } else if (norm < 19) {
      // Moderate Heat / Active Watch
      const p = (norm - 9) / 10;
      return {
        temperature: 29.0 + p * 6.5, // 29.0°C -> 35.5°C
        humidity: 47 - p * 17, // 47% -> 30%
        smokePPM: 22 + p * 32, // 22 -> 54 ppm
        carbonMonoxide: 6.5 + p * 7.5, // 6.5 -> 14.0 ppm
        windSpeed: 14 + p * 6 // 14 -> 20 km/h
      };
    } else if (norm < 26) {
      // Critical Surge / Extreme Wildfire
      const p = (norm - 19) / 7;
      return {
        temperature: 35.5 + p * 7.5, // 35.5°C -> 43.0°C
        humidity: 30 - p * 15, // 30% -> 15%
        smokePPM: 54 + p * 75, // 54 -> 129 ppm
        carbonMonoxide: 14.0 + p * 14.0, // 14.0 -> 28.0 ppm
        windSpeed: 20 + p * 10 // 20 -> 30 km/h
      };
    } else {
      // Evening Suppression / Rapid Cool Down
      const p = (norm - 26) / 4;
      return {
        temperature: 43.0 - p * 18.5, // 43.0°C -> 24.5°C
        humidity: 15 + p * 47, // 15% -> 62%
        smokePPM: 129 - p * 117, // 129 -> 12 ppm
        carbonMonoxide: 28.0 - p * 25.5, // 28.0 -> 2.5 ppm
        windSpeed: 30 - p * 20 // 30 -> 10 km/h
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
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 transition-all shadow-sm"
          >
            <Download size={14} />
            <span>EXPORT SITREP</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTIONS 1 & 3: FIRE RISK GAUGE + AI INFERENCE PREDICTION
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SECTION 1: Wildfire Risk Assessment Gauge + Real-Time Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <FireGauge
            score={primaryRiskScore}
            tier={primaryRiskTier}
            temperature={primaryTemp}
            humidity={primaryHumidity}
            smokePPM={primarySmoke}
            windSpeed={primaryWind}
          />
        </div>

        {/* SECTION 3: AI Inference Wildfire Spread Prediction */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <FirePredictionPanel prediction={prediction} />
        </div>
      </div>

      {/* ========================================================
          SECTIONS 4 & 5: REAL-TIME CHARTS & INTERACTIVE BANDIPUR MAP
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SECTION 4: Dual Environmental Trends Charts */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <FireCharts
            historicalData={historicalData}
            criticalTempThreshold={40.0}
            warningTempThreshold={35.0}
            criticalHumidityThreshold={25.0}
          />
        </div>

        {/* SECTION 5: Interactive Bandipur - Western Ghats Forest Map */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <FireMap
            sensors={sensors}
            selectedSensor={selectedSensor}
            onSelectSensor={sensor => setSelectedSensor(sensor)}
          />
        </div>
      </div>

      {/* ========================================================
          SECTIONS 6 & 7: ACTIVE ALERTS & AI RECOMMENDED ACTIONS
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SECTION 6: Active Wildfire Alerts & Notifications */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className="field-panel p-6 rounded-xl flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
            }}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/70 border border-red-500/40 flex items-center justify-center text-red-400">
                  <BellRing size={20} className="text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                      <Sparkles size={12} /> SECTION 6 · EMERGENCY OPERATIONS
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Active Wildfire Alerts ({filteredAlerts.length})
                  </h2>
                </div>
              </div>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-white/10 text-xs">
                {(['ALL', 'CRITICAL', 'HIGH'] as const).map(sev => (
                  <button
                    key={sev}
                    onClick={() => setAlertSeverityFilter(sev)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      alertSeverityFilter === sev
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts List */}
            <div className="flex flex-col gap-3.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 border border-dashed border-white/10 rounded-xl">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2 opacity-80" />
                  <div className="text-sm font-bold text-slate-300">No Active Wildfire Alerts</div>
                  <div className="text-xs text-slate-500 mt-1">All forest sectors operating below thermal alert thresholds.</div>
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
        </div>

        {/* SECTION 7: AI Recommended Tactical Incident Actions */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <FireRecommendations
            actions={recommendedActions}
            riskTier={primaryRiskTier}
          />
        </div>
      </div>

      {/* ========================================================
          SECTION 8: FOREST MULTI-SENSOR NETWORK TELEMETRY NODES
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col gap-5"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-950/70 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Radio size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                  <Sparkles size={12} /> SECTION 8 · FIELD IOT SENSOR NETWORK
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Bandipur Reserve Sentinel Stations ({filteredSensors.length} Nodes Active)
              </h2>
            </div>
          </div>

          {/* Node Health Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-white/10 text-xs">
              {(['ALL', 'ONLINE', 'ALERTING'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSensorHealthFilter(f)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
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
