import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { HistoricalReading } from '../types/flood';
import { Waves, CloudRain, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface ChartsProps {
  historicalData: HistoricalReading[];
  floodThreshold?: number; // e.g. 4.20 m
  warningThreshold?: number; // e.g. 3.50 m
  heavyRainThreshold?: number; // e.g. 35.0 mm/h
}

export const Charts: React.FC<ChartsProps> = ({
  historicalData = [],
  floodThreshold = 4.20,
  warningThreshold = 3.50,
  heavyRainThreshold = 35.0
}) => {
  const latest = historicalData[historicalData.length - 1] || {
    waterLevel: 4.82,
    rainfall: 48.5,
    timestamp: 'Now'
  };

  const maxWater = Math.max(...historicalData.map(d => d.waterLevel), floodThreshold + 0.6);
  const minWater = Math.min(...historicalData.map(d => d.waterLevel), 1.0);
  const maxRain = Math.max(...historicalData.map(d => d.rainfall), heavyRainThreshold + 10);

  // Custom sleek tooltip for Water Level
  const WaterCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isDanger = val >= floodThreshold;
      return (
        <div className="bg-slate-950/95 border border-cyan-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">TIME: {label}</div>
          <div className="text-base font-bold text-cyan-300 font-mono">
            {val.toFixed(2)} meters
          </div>
          <div className="text-[11px] mt-1 pt-1 border-t border-white/10 font-medium">
            <span className={isDanger ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isDanger ? `▲ +${(val - floodThreshold).toFixed(2)}m (Danger Exceeded)` : `▼ -${(floodThreshold - val).toFixed(2)}m (Within Limit)`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom sleek tooltip for Rainfall
  const RainCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-950/95 border border-indigo-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">TIME: {label}</div>
          <div className="text-base font-bold text-indigo-300 font-mono">
            {val.toFixed(1)} mm/hr
          </div>
          <div className="text-[11px] mt-1 pt-1 border-t border-white/10 text-slate-300 font-medium">
            {val >= 35 ? 'Torrential Downpour' : val >= 20 ? 'Heavy Precipitation' : 'Moderate Inflow'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ========================================================
          SECTION 4: WATER LEVEL TREND CHART (FULL WIDTH)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(56,189,248,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Waves size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                SECTION 4 · HYDROLOGICAL STAGE TELEMETRY
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Water Level Trend Chart & Inundation Stage History
              </h2>
            </div>
          </div>

          {/* Current reading pill & live indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY STREAM
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Water Level</div>
              <div className="text-2xl font-bold text-cyan-300 font-mono">
                {latest.waterLevel.toFixed(2)}m
              </div>
            </div>
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 mb-3 px-1">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-0.5 bg-red-500 inline-block" />
              <strong className="text-red-400">Danger Threshold: {floodThreshold.toFixed(2)}m</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-0.5 bg-orange-400 inline-block" />
              <strong className="text-orange-400">Warning Threshold: {warningThreshold.toFixed(2)}m</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-cyan-300">
              <span className="w-3.5 h-1.5 rounded-sm bg-cyan-400 inline-block" />
              Brahmaputra Hydro Node Alpha Telemetry
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">30-minute interval readings · Auto-syncing</span>
        </div>

        {/* Full-Width Recharts Area */}
        <div className="w-full h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 12, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="waterLevelGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                domain={[Math.floor(minWater * 0.8), Math.ceil(maxWater * 1.1)]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit="m"
              />
              <Tooltip content={<WaterCustomTooltip />} />

              <ReferenceLine
                y={floodThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `DANGER LIMIT (${floodThreshold}m)`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'top'
                }}
              />

              <ReferenceLine
                y={warningThreshold}
                stroke="#f97316"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `WARNING LIMIT (${warningThreshold}m)`,
                  fill: '#f97316',
                  fontSize: 10,
                  position: 'top'
                }}
              />

              <Area
                type="monotone"
                dataKey="waterLevel"
                stroke="#38bdf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#waterLevelGradient)"
                dot={{ fill: '#38bdf8', r: 3.5, stroke: '#0369a1', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 mt-4 pt-3 border-t border-white/10">
          <span>MIN RECORDED: <strong className="text-white font-mono">{Math.min(...historicalData.map(d => d.waterLevel)).toFixed(2)}m</strong></span>
          <span>PEAK RECORDED: <strong className="text-cyan-300 font-mono">{Math.max(...historicalData.map(d => d.waterLevel)).toFixed(2)}m</strong></span>
          <span>DISCHARGE STATUS: <strong className={latest.waterLevel >= floodThreshold ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {latest.waterLevel >= floodThreshold ? 'CRITICAL FLOOD STAGE BREACHED' : 'NORMAL HYDRAULIC DISCHARGE'}
          </strong></span>
        </div>
      </div>

      {/* ========================================================
          SECTION 5: RAINFALL TREND CHART (FULL WIDTH)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(129,140,248,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <CloudRain size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                SECTION 5 · PRECIPITATION & RUNOFF ACCUMULATION
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Rainfall Trend Chart & Catchment Storm History
              </h2>
            </div>
          </div>

          {/* Current reading pill & live indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              LIVE PRECIPITATION FEED
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Precipitation</div>
              <div className="text-2xl font-bold text-indigo-300 font-mono">
                {latest.rainfall.toFixed(1)} <span className="text-sm font-sans text-slate-400">mm/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 mb-3 px-1">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-0.5 bg-red-400 inline-block" />
              <strong className="text-red-400">Extreme Rainfall Threshold: {heavyRainThreshold} mm/hr</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-indigo-300">
              <span className="w-3.5 h-1.5 rounded-sm bg-indigo-400 inline-block" />
              Brahmaputra Basin Meteorological Feed
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">24-Hour Cumulative: 114.2 mm</span>
        </div>

        {/* Full-Width Recharts Area */}
        <div className="w-full h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 12, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                domain={[0, Math.ceil(maxRain * 1.15)]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit="mm"
              />
              <Tooltip content={<RainCustomTooltip />} />

              <ReferenceLine
                y={heavyRainThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `EXTREME PRECIPITATION (${heavyRainThreshold} mm/h)`,
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'top'
                }}
              />

              <Area
                type="monotone"
                dataKey="rainfall"
                stroke="#818cf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#rainfallGradient)"
                dot={{ fill: '#818cf8', r: 3.5, stroke: '#312e81', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#ffffff', stroke: '#818cf8', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 mt-4 pt-3 border-t border-white/10">
          <span>AVERAGE RAIN RATE: <strong className="text-white font-mono">{(historicalData.reduce((acc, d) => acc + d.rainfall, 0) / (historicalData.length || 1)).toFixed(1)} mm/hr</strong></span>
          <span>PEAK RAIN RATE: <strong className="text-indigo-300 font-mono">{Math.max(...historicalData.map(d => d.rainfall)).toFixed(1)} mm/hr</strong></span>
          <span>INTENSITY CLASSIFICATION: <strong className="text-red-400 font-semibold">TORRENTIAL MONSOON PRECIPITATION</strong></span>
        </div>
      </div>
    </div>
  );
};
