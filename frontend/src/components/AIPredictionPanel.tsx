import React, { useState } from 'react';
import { AIPredictionData, HourlyPrediction } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { Cpu, Brain, Sparkles, Clock, AlertTriangle, TrendingUp, CloudRain, CheckCircle2 } from 'lucide-react';

interface AIPredictionPanelProps {
  prediction: AIPredictionData;
}

export const AIPredictionPanel: React.FC<AIPredictionPanelProps> = ({ prediction }) => {
  const [selectedHour, setSelectedHour] = useState<HourlyPrediction>(
    prediction.hourlyForecast[2] || prediction.hourlyForecast[0]
  );

  return (
    <div
      className="field-panel relative p-6 flex flex-col justify-between overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(18,26,24,0.96) 0%, rgba(13,19,16,0.98) 100%)',
        border: '1px solid rgba(74,143,168,0.28)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,143,168,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }}
      />

      {/* Top Header: Title, Confidence Badge, Model info */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-900/30">
            <Brain size={22} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-400 font-semibold flex items-center gap-1">
                <Sparkles size={12} /> Neural Inundation Forecast
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                6-HOUR HORIZON
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
              AI Flood Prediction & Peak Inundation Model
            </h3>
          </div>
        </div>

        {/* Confidence Percentage & Peak Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Prediction Confidence
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400 flex items-center justify-end gap-1">
              <CheckCircle2 size={16} className="text-emerald-400" />
              {prediction.confidence}%
            </div>
          </div>
          <div className="h-9 w-px bg-white/10 hidden sm:block" />
          <div className="bg-red-500/15 border border-red-500/30 px-3 py-1.5 rounded-lg text-right">
            <div className="text-[10px] font-mono text-red-300 uppercase">Projected Peak Crest</div>
            <div className="text-sm font-mono font-bold text-red-400">
              {prediction.projectedPeakLevel.toFixed(2)}m @ {prediction.projectedPeakTime}
            </div>
          </div>
        </div>
      </div>

      {/* AI Reason for Prediction (Prominent Box) */}
      <div className="relative z-10 my-2 p-3.5 rounded-lg bg-black/40 border border-cyan-500/20 backdrop-blur-sm">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0 mt-0.5">
            <AlertTriangle size={15} />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono uppercase text-amber-400/90 font-bold tracking-wider mb-1">
              Reason for AI Prediction:
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans">
              "{prediction.reason}"
            </p>
          </div>
        </div>
      </div>

      {/* 6-Hour Timeline Forecast Progression */}
      <div className="relative z-10 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Clock size={12} className="text-cyan-400" /> Next 6 Hours Flood Progression
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Click hour to view hydrological state
          </span>
        </div>

        {/* 6 Hour Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {prediction.hourlyForecast.map((hf) => {
            const isSelected = selectedHour.hour === hf.hour;
            const riskMeta = RISK_COLORS[hf.riskTier] || RISK_COLORS.SAFE;

            return (
              <button
                key={hf.hour}
                onClick={() => setSelectedHour(hf)}
                className={`p-2.5 rounded-lg text-left transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-800/90 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/60'
                    : 'bg-black/30 border-white/5 hover:border-white/20 hover:bg-black/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 w-full">
                  <span className="text-xs font-mono font-bold text-white">{hf.hour}</span>
                  <span className="text-[10px] font-mono text-zinc-400">{hf.timeLabel}</span>
                </div>

                <div className="mb-2">
                  <div className="text-[10px] font-mono text-zinc-400">Proj. Stage</div>
                  <div className="text-sm font-mono font-bold text-cyan-300">
                    {hf.waterLevel.toFixed(2)}m
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-white/5">
                  <span
                    className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{
                      background: riskMeta.bg,
                      color: riskMeta.text,
                      border: `1px solid ${riskMeta.border}`
                    }}
                  >
                    {hf.riskTier}
                  </span>
                  <span className="text-[10px] font-mono text-blue-300 flex items-center gap-0.5">
                    <CloudRain size={10} />
                    {hf.rainfall.toFixed(0)}mm
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Insight Card & Model Metadata Footer */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">{selectedHour.hour} ({selectedHour.timeLabel}):</span>
          <span className="text-zinc-300">{selectedHour.summary}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500 ml-auto">
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-cyan-400" /> {prediction.modelName}
          </span>
          <span>·</span>
          <span>Latency: <strong className="text-zinc-300">{prediction.latencyMs}ms</strong></span>
        </div>
      </div>
    </div>
  );
};
