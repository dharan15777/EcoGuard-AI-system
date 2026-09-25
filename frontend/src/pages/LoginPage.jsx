import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('elena.rostova@ecoguard.ai');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '12px'
          }}>
            <ShieldAlert size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff' }}>Operator Authentication</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Sign in to EcoGuard Disaster Response Console
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Security Key / Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Authenticate Operator <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
