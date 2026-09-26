import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

const METRICS = [
  { key: 'water', label: 'Stage Height (m)', unit: 'm',  color: '#4a8fa8', getter: p => p.avgWaterLevel },
  { key: 'temp',  label: 'Temperature (°C)', unit: '°C', color: '#c84040', getter: p => p.avgTemperature },
  { key: 'risk',  label: 'Hazard Index (%)', unit: '%',  color: '#c47e35', getter: p => (p.riskScoreAverage * 100) },
];

const FALLBACK = [
  { timestamp: '00:00', avgWaterLevel: 2.1, avgTemperature: 21, riskScoreAverage: 0.12 },
  { timestamp: '04:00', avgWaterLevel: 2.3, avgTemperature: 20, riskScoreAverage: 0.15 },
  { timestamp: '08:00', avgWaterLevel: 3.1, avgTemperature: 24, riskScoreAverage: 0.32 },
  { timestamp: '12:00', avgWaterLevel: 4.5, avgTemperature: 31, riskScoreAverage: 0.78 },
  { timestamp: '16:00', avgWaterLevel: 4.2, avgTemperature: 28, riskScoreAverage: 0.65 },
  { timestamp: '20:00', avgWaterLevel: 3.8, avgTemperature: 25, riskScoreAverage: 0.40 },
];

export const Charts = ({ historicalData = [] }) => {
  const [activeKey, setActiveKey] = useState('water');
  const points = historicalData.length > 0 ? historicalData : FALLBACK;
  const active  = METRICS.find(m => m.key === activeKey);
  const values  = points.map(active.getter);
  const maxVal  = Math.max(...values, 1);
  const minVal  = Math.min(...values);

  return (
    <div className="field-panel" style={{ padding: '22px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="overline" style={{ marginBottom: '2px' }}>Historical Trends · 24h</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <TrendingUp size={17} color="var(--moss-light)" /> Zone Telemetry Overview
          </h3>
        </div>

        {/* Metric selector */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-raw)' }}>
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveKey(m.key)}
              style={{
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: '600',
                fontFamily: 'var(--font-mono)',
                background: activeKey === m.key ? m.color + '28' : 'transparent',
                color: activeKey === m.key ? m.color : 'var(--text-muted)',
                border: activeKey === m.key ? `1px solid ${m.color}44` : '1px solid transparent',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '10px', borderBottom: '1px solid var(--border-raw)', paddingBottom: '0' }}>
        {points.map((p, i) => {
          const val = active.getter(p);
          const heightPct = Math.min(100, Math.max(8, (val / (maxVal * 1.1)) * 100));
          const timeStr = typeof p.timestamp === 'string' && p.timestamp.includes('T')
            ? p.timestamp.substring(11, 16)
            : p.timestamp;

          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
              {/* Value label */}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: active.color, fontWeight: '700', opacity: 0.9 }}>
                {val.toFixed(1)}{active.unit}
              </span>
              {/* Bar */}
              <div style={{
                width: '100%',
                maxWidth: '40px',
                height: `${heightPct}%`,
                borderRadius: '4px 4px 0 0',
                background: `linear-gradient(180deg, ${active.color}dd 0%, ${active.color}44 100%)`,
                transition: 'height 0.4s ease',
                position: 'relative',
              }}>
                {/* Top highlight */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: active.color,
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.9,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px', paddingLeft: '2px' }}>
        {points.map((p, i) => {
          const timeStr = typeof p.timestamp === 'string' && p.timestamp.includes('T')
            ? p.timestamp.substring(11, 16)
            : p.timestamp;
          return (
            <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              {timeStr}
            </div>
          );
        })}
      </div>

      {/* Legend row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        marginTop: '14px',
        paddingTop: '14px',
        borderTop: '1px solid var(--border-raw)',
        fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'
      }}>
        <span>MIN: <span style={{ color: active.color }}>{minVal.toFixed(1)}{active.unit}</span></span>
        <span>MAX: <span style={{ color: active.color }}>{maxVal.toFixed(1)}{active.unit}</span></span>
        <span style={{ marginLeft: 'auto' }}>SOURCE: ZONE MESH AGGREGATE · {points.length} SAMPLES</span>
      </div>
    </div>
  );
};
