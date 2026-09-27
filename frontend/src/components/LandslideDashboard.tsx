import React, { useState, useEffect, useMemo } from 'react';
import {
  LandslideSensor,
  LandslideAlert,
  HistoricalLandslideReading,
  LandslideRiskTier,
  LandslideImpactAssessment
} from '../types/landslide';
import {
  INITIAL_LANDSLIDE_SENSORS,
  generateHistoricalLandslideData,
  getAILandslidePrediction,
  getAILandslideImpact,
  getAILandslideRecommendations,
  generateDynamicLandslideAlerts,
  classifyLandslideRisk,
  calculateLandslideRiskScore,
  classifySoilSaturation,
  classifyVibration,
  classifyDisplacement,
  LANDSLIDE_RISK_COLORS
} from '../utils/landslideConstants';
import { LandslideGauge } from './LandslideGauge';
import { LandslidePredictionPanel } from './LandslidePredictionPanel';
import { LandslideImpactSection } from './LandslideImpactSection';
import { LandslideCharts } from './LandslideCharts';
import { LandslideMap } from './LandslideMap';
import { LandslideAlertNotification } from './LandslideAlertNotification';
import { LandslideSensorCard } from './LandslideSensorCard';
import { LandslideRecommendations } from './LandslideRecommendations';
import {
  Mountain,
  Droplets,
  CloudRain,
  Move,
  Activity,
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

interface LandslideDashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
}

