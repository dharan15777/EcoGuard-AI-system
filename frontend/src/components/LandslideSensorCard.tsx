import React from 'react';
import { LandslideSensor } from '../types/landslide';
import { LANDSLIDE_RISK_COLORS } from '../utils/landslideConstants';
import { Mountain, Droplets, Move, Activity, Compass, Battery, Radio, Clock, ShieldAlert } from 'lucide-react';

interface LandslideSensorCardProps {
  sensor: LandslideSensor;
  isSelected?: boolean;
  onSelect?: (sensor: LandslideSensor) => void;
}

export const LandslideSensorCard: React.FC<LandslideSensorCardProps> = ({
  sensor,
  isSelected = false,
  onSelect
}) => {
  const riskMeta = LANDSLIDE_RISK_COLORS[sensor.riskTier] || LANDSLIDE_RISK_COLORS.LOW;
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
          ? 'bg-slate-800/95 border-amber-400 shadow-xl ring-2 ring-amber-400/40'
          : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/70'
      }`}
    >
      <div>
        {/* Top: Name, Status & Risk Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              {isOnline && sensor.riskTier === 'CRITICAL' && (
                <span className="absolute w-3 h-3 rounded-full bg-red-400 animate-ping opacity-75" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                {sensor.name}
              </h4>
              <div className="text-[11px] text-slate-400 font-mono">
                {sensor.id} · {sensor.hillZone}
              </div>
            </div>
          </div>

          <span
            className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shrink-0"
            style={{
              background: riskMeta.bg,
              color: riskMeta.text,
              border: `1px solid ${riskMeta.border}`
            }}
          >
            {sensor.riskTier}
          </span>
        </div>

        {/* 4-Metric Geotechnical Data Grid */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
              <Droplets size={11} className="text-cyan-400" /> Soil Moisture
            </div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">
              {sensor.soilMoisture.toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
              <Move size={11} className="text-amber-400" /> Displacement
            </div>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              +{sensor.groundDisplacement.toFixed(1)} mm
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
              <Activity size={11} className="text-indigo-400" /> Vibration
            </div>
            <div className="text-sm font-bold text-indigo-300 mt-0.5">
              {sensor.groundVibration.toFixed(1)} mm/s
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
              <Compass size={11} className="text-emerald-400" /> Slope Tilt
            </div>
            <div className="text-sm font-bold text-emerald-300 mt-0.5">
              {sensor.slopeTiltAngle.toFixed(1)}°
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Battery, Signal & Ping */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 font-semibold ${getBatteryColor(sensor.batteryLevel)}`}>
            <Battery size={13} /> {sensor.batteryLevel.toFixed(0)}%
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Radio size={12} className="text-slate-500" /> {sensor.status}
          </span>
        </div>

        <span className="flex items-center gap-1 text-slate-500 text-[10px]">
          <Clock size={11} /> {formatLastPing(sensor.lastPing)}
        </span>
      </div>
    </div>
  );
};

export default LandslideSensorCard;
