import React from 'react';
import { User, Shield, Mail, Phone, Building, Key } from 'lucide-react';

export const UserProfile = ({ user }) => {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '24px', marginBottom: '24px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#fff',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            {user?.name?.[0] || 'E'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>{user?.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>{user?.role} • SYSTEM OPERATOR</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.department}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> Email Address
            </span>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', marginTop: '4px' }}>{user?.email}</p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} /> Emergency Hotline
            </span>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', marginTop: '4px' }}>+1 (800) 555-0199</p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Access Level
            </span>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#34d399', marginTop: '4px' }}>Tier 3 (Hazard Command)</p>
          </div>

          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> Hardware Cryptographic Key
            </span>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#38bdf8', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>ECDSA-256 Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
};
