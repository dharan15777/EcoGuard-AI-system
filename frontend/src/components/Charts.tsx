import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { HistoricalReading } from '../types/flood';
import { Waves, CloudRain, Activity, Maximize2, AlertTriangle, ShieldCheck } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'both' | 'water' | 'rainfall'>('both');

  // Latest readings
  const latest = historicalData[historicalData.length - 1] || {
    waterLevel: 4.82,
    rainfall: 48.5,
    timestamp: 'Now'
  };

  const maxWater = Math.max(...historicalData.map(d => d.waterLevel), floodThreshold + 0.6);
  const minWater = Math.min(...historicalData.map(d => d.waterLevel), 1.0);
  const maxRain = Math.max(...historicalData.map(d => d.rainfall), heavyRainThreshold + 10);

  // Custom Dark Tooltip for Water Level
  const WaterCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isDanger = val >= floodThreshold;
      const isWarn = val >= warningThreshold && !isDanger;

      return (
        <div className="bg-zinc-950/95 border border-cyan-500/40 p-3 rounded-lg shadow-xl backdrop-blur-md font-mono text-xs">
          <div className="text-zinc-400 mb-1 border-b border-white/10 pb-1 flex justify-between gap-4">
            <span>TIMESTAMP:</span>
            <strong className="text-white">{label}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 my-1">
            <span className="text-cyan-400 font-semibold">STAGE HEIGHT:</span>
            <span className="text-base font-bold text-white">{val.toFixed(2)} m</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[10px] mt-1 pt-1 border-t border-white/5">
            <span>DELTA VS FLOOD STAGE:</span>
            <span className={val >= floodThreshold ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {val >= floodThreshold ? `+${(val - floodThreshold).toFixed(2)}m (EXCEEDED)` : `-${(floodThreshold - val).toFixed(2)}m (CLEAR)`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dark Tooltip for Rainfall
  const RainCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isHeavy = val >= heavyRainThreshold;

      return (
        <div className="bg-zinc-950/95 border border-indigo-500/40 p-3 rounded-lg shadow-xl backdrop-blur-md font-mono text-xs">
          <div className="text-zinc-400 mb-1 border-b border-white/10 pb-1 flex justify-between gap-4">
            <span>TIMESTAMP:</span>
            <strong className="text-white">{label}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 my-1">
            <span className="text-indigo-400 font-semibold">PRECIPITATION RATE:</span>
            <span className="text-base font-bold text-white">{val.toFixed(1)} mm/hr</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[10px] mt-1 pt-1 border-t border-white/5">
            <span>INTENSITY TIER:</span>
            <span className={isHeavy ? 'text-red-400 font-bold' : val > 15 ? 'text-orange-400' : 'text-emerald-400'}>
              {val >= 40 ? 'TORRENTIAL MONSOON' : val >= 25 ? 'HEAVY DOWNPOUR' : val >= 10 ? 'MODERATE RAIN' : 'LIGHT PRECIPITATION'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header and Filter Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <div className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
            <Activity size={13} /> Hydrological Real-Time Telemetry Trends
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Water Level & Precipitation Time-Series Analytics
          </h3>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'both' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            SPLIT VIEW
          </button>
          <button
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
              activeTab === 'water' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Waves size={12} /> WATER LEVEL
          </button>
          <button
            onClick={() => setActiveTab('rainfall')}
            className={`px-3 py-1 rounded transition-all flex items-center gap-1 ${
              activeTab === 'rainfall' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CloudRain size={12} /> RAINFALL
          </button>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className={`grid gap-5 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* ========================================================
            SECTION 4: WATER LEVEL TREND CHART
           ======================================================== */}
        {(activeTab === 'both' || activeTab === 'water') && (
          <div
            className="field-panel p-5 rounded-lg flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, rgba(16,24,24,0.96) 0%, rgba(11,18,17,0.98) 100%)',
              border: '1px solid rgba(56,189,248,0.25)'
            }}
          >
            {/* Top Stat Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <Waves size={15} />
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    Water Level Trend Chart (Stage Height)
                  </h4>
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Pine River Valley Sector 4 Primary Hydrostatic Stage
                </div>
              </div>

              {/* Current Value Pill */}
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Current Stage</span>
                <div className="text-xl font-mono font-black text-cyan-300">
                  {latest.waterLevel.toFixed(2)}m
                </div>
              </div>
            </div>

            {/* Threshold Legend Bar */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 inline-block" />
                <strong className="text-red-400">Danger: {floodThreshold.toFixed(2)}m</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-500 inline-block" />
                <strong className="text-orange-400">Warning: {warningThreshold.toFixed(2)}m</strong>
              </span>
              <span className="ml-auto text-zinc-500">Interval: 30 min ticks</span>
            </div>

            {/* Recharts Area Chart */}
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalData}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#52525b"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[Math.floor(minWater * 0.8), Math.ceil(maxWater * 1.15)]}
                    stroke="#52525b"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    unit="m"
                  />
                  <Tooltip content={<WaterCustomTooltip />} />

                  {/* Danger Reference Line */}
                  <ReferenceLine
                    y={floodThreshold}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `DANGER (${floodThreshold}m)`,
                      fill: '#ef4444',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      position: 'top'
                    }}
                  />

                  {/* Warning Reference Line */}
                  <ReferenceLine
                    y={warningThreshold}
                    stroke="#f97316"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{
                      value: `WARNING (${warningThreshold}m)`,
                      fill: '#f97316',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      position: 'top'
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="waterLevel"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#waterGradient)"
                    dot={{ fill: '#38bdf8', r: 3, stroke: '#082f49', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom summary stats */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2 pt-2 border-t border-white/5">
              <span>MIN: <strong className="text-zinc-200">{Math.min(...historicalData.map(d => d.waterLevel)).toFixed(2)}m</strong></span>
              <span>PEAK: <strong className="text-cyan-300">{Math.max(...historicalData.map(d => d.waterLevel)).toFixed(2)}m</strong></span>
              <span>STATUS: <strong className={latest.waterLevel >= floodThreshold ? 'text-red-400' : 'text-emerald-400'}>
                {latest.waterLevel >= floodThreshold ? 'CRITICAL EXCEEDANCE' : 'CONTROLLED'}
              </strong></span>
            </div>
          </div>
        )}

        {/* ========================================================
            SECTION 5: RAINFALL TREND CHART
           ======================================================== */}
        {(activeTab === 'both' || activeTab === 'rainfall') && (
          <div
            className="field-panel p-5 rounded-lg flex flex-col justify-between"
            style={{
              background: 'linear-gradient(160deg, rgba(18,20,28,0.96) 0%, rgba(13,14,21,0.98) 100%)',
              border: '1px solid rgba(99,102,241,0.25)'
            }}
          >
            {/* Top Stat Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <CloudRain size={15} />
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono">
                    Rainfall Trend Chart (Precipitation History)
                  </h4>
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> LIVE STREAM
                  </span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Pine River Upstream Catchment Optical Rain Gauge
                </div>
              </div>

              {/* Current Value Pill */}
              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Current Rate</span>
                <div className="text-xl font-mono font-black text-indigo-300">
                  {latest.rainfall.toFixed(1)} <span className="text-xs">mm/h</span>
                </div>
              </div>
            </div>

            {/* Threshold Legend Bar */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-400 inline-block" />
                <strong className="text-red-400">Extreme Rain Threshold: {heavyRainThreshold} mm/h</strong>
              </span>
              <span className="ml-auto text-zinc-500">Intensity Unit: mm/hr</span>
            </div>

            {/* Recharts Line / Area Chart */}
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={historicalData}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#52525b"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[0, Math.ceil(maxRain * 1.15)]}
                    stroke="#52525b"
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    unit="mm"
                  />
                  <Tooltip content={<RainCustomTooltip />} />

                  {/* Heavy Rain Reference Line */}
                  <ReferenceLine
                    y={heavyRainThreshold}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `EXTREME (${heavyRainThreshold}mm/h)`,
                      fill: '#ef4444',
                      fontSize: 9,
                      fontFamily: 'monospace',
                      position: 'top'
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="rainfall"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#rainGradient)"
                    dot={{ fill: '#818cf8', r: 3, stroke: '#1e1b4b', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#818cf8', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom summary stats */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2 pt-2 border-t border-white/5">
              <span>AVG RATE: <strong className="text-zinc-200">
                {(historicalData.reduce((acc, d) => acc + d.rainfall, 0) / (historicalData.length || 1)).toFixed(1)} mm/h
              </strong></span>
              <span>PEAK RATE: <strong className="text-indigo-300">
                {Math.max(...historicalData.map(d => d.rainfall)).toFixed(1)} mm/h
              </strong></span>
              <span>24H ACCUM: <strong className="text-cyan-300">114.2 mm</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
