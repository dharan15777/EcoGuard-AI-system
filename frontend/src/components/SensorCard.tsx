import React from 'react';
import { FloodSensor } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { Waves, CloudRain, Battery, BatteryCharging, Radio, Clock, ShieldAlert, Cpu } from 'lucide-react';

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
      className={`field-panel p-4 rounded-lg cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
        isSelected
          ? 'bg-zinc-900/90 border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
          : 'bg-black/30 border-white/10 hover:border-white/25 hover:bg-black/45'
      }`}
    >
      {/* Top: Name, Status & Risk Badge */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Status Beacon */}
            <div className="relative flex items-center justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
              {isOnline && (
                <span className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping" />
              )}
            </div>

            <div>
              <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                {sensor.name}
              </h4>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span className="text-cyan-400 font-semibold">{sensor.id}</span>
                <span>·</span>
                <span>{sensor.basin}</span>
              </div>
            </div>
          </div>

          {/* Risk Tier Badge */}
          <span
            className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded flex-shrink-0"
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
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded bg-black/40 border border-white/5 font-mono">
          <div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Waves size={11} className="text-cyan-400" /> STAGE HEIGHT
            </div>
            <div className="text-base font-bold text-cyan-300 mt-0.5">
              {sensor.waterLevel.toFixed(2)}m
              <span className="text-[10px] text-zinc-500 font-normal ml-1">
                / {sensor.floodThreshold.toFixed(2)}m
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-1">
              <CloudRain size={11} className="text-blue-400" /> PRECIPITATION
            </div>
            <div className="text-base font-bold text-indigo-300 mt-0.5">
              {sensor.rainfallRate.toFixed(1)} <span className="text-[10px]">mm/h</span>
            </div>
          </div>
        </div>

        {/* Risk Score Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
            <span>Flood Hazard Score</span>
            <span style={{ color: riskMeta.color }} className="font-bold">
              {sensor.riskScore} / 100
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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

      {/* Footer: Sensor Health Monitoring Attributes */}
      {/* 1. Online/Offline Status, 2. Battery Percentage, 3. Last Update Time */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        {/* Status */}
        <span className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-zinc-500'}`}>
          ● {sensor.status}
        </span>

        {/* Battery Percentage */}
        <div className="flex items-center gap-1">
          <Battery size={13} className={getBatteryColor(sensor.batteryLevel)} />
          <span className="font-bold text-zinc-200">{sensor.batteryLevel.toFixed(0)}%</span>
        </div>

        {/* Last Update Time */}
        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <Clock size={11} className="text-zinc-500" />
          <span>{formatLastPing(sensor.lastPing)}</span>
        </div>
      </div>
    </div>
  );
};
