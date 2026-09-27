import React from 'react';
import { LandslideRiskTier } from '../types/landslide';
import { LANDSLIDE_RISK_COLORS } from '../utils/landslideConstants';
import { AlertTriangle, ShieldCheck, ShieldAlert, Mountain, Activity, Droplets, Move, Gauge, Compass } from 'lucide-react';

interface LandslideGaugeProps {
  score: number; // 0 to 100
  tier: LandslideRiskTier;
  soilMoisture: number; // %
  groundDisplacement: number; // mm
  slopeTiltAngle?: number; // deg
  groundVibration?: number; // mm/s
}

export const LandslideGauge: React.FC<LandslideGaugeProps> = ({
  score,
  tier,
  soilMoisture,
  groundDisplacement,
  slopeTiltAngle = 38.6,
  groundVibration = 8.8
}) => {
  const currentRisk = LANDSLIDE_RISK_COLORS[tier] || LANDSLIDE_RISK_COLORS.LOW;

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
        border: tier === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: tier === 'CRITICAL' ? '0 10px 30px rgba(239, 68, 68, 0.15)' : '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: currentRisk.bg, border: `1px solid ${currentRisk.border}` }}
          >
            <Mountain size={22} color={currentRisk.color} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                SECTION 2 · COMPREHENSIVE LANDSLIDE RISK ASSESSMENT
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Landslide Risk Severity Indicator & Visual Gauge
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
          {tier === 'CRITICAL' ? (
            <ShieldAlert size={16} />
          ) : tier === 'LOW' ? (
            <ShieldCheck size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          STATUS: {currentRisk.name.toUpperCase()} RISK CATEGORY
        </div>
      </div>

      {/* Main Gauge & Matrix Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Large Visual Gauge (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-white/5 relative">
          <svg viewBox="0 0 400 230" className="w-full max-w-[420px] h-auto overflow-visible select-none">
            <defs>
              <filter id="gauge-glow-ls-v2" x="-20%" y="-20%" width="140%" height="140%">
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
            {/* Red = Critical (75 - 100) */}
            <path
              d={createArc(0.76, 0.99)}
              fill="none"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              opacity={tier === 'CRITICAL' ? 1 : 0.4}
              strokeLinecap="round"
              filter={tier === 'CRITICAL' ? 'url(#gauge-glow-ls-v2)' : undefined}
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
              filter="url(#gauge-glow-ls-v2)"
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

            {/* Center Pivot */}
            <circle cx={cx} cy={cy} r="14" fill="#0f172a" stroke={currentRisk.color} strokeWidth="3" />
            <circle cx={cx} cy={cy} r="6" fill="#ffffff" />
          </svg>

          {/* Central Score readout */}
          <div className="text-center mt-[-10px]">
            <div className="text-5xl font-black tracking-tight font-mono" style={{ color: currentRisk.text }}>
              {scoreClamped}
              <span className="text-2xl text-slate-500 font-normal">/100</span>
            </div>
            <div className="text-xs uppercase font-extrabold tracking-wider mt-1" style={{ color: currentRisk.text }}>
              {currentRisk.name} Landslide Probability
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Automated AI Multi-Sensor Geotechnical Inference
            </div>
          </div>
        </div>

        {/* Right: Real-Time Geotechnical Telemetry & Safety Status Matrix (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Soil Moisture */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Soil Moisture</span>
                <Droplets size={16} className="text-cyan-400" />
              </div>
              <div className="text-2xl font-black font-mono text-cyan-300">
                {soilMoisture.toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Saturation:{' '}
                <strong className={soilMoisture >= 85 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                  {soilMoisture >= 85 ? 'HIGHLY SATURATED' : soilMoisture >= 65 ? 'SATURATED' : 'MODERATE'}
                </strong>
              </div>
            </div>

            {/* Ground Displacement */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Ground Displacement</span>
                <Move size={16} className="text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-300">
                {groundDisplacement.toFixed(1)} mm
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Movement:{' '}
                <strong className={groundDisplacement >= 18 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                  {groundDisplacement >= 18 ? 'CRITICAL SLIP' : groundDisplacement >= 8 ? 'UNSTABLE CREEP' : 'STABLE'}
                </strong>
              </div>
            </div>

            {/* Ground Vibration */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Ground Vibration (PPV)</span>
                <Activity size={16} className="text-indigo-400" />
              </div>
              <div className="text-2xl font-black font-mono text-indigo-300">
                {groundVibration.toFixed(1)} mm/s
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Seismic Status:{' '}
                <strong className={groundVibration >= 8.0 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                  {groundVibration >= 8.0 ? 'ABNORMAL SHIFT' : 'NOMINAL SEISMIC'}
                </strong>
              </div>
            </div>

            {/* Slope Tilt Angle */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Slope Tilt Angle</span>
                <Compass size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-300">
                {slopeTiltAngle.toFixed(1)}°
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Stability FoS:{' '}
                <strong className={tier === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {tier === 'CRITICAL' ? '0.78 (FAILURE)' : tier === 'HIGH' ? '1.15 (CRITICAL)' : '1.85 (STABLE)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Qualitative assessment summary banner */}
          <div
            className="p-3.5 rounded-xl border flex items-center justify-between text-xs"
            style={{
              background: currentRisk.bg,
              borderColor: currentRisk.border
            }}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={18} style={{ color: currentRisk.text }} />
              <div>
                <div className="font-bold text-white uppercase tracking-wide">
                  {tier === 'CRITICAL'
                    ? 'IMMINENT DEBRIS RUNOUT DISASTER PROTOCOL'
                    : tier === 'HIGH'
                    ? 'HIGH SHEAR STRESS · EVACUATION STANDBY'
                    : tier === 'MODERATE'
                    ? 'ELEVATED SOIL SATURATION ADVISORY'
                    : 'SLOPE CONDITIONS GEOTECHNICALLY STABLE'}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Continuous multi-point displacement, pore pressure, and seismic sensor cross-validation.
                </div>
              </div>
            </div>
            <div className="font-mono font-bold text-xs uppercase px-2.5 py-1 rounded bg-black/40 text-slate-200">
              {currentRisk.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandslideGauge;
