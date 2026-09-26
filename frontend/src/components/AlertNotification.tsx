import React from 'react';
import { FloodAlert } from '../types/flood';
import { Siren, CheckCheck, Clock, MapPin, AlertTriangle, ShieldAlert, Send } from 'lucide-react';

interface AlertNotificationProps {
  alert: FloodAlert;
  onAcknowledge?: (alertId: string) => void;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.45)',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
    bar: 'bg-red-500'
  },
  HIGH: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.45)',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    bar: 'bg-orange-500'
  },
  MODERATE: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.45)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bar: 'bg-amber-500'
  },
  LOW: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.45)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bar: 'bg-emerald-500'
  }
};

export const AlertNotification: React.FC<AlertNotificationProps> = ({ alert, onAcknowledge }) => {
  const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
  const isAck = alert.status === 'ACKNOWLEDGED' || alert.status === 'RESOLVED';

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div
      className="field-panel p-4 rounded-lg relative overflow-hidden transition-all duration-200 border hover:border-white/20"
      style={{
        background: sev.bg,
        borderColor: sev.border,
        boxShadow: alert.severity === 'CRITICAL' ? '0 0 15px rgba(239, 68, 68, 0.15)' : 'none'
      }}
    >
      {/* Left accent bar */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${sev.bar}`} />

      <div className="pl-2 flex flex-col gap-2.5">
        {/* Top Header: Alert Type & Severity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div
              className="p-1.5 rounded flex-shrink-0 mt-0.5"
              style={{ background: `${sev.color}22`, border: `1px solid ${sev.color}44` }}
            >
              {alert.severity === 'CRITICAL' ? (
                <ShieldAlert size={16} color={sev.color} />
              ) : (
                <AlertTriangle size={16} color={sev.color} />
              )}
            </div>

            <div>
              {/* Alert Type */}
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${sev.badge}`}>
                  {alert.severity} SEVERITY
                </span>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">
                  STATUS: <strong className={isAck ? 'text-emerald-400' : 'text-red-400'}>{alert.status}</strong>
                </span>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                {alert.alertType}
              </h4>
            </div>
          </div>

          {/* Acknowledge Button */}
          {!isAck && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/80 active:scale-95 transition-all flex-shrink-0"
            >
              <CheckCheck size={13} /> ACKNOWLEDGE
            </button>
          )}

          {isAck && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30 flex-shrink-0">
              <CheckCheck size={13} /> ACKNOWLEDGED
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed pl-8">
          {alert.description}
        </p>

        {/* Footer: Location, Detection Time, Sensor */}
        <div className="pl-8 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1 text-cyan-300 font-medium">
            <MapPin size={12} className="text-cyan-400" />
            <span>Location: <strong>{alert.location}</strong></span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <Clock size={12} className="text-zinc-500" />
            <span>Detected: <strong className="text-zinc-300">{formatTime(alert.detectionTime)}</strong></span>
          </div>

          {alert.confidenceScore && (
            <div className="text-[10px] text-zinc-500">
              AI CONFIDENCE: <strong className="text-emerald-400">{(alert.confidenceScore * 100).toFixed(0)}%</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
