import React from 'react';
import { Siren, CheckCheck, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { getSeverityClass, formatTimestamp } from '../utils/formatters';

const SEVERITY_STYLE = {
  CRITICAL: { left: 'var(--crimson)',    bg: 'rgba(200,64,64,0.08)',   badge: 'badge badge-critical' },
  HIGH:     { left: 'var(--amber)',      bg: 'rgba(196,126,53,0.08)',  badge: 'badge badge-high'     },
  MODERATE: { left: '#a07828',           bg: 'rgba(160,120,40,0.08)',  badge: 'badge badge-moderate' },
  LOW:      { left: 'var(--moss)',       bg: 'rgba(90,138,74,0.08)',   badge: 'badge badge-low'      },
};

export const AlertNotification = ({ alert, onAcknowledge }) => {
  const isResolved  = alert.status === 'RESOLVED';
  const isAck       = alert.status === 'ACKNOWLEDGED';
  const sev         = SEVERITY_STYLE[alert.severity] || SEVERITY_STYLE.LOW;

  return (
    <div
      className="field-panel slide-in"
      style={{
        borderLeft: `3px solid ${sev.left}`,
        background: sev.bg,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '11px', flex: 1 }}>
          {/* Severity icon */}
          <div style={{
            width: '34px', height: '34px', borderRadius: '5px',
            background: `${sev.left}22`,
            border: `1px solid ${sev.left}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle size={17} color={sev.left} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
              <span className={sev.badge}>{alert.severity}</span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)' }}>
                <Clock size={11} />{formatTimestamp(alert.triggeredAt)}
              </span>
              {(isAck || isResolved) && (
                <span style={{ fontSize: '0.62rem', color: 'var(--moss-light)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  ✓ {isResolved ? 'RESOLVED' : 'ACKNOWLEDGED'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.3 }}>{alert.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>{alert.description}</div>
          </div>
        </div>

        {/* Action */}
        {!isAck && !isResolved && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            style={{
              padding: '7px 12px',
              borderRadius: '5px',
              background: 'rgba(90,138,74,0.2)',
              border: '1px solid rgba(90,138,74,0.4)',
              color: 'var(--moss-light)',
              fontWeight: '700',
              fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '5px',
              flexShrink: 0,
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.04em',
            }}
          >
            <CheckCheck size={13} /> CONFIRM
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        fontSize: '0.7rem', color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-raw)', paddingTop: '8px',
        fontFamily: 'var(--font-mono)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="var(--river)" /> {alert.locationName || 'Sector 4A'}
        </span>
        <span>NODE: <span style={{ color: 'var(--text-secondary)' }}>{alert.sensorId || alert.sensorName}</span></span>
        <span style={{ marginLeft: 'auto' }}>
          CONF: <span style={{ color: alert.confidenceScore > 0.8 ? 'var(--crimson)' : 'var(--amber-light)' }}>
            {alert.confidenceScore ? `${(alert.confidenceScore * 100).toFixed(0)}%` : '—'}
          </span>
        </span>
      </div>
    </div>
  );
};
