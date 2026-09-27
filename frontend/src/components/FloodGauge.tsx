import React from 'react';
import { FloodRiskTier } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { AlertTriangle, ShieldCheck, ShieldAlert, TrendingUp, Info, Activity } from 'lucide-react';

interface FloodGaugeProps {
  score: number; // 0 to 100
  tier: FloodRiskTier;
  waterLevel: number;
  rateOfRise?: number; // m/hr
}

export const FloodGauge: React.FC<FloodGaugeProps> = ({
  score,
  tier,
  waterLevel,
  rateOfRise = 0.34
}) => {
  const currentRisk = RISK_COLORS[tier] || RISK_COLORS.SAFE;

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
        border: tier === 'DANGER' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: tier === 'DANGER' ? '0 10px 30px rgba(239, 68, 68, 0.15)' : '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: currentRisk.bg, border: `1px solid ${currentRisk.border}` }}
          >
            <Activity size={22} color={currentRisk.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                SECTION 2 · COMPREHENSIVE FLOOD RISK ASSESSMENT
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Flood Risk Severity Indicator & Visual Gauge
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
          {tier === 'DANGER' ? <ShieldAlert size={16} /> : tier === 'SAFE' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
          STATUS: {currentRisk.name.toUpperCase()} RISK TIER
        </div>
      </div>

      {/* Main Gauge & Matrix Layout: 2 Columns for maximum clarity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Large Visual Gauge (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-white/5 relative">
          <svg viewBox="0 0 400 230" className="w-full max-w-[420px] h-auto overflow-visible select-none">
            <defs>
              <filter id="gauge-glow-v2" x="-20%" y="-20%" width="140%" height="140%">
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
            {/* Green = Safe (0 - 25) */}
            <path
              d={createArc(0.01, 0.245)}
              fill="none"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              opacity={tier === 'SAFE' ? 1 : 0.4}
              strokeLinecap="round"
            />
            {/* Yellow = Watch (25 - 50) */}
            <path
              d={createArc(0.26, 0.495)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              opacity={tier === 'WATCH' ? 1 : 0.4}
            />
            {/* Orange = Warning (50 - 75) */}
            <path
              d={createArc(0.51, 0.745)}
              fill="none"
              stroke="#f97316"
              strokeWidth={strokeWidth}
              opacity={tier === 'WARNING' ? 1 : 0.4}
            />
            {/* Red = Danger (75 - 100) */}
            <path
              d={createArc(0.76, 0.99)}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              opacity={tier === 'DANGER' ? 1 : 0.4}
              strokeLinecap="round"
              filter={tier === 'DANGER' ? 'url(#gauge-glow-v2)' : undefined}
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
              filter="url(#gauge-glow-v2)"
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
              Flood Severity Index
            </div>
          </div>
        </div>

        {/* Right: Risk Threshold Matrix & Telemetry Breakdown (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          {/* Telemetry Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Telemetry Rate of Rise</span>
              <div className="text-xl font-bold text-cyan-400 flex items-center gap-1.5 mt-1">
                <TrendingUp size={18} /> +{rateOfRise.toFixed(2)} m/hr
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Rapid catchment inflow</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Current River Stage</span>
              <div className="text-xl font-bold text-white mt-1">
                {waterLevel.toFixed(2)} meters
              </div>
              <span className="text-[11px] text-red-400 mt-0.5 block font-semibold">Exceeds Danger Limit (4.20m)</span>
            </div>
          </div>

          {/* Color-Coded Risk Level Definitions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className={`p-3 rounded-lg border text-center transition-all ${tier === 'SAFE' ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/40' : 'bg-slate-900/50 border-white/10'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block mb-1" />
              <div className="text-xs font-bold text-emerald-400">SAFE</div>
              <div className="text-[11px] text-slate-400 font-mono">0 – 25</div>
              <div className="text-[10px] text-slate-400 mt-1">Nominal flow</div>
            </div>

            <div className={`p-3 rounded-lg border text-center transition-all ${tier === 'WATCH' ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40' : 'bg-slate-900/50 border-white/10'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block mb-1" />
              <div className="text-xs font-bold text-amber-400">WATCH</div>
              <div className="text-[11px] text-slate-400 font-mono">26 – 50</div>
              <div className="text-[10px] text-slate-400 mt-1">Rising levels</div>
            </div>

            <div className={`p-3 rounded-lg border text-center transition-all ${tier === 'WARNING' ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/40' : 'bg-slate-900/50 border-white/10'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block mb-1" />
              <div className="text-xs font-bold text-orange-400">WARNING</div>
              <div className="text-[11px] text-slate-400 font-mono">51 – 75</div>
              <div className="text-[10px] text-slate-400 mt-1">Overbank risk</div>
            </div>

            <div className={`p-3 rounded-lg border text-center transition-all ${tier === 'DANGER' ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/40' : 'bg-slate-900/50 border-white/10'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse inline-block mb-1" />
              <div className="text-xs font-bold text-red-400">DANGER</div>
              <div className="text-[11px] text-slate-400 font-mono">76 – 100</div>
              <div className="text-[10px] text-slate-400 mt-1">Severe inundation</div>
            </div>
          </div>

          {/* Operational Advisory summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-start gap-3">
            <Info size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Active Emergency Threshold:</strong> Hydrostatic stage sensor reports water level at <strong>{waterLevel.toFixed(2)}m</strong> with a flood risk score of <strong>{score}/100</strong>. Disaster management protocols recommend immediate Phase-2 mitigation and barrier deployment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
