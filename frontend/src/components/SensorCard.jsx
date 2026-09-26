import React from 'react';
import { Droplets, Flame, Wind, Mountain, Activity, Battery, Radio } from 'lucide-react';

const TYPE_META = {
  'FLOOD_WATER_LEVEL':      { icon: Droplets,  label: 'Hydrology',     color: '#4a8fa8', bg: 'rgba(74,143,168,0.12)',  unit: 'm',    key: 'waterLevel'  },
  'WILDFIRE_THERMAL':       { icon: Flame,     label: 'Thermal',       color: '#c84040', bg: 'rgba(200,64,64,0.12)',   unit: '°C',   key: 'temperature' },
  'AIR_QUALITY_AQI':        { icon: Wind,      label: 'Air Quality',   color: '#9a7ec8', bg: 'rgba(154,126,200,0.12)', unit: 'AQI',  key: 'pm25'        },
  'LANDSLIDE_SOIL_MOISTURE':{ icon: Mountain,  label: 'Geotechnical',  color: '#c47e35', bg: 'rgba(196,126,53,0.12)',  unit: '%',    key: 'soilMoisture'},
  'METEOROLOGICAL':         { icon: Activity,  label: 'Meteorology',   color: '#5a8a4a', bg: 'rgba(90,138,74,0.12)',   unit: '',     key: null          },
};

const getStatusStyle = (status) => {
  if (status === 'ALERTING') return { dot: 'alerting', badge: 'badge badge-critical', text: 'HAZARD' };
  if (status === 'OFFLINE')  return { dot: 'offline',  badge: 'badge badge-moderate', text: 'OFFLINE' };
  return { dot: 'online', badge: 'badge badge-low', text: 'NOMINAL' };
};

export const SensorCard = ({ sensor, onSelect }) => {
  const meta = TYPE_META[sensor.type] || TYPE_META['METEOROLOGICAL'];
  const Icon = meta.icon;
  const st = getStatusStyle(sensor.status);
  const isAlerting = sensor.status === 'ALERTING';

  // Get main metric value
  const rawVal = sensor.telemetry?.[meta.key];
  const displayVal = sensor.val || (rawVal !== undefined ? `${rawVal}${meta.unit}` : '—');

  // Risk bar percentage (0-100)
  const riskPct = sensor.riskScore !== undefined ? Math.round(sensor.riskScore * 100) : 12;
  const riskColor = riskPct > 75 ? 'var(--crimson)' : riskPct > 45 ? 'var(--amber)' : 'var(--moss-light)';

  return (
    <div
      className="field-panel"
      onClick={() => onSelect && onSelect(sensor)}
      style={{
        padding: '18px',
        cursor: 'pointer',
        borderColor: isAlerting ? 'var(--border-crit)' : 'var(--border-raw)',
        boxShadow: isAlerting ? 'var(--shadow-glow-crit)' : 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Top: type icon + name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '6px',
            background: meta.bg,
            border: `1px solid ${meta.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={18} color={meta.color} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {sensor.name}
            </div>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.06em' }}>
              {sensor.id} · {meta.label}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span className={`status-dot ${st.dot}`} />
          <span className={st.badge}>{st.text}</span>
        </div>
      </div>

      {/* Main metric + risk */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '12px',
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '6px',
        border: '1px solid var(--border-raw)',
        marginBottom: '14px'
      }}>
        <div>
          <div className="overline" style={{ marginBottom: '4px' }}>Live Reading</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: '700', color: meta.color, letterSpacing: '-0.01em' }}>
            {displayVal}
          </div>
        </div>
        <div>
          <div className="overline" style={{ marginBottom: '4px' }}>Risk Level</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: '700', color: riskColor, letterSpacing: '-0.01em' }}>
            {riskPct}%
          </div>
        </div>
      </div>

      {/* Risk progress bar */}
      <div style={{ marginBottom: '14px' }}>
        <div className="prog-bar-track">
          <div className="prog-bar-fill" style={{ width: `${riskPct}%`, background: riskColor }} />
        </div>
      </div>

      {/* Footer: battery + signal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.73rem' }}>
          <Battery size={13} color="var(--moss-light)" />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {sensor.batteryLevel !== undefined ? `${sensor.batteryLevel}%` : '95%'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.73rem' }}>
          <Radio size={13} color="var(--river)" />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {sensor.firmwareVersion || 'v2.4'}
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {sensor.lastPing ? new Date(sensor.lastPing).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
        </div>
      </div>
    </div>
  );
};
