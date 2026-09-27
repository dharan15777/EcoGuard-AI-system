import React, { useState } from 'react';
import { AILandslidePredictionData, HourlyLandslidePrediction } from '../types/landslide';
import { LANDSLIDE_RISK_COLORS } from '../utils/landslideConstants';
import { Brain, Sparkles, Clock, AlertTriangle, Mountain, CheckCircle2, Cpu, Droplets, Move, Activity } from 'lucide-react';

interface LandslidePredictionPanelProps {
  prediction: AILandslidePredictionData;
}

export const LandslidePredictionPanel: React.FC<LandslidePredictionPanelProps> = ({ prediction }) => {
  const [selectedHour, setSelectedHour] = useState<HourlyLandslidePrediction>(
    prediction.hourlyForecast.find(h => h.horizonHours === 6) || prediction.hourlyForecast[0]
  );

  const currentRiskMeta = LANDSLIDE_RISK_COLORS[prediction.currentRisk] || LANDSLIDE_RISK_COLORS.LOW;
  const predRisk6Meta = LANDSLIDE_RISK_COLORS[prediction.predictedRisk6h] || LANDSLIDE_RISK_COLORS.CRITICAL;

  // Keep selected hour in sync when prediction changes
  React.useEffect(() => {
    setSelectedHour(prev => {
      const match = prediction.hourlyForecast.find(h => h.horizonHours === prev.horizonHours);
      return match || prediction.hourlyForecast.find(h => h.horizonHours === 6) || prediction.hourlyForecast[0];
    });
  }, [prediction]);

  return (
    <div
      className="field-panel p-6 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-900/30">
            <Brain size={22} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles size={12} /> SECTION 3 · ARTIFICIAL INTELLIGENCE INFERENCE ENGINE
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Landslide Displacement & Runout Prediction (1h, 3h, 6h, 12h, 24h Horizons)
            </h2>
          </div>
        </div>

        {/* Display: Current Risk, Predicted Risk (6h), and Confidence */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Current Risk */}
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

          {/* Predicted Risk (6 Hours) */}
          <div className="p-2.5 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Predicted (6 Hours)</div>
            <div
              className="text-base font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5"
              style={{ color: predRisk6Meta.text }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: predRisk6Meta.color }} />
              {prediction.predictedRisk6h}
            </div>
          </div>

          {/* AI Confidence Score */}
          <div className="p-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 shadow-inner">
            <Sparkles size={18} className="text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</div>
              <div className="text-lg font-black text-amber-300 font-mono leading-none mt-0.5">
                {prediction.confidence}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Prediction Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: AI Inference Reasoning & Geotechnical Parameters (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-slate-900/70 border border-white/5">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-3 border-b border-white/10 mb-3">
              <span className="flex items-center gap-2 text-amber-400 uppercase tracking-wide">
                <Brain size={14} /> Neural Slope Stability Analysis
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Peak Threat: {prediction.projectedPeakFailureTime}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-300 mb-4 bg-slate-950/60 p-3.5 rounded-lg border border-white/5 font-sans">
              {prediction.reason}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                <div className="text-[11px] text-slate-400 font-medium">Projected Runout Velocity</div>
                <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                  {prediction.projectedRunoutVelocity} m/s
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                <div className="text-[11px] text-slate-400 font-medium">Critical Failure Horizon</div>
                <div className="text-lg font-bold font-mono text-red-400 mt-1">
                  6 Hours
                </div>
              </div>
            </div>
          </div>

          {/* Selected Hour Insight Highlight */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Clock size={13} /> {selectedHour.hour} ({selectedHour.timeLabel}) Insight:
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: LANDSLIDE_RISK_COLORS[selectedHour.riskTier]?.bg,
                  color: LANDSLIDE_RISK_COLORS[selectedHour.riskTier]?.text,
                  border: `1px solid ${LANDSLIDE_RISK_COLORS[selectedHour.riskTier]?.border}`
                }}
              >
                {selectedHour.riskTier}
              </span>
            </div>
            <div className="text-slate-300 leading-snug">
              {selectedHour.summary}
            </div>
          </div>
        </div>

        {/* Right: 5 Hourly Prediction Cards (1h, 3h, 6h, 12h, 24h) (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center justify-between">
            <span>Forecast Horizons (Click to inspect detail)</span>
            <span className="text-[11px] font-mono text-slate-500">Continuous 24-Hour Horizon</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {prediction.hourlyForecast.map(h => {
              const isSelected = selectedHour.horizonHours === h.horizonHours;
              const meta = LANDSLIDE_RISK_COLORS[h.riskTier] || LANDSLIDE_RISK_COLORS.LOW;

              return (
                <div
                  key={h.horizonHours}
                  onClick={() => setSelectedHour(h)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/95 border-amber-400 shadow-xl ring-2 ring-amber-400/40'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 font-mono">{h.hour}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                    />
                  </div>

                  <div className="my-1">
                    <div className="text-[11px] text-slate-400">Displacement</div>
                    <div className="text-lg font-black font-mono text-white">
                      +{h.groundDisplacement} <span className="text-[10px] font-normal text-slate-400">mm</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-white/5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Soil Moist:</span>
                      <strong className="text-cyan-300 font-mono">{h.soilMoisture}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rain Rate:</span>
                      <strong className="text-indigo-300 font-mono">{h.rainfallRate} mm/h</strong>
                    </div>
                  </div>

                  <div
                    className="mt-2.5 py-1 px-1.5 rounded text-[10px] font-extrabold uppercase text-center tracking-wider"
                    style={{
                      background: meta.bg,
                      color: meta.text,
                      border: `1px solid ${meta.border}`
                    }}
                  >
                    {h.riskTier}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Model Edge Status Footer */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Inference Engine: <strong>Active</strong></span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <Cpu size={14} className="text-amber-400" />
              <span>Model: <strong>{prediction.modelName}</strong></span>
            </span>
            <span>·</span>
            <span>Latency: <strong className="text-slate-200 font-mono">{prediction.latencyMs}ms</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandslidePredictionPanel;
