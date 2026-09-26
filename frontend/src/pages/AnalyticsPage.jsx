import React from 'react';
import { Charts } from '../components/Charts';
import { Droplets, Flame, Wind, Mountain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const METRICS_CARDS = [
  {
    icon: Droplets, color: '#4a8fa8', bg: 'rgba(74,143,168,0.1)',
    label: 'Flood Stage Index', value: '+18.4%', unit: 'vs 30-day baseline',
    trend: 'up', detail: 'River levels rising across Delta channels'
  },
  {
    icon: Flame, color: '#c84040', bg: 'rgba(200,64,64,0.1)',
    label: 'Fire Weather Index', value: '94.2%', unit: 'probability (sierra)',
    trend: 'up', detail: 'High-risk window: 11:00 – 18:00 local'
  },
  {
    icon: Wind, color: '#9a7ec8', bg: 'rgba(154,126,200,0.1)',
    label: 'Avg Particulate PM2.5', value: '28.5', unit: 'µg/m³',
    trend: 'stable', detail: 'Within acceptable range — Good AQI'
  },
  {
    icon: Mountain, color: '#c47e35', bg: 'rgba(196,126,53,0.1)',
    label: 'Slope Saturation', value: '61.3%', unit: '% soil moisture',
    trend: 'down', detail: 'Decreasing after recent dry spell'
  },
];

const TrendIcon = ({ dir }) => {
  if (dir === 'up')     return <TrendingUp size={14} color="var(--crimson)" />;
  if (dir === 'down')   return <TrendingDown size={14} color="var(--moss-light)" />;
  return <Minus size={14} color="var(--amber)" />;
};

export const AnalyticsPage = ({ historicalData = [] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} >

      {/* Page header */}
      <div>
        <div className="overline" style={{ marginBottom: '4px' }}>Analytics</div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Environmental Trend Analysis
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Historical baseline comparison, hazard probability distributions, and zone-level telemetry aggregates.
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {METRICS_CARDS.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="field-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '5px',
                    background: m.bg, border: `1px solid ${m.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} color={m.color} />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{m.label}</span>
                </div>
                <TrendIcon dir={m.trend} />
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: '700', color: m.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px', letterSpacing: '0.04em' }}>
                {m.unit}
              </div>

              <div style={{
                marginTop: '12px', paddingTop: '10px',
                borderTop: '1px solid var(--border-raw)',
                fontSize: '0.75rem', color: 'var(--text-secondary)'
              }}>
                {m.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time-series chart */}
      <Charts historicalData={historicalData} />

      {/* Zone performance table */}
      <div className="field-panel" style={{ padding: '22px' }}>
        <div className="overline" style={{ marginBottom: '14px' }}>Zone Performance Summary · 7-Day</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-raw)' }}>
                {['Zone', 'Type', 'Avg Reading', 'Peak', 'Alerts Issued', 'Status'].map(col => (
                  <th key={col} style={{
                    padding: '8px 12px', textAlign: 'left',
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                    color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { zone: 'Pine River Delta', type: 'Hydrology',    avg: '2.8 m',    peak: '4.5 m',  alerts: 2, ok: true  },
                { zone: 'Sierra Foothills', type: 'Thermal',      avg: '26.4 °C',  peak: '84 °C',  alerts: 5, ok: false },
                { zone: 'Metro Corridor',   type: 'Air Quality',  avg: 'AQI 38',   peak: 'AQI 90', alerts: 0, ok: true  },
                { zone: 'Coastal Cliffs',   type: 'Geotechnical', avg: '44% moist',peak: '88%',    alerts: 1, ok: true  },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-raw)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--text-primary)' }}>{row.zone}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.type}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--river-light)' }}>{row.avg}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: row.ok ? 'var(--text-secondary)' : 'var(--crimson)' }}>{row.peak}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: row.alerts > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>{row.alerts}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${row.ok ? 'badge-low' : 'badge-high'}`}>
                      {row.ok ? 'NOMINAL' : 'ELEVATED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
