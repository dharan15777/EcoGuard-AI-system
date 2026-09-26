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
  ArrowRight
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

  // Sync if props update
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
    }, 600);
  };

  const getPriorityStyle = (priority: AIRecommendedAction['priority']) => {
    switch (priority) {
      case 'CRITICAL_NOW':
        return {
          badge: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
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
        return <Users size={16} className="text-red-400" />;
      case 'Infrastructure':
        return <AlertOctagon size={16} className="text-amber-400" />;
      case 'Authority':
        return <PhoneCall size={16} className="text-cyan-400" />;
      case 'Livestock':
        return <Truck size={16} className="text-yellow-400" />;
      case 'Barriers':
        return <Layers size={16} className="text-emerald-400" />;
      default:
        return <LifeBuoy size={16} className="text-cyan-400" />;
    }
  };

  return (
    <div
      className="field-panel p-6 flex flex-col justify-between"
      style={{
        background: 'linear-gradient(150deg, rgba(20,24,20,0.96) 0%, rgba(14,17,14,0.98) 100%)',
        border: '1px solid var(--border-raw)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)'
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI Recommended Tactical Actions
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              Autonomous Disaster Management Protocols · {riskTier} Phase
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-black/40 border border-white/10 text-zinc-300">
          {actionsList.filter(a => a.status === 'DISPATCHED').length} / {actionsList.length} Executed
        </span>
      </div>

      {/* Action Cards List */}
      <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
        {actionsList.map((action) => {
          const style = getPriorityStyle(action.priority);
          const isDone = action.status === 'DISPATCHED' || action.status === 'COMPLETED';
          const isProcessing = dispatchedId === action.id;

          return (
            <div
              key={action.id}
              className={`p-3.5 rounded-lg bg-black/35 border border-white/5 transition-all ${style.border} flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded bg-black/40 border border-white/10 flex-shrink-0 mt-0.5">
                  {getCategoryIcon(action.category)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      {action.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {action.title}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0 sm:self-center pl-10 sm:pl-0">
                {isDone ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30">
                    <CheckCircle2 size={14} /> EXECUTED
                  </span>
                ) : (
                  <button
                    onClick={() => handleActionClick(action.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 border border-cyan-400/40 shadow-sm transition-all duration-150 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      'DISPATCHING...'
                    ) : (
                      <>
                        <Send size={13} /> EXECUTE
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Dispatch Banner */}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1.5">
          <ShieldAlert size={13} className="text-orange-400" />
          Protocols synchronized with State Emergency Operations Center (SEOC)
        </span>
        <button
          onClick={() => {
            setActionsList(prev => prev.map(a => ({ ...a, status: 'DISPATCHED' })));
          }}
          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 underline underline-offset-2"
        >
          Execute All Pending Protocols <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