export const LandslideDashboard: React.FC<LandslideDashboardProps> = ({
  onAcknowledgeAlert: propAcknowledge
}) => {
  // Dynamic sensors state across Wayanad Escarpment - Western Ghats, Kerala (India)
  const [sensors, setSensors] = useState<LandslideSensor[]>(() => {
    return INITIAL_LANDSLIDE_SENSORS.map(s => {
      const tier = classifyLandslideRisk(s.soilMoisture, s.rainfallRate, s.groundDisplacement, s.groundVibration, s.slopeTiltAngle);
      const score = calculateLandslideRiskScore(s.soilMoisture, s.rainfallRate, s.groundDisplacement, s.groundVibration, s.slopeTiltAngle);
      return { ...s, riskTier: tier, riskScore: score };
    });
  });

  const [selectedSensor, setSelectedSensor] = useState<LandslideSensor | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [sensorHealthFilter, setSensorHealthFilter] = useState<'ALL' | 'ONLINE' | 'ALERTING'>('ALL');

  // Derive active focus sensor
  const activeFocusSensor = selectedSensor || sensors[0];

  // Dynamic raw telemetry inputs (refreshes every 3 seconds)
  const primaryMoisture = activeFocusSensor.soilMoisture;
  const primaryRainRate = activeFocusSensor.rainfallRate;
  const primaryRain24h = activeFocusSensor.rainfall24h;
  const primaryDisplacement = activeFocusSensor.groundDisplacement;
  const primaryVibration = activeFocusSensor.groundVibration;
  const primaryTilt = activeFocusSensor.slopeTiltAngle;

  // 15–30 Minute Rainfall & Geotechnical Seepage Cycle (simulated minutes 0m to 30m)
  const [cycleMinute, setCycleMinute] = useState<number>(14);

  // Overall Hazard Classification & Risk Scoring:
  // Dynamically and continuously computed DIRECTLY from the live telemetry readings
  const primaryRiskTier = useMemo<LandslideRiskTier>(() => {
    return classifyLandslideRisk(primaryMoisture, primaryRainRate, primaryDisplacement, primaryVibration, primaryTilt);
  }, [primaryMoisture, primaryRainRate, primaryDisplacement, primaryVibration, primaryTilt]);

  const primaryRiskScore = useMemo<number>(() => {
    return calculateLandslideRiskScore(primaryMoisture, primaryRainRate, primaryDisplacement, primaryVibration, primaryTilt);
  }, [primaryMoisture, primaryRainRate, primaryDisplacement, primaryVibration, primaryTilt]);

  // Unified automatic state machine: computes CRITICAL, HIGH, MODERATE, or LOW directly from the reading's risk tier
  const activeState = useMemo<LandslideRiskTier>(() => {
    return primaryRiskTier;
  }, [primaryRiskTier]);

  const riskMeta = LANDSLIDE_RISK_COLORS[primaryRiskTier] || LANDSLIDE_RISK_COLORS.LOW;

  // AI 1h to 24h Prediction (based on evaluated hazard classification)
  const prediction = useMemo(
    () => getAILandslidePrediction(primaryRiskScore, primaryMoisture, primaryRainRate, primaryDisplacement, primaryVibration),
    [primaryRiskScore, primaryMoisture, primaryRainRate, primaryDisplacement, primaryVibration]
  );

  // Dedicated Impact Assessment Data
  const impactData = useMemo<LandslideImpactAssessment>(
    () => getAILandslideImpact(primaryRiskTier),
    [primaryRiskTier]
  );

  // Dynamic AI Recommended Actions strictly based on user rules
  const recommendedActions = useMemo(
    () => getAILandslideRecommendations(primaryRiskTier),
    [primaryRiskTier]
  );

  // Dynamic alerts generated based on evaluated hazard conditions
  const [alerts, setAlerts] = useState<LandslideAlert[]>(() =>
    generateDynamicLandslideAlerts(primaryRiskTier, primaryMoisture, primaryDisplacement, primaryRainRate, primaryVibration)
  );

  // Synchronize alerts whenever evaluated risk or telemetry changes
  useEffect(() => {
    setAlerts(generateDynamicLandslideAlerts(primaryRiskTier, primaryMoisture, primaryDisplacement, primaryRainRate, primaryVibration));
  }, [primaryRiskTier, primaryMoisture, primaryDisplacement, primaryRainRate, primaryVibration]);

  // Real-time time series data
  const [historicalData, setHistoricalData] = useState<HistoricalLandslideReading[]>(() =>
    generateHistoricalLandslideData(16, primaryMoisture, primaryRainRate, primaryDisplacement)
  );

  // Acknowledge Alert Handler
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    if (propAcknowledge) propAcknowledge(alertId);
  };

  /**
   * 15–30 Minute Landslide Hydro-Geotechnical Monsoon Cycle:
   * Simulates continuous rainfall ingress, soil saturation, and progressive shear displacement.
   * - Minutes 0m - 9m: Baseline / Stable (Low moisture < 50%, rain < 12 mm/h, displacement < 3 mm) -> LOW
   * - Minutes 9m - 19m: Heavy Monsoon Seepage / Watch (Moisture 55 - 75%, rain 15 - 30 mm/h, displacement 4 - 8 mm) -> MODERATE
   * - Minutes 19m - 26m: Saturated Surcharge / Critical Slip (Moisture > 82%, rain > 42 mm/h, displacement > 18 mm) -> HIGH / CRITICAL
   * - Minutes 26m - 30m: Drainage Recession / Stabilization -> MODERATE -> LOW
   */
  const getCycleBasinTarget = (minute: number) => {
    const norm = ((minute % 30) + 30) % 30;
    if (norm < 9) {
      const p = norm / 9;
      return {
        soilMoisture: 42 + p * 15,
        rainfallRate: 6 + p * 10,
        groundDisplacement: 1.2 + p * 2.2,
        groundVibration: 1.0 + p * 1.5
      };
    } else if (norm < 19) {
      const p = (norm - 9) / 10;
      return {
        soilMoisture: 57 + p * 20,
        rainfallRate: 16 + p * 18,
        groundDisplacement: 3.4 + p * 5.2,
        groundVibration: 2.5 + p * 2.5
      };
    } else if (norm < 26) {
      const p = (norm - 19) / 7;
      return {
        soilMoisture: 77 + p * 15,
        rainfallRate: 34 + p * 24,
        groundDisplacement: 8.6 + p * 14.2,
        groundVibration: 5.0 + p * 4.8
      };
    } else {
      const p = (norm - 26) / 4;
      return {
        soilMoisture: 92 - p * 50,
        rainfallRate: 58 - p * 52,
        groundDisplacement: 22.8 - p * 21.6,
        groundVibration: 9.8 - p * 8.8
      };
    }
  };

  /**
   * CONTINUOUS LIVE TELEMETRY SIMULATION (Ticks every 3 seconds):
   * Updates all geotechnical sensors towards dynamic target curves with realistic micro-jitter.
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
            const jitterMoist = (Math.random() - 0.48) * 0.8;
            const jitterRain = (Math.random() - 0.48) * 1.2;
            const jitterDisp = (Math.random() - 0.48) * 0.4;
            const jitterVib = (Math.random() - 0.48) * 0.3;

            const baseM = isTarget ? target.soilMoisture : sensor.soilMoisture;
            const baseR = isTarget ? target.rainfallRate : sensor.rainfallRate;
            const baseD = isTarget ? target.groundDisplacement : sensor.groundDisplacement;
            const baseV = isTarget ? target.groundVibration : sensor.groundVibration;

            const newMoist = Math.max(25, Math.min(99, parseFloat((baseM + jitterMoist).toFixed(1))));
            const newRain = Math.max(0, Math.min(85, parseFloat((baseR + jitterRain).toFixed(1))));
            const newDisp = Math.max(0.5, Math.min(35, parseFloat((baseD + jitterDisp).toFixed(1))));
            const newVib = Math.max(0.4, Math.min(15, parseFloat((baseV + jitterVib).toFixed(1))));

            const newTier = classifyLandslideRisk(newMoist, newRain, newDisp, newVib, sensor.slopeTiltAngle);
            const newScore = calculateLandslideRiskScore(newMoist, newRain, newDisp, newVib, sensor.slopeTiltAngle);
            const newSat = classifySoilSaturation(newMoist);
            const newVibStat = classifyVibration(newVib);
            const newDispStat = classifyDisplacement(newDisp);

            return {
              ...sensor,
              soilMoisture: newMoist,
              soilSaturationLevel: newSat,
              rainfallRate: newRain,
              groundDisplacement: newDisp,
              displacementStatus: newDispStat,
              groundVibration: newVib,
              vibrationStatus: newVibStat,
              riskTier: newTier,
              riskScore: newScore,
              lastPing: new Date().toISOString()
            };
          })
        );

        // Update historical chart time series
        setHistoricalData(prevData => {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newPt: HistoricalLandslideReading = {
            timestamp: nowStr,
            soilMoisture: target.soilMoisture,
            rainfallRate: target.rainfallRate,
            rainfall24h: Math.round(target.rainfallRate * 5 + 40),
            groundVibration: target.groundVibration,
            groundDisplacement: target.groundDisplacement,
            riskScore: calculateLandslideRiskScore(target.soilMoisture, target.rainfallRate, target.groundDisplacement, target.groundVibration)
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
      if (sensorHealthFilter === 'ALERTING') return s.riskTier === 'HIGH' || s.riskTier === 'CRITICAL';
      return true;
    });
  }, [sensors, sensorHealthFilter]);

  // Tactical response label
  const disasterResponse = useMemo(() => {
    if (primaryRiskTier === 'CRITICAL') return 'STAGE 4 EVACUATION & DEBRIS RESCUE';
    if (primaryRiskTier === 'HIGH') return 'STAGE 3 RAPID DISASTER SQUADS MOBILIZED';
    if (primaryRiskTier === 'MODERATE') return 'STAGE 2 GEOTECHNICAL MONITORING ACCELERATED';
    return 'STAGE 1 ROUTINE AI SURVEILLANCE';
  }, [primaryRiskTier]);

  const criticalAlertsCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningAlertsCount = alerts.filter(a => a.severity === 'HIGH').length;

  // Export SITREP JSON Report
  const handleExportData = () => {
    const report = {
      title: 'EcoGuard Landslide Early Warning & Runout Hazard SITREP',
      timestamp: new Date().toISOString(),
      locationZone: 'Wayanad Hill Slopes - Western Ghats (Kerala, India)',
      evaluation: {
        activeState,
        riskScore: primaryRiskScore,
        riskTier: primaryRiskTier,
        cycleMinute: Math.round(cycleMinute)
      },
      currentReadings: {
        soilMoisture: `${primaryMoisture}%`,
        rainfallRate: `${primaryRainRate} mm/h`,
        rainfall24h: `${primaryRain24h} mm`,
        groundDisplacement: `+${primaryDisplacement} mm`,
        groundVibration: `${primaryVibration} mm/s PPV`,
        slopeTilt: `${primaryTilt}°`
      },
      impactAssessment: impactData,
      sensors,
      activeAlerts: alerts,
      recommendedActions
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoGuard_Landslide_SITREP_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1700px] mx-auto w-full pb-14 font-sans">
      {/* ========================================================
          DISASTER OPERATIONS COMMAND CONSOLE HEADER
         ======================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/50">
            <Mountain size={30} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                ● EARLY WARNING LANDSLIDE DISASTER SYSTEM
              </span>
              <span className="text-slate-600 text-xs hidden sm:inline">|</span>
              <span className="text-xs text-amber-400 font-semibold tracking-wide hidden sm:inline">
                NATIONAL GEOTECHNICAL HAZARD REDUCTION PLATFORM
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-1">
              LANDSLIDE DETECTION MONITORING
            </h1>
          </div>
        </div>

        {/* System-Detected State Machine: Critical, High, Moderate, Low in one dynamic detector */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            title="Real-time detection: automatically updates between LOW, MODERATE, HIGH, and CRITICAL based on live telemetry readings"
            className="flex items-center bg-slate-950/90 p-1.5 rounded-xl border border-white/10 text-xs shadow-inner gap-2 select-none"
          >
            <span className="text-[11px] text-slate-400 uppercase px-1.5 font-bold flex items-center gap-1.5">
              <Cpu size={13} className="text-amber-400" /> DETECTION:
            </span>
            <span
              className={`px-3.5 py-1 rounded-lg font-black transition-all shadow flex items-center gap-2 ${
                activeState === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 ring-1 ring-red-400/50'
                  : activeState === 'HIGH'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/60 ring-1 ring-orange-400/50'
                  : activeState === 'MODERATE'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60 ring-1 ring-amber-400/50'
                  : 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {activeState === 'CRITICAL'
                ? 'CRITICAL LANDSLIDE WARNING'
                : activeState === 'HIGH'
                ? 'HIGH LANDSLIDE PROBABILITY'
                : activeState === 'MODERATE'
                ? 'MODERATE WATCH'
                : 'LOW (SAFE)'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono px-1.5 border-l border-white/10 hidden sm:inline">
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

      {/* Dynamic Alert Banner: Automatically updates to match active landslide risk state */}
      {primaryRiskTier === 'CRITICAL' && (
        <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-xl bg-red-500/15 border-red-500/55">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-red-500/25 text-red-400 animate-bounce">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                  ⚠️ ACTIVE LANDSLIDE SLIP PROTOCOL STAGE 2
                </span>
                <span className="text-xs text-slate-400">· Immediate Mandatory Valley Evacuation Activated</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Chooralmala Escarpment Sentinel recorded cumulative shear slip at <strong>+{primaryDisplacement.toFixed(1)} mm</strong> with soil saturation at <strong>{primaryMoisture.toFixed(1)}%</strong>. Catastrophic debris flow failure expected within 30 minutes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white animate-pulse shadow-md">
            CRITICAL LANDSLIDE CODE #771
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
                  ⚠️ HIGH LANDSLIDE PROBABILITY · Rapid Progressive Shear Creep Detected
                </span>
                <span className="text-xs text-slate-400">· Emergency Response Squads On Standby</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Ground displacement reached <strong>+{primaryDisplacement.toFixed(1)} mm</strong> under intense rainfall (<strong>{primaryRainRate.toFixed(1)} mm/h</strong>). Hill highway barricades and rescue squads activated.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-orange-600 text-white shadow-md">
            ORANGE ALERT CODE #580
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
                  ℹ️ GEOTECHNICAL WATCH NOTICE · Saturated Pore Water Surcharge Advisory
                </span>
                <span className="text-xs text-slate-400">· Monitoring Polling Accelerated</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Soil moisture elevated to <strong>{primaryMoisture.toFixed(1)}%</strong> following continuous monsoon precipitation. Tension crack inspection teams deployed to upper scarp lines.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-600 text-white shadow-md">
            YELLOW WATCH CODE #310
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
                  ✓ ALL SLOPE SECTORS STABLE · Continuous AI Geotechnical Surveillance Active
                </span>
                <span className="text-xs text-slate-400">· Hydro-Mechanical Equilibrium</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                Ground displacement (<strong>+{primaryDisplacement.toFixed(1)} mm</strong>) and pore pressure remain well within factor of safety limits (&gt; 1.8).
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
          1. Current Soil Moisture (%)
          2. Current Rainfall (mm/h)
          3. Current Landslide Risk Level
          4. Number of Active Alerts
         ======================================================== */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-3 px-1">
          SECTION 1 · REAL-TIME TELEMETRIC SUMMARY
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Current Soil Moisture */}
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
                  Piezometer Array
                </span>
                <div className="text-base font-bold text-white mt-0.5">Soil Moisture Saturation</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Droplets size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-cyan-300 font-mono tracking-tight">
                  {primaryMoisture.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">%</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mt-1">
                <span>{primaryMoisture >= 85 ? 'HIGHLY SATURATED' : primaryMoisture >= 65 ? 'SATURATED' : 'MODERATE MOISTURE'}</span>
                <span className="text-slate-500">· Pore Press: {activeFocusSensor.poreWaterPressure} kPa</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Saturation Danger Limit:</span>
              <strong className="text-red-400 font-mono">&gt; 80.0%</strong>
            </div>
          </div>

          {/* Card 2: Current Rainfall & 24h Accumulation */}
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
                  Tipping Bucket Pluviometer
                </span>
                <div className="text-base font-bold text-white mt-0.5">Precipitation & 24h Rain</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <CloudRain size={20} />
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-indigo-300 font-mono tracking-tight">
                  {primaryRainRate.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-400">mm/hr</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mt-1">
                <span>24h Total: {primaryRain24h} mm</span>
                <span className="text-slate-500">· Heavy Monsoon</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-2.5 border-t border-white/5 flex justify-between">
              <span>Trigger Rainfall Threshold:</span>
              <strong className="text-amber-400 font-mono">35.0 mm/h</strong>
            </div>
          </div>

          {/* Card 3: Current Landslide Risk Level */}
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
                  Geotechnical Assessment
                </span>
                <div className="text-base font-bold text-white mt-0.5">Current Landslide Risk</div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: riskMeta.bg, border: `1px solid ${riskMeta.border}` }}
              >
                <Mountain size={20} color={riskMeta.color} />
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
                {primaryRiskTier === 'CRITICAL'
                  ? 'Catastrophic Runout Avalanche Imminent'
                  : primaryRiskTier === 'HIGH'
                  ? 'Rapid Progressive Shear Creep'
                  : primaryRiskTier === 'MODERATE'
                  ? 'Elevated Surcharge & Tension Cracks'
                  : 'Geotechnical Slope Equilibrium'}
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
                  Civil Defense Dispatch
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
              <strong className="text-emerald-400 font-semibold">&lt; 4 minutes</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECTION 2: LANDSLIDE RISK INDICATOR (LARGE VISUAL GAUGE - FULL WIDTH)
         ======================================================== */}
      <div>
        <LandslideGauge
          score={primaryRiskScore}
          tier={primaryRiskTier}
          soilMoisture={primaryMoisture}
          groundDisplacement={primaryDisplacement}
          slopeTiltAngle={primaryTilt}
          groundVibration={primaryVibration}
        />
      </div>

      {/* ========================================================
          SECTION 3: AI LANDSLIDE PREDICTION PANEL (FULL WIDTH)
         ======================================================== */}
      <div>
        <LandslidePredictionPanel prediction={prediction} />
      </div>

      {/* ========================================================
          SECTION 4: DEDICATED IMPACT ASSESSMENT SECTION (FULL WIDTH)
         ======================================================== */}
      <div>
        <LandslideImpactSection
          impact={impactData}
          riskTier={primaryRiskTier}
        />
      </div>

      {/* ========================================================
          SECTIONS 5 & 6: SOIL MOISTURE / RAINFALL & DISPLACEMENT / VIBRATION CHARTS
         ======================================================== */}
      <div>
        <LandslideCharts
          historicalData={historicalData}
          criticalDisplacementThreshold={18.0}
          warningDisplacementThreshold={8.0}
          saturationThreshold={80.0}
        />
      </div>

      {/* ========================================================
          SECTION 7: INTERACTIVE LANDSLIDE RISK MAP (FULL WIDTH)
         ======================================================== */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Layers size={14} /> SECTION 7 · GEOSPATIAL LANDSLIDE SENSOR NETWORK
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Landslide Risk & Hazard Runout Map
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            Displaying all {sensors.length} geotechnical stations, high-risk slope shear zones & civilian settlements across Wayanad
          </span>
        </div>

        <LandslideMap
          sensors={sensors}
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
        />
      </div>

      {/* ========================================================
          SECTION 8: ACTIVE HAZARD ALERTS (FULL WIDTH)
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
                SECTION 8 · EMERGENCY TELEMETRY DISPATCH FEED
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
              No active alerts matching filter. All monitored slope sectors nominal.
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <LandslideAlertNotification
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </div>
      </div>

      {/* ========================================================
          SECTION 9: AI RECOMMENDED TACTICAL ACTIONS (FULL WIDTH)
         ======================================================== */}
      <div>
        <LandslideRecommendations
          actions={recommendedActions}
          riskTier={primaryRiskTier}
        />
      </div>

      {/* ========================================================
          SECTION 10: GEOTECHNICAL SENSOR NETWORK NODES (FULL WIDTH)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(245,158,11,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cpu size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                SECTION 10 · FIELD IOT SENSOR NETWORK
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Wayanad Escarpment Sentinel Stations ({sensors.length} Stations Active)
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
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
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
            <LandslideSensorCard
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

export default LandslideDashboard;
