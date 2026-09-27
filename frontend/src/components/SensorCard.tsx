import React from 'react';
import { FireSensor } from '../types/fire';
import { FIRE_RISK_COLORS } from '../utils/fireConstants';
import { Thermometer, CloudFog, Wind, Droplets, Battery, Radio, Clock, Flame, ShieldAlert, Cpu } from 'lucide-react';

interface SensorCardProps {
  sensor: FireSensor;
  isSelected?: boolean;
  onSelect?: (sensor: FireSensor) => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  sensor,
  isSelected = false,
  onSelect
}) => {
  const riskMeta = FIRE_RISK_COLORS[sensor.riskTier] || FIRE_RISK_COLORS.LOW;
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
          ? 'bg-slate-800/95 border-orange-400 shadow-xl ring-2 ring-orange-400/40'
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
                <span className="text-orange-400 font-mono font-bold">{sensor.id}</span>
                <span>·</span>
                <span>{sensor.forestZone}</span>
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

        {/* Telemetry Metrics Row: Temperature & Smoke */}
        <div className="grid grid-cols-2 gap-2.5 my-3 p-2.5 rounded-lg bg-slate-950/70 border border-white/5">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
              <Thermometer size={12} className="text-orange-400" /> Temperature
            </div>
            <div className="text-lg font-bold text-orange-300 font-mono mt-0.5">
              {sensor.temperature.toFixed(1)}°C
              <span className="text-[10px] text-slate-400 font-normal ml-1">
                (Max: {sensor.maxTempToday.toFixed(1)}°)
              </span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
              <CloudFog size={12} className="text-amber-400" /> Smoke & CO
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">
              {sensor.smokePPM} <span className="text-xs font-sans">ppm</span>
              <span className="text-[10px] text-slate-400 font-normal ml-1">
                (CO: {sensor.carbonMonoxide.toFixed(1)})
              </span>
            </div>
          </div>
        </div>

        {/* Atmospheric Context: Humidity & Wind */}
        <div className="flex items-center justify-between text-xs text-slate-300 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <Droplets size={12} className="text-cyan-400" />
            <span>Humidity: <strong className={sensor.humidity <= 25 ? 'text-red-400' : 'text-white'}>{sensor.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={12} className="text-amber-400" />
            <span>Wind: <strong className="text-white">{sensor.windSpeed} km/h</strong></span>
          </div>
        </div>
      </div>

      {/* Footer: Battery, Signal, Timestamp */}
      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Battery size={13} className={getBatteryColor(sensor.batteryLevel)} />
            <strong className="text-slate-200 font-mono">{sensor.batteryLevel.toFixed(0)}%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Radio size={13} className="text-cyan-400" />
            <span>LoRaWAN</span>
          </span>
        </div>

        <span className="flex items-center gap-1 font-mono text-[10px]">
          <Clock size={11} className="text-slate-500" />
          {formatLastPing(sensor.lastPing)}
        </span>
      </div>
    </div>
  );
};

export default SensorCard;
