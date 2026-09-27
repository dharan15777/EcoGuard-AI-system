import React from 'react';
import { FireAlert } from '../types/fire';
import { ShieldAlert, AlertTriangle, CheckCheck, Clock, MapPin, CheckCircle2, Flame, Thermometer, CloudFog } from 'lucide-react';

interface AlertNotificationProps {
  alert: FireAlert;
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

export const AlertNotification: React.FC<AlertNotificationProps> = ({ alert, onAcknowledge }) => {
  const sev = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
  const isAck = alert.status === 'ACKNOWLEDGED' || alert.status === 'RESOLVED';

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Just now';
    return timeStr;
  };

  return (
    <div
      className="p-4 rounded-xl relative overflow-hidden transition-all duration-200 border flex flex-col md:flex-row md:items-center justify-between gap-4"
      style={{
        background: sev.bg,
        borderColor: sev.border,
        boxShadow: alert.severity === 'CRITICAL' ? '0 4px 16px rgba(239, 68, 68, 0.12)' : 'none'
      }}
    >
      {/* Left accent bar */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${sev.bar}`} />

      {/* Main Info */}
      <div className="pl-3 flex items-start gap-3.5 flex-1">
        <div
          className="p-2 rounded-lg flex-shrink-0 mt-0.5"
          style={{ background: `${sev.color}22`, border: `1px solid ${sev.color}44` }}
        >
          {alert.severity === 'CRITICAL' ? (
            <Flame size={20} color={sev.color} />
          ) : alert.severity === 'HIGH' ? (
            <ShieldAlert size={18} color={sev.color} />
          ) : (
            <AlertTriangle size={18} color={sev.color} />
          )}
        </div>

        <div className="flex-1">
          {/* Top row: Severity, Status, Time */}
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${sev.badge}`}>
              {alert.severity} SEVERITY
            </span>
            <span className="text-xs text-slate-400 font-medium">
              STATUS: <strong className={isAck ? 'text-emerald-400' : 'text-red-400 font-semibold'}>{alert.status}</strong>
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Clock size={12} className="text-slate-500" /> {formatTime(alert.detectionTime)}
            </span>
          </div>

          {/* Alert Title / Type */}
          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
            {alert.alertType}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {alert.description}
          </p>

          {/* Location & Metadata */}
          <div className="flex flex-wrap items-center gap-4 mt-2.5 pt-2 border-t border-white/5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-orange-300 font-medium">
              <MapPin size={13} className="text-orange-400" />
              <span>Location: <strong>{alert.location}</strong></span>
            </div>

            {alert.temperature !== undefined && (
              <span className="text-slate-300 text-[11px] flex items-center gap-1">
                <Thermometer size={12} className="text-orange-400" />
                <span>Temp: <strong className="text-orange-300 font-mono">{alert.temperature.toFixed(1)}°C</strong></span>
              </span>
            )}

            {alert.smokePPM !== undefined && (
              <span className="text-slate-300 text-[11px] flex items-center gap-1">
                <CloudFog size={12} className="text-amber-400" />
                <span>Smoke: <strong className="text-amber-300 font-mono">{alert.smokePPM} ppm</strong></span>
              </span>
            )}

            {alert.confidenceScore !== undefined && (
              <span className="text-slate-400 text-[11px]">
                Confidence: <strong className="text-emerald-400 font-mono">{alert.confidenceScore}%</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pl-3 md:pl-0 flex-shrink-0 self-start md:self-center">
        {!isAck && onAcknowledge ? (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CheckCheck size={14} className="text-cyan-400" />
            <span>Acknowledge</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-lg">
            <CheckCircle2 size={14} />
            <span>Dispatched</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertNotification;
