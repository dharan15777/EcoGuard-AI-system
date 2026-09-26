import React from 'react';
import { FloodSensor } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { Waves, CloudRain, Battery, Radio, Clock, ShieldAlert, Cpu } from 'lucide-react';

interface SensorCardProps {
  sensor: FloodSensor;
  isSelected?: boolean;
  onSelect?: (sensor: FloodSensor) => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  sensor,
  isSelected = false,
  onSelect
}) => {
  const riskMeta = RISK_COLORS[sensor.riskTier] || RISK_COLORS.SAFE;
  const isOnline = sensor.status === 'ONLINE';

  const formatLastPing = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getBatteryColor = (level: number) => {
    if (level < 25) return 'text-red-400';
    if (level < 60) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div
      onClick={() => onSelect && onSelect(sensor)}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-800/95 border-cyan-400 shadow-xl ring-2 ring-cyan-400/40'
          : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/70'
      }`}
    >
      <div>
        {/* Top: Name, Status & Risk Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            {/* Status Beacon */}
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              {isOnline && (
                <span className="absolute w-5 h-5 rounded-full bg-emerald-400/30 animate-ping" />
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {sensor.name}
              </h4>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="text-cyan-400 font-mono font-bold">{sensor.id}</span>
                <span>·</span>
                <span>{sensor.basin}</span>
              </div>
            </div>
          </div>

          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded flex-shrink-0"
            style={{
              background: riskMeta.bg,
              color: riskMeta.text,
              border: `1px solid ${riskMeta.border}`
            }}
          >
            {sensor.riskTier}
          </span>
        </div>

        {/* Telemetry Metrics Row: Water Level & Rainfall */}
        <div className="grid grid-cols-2 gap-2.5 my-3 p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
              <Waves size={12} className="text-cyan-400" /> Stage Height
            </div>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
              {sensor.waterLevel.toFixed(2)}m
              <span className="text-xs text-slate-500 font-normal ml-1">
                / {sensor.floodThreshold.toFixed(2)}m
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
              <CloudRain size={12} className="text-indigo-400" /> Precipitation
            </div>
            <div className="text-lg font-bold text-indigo-300 font-mono mt-0.5">
              {sensor.rainfallRate.toFixed(1)} <span className="text-xs font-sans">mm/h</span>
            </div>
          </div>
        </div>

        {/* Risk Score Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Flood Risk Score</span>
            <span style={{ color: riskMeta.color }} className="font-bold font-mono">
              {sensor.riskScore} / 100
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${sensor.riskScore}%`,
                background: riskMeta.color
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer: 1. Sensor Name, 2. Online/Offline Status, 3. Battery Percentage, 4. Last Update Time */}
      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <span className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
          ● {sensor.status}
        </span>

        <div className="flex items-center gap-1">
          <Battery size={14} className={getBatteryColor(sensor.batteryLevel)} />
          <span className="font-bold text-slate-200 font-mono">{sensor.batteryLevel.toFixed(0)}%</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={12} className="text-slate-500" />
          <span className="font-mono">{formatLastPing(sensor.lastPing)}</span>
        </div>
      </div>
    </div>
  );
};
