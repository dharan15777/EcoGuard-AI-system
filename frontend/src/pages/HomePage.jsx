import React from 'react';
import { ShieldCheck, Cpu, Radio, AlertTriangle, ArrowRight, Activity, Globe, Zap } from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '48px 36px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.9) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#34d399',
            marginBottom: '16px'
          }}>
            <Zap size={14} /> NEXT-GEN TENSORFLOW LITE EDGE INFERENCE
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.15, letterSpacing: '-0.03em', color: '#ffffff' }}>
            AI-Driven Early Warning & Environmental Hazard Detection
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', marginTop: '16px', lineHeight: 1.6 }}>
            EcoGuard AI combines ultra-low power LoRaWAN edge sensor micro-nodes, local quantized neural inference, and rapid multi-channel emergency broadcasting for floods, wildfires, air toxics, and landslides.
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '28px' }}>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              Open Live Command Center <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('sensors')}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            >
              Inspect Sensor Mesh
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', marginBottom: '14px' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>On-Device TFLite Models</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Sub-millisecond quantized neural classification directly on ESP32 & STM32 edge microcontrollers without network round-trips.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', marginBottom: '14px' }}>
            <AlertTriangle size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Multi-Channel Dispatch</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Automated siren array triggering, emergency SMS, push notifications, and civic authority escalations within 3 seconds of anomaly.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '14px' }}>
            <Radio size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>LoRaWAN & NB-IoT Backhaul</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Resilient dual-path long-range mesh network surviving regional infrastructure and electrical grid power failures.
          </p>
        </div>
      </div>
    </div>
  );
};
