import React from 'react';
import { LandslideImpactAssessment, LandslideRiskTier } from '../types/landslide';
import { LANDSLIDE_RISK_COLORS } from '../utils/landslideConstants';
import { AlertOctagon, Users, Home, ShieldAlert, Navigation, School, Hospital, MapPin, Sparkles } from 'lucide-react';

interface LandslideImpactSectionProps {
  impact: LandslideImpactAssessment;
  riskTier: LandslideRiskTier;
}

export const LandslideImpactSection: React.FC<LandslideImpactSectionProps> = ({
  impact,
  riskTier
}) => {
  const riskMeta = LANDSLIDE_RISK_COLORS[riskTier] || LANDSLIDE_RISK_COLORS.LOW;

  return (
    <div
      className="field-panel p-6 rounded-xl flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(239,68,68,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-950/70 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertOctagon size={22} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                <Sparkles size={12} /> SECTION 4 · DISASTER IMPACT & EXPOSURE ASSESSMENT
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Civilian & Infrastructure Exposure Radius
            </h2>
          </div>
        </div>

        <div
          className="px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-2"
          style={{
            background: riskMeta.bg,
            color: riskMeta.text,
            border: `1px solid ${riskMeta.border}`
          }}
        >
          <ShieldAlert size={14} />
          EXPOSURE LEVEL: {riskTier}
        </div>
      </div>

      {/* 6 Impact Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Villages at Risk */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Villages at Risk</span>
            <Home size={16} className="text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {impact.villagesAtRisk}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-semibold">
            {impact.villagesAtRisk > 0 ? 'Chooralmala & Mundakkai' : 'No Threat'}
          </div>
        </div>

        {/* Metric 2: Population at Risk */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Population at Risk</span>
            <Users size={16} className="text-red-400" />
          </div>
          <div className="text-3xl font-black font-mono text-red-400">
            {impact.populationAtRisk.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Civilian headcount
          </div>
        </div>

        {/* Metric 3: Roads Affected */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Roads Affected</span>
            <Navigation size={16} className="text-orange-400" />
          </div>
          <div className="text-3xl font-black font-mono text-orange-400">
            {impact.roadsAffected}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            SH-59 Hill Highway
          </div>
        </div>

        {/* Metric 4: Schools Affected */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Schools Affected</span>
            <School size={16} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-black font-mono text-indigo-300">
            {impact.schoolsAffected}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Converted to relief camps
          </div>
        </div>

        {/* Metric 5: Hospitals Affected */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Hospitals Affected</span>
            <Hospital size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-300">
            {impact.hospitalsAffected}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Primary Health Center
          </div>
        </div>

        {/* Metric 6: Estimated Impact Area */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Impact Area</span>
            <MapPin size={16} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-300">
            {impact.impactAreaKm2} <span className="text-xs text-slate-400">km²</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Runout swath
          </div>
        </div>
      </div>

      {/* Evacuation Corridors Info Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold uppercase">Critical Evacuation Corridors:</span>
          <span className="text-slate-200 font-mono">
            {impact.criticalEvacuationCorridors.join(' · ')}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Source: National Disaster Management Authority (NDMA) & GSI Runout Modeling
        </div>
      </div>
    </div>
  );
};

export default LandslideImpactSection;
