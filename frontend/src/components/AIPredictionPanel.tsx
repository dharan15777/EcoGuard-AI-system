import React, { useState } from 'react';
import { AIPredictionData, HourlyPrediction } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { Brain, Sparkles, Clock, AlertTriangle, CloudRain, CheckCircle2, Cpu } from 'lucide-react';

interface AIPredictionPanelProps {
  prediction: AIPredictionData;
}

export const AIPredictionPanel: React.FC<AIPredictionPanelProps> = ({ prediction }) => {
  const [selectedHour, setSelectedHour] = useState<HourlyPrediction>(
    prediction.hourlyForecast[4] || prediction.hourlyForecast[0] // default to 24h or first
  );

  const currentRiskMeta = RISK_COLORS[prediction.currentRisk] || RISK_COLORS.SAFE;
  const predRisk24Meta = RISK_COLORS[prediction.predictedRisk24h] || RISK_COLORS.DANGER;

  // Keep selected hour in sync when prediction changes
  React.useEffect(() => {
    setSelectedHour(prev => {
      const match = prediction.hourlyForecast.find(h => h.horizonHours === prev.horizonHours);
      return match || prediction.hourlyForecast[4] || prediction.hourlyForecast[0];
    });
  }, [prediction]);

  return (
    <div
      className="field-panel p-6 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-900/30">
            <Brain size={22} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Sparkles size={12} /> SECTION 3 · ARTIFICIAL INTELLIGENCE INFERENCE ENGINE
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Flood Prediction & 30-Hour Inundation Horizon
            </h2>
          </div>
        </div>

        {/* Display: Current Flood Risk & Predicted Flood Risk (24 Hours) & Confidence */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Current Flood Risk */}
          <div className="p-2.5 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Risk</div>
            <div
              className="text-base font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5"
              style={{ color: currentRiskMeta.text }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: currentRiskMeta.color }} />
              {prediction.currentRisk}
            </div>
          </div>

          {/* Predicted Flood Risk (24 Hours) */}
          <div
            className="p-2.5 px-3.5 rounded-xl border text-right shadow-sm"
            style={{
              background: predRisk24Meta.bg,
              borderColor: predRisk24Meta.border
            }}
          >
            <div className="text-[10px] uppercase font-semibold text-slate-300">Predicted Risk (24 Hours)</div>
            <div
              className="text-base font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5"
              style={{ color: predRisk24Meta.text }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: predRisk24Meta.color }} />
              {prediction.predictedRisk24h}
            </div>
          </div>

          {/* Confidence */}
          <div className="p-2.5 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</div>
            <div className="text-base font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={15} /> {prediction.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Reason for Prediction Callout Banner */}
      <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase font-bold text-amber-300 tracking-wider mb-1 flex items-center gap-2">
            <span>Reason for AI Prediction</span>
            <span className="text-slate-400">· Edge Neural Synthesis</span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            "{prediction.reason}"
          </p>
        </div>
      </div>

      {/* 6-Hour to 30-Hour Horizon Timeline across Full Width */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Clock size={14} className="text-cyan-400" />
            <span>AI Projected Trajectory (1h, 3h, 6h, 12h, 24h, 30h Horizons)</span>
          </div>
          <span className="text-xs text-slate-400">
            Click horizon to view projected water level & risk
          </span>
        </div>

        {/* 6 Horizons Cards (1 Hour, 3 Hours, 6 Hours, 12 Hours, 24 Hours, 30 Hours) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {prediction.hourlyForecast.map((hf) => {
            const isSelected = selectedHour.horizonHours === hf.horizonHours;
            const riskMeta = RISK_COLORS[hf.riskTier] || RISK_COLORS.SAFE;

            return (
              <button
                key={hf.hour}
                onClick={() => setSelectedHour(hf)}
                className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-lg ring-2 ring-cyan-400/40'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-bold text-white font-mono">{hf.hour}</span>
                  <span className="text-xs text-slate-400 font-mono">{hf.timeLabel}</span>
                </div>

                <div className="mb-3">
                  <span className="text-[10px] text-slate-400 block font-medium">Predicted Level</span>
                  <div className="text-xl font-bold text-cyan-300 font-mono mt-0.5">
                    {hf.waterLevel.toFixed(2)}m
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                    style={{
                      background: riskMeta.bg,
                      color: riskMeta.text,
                      border: `1px solid ${riskMeta.border}`
                    }}
                  >
                    {hf.riskTier}
                  </span>
                  <span className="text-xs font-mono text-indigo-300 flex items-center gap-1 font-semibold">
                    <CloudRain size={12} /> {hf.rainfall.toFixed(0)}mm
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Horizon Telemetry Detail & Neural Model Metadata */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono">
            {selectedHour.hour} ({selectedHour.timeLabel}) Projection
          </span>
          <span className="text-slate-200 font-medium">
            {selectedHour.summary}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 ml-auto">
          <span className="flex items-center gap-1.5">
            <Cpu size={14} className="text-cyan-400" />
            <span>Model: <strong>{prediction.modelName}</strong></span>
          </span>
          <span>·</span>
          <span>Latency: <strong className="text-slate-200 font-mono">{prediction.latencyMs}ms</strong></span>
        </div>
      </div>
    </div>
  );
};
