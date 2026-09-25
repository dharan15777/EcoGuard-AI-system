import React from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { getSeverityClass, formatTimestamp } from '../utils/formatters';

export const AlertNotification = ({ alert, onAcknowledge }) => {
  const isResolved = alert.status === 'RESOLVED';
  const isAck = alert.status === 'ACKNOWLEDGED';

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '16px 20px',
        borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#f43f5e' : alert.severity === 'HIGH' ? '#f97316' : '#eab308'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f43f5e',
            flexShrink: 0
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`badge ${getSeverityClass(alert.severity)}`}>
                {alert.severity}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {formatTimestamp(alert.triggeredAt)}
              </span>
            </div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#fff' }}>{alert.title}</h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{alert.description}</p>
          </div>
        </div>

        <div>
          {!isAck && !isResolved ? (
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle size={14} /> Acknowledge
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>
              ✓ Acknowledged
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={13} color="#38bdf8" /> {alert.locationName || 'Region Sector 4'}
        </span>
        <span>Sensor: <strong>{alert.sensorName || alert.sensorId}</strong></span>
      </div>
    </div>
  );
};
