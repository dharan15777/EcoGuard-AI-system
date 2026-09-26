import React, { useState, useEffect } from 'react';
import { FloodSensor, FloodAlert, HistoricalReading } from '../types/flood';
import {
  INITIAL_FLOOD_SENSORS,
  INITIAL_FLOOD_ALERTS,
  generateHistoricalData,
  getAIPrediction,
  getAIRecommendedActions,
  getRiskTierFromScore,
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
  Activity,
  Play,
  Pause,
  RotateCcw,
  Download,
  AlertTriangle,
  Radio,
  Cpu,
  Layers,
  CheckCircle2,
  Sliders,
  Filter
} from 'lucide-react';

interface DashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensors: propSensors = [],
  alerts: propAlerts = [],
  onAcknowledgeAlert: propAcknowledge,
  historicalData: propHistorical = []
}) => {
  // Merge prop sensors with hydrological sensors if needed
  const [sensors, setSensors] = useState<FloodSensor[]>(() => {
    if (propSensors && propSensors.length > 0) {
      // Filter only hydrological or map them with flood attributes
      const floodOnes = propSensors.filter(s => s.type === 'FLOOD_WATER_LEVEL' || s.id?.includes('FLD'));
      if (floodOnes.length > 0) {
        return floodOnes.map((s, idx) => ({
          ...INITIAL_FLOOD_SENSORS[idx % INITIAL_FLOOD_SENSORS.length],
          id: s.id || INITIAL_FLOOD_SENSORS[idx].id,
          name: s.name || INITIAL_FLOOD_SENSORS[idx].name,
          status: s.status || 'ONLINE',
          batteryLevel: s.batteryLevel ?? 92,
        }));
      }
    }
    return INITIAL_FLOOD_SENSORS;
  });

  const [alerts, setAlerts] = useState<FloodAlert[]>(() => {
    if (propAlerts && propAlerts.length > 0) {
      const floodAlerts = propAlerts.filter(a => a.hazardType === 'FLOOD' || a.id?.includes('FLD'));
      if (floodAlerts.length > 0) {
        return floodAlerts.map((a, idx) => ({
          ...INITIAL_FLOOD_ALERTS[idx % INITIAL_FLOOD_ALERTS.length],
          id: a.id || INITIAL_FLOOD_ALERTS[idx].id,
          alertType: a.title || a.alertType || INITIAL_FLOOD_ALERTS[idx].alertType,
          description: a.description || INITIAL_FLOOD_ALERTS[idx].description,
          severity: a.severity || 'CRITICAL',
          status: a.status || 'ACTIVE'
        }));
      }
    }
    return INITIAL_FLOOD_ALERTS;
  });

  const [historicalData, setHistoricalData] = useState<HistoricalReading[]>(() =>
    generateHistoricalData(16)
  );

  const [selectedSensor, setSelectedSensor] = useState<FloodSensor | null>(sensors[0] || null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<'SURGE' | 'MODERATE' | 'SAFE'>('SURGE');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [sensorHealthFilter, setSensorHealthFilter] = useState<'ALL' | 'ONLINE' | 'ALERTING'>('ALL');

  // Compute Primary Aggregate Telemetry from highest risk sensor or selected sensor
  const focusSensor = selectedSensor || sensors[0] || INITIAL_FLOOD_SENSORS[0];
  const primaryWaterLevel = focusSensor.waterLevel;
  const primaryRainfall = focusSensor.rainfallRate;
  const primaryRiskScore = focusSensor.riskScore;
  const primaryRiskTier = focusSensor.riskTier;
  const riskMeta = RISK_COLORS[primaryRiskTier] || RISK_COLORS.SAFE;

  // Active alerts count
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;

  // AI Prediction & Actions
  const prediction = getAIPrediction(primaryRiskScore, primaryWaterLevel, primaryRainfall);
  const recommendedActions = getAIRecommendedActions(primaryRiskTier);

  // Acknowledge Alert Handler
  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
    if (propAcknowledge) propAcknowledge(alertId);
  };

  // Scenario Switcher for Hackathon Demonstrations
  const applyScenario = (scenario: 'SURGE' | 'MODERATE' | 'SAFE') => {
    setActiveScenario(scenario);
    if (scenario === 'SURGE') {
      setSensors(prev =>
        prev.map(s => {
          if (s.id === 'SN-FLD-01' || s.id === 'SN-FLD-06') {
            return { ...s, waterLevel: 4.88, rainfallRate: 52.4, riskScore: 92, riskTier: 'DANGER', status: 'ONLINE' };
          }
          if (s.id === 'SN-FLD-02') {
            return { ...s, waterLevel: 3.92, rainfallRate: 43.0, riskScore: 78, riskTier: 'DANGER', status: 'ONLINE' };
          }
          return { ...s, waterLevel: 3.10, rainfallRate: 31.0, riskScore: 52, riskTier: 'WARNING', status: 'ONLINE' };
        })
      );
    } else if (scenario === 'MODERATE') {
      setSensors(prev =>
        prev.map(s => ({
          ...s,
          waterLevel: parseFloat((2.8 + Math.random() * 0.4).toFixed(2)),
          rainfallRate: parseFloat((18.0 + Math.random() * 8.0).toFixed(1)),
          riskScore: 48,
          riskTier: 'WATCH'
        }))
      );
    } else {
      setSensors(prev =>
        prev.map(s => ({
          ...s,
          waterLevel: parseFloat((1.6 + Math.random() * 0.5).toFixed(2)),
          rainfallRate: parseFloat((4.0 + Math.random() * 4.0).toFixed(1)),
          riskScore: 18,
          riskTier: 'SAFE'
        }))
      );
    }
  };

  // Real-Time 3-second live stream generator
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // 1. Gently jitter sensor values
      setSensors(prev =>
        prev.map(s => {
          const jitter = (Math.random() - 0.48) * 0.04;
          const newLevel = Math.max(1.0, parseFloat((s.waterLevel + jitter).toFixed(2)));
          const rainJitter = (Math.random() - 0.5) * 0.8;
          const newRain = Math.max(0, parseFloat((s.rainfallRate + rainJitter).toFixed(1)));
          const newScore = Math.min(100, Math.max(5, Math.round(s.riskScore + (jitter > 0 ? 1 : -1))));
          const newTier = getRiskTierFromScore(newScore);

          return {
            ...s,
            waterLevel: newLevel,
            rainfallRate: newRain,
            riskScore: newScore,
            riskTier: newTier,
            lastPing: new Date().toISOString()
          };
        })
      );

      // 2. Append new reading point to historical stream
      setHistoricalData(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const last = prev[prev.length - 1];
        const newWater = parseFloat((last.waterLevel + (Math.random() - 0.48) * 0.05).toFixed(2));
        const newRain = parseFloat((last.rainfall + (Math.random() - 0.5) * 1.2).toFixed(1));
        const newScore = Math.min(100, Math.max(10, Math.round(last.riskScore + (Math.random() - 0.48) * 2)));

        const next = [...prev.slice(1), {
          timestamp: timeStr,
          waterLevel: newWater,
          rainfall: newRain,
          riskScore: newScore
        }];
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Filtered Alerts
  const filteredAlerts = alerts.filter(a => {
    if (alertSeverityFilter === 'ALL') return true;
    return a.severity === alertSeverityFilter;
  });

  // Filtered Sensors for Health Monitoring
  const filteredSensors = sensors.filter(s => {
    if (sensorHealthFilter === 'ALL') return true;
    if (sensorHealthFilter === 'ONLINE') return s.status === 'ONLINE';
    if (sensorHealthFilter === 'ALERTING') return s.riskTier === 'DANGER' || s.riskTier === 'WARNING';
    return true;
  });

  // Export Situation Report
  const handleExportSitRep = () => {
    const sitrep = {
      timestamp: new Date().toISOString(),
      basin: 'Pine River Catchment & Bay Delta',
      currentWaterLevel: `${primaryWaterLevel}m`,
      currentRainfall: `${primaryRainfall} mm/h`,
      riskScore: primaryRiskScore,
      riskTier: primaryRiskTier,
      activeAlertsCount: activeAlerts.length,
      aiConfidence: `${prediction.confidence}%`,
      aiReason: prediction.reason,
      projectedPeak: `${prediction.projectedPeakLevel}m at ${prediction.projectedPeakTime}`,
      sensorsSummary: sensors.map(s => ({
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
    <div className="flex flex-col gap-6 fade-up max-w-[1700px] mx-auto w-full pb-10">
      {/* ========================================================
          DISASTER OPS COMMAND HEADER
         ======================================================== */}
      <div className="field-panel p-5 rounded-lg bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-cyan-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-900/40">
            <Waves size={26} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                ● EARLY WARNING DISASTER SYSTEM
              </span>
              <span className="text-zinc-500 text-xs hidden sm:inline">|</span>
              <span className="text-[11px] font-mono text-cyan-400 hidden sm:inline">
                SMART DISASTER MANAGEMENT CONSOLE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
              Hydrological Flood Monitoring & Edge-AI Inundation System
            </h1>
          </div>
        </div>

        {/* Hackathon Scenario Controls & Live Stream Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Trigger for judges */}
          <div className="flex items-center bg-black/50 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <span className="text-[10px] text-zinc-400 uppercase px-2 font-bold flex items-center gap-1">
              <Sliders size={12} className="text-cyan-400" /> Demo Scenario:
            </span>
            <button
              onClick={() => applyScenario('SURGE')}
              className={`px-2 py-1 rounded transition-all font-bold ${
                activeScenario === 'SURGE' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Surge
            </button>
            <button
              onClick={() => applyScenario('MODERATE')}
              className={`px-2 py-1 rounded transition-all font-bold ${
                activeScenario === 'MODERATE' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Watch
            </button>
            <button
              onClick={() => applyScenario('SAFE')}
              className={`px-2 py-1 rounded transition-all font-bold ${
                activeScenario === 'SAFE' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Clear
            </button>
          </div>

          {/* Live Feed Toggle */}
          <button
            onClick={() => setIsLiveStreaming(v => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              isLiveStreaming
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                : 'bg-zinc-800 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            {isLiveStreaming ? <Pause size={13} /> : <Play size={13} />}
            {isLiveStreaming ? 'LIVE (3s)' : 'PAUSED'}
          </button>

          {/* Export SitRep */}
          <button
            onClick={handleExportSitRep}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/15 flex items-center gap-1.5 transition-all"
          >
            <Download size={13} /> SITREP
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner (when DANGER or WARNING) */}
      {(primaryRiskTier === 'DANGER' || primaryRiskTier === 'WARNING') && (
        <div
          className="p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 shadow-lg"
          style={{
            background: primaryRiskTier === 'DANGER' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)',
            borderColor: primaryRiskTier === 'DANGER' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(249, 115, 22, 0.5)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-500/20 text-red-400 animate-bounce">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase text-red-400 tracking-wider">
                  ⚠️ ACTIVE FLOOD EVACUATION PROTOCOL STAGE 2
                </span>
                <span className="text-xs font-mono text-zinc-400">· Immediate Response Mandate</span>
              </div>
              <p className="text-xs text-zinc-200 mt-0.5">
                Pine River Hydro Node Alpha recorded stage height at <strong>{primaryWaterLevel.toFixed(2)}m</strong> (breaching 4.20m max safety limit). Downstream inundation forecasted within 45 minutes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-600 text-white animate-pulse">
              RED ALERT CODE #882
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 1: TOP SUMMARY CARDS
          1. Current Water Level
          2. Current Rainfall
          3. Current Flood Risk Level
          4. Number of Active Alerts
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Water Level */}
        <div
          className="field-panel p-5 rounded-lg relative overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(145deg, rgba(16,28,32,0.95) 0%, rgba(12,20,24,0.98) 100%)',
            border: '1px solid rgba(56,189,248,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Hydrological Metric
              </span>
              <div className="text-sm font-bold text-white mt-0.5">Current Water Level</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Waves size={20} />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl lg:text-4xl font-mono font-black text-cyan-300 tracking-tight">
                {primaryWaterLevel.toFixed(2)}
              </span>
              <span className="text-base font-mono font-semibold text-zinc-400">meters</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mt-1">
              <span className="font-bold">▲ +0.34 m/hr</span>
              <span className="text-zinc-500">· Rapid Rise</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5 flex justify-between">
            <span>Danger Threshold:</span>
            <strong className="text-red-400">{focusSensor.floodThreshold.toFixed(2)}m</strong>
          </div>
        </div>

        {/* Card 2: Current Rainfall */}
        <div
          className="field-panel p-5 rounded-lg relative overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(145deg, rgba(20,22,36,0.95) 0%, rgba(14,16,26,0.98) 100%)',
            border: '1px solid rgba(129,140,248,0.3)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Precipitation Gauge
              </span>
              <div className="text-sm font-bold text-white mt-0.5">Current Rainfall</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CloudRain size={20} />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl lg:text-4xl font-mono font-black text-indigo-300 tracking-tight">
                {primaryRainfall.toFixed(1)}
              </span>
              <span className="text-base font-mono font-semibold text-zinc-400">mm/hr</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mt-1">
              <span className="font-bold">Torrential Downpour</span>
              <span className="text-zinc-500">· 24h: 114.2mm</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5 flex justify-between">
            <span>Runoff Saturation:</span>
            <strong className="text-amber-400">92% Extreme</strong>
          </div>
        </div>

        {/* Card 3: Current Flood Risk Level */}
        <div
          className="field-panel p-5 rounded-lg relative overflow-hidden flex flex-col justify-between"
          style={{
            background: `linear-gradient(145deg, ${riskMeta.bg} 0%, rgba(14,18,14,0.98) 100%)`,
            border: `1px solid ${riskMeta.border}`,
            boxShadow: riskMeta.glow
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Risk Classification
              </span>
              <div className="text-sm font-bold text-white mt-0.5">Current Flood Risk Level</div>
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
              <span
                className="text-2xl lg:text-3xl font-mono font-black tracking-tight uppercase"
                style={{ color: riskMeta.text }}
              >
                {primaryRiskTier}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">
                ({primaryRiskScore}/100)
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-300 mt-1">
              {primaryRiskTier === 'DANGER'
                ? 'Severe Inundation Imminent'
                : primaryRiskTier === 'WARNING'
                ? 'Heightened Spillway Watch'
                : 'Nominal Basin Safety'}
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5 flex justify-between">
            <span>Status Code:</span>
            <strong style={{ color: riskMeta.text }}>PHASE-II TRIGGERED</strong>
          </div>
        </div>

        {/* Card 4: Number of Active Alerts */}
        <div
          className="field-panel p-5 rounded-lg relative overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(145deg, rgba(32,16,16,0.95) 0%, rgba(20,12,12,0.98) 100%)',
            border: activeAlerts.length > 0 ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--border-raw)',
            boxShadow: activeAlerts.length > 0 ? '0 0 20px rgba(239,68,68,0.15)' : 'none'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-semibold">
                Incident Management
              </span>
              <div className="text-sm font-bold text-white mt-0.5">Number of Active Alerts</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <BellRing size={20} className={activeAlerts.length > 0 ? 'animate-bounce' : ''} />
            </div>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl lg:text-4xl font-mono font-black text-red-400 tracking-tight">
                {activeAlerts.length}
              </span>
              <span className="text-base font-mono font-semibold text-zinc-400">Alerts Active</span>
            </div>
            <div className="text-xs font-mono text-red-300 mt-1">
              <strong>{criticalAlertsCount} Critical</strong> · {activeAlerts.length - criticalAlertsCount} Warning
            </div>
          </div>

          <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5 flex justify-between">
            <span>Fastest Response Time:</span>
            <strong className="text-emerald-400">&lt; 4 minutes</strong>
          </div>
        </div>
      </div>

      {/* ========================================================
          SPLIT SECTION:
          SECTION 2: Flood Risk Indicator (Visual Gauge)
          SECTION 3: AI Flood Prediction Panel
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Section 2 - Flood Risk Indicator Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <FloodGauge
            score={primaryRiskScore}
            tier={primaryRiskTier}
            waterLevel={primaryWaterLevel}
            rateOfRise={0.34}
          />
        </div>

        {/* Right: Section 3 - AI Flood Prediction Panel (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <AIPredictionPanel prediction={prediction} />
        </div>
      </div>

      {/* ========================================================
          SPLIT SECTION:
          SECTION 4: Water Level Trend Chart
          SECTION 5: Rainfall Trend Chart
         ======================================================== */}
      <div>
        <Charts
          historicalData={historicalData}
          floodThreshold={focusSensor.floodThreshold}
          warningThreshold={focusSensor.warningThreshold}
          heavyRainThreshold={35.0}
        />
      </div>

      {/* ========================================================
          SPLIT SECTION:
          SECTION 6: Interactive Flood Risk Map
          SECTION 7: Active Alerts Section
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Section 6 - Interactive Flood Risk Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                <Layers size={13} /> Geospatial Hydrology Network
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Interactive Flood Risk Map
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {sensors.length} Hydro Nodes Deployed
            </span>
          </div>

          <Map
            sensors={sensors}
            selectedSensor={selectedSensor}
            onSelectSensor={setSelectedSensor}
          />
        </div>

        {/* Right: Section 7 - Active Alerts Section (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-red-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert size={13} /> Emergency Telemetry Dispatch
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Active Hazard Alerts ({activeAlerts.length})
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/10 text-[10px] font-mono">
              <button
                onClick={() => setAlertSeverityFilter('ALL')}
                className={`px-2 py-0.5 rounded ${alertSeverityFilter === 'ALL' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setAlertSeverityFilter('CRITICAL')}
                className={`px-2 py-0.5 rounded ${alertSeverityFilter === 'CRITICAL' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400'}`}
              >
                CRIT
              </button>
            </div>
          </div>

          {/* Alert Cards Container */}
          <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="field-panel p-8 text-center text-zinc-400 font-mono text-xs">
                <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                No active alerts matching filter. All hydrological sectors nominal.
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
      </div>

      {/* ========================================================
          SECTION 8: AI RECOMMENDED ACTIONS
         ======================================================== */}
      <div>
        <AIRecommendedActions
          actions={recommendedActions}
          riskTier={primaryRiskTier}
        />
      </div>

      {/* ========================================================
          SECTION 9: SENSOR HEALTH MONITORING
          - Sensor Name
          - Online/Offline Status
          - Battery Percentage
          - Last Update Time
         ======================================================== */}
      <div className="field-panel p-6 rounded-lg bg-zinc-950/90 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Section 9: Hydrological Sensor Health Monitoring
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Mesh Node Health · Power Reserves · LoRaWAN & NB-IoT Telemetry Heartbeat
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10 text-xs font-mono">
            <span className="text-zinc-500 px-2 text-[10px] uppercase font-bold flex items-center gap-1">
              <Filter size={11} /> Filter:
            </span>
            <button
              onClick={() => setSensorHealthFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-all ${
                sensorHealthFilter === 'ALL' ? 'bg-cyan-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ALL ({sensors.length})
            </button>
            <button
              onClick={() => setSensorHealthFilter('ONLINE')}
              className={`px-2.5 py-1 rounded transition-all ${
                sensorHealthFilter === 'ONLINE' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ONLINE ({sensors.filter(s => s.status === 'ONLINE').length})
            </button>
            <button
              onClick={() => setSensorHealthFilter('ALERTING')}
              className={`px-2.5 py-1 rounded transition-all ${
                sensorHealthFilter === 'ALERTING' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ELEVATED RISK ({sensors.filter(s => s.riskTier === 'DANGER' || s.riskTier === 'WARNING').length})
            </button>
          </div>
        </div>

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSensors.map(sensor => (
            <SensorCard
              key={sensor.id}
              sensor={sensor}
              isSelected={selectedSensor?.id === sensor.id}
              onSelect={setSelectedSensor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
