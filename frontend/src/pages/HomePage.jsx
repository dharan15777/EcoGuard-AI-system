import React from 'react';
import { ShieldCheck, Cpu, Radio, AlertTriangle, ArrowRight, Droplets, Flame, Wind, Mountain, MapPin } from 'lucide-react';

const HAZARD_ZONES = [
  { icon: Droplets, label: 'Flood Monitoring',   color: '#4a8fa8', bg: 'rgba(74,143,168,0.1)',  count: '3 Hydro Nodes',    region: 'River Delta' },
  { icon: Flame,    label: 'Fire Detection',      color: '#c84040', bg: 'rgba(200,64,64,0.1)',   count: '4 Thermal Nodes', region: 'Sierra Foothills' },
  { icon: Wind,     label: 'Air Quality',         color: '#9a7ec8', bg: 'rgba(154,126,200,0.1)', count: '2 AQI Stations',  region: 'Metro Corridor' },
  { icon: Mountain, label: 'Slope Stability',     color: '#c47e35', bg: 'rgba(196,126,53,0.1)',  count: '5 Geo Sensors',   region: 'Coastal Cliffs' },
];

const STATS = [
  { value: '320 km²', label: 'Coverage Area' },
  { value: '< 8 min', label: 'Alert Response Time' },
  { value: '24 / 7',  label: 'Continuous Watch' },
  { value: '3 sec',   label: 'Telemetry Interval' },
];

export const HomePage = ({ onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="fade-up">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{
        padding: '48px 40px',
        background: 'linear-gradient(130deg, rgba(22,30,20,0.95) 0%, rgba(15,20,14,0.98) 100%)',
        border: '1px solid var(--border-raw)',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative topographic lines */}
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.06, height: '100%', width: '50%' }}
          viewBox="0 0 600 400" fill="none" preserveAspectRatio="xMidYMid slice">
          {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((r, i) => (
            <ellipse key={i} cx="500" cy="200" rx={r * 1.5} ry={r} stroke="#82b460" strokeWidth="1.5" />
          ))}
        </svg>

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(90,138,74,0.12)',
            border: '1px solid rgba(90,138,74,0.3)',
            padding: '5px 12px', borderRadius: '4px',
            fontSize: '0.65rem', fontWeight: '700',
            color: 'var(--moss-light)', fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em', marginBottom: '20px'
          }}>
            <MapPin size={11} /> BAY-DELTA ENVIRONMENTAL MONITORING ZONE
          </div>

          <h1 style={{
            fontSize: '2.6rem', fontWeight: '700',
            lineHeight: 1.1, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '16px'
          }}>
            Protecting Communities<br />
            <span style={{ color: 'var(--moss-light)' }}>Through Environmental Vigilance</span>
          </h1>

          <p style={{
            fontSize: '1rem', color: 'var(--text-secondary)',
            lineHeight: 1.7, maxWidth: '560px', marginBottom: '32px'
          }}>
            A distributed network of environmental sensors monitors flood water levels,
            wildfire heat signatures, air quality indices, and ground instability across
            the region — 24 hours a day, 7 days a week.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                background: 'linear-gradient(135deg, var(--moss) 0%, #3d5e30 100%)',
                color: '#e8ede6',
                padding: '12px 22px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 0 18px rgba(90,138,74,0.3)',
                border: '1px solid rgba(90,138,74,0.3)',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Open Field Command <ArrowRight size={15} />
            </button>
            <button
              onClick={() => onNavigate('sensors')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-raw)',
                color: 'var(--text-secondary)',
                padding: '12px 20px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              View Sensor Map
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1px',
        background: 'var(--border-raw)',
        border: '1px solid var(--border-raw)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            padding: '20px 24px',
            background: 'var(--bg-panel)',
            textAlign: 'center'
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '0.02em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Monitoring zones ──────────────────────────────── */}
      <div>
        <div className="overline" style={{ marginBottom: '12px' }}>Active Monitoring Disciplines</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {HAZARD_ZONES.map((zone, i) => {
            const Icon = zone.icon;
            return (
              <div key={i} className="field-panel" style={{ padding: '22px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '6px',
                  background: zone.bg,
                  border: `1px solid ${zone.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <Icon size={20} color={zone.color} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {zone.label}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                  Continuous telemetry across {zone.region} with automated hazard escalation.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    color: zone.color,
                    background: zone.bg,
                    border: `1px solid ${zone.color}30`,
                    padding: '2px 8px', borderRadius: '3px'
                  }}>
                    {zone.count}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {zone.region}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── System capabilities ───────────────────────────── */}
      <div className="field-panel" style={{ padding: '28px 32px' }}>
        <div className="overline" style={{ marginBottom: '16px' }}>System Capabilities</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { icon: Cpu,          color: 'var(--river)',       label: 'Local Processing',      desc: 'Sensor inference runs directly on the node hardware — no cloud dependency for hazard detection.' },
            { icon: AlertTriangle, color: 'var(--crimson)',    label: 'Multi-Channel Dispatch', desc: 'Automated SMS alerts, siren triggers, and authority escalations within 3 seconds of threshold breach.' },
            { icon: Radio,         color: 'var(--moss-light)', label: 'Resilient Backhaul',    desc: 'Long-range mesh network survives regional grid failure and infrastructure outages.' },
            { icon: ShieldCheck,   color: 'var(--amber)',      label: 'Certified Hardware',    desc: 'IP67-rated nodes designed for extreme weather, high-altitude deployment, and submersion.' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  <Icon size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
