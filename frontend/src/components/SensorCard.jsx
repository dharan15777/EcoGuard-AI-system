import React from 'react';
import { Activity, Battery, Radio, ShieldCheck, AlertCircle, Droplets, Flame, Wind, Mountain } from 'lucide-react';
import { getSeverityClass } from '../utils/formatters';

export const SensorCard = ({ sensor, onSelect }) => {
  const isAlerting = sensor.status === 'ALERTING' || sensor.riskScore > 0.7;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'FLOOD_WATER_LEVEL': return <Droplets size={18} color="#06b6d4" />;
      case 'WILDFIRE_THERMAL': return <Flame size={18} color="#ef4444" />;
      case 'AIR_QUALITY_AQI': return <Wind size={18} color="#a855f7" />;
      case 'LANDSLIDE_SOIL_MOISTURE': return <Mountain size={18} color="#f59e0b" />;
      default: return <Activity size={18} color="#10b981" />;
    }
  };

  return (
    <div 
      className="glass-panel"
      onClick={() => onSelect && onSelect(sensor)}
      style={{
        padding: '20px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        border: isAlerting ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-glass)',
        boxShadow: isAlerting ? '0 0 20px rgba(244, 63, 94, 0.15)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getTypeIcon(sensor.type)}
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>{sensor.name}</h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{sensor.id}</p>
          </div>
        </div>

        <span className={`badge ${isAlerting ? 'badge-critical' : 'badge-low'}`}>
          {sensor.status}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        padding: '12px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '10px',
        marginBottom: '14px'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Telemetry Metric</span>
          <p style={{ fontSize: '1.05rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
            {sensor.val || (sensor.telemetry?.waterLevel ? `${sensor.telemetry.waterLevel}m` : sensor.telemetry?.temperature ? `${sensor.telemetry.temperature}°C` : 'Nominal')}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Risk Evaluation</span>
          <p style={{ fontSize: '1.05rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isAlerting ? '#f43f5e' : '#34d399' }}>
            {sensor.riskScore !== undefined ? `${(sensor.riskScore * 100).toFixed(0)}%` : '12%'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Battery size={14} color="#10b981" />
          <span>{sensor.batteryLevel || 95}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={14} color="#38bdf8" />
          <span>LoRaWAN SF7</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} color="#a855f7" />
          <span>TFLite Int8</span>
        </div>
      </div>
    </div>
  );
};
