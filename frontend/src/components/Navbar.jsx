import React from 'react';
import { Leaf, Bell, Radio, ChevronDown, Wifi, LogOut } from 'lucide-react';

export const Navbar = ({ activePage, setActivePage, user, onLogout }) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      height: '60px',
      background: 'rgba(14, 18, 13, 0.97)',
      borderBottom: '1px solid var(--border-raw)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '34px', height: '34px',
          borderRadius: '6px',
          background: 'linear-gradient(140deg, #3d6e30 0%, #2a4e24 100%)',
          border: '1px solid rgba(90,138,74,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(90,138,74,0.2)',
          flexShrink: 0
        }}>
          <Leaf size={18} color="#82b460" />
        </div>
        <div>
          <div style={{
            fontSize: '1.05rem', fontWeight: '700',
            letterSpacing: '-0.01em',
            color: '#e8ede6'
          }}>
            <span style={{ color: '#82b460' }}>Eco</span>Guard
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)', marginTop: '-1px' }}>
            FIELD OPERATIONS CONSOLE
          </div>
        </div>
      </div>

      {/* Center — zone ID & time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ZONE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: '700', color: '#c4d4bc' }}>BAY-DELTA</div>
        </div>

        <div style={{ width: '1px', height: '28px', background: 'var(--border-raw)' }} />

        {/* Live mesh status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot online" />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>MESH NET</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--moss-light)' }}>NOMINAL</div>
          </div>
        </div>

        <div style={{ width: '1px', height: '28px', background: 'var(--border-raw)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700', color: '#c4d4bc', letterSpacing: '0.05em' }}>{timeStr}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{dateStr} UTC+5:30</div>
        </div>
      </div>

      {/* Right — alerts + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setActivePage('alerts')}
          style={{
            position: 'relative', padding: '8px',
            border: '1px solid var(--border-raw)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s ease'
          }}
        >
          <Bell size={17} />
          <span style={{
            position: 'absolute', top: '5px', right: '5px',
            width: '7px', height: '7px',
            background: 'var(--crimson)',
            borderRadius: '50%',
            border: '1.5px solid var(--bg-root)'
          }} />
        </button>

        <div
          onClick={() => setActivePage('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '9px',
            cursor: 'pointer',
            padding: '6px 12px 6px 8px',
            border: '1px solid var(--border-raw)',
            borderRadius: '6px',
            background: 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '5px',
            background: 'linear-gradient(135deg, #3d6e30, #2a4e24)',
            border: '1px solid rgba(90,138,74,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.9rem', color: '#82b460'
          }}>
            {user?.name?.[0] || 'E'}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.1 }}>{user?.name || 'E. Rostova'}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{user?.role || 'FIELD OPS'}</div>
          </div>
          <ChevronDown size={13} color="var(--text-muted)" />
        </div>
        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              padding: '8px',
              border: '1px solid rgba(200,64,64,0.25)',
              borderRadius: '6px',
              color: 'var(--crimson)',
              background: 'rgba(200,64,64,0.06)',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </nav>
  );
};
