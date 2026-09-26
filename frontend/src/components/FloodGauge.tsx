import React from 'react';
import { FloodRiskTier } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { AlertTriangle, ShieldCheck, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

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

  // Gauge geometry: Semi-circle from -180 deg to 0 deg (or -210 to +30)
  // Let's use an arc radius of 130, center at (175, 160)
  const radius = 120;
  const strokeWidth = 16;
  const cx = 175;
  const cy = 165;

  // Angle ranges: -180 deg (left, 0 score) to 0 deg (right, 100 score)
  const scoreClamped = Math.min(100, Math.max(0, score));
  const angleDeg = -180 + (scoreClamped / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  // Needle tip
  const needleLength = 95;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy + needleLength * Math.sin(angleRad);

  // SVG Arc generator
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
    <div className="field-panel relative overflow-hidden p-6 flex flex-col items-center justify-between"
      style={{
        background: 'linear-gradient(170deg, rgba(20,26,20,0.95) 0%, rgba(14,18,14,0.98) 100%)',
        boxShadow: tier === 'DANGER' ? '0 0 30px rgba(239, 68, 68, 0.18)' : '0 4px 20px rgba(0,0,0,0.4)',
        borderColor: tier === 'DANGER' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-raw)'
      }}
    >
      {/* Top Title & Status */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ background: currentRisk.color }} />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400">
            Flood Risk Indicator
          </span>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 shadow-sm"
          style={{
            background: currentRisk.bg,
            color: currentRisk.text,
            border: `1px solid ${currentRisk.border}`
          }}
        >
          {tier === 'DANGER' ? <ShieldAlert size={14} /> : tier === 'SAFE' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
          {currentRisk.name.toUpperCase()} RISK
        </div>
      </div>

      {/* Large SVG Gauge */}
      <div className="relative w-full max-w-[350px] flex justify-center items-center py-1">
        <svg
          viewBox="0 0 350 205"
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Glow filters for needle and active zones */}
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="needle-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={currentRisk.color} />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={createArc(0, 1)}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
          />

          {/* 4 Colored Risk Zone Arcs */}
          {/* Safe (0 - 25%): Green */}
          <path
            d={createArc(0.01, 0.245)}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            opacity={tier === 'SAFE' ? 1 : 0.45}
            strokeLinecap="round"
          />
          {/* Watch (25 - 50%): Yellow */}
          <path
            d={createArc(0.26, 0.495)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            opacity={tier === 'WATCH' ? 1 : 0.45}
          />
          {/* Warning (50 - 75%): Orange */}
          <path
            d={createArc(0.51, 0.745)}
            fill="none"
            stroke="#f97316"
            strokeWidth={strokeWidth}
            opacity={tier === 'WARNING' ? 1 : 0.45}
          />
          {/* Danger (75 - 100%): Red */}
          <path
            d={createArc(0.76, 0.99)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={strokeWidth}
            opacity={tier === 'DANGER' ? 1 : 0.45}
            strokeLinecap="round"
            filter={tier === 'DANGER' ? 'url(#gauge-glow)' : undefined}
          />

          {/* Inner Accent Ring */}
          <path
            d={createArc(0, 1)}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Scale Labels */}
          <text x="32" y="180" fill="#10b981" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">0</text>
          <text x="75" y="95" fill="#f59e0b" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">25</text>
          <text x="175" y="45" textAnchor="middle" fill="#f97316" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">50</text>
          <text x="270" y="95" fill="#ef4444" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600">75</text>
          <text x="312" y="180" fill="#ef4444" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">100</text>

          {/* Needle Base & Needle */}
          {/* Glowing trajectory line */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={currentRisk.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#gauge-glow)"
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
          <circle cx={cx} cy={cy} r="14" fill="#0d130e" stroke={currentRisk.color} strokeWidth="3" />
          <circle cx={cx} cy={cy} r="6" fill={currentRisk.color} />
        </svg>

        {/* Digital Readout In Center Overlay */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl md:text-5xl font-mono font-black tracking-tight drop-shadow-md"
              style={{ color: currentRisk.text }}
            >
              {score}
            </span>
            <span className="text-zinc-500 font-mono text-sm font-semibold">/100</span>
          </div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 font-semibold -mt-1">
            Hazard Severity Index
          </span>
        </div>
      </div>

      {/* Bottom Risk Color Legend & Metrics */}
      <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-col gap-2.5">
        {/* Color Indicators Legend */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono font-bold">
          <div className={`p-1.5 rounded border transition-all ${tier === 'SAFE' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50' : 'bg-black/30 border-white/5 text-zinc-400'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1 align-middle" />
            SAFE
          </div>
          <div className={`p-1.5 rounded border transition-all ${tier === 'WATCH' ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50' : 'bg-black/30 border-white/5 text-zinc-400'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1 align-middle" />
            WATCH
          </div>
          <div className={`p-1.5 rounded border transition-all ${tier === 'WARNING' ? 'bg-orange-500/20 border-orange-500 text-orange-300 ring-1 ring-orange-500/50' : 'bg-black/30 border-white/5 text-zinc-400'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mr-1 align-middle" />
            WARN
          </div>
          <div className={`p-1.5 rounded border transition-all ${tier === 'DANGER' ? 'bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-500/50' : 'bg-black/30 border-white/5 text-zinc-400'}`}>
            <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1 align-middle animate-pulse" />
            DANGER
          </div>
        </div>

        {/* Telemetry sub-metrics */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 bg-black/25 px-3 py-2 rounded border border-white/5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-cyan-400" />
            <span>Rate of Rise:</span>
            <span className="text-cyan-300 font-bold">+{rateOfRise.toFixed(2)} m/hr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Stage:</span>
            <span className="text-white font-bold">{waterLevel.toFixed(2)}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
