import React, { useState } from 'react';
import { AIRecommendedAction, FloodRiskTier } from '../types/flood';
import {
  ShieldAlert,
  AlertOctagon,
  LifeBuoy,
  PhoneCall,
  Truck,
  Users,
  CheckCircle2,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface AIRecommendedActionsProps {
  actions: AIRecommendedAction[];
  riskTier: FloodRiskTier;
  onExecuteAction?: (actionId: string) => void;
}

export const AIRecommendedActions: React.FC<AIRecommendedActionsProps> = ({
  actions: initialActions,
  riskTier,
  onExecuteAction
}) => {
  const [actionsList, setActionsList] = useState<AIRecommendedAction[]>(initialActions);
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
    }, 500);
  };

  const getPriorityStyle = (priority: AIRecommendedAction['priority']) => {
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

  const getCategoryIcon = (category: AIRecommendedAction['category']) => {
    switch (category) {
      case 'Evacuation':
        return <Users size={18} className="text-red-400" />;
      case 'Infrastructure':
        return <AlertOctagon size={18} className="text-amber-400" />;
      case 'Authority':
        return <PhoneCall size={18} className="text-cyan-400" />;
      case 'Livestock':
        return <Truck size={18} className="text-yellow-400" />;
      case 'Barriers':
        return <Layers size={18} className="text-emerald-400" />;
      default:
        return <LifeBuoy size={18} className="text-cyan-400" />;
    }
  };

  return (
    <div
      className="field-panel p-6 rounded-xl flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
              SECTION 8 · AUTONOMOUS EMERGENCY DISASTER PROTOCOLS
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Recommended Tactical Actions ({riskTier} Phase)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            {actionsList.filter(a => a.status === 'DISPATCHED').length} of {actionsList.length} Protocols Dispatched
          </span>
          <button
            onClick={() => setActionsList(prev => prev.map(a => ({ ...a, status: 'DISPATCHED' })))}
            className="text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Send size={13} /> Dispatch All Protocols
          </button>
        </div>
      </div>

      {/* Grid of Action Cards across full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionsList.map((action) => {
          const style = getPriorityStyle(action.priority);
          const isDone = action.status === 'DISPATCHED' || action.status === 'COMPLETED';
          const isProcessing = dispatchedId === action.id;

          return (
            <div
              key={action.id}
              className={`p-4 rounded-xl bg-slate-900/70 border border-white/10 transition-all ${style.border} flex flex-col justify-between hover:border-white/20`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-950 border border-white/10">
                      {getCategoryIcon(action.category)}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${style.badge}`}>
                        {style.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold ml-2">
                        {action.category} Protocol
                      </span>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
                      <CheckCircle2 size={13} /> EXECUTED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActionClick(action.id)}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 border border-cyan-400/40 transition-all shadow-sm"
                    >
                      {isProcessing ? 'SENDING...' : <><Send size={12} /> EXECUTE</>}
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug mt-1">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span>Protocol ID: <strong className="text-slate-300 font-mono">{action.id}</strong></span>
                <span className="text-cyan-400 font-medium">CAP XML & SMS Automated</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-orange-400" />
          Synchronized with District Disaster Management Authority (DDMA) & National Disaster Response Force (NDRF)
        </span>
        <span className="text-slate-400">Target Zone: Brahmaputra River Basin & Assam Floodplains</span>
      </div>
    </div>
  );
};
