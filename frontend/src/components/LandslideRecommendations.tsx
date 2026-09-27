import React, { useState } from 'react';
import { AILandslideRecommendation, LandslideRiskTier } from '../types/landslide';
import {
  ShieldAlert,
  AlertOctagon,
  Mountain,
  PhoneCall,
  Truck,
  Users,
  CheckCircle2,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  BellRing
} from 'lucide-react';

interface LandslideRecommendationsProps {
  actions: AILandslideRecommendation[];
  riskTier: LandslideRiskTier;
  onExecuteAction?: (actionId: string) => void;
}

export const LandslideRecommendations: React.FC<LandslideRecommendationsProps> = ({
  actions: initialActions,
  riskTier,
  onExecuteAction
}) => {
  const [actionsList, setActionsList] = useState<AILandslideRecommendation[]>(initialActions);
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  React.useEffect(() => {
    setActionsList(initialActions);
  }, [initialActions]);

  const handleActionClick = (id: string) => {
    setDispatchedId(id);
    setTimeout(() => {
      setActionsList(prev =>
        prev.map(a => (a.id === id ? { ...a, status: 'DISPATCHED' } : a))
      );
      setDispatchedId(null);
      if (onExecuteAction) onExecuteAction(id);
    }, 400);
  };

  const getPriorityStyle = (priority: AILandslideRecommendation['priority']) => {
    switch (priority) {
      case 'CRITICAL_NOW':
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: 'MANDATORY IMMEDIATE DISPATCH',
          border: 'border-l-4 border-l-red-500'
        };
      case 'HIGH_PRIORITY':
        return {
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          label: 'HIGH PRIORITY RESPONSE',
          border: 'border-l-4 border-l-orange-500'
        };
      case 'TACTICAL_ADVISORY':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'TACTICAL ENGINEERING ACTION',
          border: 'border-l-4 border-l-amber-500'
        };
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'ROUTINE SURVEILLANCE PROTOCOL',
          border: 'border-l-4 border-l-emerald-500'
        };
    }
  };

  return (
    <div
      className="field-panel p-6 rounded-xl flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles size={12} /> SECTION 8 · AI RECOMMENDED TACTICAL INCIDENT ACTIONS
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Civil Protection & Geotechnical Response Protocols
            </h2>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Tier: <strong className="text-amber-400 uppercase">{riskTier}</strong> · Automated Rule Engine Active
        </span>
      </div>

      {/* Action Cards List */}
      <div className="flex flex-col gap-3.5">
        {actionsList.map(action => {
          const style = getPriorityStyle(action.priority);
          const isDispatched = action.status === 'DISPATCHED' || action.status === 'COMPLETED';

          return (
            <div
              key={action.id}
              className={`p-4 rounded-xl bg-slate-900/80 border border-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${style.border}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    [{action.category}]
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {action.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {isDispatched ? (
                  <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>DISPATCHED</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleActionClick(action.id)}
                    disabled={dispatchedId === action.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 active:scale-95 disabled:opacity-50"
                  >
                    <span>Execute Action</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandslideRecommendations;
