import React from 'react';
import { Cpu, Activity, Radio, BatteryCharging, Droplets, Flame, Wind, Mountain } from 'lucide-react';
import { Map } from './Map';
import { Charts } from './Charts';
import { SensorCard } from './SensorCard';
import { AlertNotification } from './AlertNotification';

export const Dashboard = ({ sensors = [], alerts = [], onAcknowledgeAlert, historicalData = [] }) => {
  const onlineSensors   = sensors.filter(s => s.status === 'ONLINE').length;
  const alertingSensors = sensors.filter(s => s.status === 'ALERTING').length;
  const criticalAlerts  = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const avgBattery      = sensors.length
    ? (sensors.reduce((sum, s) => sum + (s.batteryLevel || 95), 0) / sensors.length).toFixed(1)
    : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── KPI Row ──────────────────────────────────────── */}
      <div className="kpi-grid">

        <div className="field-panel kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(74,143,168,0.12)', border: '1px solid rgba(74,143,168,0.22)' }}>
            <Cpu size={22} color="var(--river)" />
          </div>
          <div>
            <div className="kpi-value">{sensors.length}</div>
            <div className="kpi-label">Field Nodes Deployed</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--moss-light)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {onlineSensors} online · {alertingSensors} flagged
            </div>
          </div>
        </div>

        <div className={`field-panel kpi-card ${criticalAlerts > 0 ? 'crit' : ''}`}>
          <div className="kpi-icon-wrap" style={{
            background: criticalAlerts > 0 ? 'rgba(200,64,64,0.12)' : 'rgba(90,138,74,0.12)',
            border: criticalAlerts > 0 ? '1px solid rgba(200,64,64,0.25)' : '1px solid rgba(90,138,74,0.22)'
          }}>
            <Activity size={22} color={criticalAlerts > 0 ? 'var(--crimson)' : 'var(--moss-light)'} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: criticalAlerts > 0 ? 'var(--crimson)' : 'var(--moss-light)' }}>
              {criticalAlerts > 0 ? criticalAlerts : '—'}
            </div>
            <div className="kpi-label">Active Hazard Alerts</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {criticalAlerts > 0 ? 'IMMEDIATE RESPONSE NEEDED' : 'ALL SYSTEMS CLEAR'}
            </div>
          </div>
        </div>

        <div className="field-panel kpi-card river">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(90,138,74,0.1)', border: '1px solid rgba(90,138,74,0.2)' }}>
            <Radio size={22} color="var(--moss)" />
          </div>
          <div>
            <div className="kpi-value">99.8%</div>
            <div className="kpi-label">Mesh Network Uptime</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              LoRaWAN · NB-IoT
            </div>
          </div>
        </div>

        <div className="field-panel kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(196,126,53,0.1)', border: '1px solid rgba(196,126,53,0.2)' }}>
            <BatteryCharging size={22} color="var(--amber)" />
          </div>
          <div>
            <div className="kpi-value">{avgBattery}%</div>
            <div className="kpi-label">Avg Node Battery Reserve</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              Solar · Li-Ion backup
            </div>
          </div>
        </div>
      </div>

      {/* ── Map + Alert Feed ─────────────────────────────── */}
      <div className="dashboard-split">
        <div>
          <Map sensors={sensors} alerts={alerts} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="overline">Live Feed</div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                Hazard Dispatches
              </h3>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
              background: 'rgba(200,64,64,0.12)', color: 'var(--crimson)',
              border: '1px solid rgba(200,64,64,0.3)',
              padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.08em'
            }}>
              ● LIVE
            </span>
          </div>

          {/* Alert list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
            {alerts.length === 0 ? (
              <div className="field-panel" style={{ padding: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--moss-light)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  ✓ ALL ZONES NOMINAL
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  No hazard events detected. Monitoring active.
                </div>
              </div>
            ) : (
              alerts.map(alert => (
                <AlertNotification key={alert.id} alert={alert} onAcknowledge={onAcknowledgeAlert} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Time-series ──────────────────────────────────── */}
      <Charts historicalData={historicalData} />

      {/* ── Field Nodes Grid ─────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div className="overline">Sensor Network</div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
              Deployed Field Nodes
            </h3>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--moss-light)' }}>{onlineSensors}</span> / {sensors.length} active
          </div>
        </div>
        <div className="sensor-grid">
          {sensors.map(sensor => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </div>
    </div>
  );
};
