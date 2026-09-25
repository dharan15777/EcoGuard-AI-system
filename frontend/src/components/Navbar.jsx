import React from 'react';
import { ShieldAlert, Bell, Cpu, UserCheck } from 'lucide-react';

export const Navbar = ({ activePage, setActivePage, user }) => {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
        }}>
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EcoGuard AI
          </h1>
          <p style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '600', letterSpacing: '0.05em' }}>
            ENVIRONMENTAL DISASTER EARLY WARNING PLATFORM
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399' }}>EDGE AI MESH ONLINE</span>
        </div>

        <button 
          onClick={() => setActivePage('alerts')}
          style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', color: 'var(--text-primary)' }}
        >
          <Bell size={18} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#f43f5e', borderRadius: '50%' }}></span>
        </button>

        <div 
          onClick={() => setActivePage('profile')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)' }}
        >
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.name?.[0] || 'E'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{user?.name}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
};
