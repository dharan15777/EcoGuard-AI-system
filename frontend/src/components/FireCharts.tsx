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
import { HistoricalFireReading } from '../types/fire';
import { Thermometer, CloudFog, Wind, Droplets, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

interface ChartsProps {
  historicalData: HistoricalFireReading[];
  criticalTempThreshold?: number; // e.g. 40.0 °C
  warningTempThreshold?: number; // e.g. 35.0 °C
  criticalHumidityThreshold?: number; // e.g. 25 %
}

export const Charts: React.FC<ChartsProps> = ({
  historicalData = [],
  criticalTempThreshold = 40.0,
  warningTempThreshold = 35.0,
  criticalHumidityThreshold = 25.0
}) => {
  const latest = historicalData[historicalData.length - 1] || {
    temperature: 38.4,
    humidity: 22,
    smokePPM: 68,
    windSpeed: 22,
    riskScore: 68,
    timestamp: 'Now'
  };

  const maxTemp = Math.max(...historicalData.map(d => d.temperature), criticalTempThreshold + 4);
  const minTemp = Math.min(...historicalData.map(d => d.temperature), 22.0);

  // Custom sleek tooltip for Temperature & Smoke
  const TempCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const tempVal = payload[0].value;
      const smokeVal = payload[1]?.value;
      const isExtreme = tempVal >= criticalTempThreshold;
      return (
        <div className="bg-slate-950/95 border border-orange-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">TIME: {label}</div>
          <div className="text-base font-bold text-orange-300 font-mono">
            {tempVal.toFixed(1)}°C
          </div>
          {smokeVal !== undefined && (
            <div className="text-xs font-mono text-slate-300 mt-0.5">
              Smoke Particulate: <strong className="text-amber-400">{smokeVal} ppm</strong>
            </div>
          )}
          <div className="text-[11px] mt-1 pt-1 border-t border-white/10 font-medium">
            <span className={isExtreme ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isExtreme
                ? `▲ +${(tempVal - criticalTempThreshold).toFixed(1)}°C (Critical Heat Danger)`
                : `▼ Safe Thermal Range`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom sleek tooltip for Humidity & Wind
  const HumidityCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const humVal = payload[0].value;
      const windVal = payload[1]?.value;
      const isDesiccated = humVal <= criticalHumidityThreshold;
      return (
        <div className="bg-slate-950/95 border border-cyan-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md text-xs">
          <div className="text-slate-400 font-mono text-[11px] mb-1">TIME: {label}</div>
          <div className="text-base font-bold text-cyan-300 font-mono">
            {humVal}% Humidity
          </div>
          {windVal !== undefined && (
            <div className="text-xs font-mono text-slate-300 mt-0.5">
              Wind Velocity: <strong className="text-amber-300">{windVal} km/h</strong>
            </div>
          )}
          <div className="text-[11px] mt-1 pt-1 border-t border-white/10 text-slate-300 font-medium">
            <span className={isDesiccated ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {isDesiccated ? '⚠️ Critical Canopy Desiccation (< 25%)' : 'Moisture Within Safe Buffer'}
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
          SECTION 4: TEMPERATURE & SMOKE CONCENTRATION TREND CHART
         ======================================================== */}
      <div
        className="field-panel p-6 rounded-xl flex flex-col justify-between"
        style={{
          background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
          border: '1px solid rgba(249,115,22,0.3)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-950/70 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Thermometer size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                SECTION 4 · THERMAL & SMOKE COMBUSTION TELEMETRY
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Canopy Temperature & Smoke Concentration Trend
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-orange-400" />
              <span className="text-slate-300">Canopy Temp (°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Smoke Particulate (PPM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 border-dashed" />
              <span className="text-red-400">Critical Heat (40°C)</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-mono text-cyan-400">
              Current: <strong>{latest.temperature.toFixed(1)}°C</strong>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="smokeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[Math.floor(minTemp - 2), Math.ceil(maxTemp + 2)]} tickLine={false} />
              <Tooltip content={<TempCustomTooltip />} />

              {/* Reference Lines */}
              <ReferenceLine
                y={criticalTempThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'CRITICAL 40°C', position: 'insideTopRight', fill: '#ef4444', fontSize: 10, fontWeight: 700 }}
              />
              <ReferenceLine
                y={warningTempThreshold}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: 'WARNING 35°C', position: 'insideTopRight', fill: '#f59e0b', fontSize: 9 }}
              />

              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="Temperature"
              />
              <Line
                type="monotone"
                dataKey="smokePPM"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Smoke PPM"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================
          SECTION 5: RELATIVE HUMIDITY & WIND SPEED TREND CHART
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
              <Droplets size={22} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                SECTION 5 · ATMOSPHERIC DESICCATION & WIND FORCING
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Canopy Relative Humidity & Wind Speed Dynamics
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300">Relative Humidity (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-slate-300">Wind Velocity (km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 border-dashed" />
              <span className="text-red-400">Desiccation Limit (&lt; 25%)</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 font-mono text-cyan-300">
              Current Humidity: <strong>{latest.humidity}%</strong> · Wind: <strong>{latest.windSpeed} km/h</strong>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 90]} tickLine={false} />
              <Tooltip content={<HumidityCustomTooltip />} />

              {/* Reference Lines */}
              <ReferenceLine
                y={criticalHumidityThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'CRITICAL DESICCATION 25%', position: 'insideTopRight', fill: '#ef4444', fontSize: 10, fontWeight: 700 }}
              />

              <Area
                type="monotone"
                dataKey="humidity"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#humGradient)"
                name="Relative Humidity"
              />
              <Line
                type="monotone"
                dataKey="windSpeed"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                name="Wind Velocity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;
