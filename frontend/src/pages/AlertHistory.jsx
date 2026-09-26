import React, { useState } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import { AlertNotification } from '../components/AlertNotification';

const SEVERITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE'];

export const AlertHistory = ({ alerts = [], onAcknowledgeAlert }) => {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = filterSeverity === 'ALL'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div className="overline" style={{ marginBottom: '4px' }}>Dispatch Log</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Alert Broadcast History
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Complete audit trail of hazard detections, operator dispatches, and resolutions.
          </p>
        </div>

        {/* Severity filter */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          {SEVERITY_FILTERS.map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.07em',
                background: filterSeverity === sev
                  ? sev === 'CRITICAL' ? 'rgba(200,64,64,0.2)'
                  : sev === 'HIGH'     ? 'rgba(196,126,53,0.2)'
                  : 'rgba(90,138,74,0.2)'
                  : 'rgba(255,255,255,0.04)',
                color: filterSeverity === sev
                  ? sev === 'CRITICAL' ? 'var(--crimson)'
                  : sev === 'HIGH'     ? 'var(--amber-light)'
                  : 'var(--moss-light)'
                  : 'var(--text-muted)',
                border: filterSeverity === sev ? '1px solid currentColor' : '1px solid var(--border-raw)',
                transition: 'all 0.2s ease',
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Count summary */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Showing <span style={{ color: 'var(--text-secondary)' }}>{filtered.length}</span> of{' '}
        <span style={{ color: 'var(--text-secondary)' }}>{alerts.length}</span> records
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div className="field-panel" style={{ padding: '36px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--moss-light)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              ✓ NO RECORDS MATCH THIS FILTER
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Try a different severity level or check All.
            </div>
          </div>
        ) : (
          filtered.map(alert => (
            <AlertNotification key={alert.id} alert={alert} onAcknowledge={onAcknowledgeAlert} />
          ))
        )}
      </div>
    </div>
  );
};
