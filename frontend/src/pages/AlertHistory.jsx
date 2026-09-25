import React, { useState } from 'react';
import { AlertTriangle, Filter, CheckCircle2, History, ShieldAlert } from 'lucide-react';
import { AlertNotification } from '../components/AlertNotification';

export const AlertHistory = ({ alerts = [], onAcknowledgeAlert }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = filterSeverity === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.severity === filterSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Emergency Alert Broadcast History</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Complete audit trail of AI model hazard detections, dispatches, and operator resolutions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                background: filterSeverity === sev ? '#f43f5e' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid var(--border-glass)'
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(alert => (
          <AlertNotification key={alert.id} alert={alert} onAcknowledge={onAcknowledgeAlert} />
        ))}
      </div>
    </div>
  );
};
