import React, { useState } from 'react';
import { FloodDashboard } from './FloodDashboard';
import { FireDashboard } from './FireDashboard';
import { Waves, Flame } from 'lucide-react';

interface DashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
  initialMode?: 'flood' | 'fire';
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensors,
  alerts,
  onAcknowledgeAlert,
  historicalData,
  initialMode = 'flood'
}) => {
  const [activeDashboard, setActiveDashboard] = useState<'flood' | 'fire'>(initialMode);

  // Synchronize when initialMode changes externally (e.g. from sidebar or router)
  React.useEffect(() => {
    if (initialMode) {
      setActiveDashboard(initialMode);
    }
  }, [initialMode]);

  return (
    <div className="flex flex-col gap-6 max-w-[1700px] mx-auto w-full pb-10">
      {/* Top Multi-Hazard Operations Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDashboard('flood')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase flex items-center gap-2.5 transition-all ${
              activeDashboard === 'flood'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Waves size={17} className={activeDashboard === 'flood' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'} />
            <span>FLOOD DETECTION MONITORING</span>
          </button>

          <button
            onClick={() => setActiveDashboard('fire')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase flex items-center gap-2.5 transition-all ${
              activeDashboard === 'fire'
                ? 'bg-orange-500/25 text-orange-300 border border-orange-400/60 shadow-lg shadow-orange-950/60 ring-1 ring-orange-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Flame size={17} className={activeDashboard === 'fire' ? 'text-orange-400 animate-pulse' : 'text-slate-400'} />
            <span>FOREST FIRE DETECTION MONITORING</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400 pr-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">EDGE AI OPERATIONAL</span>
          </span>
          <span>·</span>
          <span>SECTOR: </span>
          <strong className="text-slate-200 font-bold tracking-wide">
            {activeDashboard === 'flood'
              ? 'ASSAM - BRAHMAPUTRA BASIN (INDIA)'
              : 'BANDIPUR - WESTERN GHATS RESERVE (INDIA)'}
          </strong>
        </div>
      </div>

      {/* Render Active Separate Dashboard */}
      {activeDashboard === 'flood' ? (
        <FloodDashboard
          sensors={sensors}
          alerts={alerts}
          onAcknowledgeAlert={onAcknowledgeAlert}
          historicalData={historicalData}
        />
      ) : (
        <FireDashboard
          sensors={sensors}
          alerts={alerts}
          onAcknowledgeAlert={onAcknowledgeAlert}
          historicalData={historicalData}
        />
      )}
    </div>
  );
};

export default Dashboard;
