import React from 'react';
import { Activity, ShieldAlert, Cpu, Radio, Droplets, Flame, Wind, Mountain, BatteryCharging } from 'lucide-react';
import { Map } from './Map';
import { Charts } from './Charts';
import { SensorCard } from './SensorCard';
import { AlertNotification } from './AlertNotification';

export const Dashboard = ({ sensors = [], alerts = [], onAcknowledgeAlert, historicalData = [] }) => {
  const onlineSensors = sensors.filter(s => s.status === 'ONLINE').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrapper">
            <Cpu size={26} />
          </div>
          <div>
            <div className="kpi-value">{sensors.length}</div>
            <div className="kpi-label">Deployed Edge Micro-Nodes</div>
          </div>
        </div>

        <div className={`glass-panel kpi-card ${criticalAlerts > 0 ? 'alert-card' : ''}`}>
          <div className="kpi-icon-wrapper">
            <ShieldAlert size={26} />
          </div>
          <div>
            <div className="kpi-value" style={{ color: criticalAlerts > 0 ? '#f43f5e' : '#34d399' }}>
              {criticalAlerts} Active
            </div>
            <div className="kpi-label">Disaster Warning Dispatches</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrapper" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}>
            <Radio size={26} />
          </div>
          <div>
            <div className="kpi-value">99.8%</div>
            <div className="kpi-label">LoRaWAN Mesh Packet Health</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon-wrapper" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
            <BatteryCharging size={26} />
          </div>
          <div>
            <div className="kpi-value">94.5%</div>
            <div className="kpi-label">Avg Solar/Battery Reserve</div>
          </div>
        </div>
      </div>

      {/* Main Split: GIS Interactive Map + Active Hazards Feed */}
      <div className="dashboard-split">
        <div>
          <Map sensors={sensors} alerts={alerts} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="#ef4444" /> Live Emergency Warning Feed
            </h3>
            <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              REALTIME
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '425px', overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active critical alerts. All environmental baselines nominal.
              </div>
            ) : (
              alerts.map(alert => (
                <AlertNotification key={alert.id} alert={alert} onAcknowledge={onAcknowledgeAlert} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Time-Series Charts */}
      <Charts historicalData={historicalData} />

      {/* Edge Micro-Nodes Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>Deployed Environmental Micro-Nodes</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Embedded TensorFlow Lite sensor points</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold' }}>
            {onlineSensors} of {sensors.length} Nodes Active
          </span>
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
