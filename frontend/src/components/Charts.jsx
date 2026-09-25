import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export const Charts = ({ historicalData = [] }) => {
  const [metric, setMetric] = useState('water'); // 'water', 'temp', 'risk'

  // Default synthetic points if not passed
  const points = historicalData.length > 0 ? historicalData : [
    { timestamp: '00:00', avgWaterLevel: 2.1, avgTemperature: 21, riskScoreAverage: 0.12 },
    { timestamp: '04:00', avgWaterLevel: 2.3, avgTemperature: 20, riskScoreAverage: 0.15 },
    { timestamp: '08:00', avgWaterLevel: 3.1, avgTemperature: 24, riskScoreAverage: 0.32 },
    { timestamp: '12:00', avgWaterLevel: 4.5, avgTemperature: 31, riskScoreAverage: 0.78 },
    { timestamp: '16:00', avgWaterLevel: 4.2, avgTemperature: 28, riskScoreAverage: 0.65 },
    { timestamp: '20:00', avgWaterLevel: 3.8, avgTemperature: 25, riskScoreAverage: 0.40 }
  ];

  const getValue = (p) => {
    if (metric === 'water') return p.avgWaterLevel;
    if (metric === 'temp') return p.avgTemperature;
    return (p.riskScoreAverage * 100);
  };

  const getUnit = () => {
    if (metric === 'water') return 'm';
    if (metric === 'temp') return '°C';
    return '%';
  };

  const maxVal = Math.max(...points.map(getValue), 1);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="#10b981" /> 24-Hour Environmental Telemetry Trends
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time multi-sensor aggregate streaming history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          {['water', 'temp', 'risk'].map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '600',
                textTransform: 'capitalize',
                background: metric === m ? '#10b981' : 'transparent',
                color: metric === m ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {m === 'water' ? 'Stage Height (m)' : m === 'temp' ? 'Temperature (°C)' : 'AI Risk (%)'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Bar / Trend Chart */}
      <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '20px 10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {points.map((p, i) => {
          const val = getValue(p);
          const heightPercent = Math.min(100, Math.max(15, (val / (maxVal * 1.15)) * 100));

          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: '700' }}>
                {typeof val === 'number' ? val.toFixed(1) : val}{getUnit()}
              </span>
              <div 
                style={{
                  width: '100%',
                  maxWidth: '44px',
                  height: `${heightPercent}%`,
                  borderRadius: '6px 6px 0 0',
                  background: metric === 'risk' 
                    ? 'linear-gradient(180deg, #f43f5e 0%, rgba(244, 63, 94, 0.2) 100%)'
                    : 'linear-gradient(180deg, #10b981 0%, rgba(16, 185, 129, 0.2) 100%)',
                  boxShadow: metric === 'risk' ? '0 0 12px rgba(244, 63, 94, 0.2)' : '0 0 12px rgba(16, 185, 129, 0.2)',
                  transition: 'height 0.4s ease'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {p.timestamp.includes('T') ? p.timestamp.substring(11, 16) : p.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
