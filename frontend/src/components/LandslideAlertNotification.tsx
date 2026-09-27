import React from 'react';
import { LandslideAlert } from '../types/landslide';
import { ShieldAlert, AlertTriangle, CheckCheck, Clock, MapPin, Mountain, Droplets, Move } from 'lucide-react';

interface LandslideAlertNotificationProps {
  alert: LandslideAlert;
  onAcknowledge?: (alertId: string) => void;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.4)',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40',
    bar: 'bg-red-500'
  },
  HIGH: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.4)',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    bar: 'bg-orange-500'
  },
  MODERATE: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.4)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bar: 'bg-amber-500'
  },
  LOW: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bar: 'bg-emerald-500'
  }
};

export const LandslideAlertNotification: React.FC<LandslideAlertNotificationProps> = ({
  alert,
  onAcknowledge
}) => {
  const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
  const isAck = alert.status === 'ACKNOWLEDGED' || alert.status === 'RESOLVED';

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden ${
        isAck ? 'opacity-70 bg-slate-900/40 border-white/5' : 'bg-slate-900/80'
      }`}
      style={{
        borderLeft: `4px solid ${sev.color}`,
        borderColor: isAck ? undefined : sev.border
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${sev.badge}`}>
              {alert.severity}
            </span>
            <h4 className="text-sm font-bold text-white tracking-tight">{alert.alertType}</h4>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Clock size={12} />
            <span>{alert.detectionTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <MapPin size={13} className="text-amber-400" />
          <span>{alert.location}</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {alert.description}
        </p>

        {/* Telemetry pill values */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mb-2">
          {alert.soilMoisture !== undefined && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">
              <Droplets size={12} className="text-cyan-400" /> Moisture: <strong className="text-cyan-300">{alert.soilMoisture}%</strong>
            </span>
          )}
          {alert.groundDisplacement !== undefined && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">
              <Move size={12} className="text-amber-400" /> Disp: <strong className="text-amber-300">+{alert.groundDisplacement} mm</strong>
            </span>
          )}
          {alert.confidenceScore !== undefined && (
            <span className="text-slate-500">
              Confidence: <strong className="text-slate-300">{alert.confidenceScore}%</strong>
            </span>
          )}
        </div>
      </div>

      {/* Footer Acknowledge Action */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-mono">
          ID: {alert.id} · Status: <strong className={isAck ? 'text-emerald-400' : 'text-red-400'}>{alert.status}</strong>
        </span>

        {!isAck && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <CheckCheck size={13} />
            <span>Acknowledge Alert</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default LandslideAlertNotification;
