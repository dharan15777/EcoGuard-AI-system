import React, { useState } from 'react';
import { AIFireRecommendation, FireRiskTier } from '../types/fire';
import {
  ShieldAlert,
  AlertOctagon,
  Flame,
  PhoneCall,
  Truck,
  Users,
  CheckCircle2,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Footprints,
  Scan,
  Droplets,
  BellRing
} from 'lucide-react';

interface AIRecommendedActionsProps {
  actions: AIFireRecommendation[];
  riskTier: FireRiskTier;
  onExecuteAction?: (actionId: string) => void;
}

export const AIRecommendedActions: React.FC<AIRecommendedActionsProps> = ({
  actions: initialActions,
  riskTier,
  onExecuteAction
}) => {
  const [actionsList, setActionsList] = useState<AIFireRecommendation[]>(initialActions);
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

  const getPriorityStyle = (priority: AIFireRecommendation['priority']) => {
    switch (priority) {
      case 'CRITICAL_NOW':
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          label: 'IMMEDIATE DISPATCH',
          border: 'border-l-4 border-l-red-500'
        };
      case 'HIGH_PRIORITY':
        return {
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          label: 'HIGH PRIORITY',
          border: 'border-l-4 border-l-orange-500'
        };
      case 'TACTICAL_ADVISORY':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'TACTICAL ADVISORY',
          border: 'border-l-4 border-l-amber-500'
        };
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'PREPAREDNESS',
          border: 'border-l-4 border-l-emerald-500'
        };
    }
  };

  const getCategoryIcon = (category: AIFireRecommendation['category']) => {
    switch (category) {
      case 'Suppression':
        return <Flame size={18} className="text-red-400" />;
      case 'Evacuation':
        return <Users size={18} className="text-orange-400" />;
      case 'Authorities':
        return <BellRing size={18} className="text-amber-400" />;
      case 'Patrol':
        return <Footprints size={18} className="text-yellow-400" />;
      case 'Firebreaks':
        return <Layers size={18} className="text-emerald-400" />;
      case 'Surveillance':
        return <Scan size={18} className="text-cyan-400" />;
      default:
        return <ShieldCheck size={18} className="text-cyan-400" />;
    }
  };

  return (
    <div
      className="field-panel p-6 rounded-xl flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(249,115,22,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-950/70 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              SECTION 8 · AUTONOMOUS WILDFIRE INCIDENT PROTOCOLS
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Recommended Tactical Actions
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Triggered by:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            {riskTier} FIRE RISK PROTOCOL
          </span>
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionsList.map(action => {
          const prio = getPriorityStyle(action.priority);
          const isDispatched = action.status === 'DISPATCHED' || action.status === 'COMPLETED';
          const isPending = dispatchedId === action.id;

          return (
            <div
              key={action.id}
              className={`p-4 rounded-xl bg-slate-900/70 border border-white/10 transition-all flex flex-col justify-between ${prio.border} ${
                isDispatched ? 'opacity-80' : 'hover:border-white/25 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                      {getCategoryIcon(action.category)}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {action.category}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${prio.badge}`}>
                    {prio.label}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {action.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  ACTION ID: <strong>{action.id}</strong>
                </span>

                {isDispatched ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/40">
                    <CheckCircle2 size={13} />
                    <span>Dispatched to Field</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleActionClick(action.id)}
                    disabled={isPending}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-orange-950/50"
                  >
                    {isPending ? (
                      <span className="animate-spin text-xs">●</span>
                    ) : (
                      <Send size={13} />
                    )}
                    <span>Authorize Dispatch</span>
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

export default AIRecommendedActions;
