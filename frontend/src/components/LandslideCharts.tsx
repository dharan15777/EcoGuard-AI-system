import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Line
} from 'recharts';
import { HistoricalLandslideReading } from '../types/landslide';
import { Droplets, CloudRain, Activity, Move, TrendingUp } from 'lucide-react';

interface LandslideChartsProps {
  historicalData: HistoricalLandslideReading[];
  criticalDisplacementThreshold?: number; // e.g. 18.0 mm
  warningDisplacementThreshold?: number; // e.g. 8.0 mm
  saturationThreshold?: number; // e.g. 80 %
}

export const LandslideCharts: React.FC<LandslideChartsProps> = ({
  historicalData = [],
  criticalDisplacementThreshold = 18.0,
  warningDisplacementThreshold = 8.0,
  saturationThreshold = 80.0
}) => {
  const latest = historicalData[historicalData.length - 1] || {
    soilMoisture: 88.5,
    rainfallRate: 46.2,
    groundVibration: 8.8,
    groundDisplacement: 22.4,
    timestamp: 'Now'
  };

  const maxDisp = Math.max(...historicalData.map(d => d.groundDisplacement), criticalDisplacementThreshold + 6);
  const minDisp = 0;

  // Custom sleek tooltip for Soil Moisture & Rainfall
  const MoistureRainTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const moistVal = payload[0].value;
      const rainVal = payload[1]?.value;
      return (
        <div className="bg-slate-950/95 border border-cyan-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">TIME: {label}</div>
          <div className="text-base font-bold text-cyan-300 font-mono">
            Soil Moisture: {moistVal}%
          </div>
          {rainVal !== undefined && (
            <div className="text-xs font-mono text-indigo-300 mt-0.5">
              Rainfall Rate: <strong>{rainVal} mm/h</strong>
            </div>
          )}
          <div className="text-[11px] mt-1 pt-1 border-t border-white/10 font-medium">
            <span className={moistVal >= saturationThreshold ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {moistVal >= saturationThreshold ? 'CRITICAL SOIL SATURATION' : 'NOMINAL HYDROLOGICAL LOAD'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom sleek tooltip for Displacement & Vibration
  const DispVibTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dispVal = payload[0].value;
      const vibVal = payload[1]?.value;
      const isCritical = dispVal >= criticalDisplacementThreshold;
      return (
        <div className="bg-slate-950/95 border border-amber-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">TIME: {label}</div>
          <div className="text-base font-bold text-amber-300 font-mono">
            Displacement: +{dispVal.toFixed(1)} mm
          </div>
          {vibVal !== undefined && (
            <div className="text-xs font-mono text-slate-300 mt-0.5">
              Ground Vibration: <strong className="text-red-400">{vibVal.toFixed(1)} mm/s PPV</strong>
            </div>
          )}
          <div className="text-[11px] mt-1 pt-1 border-t border-white/10 font-medium">
            <span className={isCritical ? 'text-red-400 font-bold' : 'text-amber-400'}>
              {isCritical ? 'CRITICAL SHEAR DISPLACEMENT' : 'PROGRESSIVE CREEP DETECTED'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ========================================================
          CHART 1: SOIL MOISTURE (%) & RAINFALL INTENSITY (mm/h)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(56,189,248,0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Droplets size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                SECTION 5 · HYDRO-METEOROLOGICAL SATURATION DYNAMICS
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Soil Moisture Saturation (%) & Rainfall Intensity Trend
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Soil Moisture (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-slate-300">Rainfall (mm/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 border-dashed" />
              <span className="text-red-400">Saturation Limit (80%)</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-mono text-cyan-400">
              Current Moisture: <strong>{latest.soilMoisture}%</strong>
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[20, 100]} tickLine={false} />
              <Tooltip content={<MoistureRainTooltip />} />
              <ReferenceLine
                y={saturationThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'SATURATION 80%', position: 'insideTopRight', fill: '#ef4444', fontSize: 10, fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="soilMoisture" stroke="#38bdf8" strokeWidth={2.5} fill="url(#moistGrad)" name="Soil Moisture" />
              <Area type="monotone" dataKey="rainfallRate" stroke="#818cf8" strokeWidth={2} fill="url(#rainGrad)" name="Rainfall" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================
          CHART 2: GROUND DISPLACEMENT (mm) & VIBRATION (mm/s PPV)
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Move size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                SECTION 6 · GEOTECHNICAL SHEAR DISPLACEMENT & SEISMICITY
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Slope Shear Displacement (mm) & Ground Vibration (PPV)
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Displacement (mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-red-400" />
              <span className="text-slate-300">Vibration (mm/s)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 border-dashed" />
              <span className="text-red-400">Failure Slip (18 mm)</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-mono text-amber-400">
              Displacement: <strong>+{latest.groundDisplacement.toFixed(1)} mm</strong>
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, Math.ceil(maxDisp + 4)]} tickLine={false} />
              <Tooltip content={<DispVibTooltip />} />
              <ReferenceLine
                y={criticalDisplacementThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'CRITICAL SLIP 18mm', position: 'insideTopRight', fill: '#ef4444', fontSize: 10, fontWeight: 700 }}
              />
              <ReferenceLine
                y={warningDisplacementThreshold}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: 'WARNING 8mm', position: 'insideTopRight', fill: '#f59e0b', fontSize: 9 }}
              />
              <Area type="monotone" dataKey="groundDisplacement" stroke="#f59e0b" strokeWidth={2.5} fill="url(#dispGrad)" name="Displacement" />
              <Area type="monotone" dataKey="groundVibration" stroke="#ef4444" strokeWidth={1.5} fill="url(#vibGrad)" name="Vibration" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LandslideCharts;
