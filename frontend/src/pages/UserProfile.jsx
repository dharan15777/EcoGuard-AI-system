import React from 'react';
import { User, Shield, Mail, Phone, Building, Key, MapPin, Clock } from 'lucide-react';

const InfoBlock = ({ icon: Icon, label, value, color = 'var(--text-primary)' }) => (
  <div style={{
    padding: '14px 16px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    border: '1px solid var(--border-raw)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
      <Icon size={13} color="var(--stone)" />
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ fontSize: '0.88rem', fontWeight: '600', color }}>{value}</div>
  </div>
);

export const UserProfile = ({ user }) => {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Identity card */}
      <div className="field-panel" style={{ padding: '28px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '18px',
          borderBottom: '1px solid var(--border-raw)',
          paddingBottom: '22px', marginBottom: '22px'
        }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '8px',
            background: 'linear-gradient(140deg, #3d6e30 0%, #2a4e24 100%)',
            border: '1px solid rgba(90,138,74,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: '700', color: '#82b460',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 0 16px rgba(90,138,74,0.15)',
            flexShrink: 0
          }}>
            {user?.name?.[0] || 'E'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {user?.name || 'Elena Rostova'}
            </h2>
            <div style={{ fontSize: '0.72rem', color: 'var(--moss-light)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: '3px' }}>
              {user?.role || 'FIELD OPERATIONS LEAD'} · BAY-DELTA ZONE
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
              {user?.department || 'Environmental Response Division'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <InfoBlock icon={Mail}     label="Email"         value={user?.email || 'elena.rostova@ecoguard.ai'} />
          <InfoBlock icon={Phone}    label="Emergency"     value="+1 (800) 555-0199" />
          <InfoBlock icon={Shield}   label="Clearance"     value="Tier 3 — Hazard Command" color="var(--moss-light)" />
          <InfoBlock icon={Building} label="Station"       value="Bay-Delta Operations Hub" />
          <InfoBlock icon={MapPin}   label="Zone"          value="BAY-DELTA / Sector 4A" color="var(--river-light)" />
          <InfoBlock icon={Clock}    label="Shift"         value="07:00 – 19:00 UTC+5:30" />
        </div>
      </div>

      {/* Credentials */}
      <div className="field-panel" style={{ padding: '22px' }}>
        <div className="overline" style={{ marginBottom: '14px' }}>Security Credentials</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { key: 'Signing Key',     val: 'ECDSA-256 · Verified',          ok: true },
            { key: 'Access Token',    val: 'OAuth2 Bearer · Exp 24h',        ok: true },
            { key: 'Hardware Token',  val: 'FIDO2 YubiKey · Bound',         ok: true },
          ].map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '6px',
              border: '1px solid var(--border-raw)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={14} color="var(--stone)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.key}</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: c.ok ? 'var(--moss-light)' : 'var(--crimson)',
              }}>{c.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
