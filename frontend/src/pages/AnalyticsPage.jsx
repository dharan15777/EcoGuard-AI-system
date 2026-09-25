import React from 'react';
import { Charts } from '../components/Charts';
import { TrendingUp, ShieldAlert, Droplet, Flame, Wind, Activity } from 'lucide-react';

export const AnalyticsPage = ({ historicalData = [] }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Predictive Risk & Environmental Analytics</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Historical baseline comparison, hazard probability distributions, and AI forecasting models
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Droplet size={18} color="#06b6d4" />
            <h4 style={{ fontSize: '0.9rem', color: '#fff' }}>Flood Stage Index</h4>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>+18.4%</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Compared to seasonal 30-day baseline</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Flame size={18} color="#ef4444" />
            <h4 style={{ fontSize: '0.9rem', color: '#fff' }}>Thermal Anomaly Prob.</h4>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f43f5e', fontFamily: 'var(--font-mono)' }}>94.2%</p>
          <span style={{ fontSize: '0.75rem', color: '#f87171' }}>High risk in Sierra Foothill Corridor</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Wind size={18} color="#a855f7" />
            <h4 style={{ fontSize: '0.9rem', color: '#fff' }}>Mean Particulate PM2.5</h4>
          </div>
          <p style={{ fontSize: '1.6rem', fontWeight: '800', color: '#c084fc', fontFamily: 'var(--font-mono)' }}>28.5 µg/m³</p>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Good Air Quality Index Level</span>
        </div>
      </div>

      <Charts historicalData={historicalData} />
    </div>
  );
};
