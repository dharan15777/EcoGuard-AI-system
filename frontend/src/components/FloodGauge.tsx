import React from 'react';
import { FireRiskTier } from '../types/fire';
import { FIRE_RISK_COLORS } from '../utils/fireConstants';
import { AlertTriangle, ShieldCheck, ShieldAlert, TrendingUp, Info, Flame, Wind, Droplets } from 'lucide-react';

interface FireGaugeProps {
  score: number; // 0 to 100
  tier: FireRiskTier;
  temperature: number; // °C
  humidity: number; // %
  smokePPM: number; // ppm
  windSpeed: number; // km/h
}

export const FireGauge: React.FC<FireGaugeProps> = ({
  score,
  tier,
  temperature,
  humidity,
  smokePPM,
  windSpeed
}) => {
  const currentRisk = FIRE_RISK_COLORS[tier] || FIRE_RISK_COLORS.LOW;

  // Arc geometry
  const radius = 135;
  const strokeWidth = 18;
  const cx = 200;
  const cy = 180;

  const scoreClamped = Math.min(100, Math.max(0, score));
  const angleDeg = -180 + (scoreClamped / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Needle tip
  const needleLength = 110;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy + needleLength * Math.sin(angleRad);

  const createArc = (startFrac: number, endFrac: number) => {
    const startAng = -Math.PI + startFrac * Math.PI;
    const endAng = -Math.PI + endFrac * Math.PI;
    const x1 = cx + radius * Math.cos(startAng);
    const y1 = cy + radius * Math.sin(startAng);
    const x2 = cx + radius * Math.cos(endAng);
    const y2 = cy + radius * Math.sin(endAng);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <div
      className="field-panel p-6 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: tier === 'EXTREME' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: tier === 'EXTREME' ? '0 10px 30px rgba(239, 68, 68, 0.15)' : '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: currentRisk.bg, border: `1px solid ${currentRisk.border}` }}
          >
            <Flame size={22} color={currentRisk.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                SECTION 2 · COMPREHENSIVE FOREST FIRE RISK ASSESSMENT
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Fire Risk Severity Indicator & Visual Gauge
            </h2>
          </div>
        </div>

        {/* Current Risk Badge */}
        <div
          className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-sm"
          style={{
            background: currentRisk.bg,
            color: currentRisk.text,
            border: `1.5px solid ${currentRisk.border}`
          }}
        >
          {tier === 'EXTREME' ? (
            <ShieldAlert size={16} />
          ) : tier === 'LOW' ? (
            <ShieldCheck size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          STATUS: {currentRisk.name.toUpperCase()} RISK CATEGORY
        </div>
      </div>

      {/* Main Gauge & Matrix Layout: 2 Columns for maximum clarity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Large Visual Gauge (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-white/5 relative">
          <svg viewBox="0 0 400 230" className="w-full max-w-[420px] h-auto overflow-visible select-none">
            <defs>
              <filter id="gauge-glow-fire" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background track */}
            <path
              d={createArc(0, 1)}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth + 6}
              strokeLinecap="round"
            />

            {/* 4 Color Zones */}
            {/* Green = Low (0 - 25) */}
            <path
              d={createArc(0.01, 0.245)}
              fill="none"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              opacity={tier === 'LOW' ? 1 : 0.4}
              strokeLinecap="round"
            />
            {/* Yellow = Moderate (25 - 50) */}
            <path
              d={createArc(0.26, 0.495)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              opacity={tier === 'MODERATE' ? 1 : 0.4}
            />
            {/* Orange = High (50 - 75) */}
            <path
              d={createArc(0.51, 0.745)}
              fill="none"
              stroke="#f97316"
              strokeWidth={strokeWidth}
              opacity={tier === 'HIGH' ? 1 : 0.4}
            />
            {/* Red = Extreme (75 - 100) */}
            <path
              d={createArc(0.76, 0.99)}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              opacity={tier === 'EXTREME' ? 1 : 0.4}
              strokeLinecap="round"
              filter={tier === 'EXTREME' ? 'url(#gauge-glow-fire)' : undefined}
            />

            {/* Scale Numerics */}
            <text x="35" y="200" fill="#10b981" fontSize="12" fontWeight="700">0</text>
            <text x="85" y="105" fill="#f59e0b" fontSize="12" fontWeight="600">25</text>
            <text x="200" y="45" textAnchor="middle" fill="#f97316" fontSize="13" fontWeight="700">50</text>
            <text x="310" y="105" fill="#ef4444" fontSize="12" fontWeight="600">75</text>
            <text x="355" y="200" fill="#ef4444" fontSize="12" fontWeight="700">100</text>

            {/* Needle Line */}
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke={currentRisk.color}
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#gauge-glow-fire)"
            />
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Center Hub */}
            <circle cx={cx} cy={cy} r="16" fill="#0b0f19" stroke={currentRisk.color} strokeWidth="3.5" />
            <circle cx={cx} cy={cy} r="7" fill={currentRisk.color} />
          </svg>

          {/* Central Digital Readout */}
          <div className="text-center -mt-8 mb-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl lg:text-6xl font-black tracking-tight" style={{ color: currentRisk.text }}>
                {score}
              </span>
              <span className="text-slate-400 font-bold text-lg">/ 100</span>
            </div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-300 mt-1">
              Wildfire Risk Severity Index
            </div>
          </div>
        </div>

        {/* Right: Risk Category Matrix & Environmental Telemetry Breakdown (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Telemetry Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Canopy Temperature</span>
              <div className="text-xl font-bold text-orange-400 flex items-center gap-1.5 mt-1">
                <TrendingUp size={18} /> {temperature.toFixed(1)}°C
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {temperature >= 40 ? 'Extreme Thermal Danger' : 'Daytime heating curve'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Relative Humidity & Wind</span>
              <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <span>{humidity}%</span>
                <span className="text-xs text-cyan-400 font-mono">({windSpeed} km/h)</span>
              </div>
              <span className={`text-[11px] mt-0.5 block font-semibold ${humidity <= 25 ? 'text-red-400' : 'text-slate-400'}`}>
                {humidity <= 25 ? 'Critical Desiccation (< 25%)' : 'Stable moisture reserve'}
              </span>
            </div>
          </div>

          {/* Color-Coded Risk Level Definitions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              className={`p-3 rounded-lg border text-center transition-all ${
                tier === 'LOW'
                  ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/40'
                  : 'bg-slate-900/50 border-white/10'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block mb-1" />
              <div className="text-xs font-bold text-emerald-400">LOW</div>
              <div className="text-[11px] text-slate-400 font-mono">0 – 25</div>
              <div className="text-[10px] text-slate-400 mt-1">Safe canopy</div>
            </div>

            <div
              className={`p-3 rounded-lg border text-center transition-all ${
                tier === 'MODERATE'
                  ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40'
                  : 'bg-slate-900/50 border-white/10'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block mb-1" />
              <div className="text-xs font-bold text-amber-400">MODERATE</div>
              <div className="text-[11px] text-slate-400 font-mono">26 – 50</div>
              <div className="text-[10px] text-slate-400 mt-1">Heightened dry</div>
            </div>

            <div
              className={`p-3 rounded-lg border text-center transition-all ${
                tier === 'HIGH'
                  ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/40'
                  : 'bg-slate-900/50 border-white/10'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block mb-1" />
              <div className="text-xs font-bold text-orange-400">HIGH</div>
              <div className="text-[11px] text-slate-400 font-mono">51 – 75</div>
              <div className="text-[10px] text-slate-400 mt-1">High ignition</div>
            </div>

            <div
              className={`p-3 rounded-lg border text-center transition-all ${
                tier === 'EXTREME'
                  ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/40'
                  : 'bg-slate-900/50 border-white/10'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse inline-block mb-1" />
              <div className="text-xs font-bold text-red-400">EXTREME</div>
              <div className="text-[11px] text-slate-400 font-mono">76 – 100</div>
              <div className="text-[10px] text-slate-400 mt-1">Active wildfire</div>
            </div>
          </div>

          {/* Operational Advisory summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
            <Info size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Active Environmental Assessment:</strong> Thermal sensors record <strong>{temperature.toFixed(1)}°C</strong> with humidity at <strong>{humidity}%</strong> and smoke concentration at <strong>{smokePPM} ppm</strong>. Risk score is evaluated at <strong>{score}/100</strong> ({tier} RISK). Tactical protocols prescribe{' '}
              {tier === 'EXTREME'
                ? 'immediate aerial/ground suppression and community evacuation preparedness.'
                : tier === 'HIGH'
                ? 'full mobilization of forest response teams and firebreak widening.'
                : tier === 'MODERATE'
                ? 'increased ranger patrols and thermal drone sweeps.'
                : 'continuous 24/7 autonomous monitoring.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Aliases for compatibility
export const FloodGauge = FireGauge;
export default FireGauge;
