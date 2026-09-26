import React from 'react';
import { LayoutDashboard, Cpu, AlertTriangle, BarChart3, Home, User, LogIn, Leaf, Waves } from 'lucide-react';

const navItems = [
  { id: 'home',      icon: Home,            label: 'Overview' },
  { id: 'dashboard', icon: Waves,          label: 'Flood Monitoring Dashboard' },
  { id: 'sensors',   icon: Cpu,             label: 'Field Nodes' },
  { id: 'alerts',    icon: AlertTriangle,   label: 'Active Alerts' },
  { id: 'analytics', icon: BarChart3,       label: 'Trend Analysis' },
  { id: 'profile',   icon: User,            label: 'My Profile' },
  { id: 'login',     icon: LogIn,           label: 'Sign In' },
];

export const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <aside style={{
      width: '64px',
      background: 'rgba(12, 16, 11, 0.95)',
      borderRight: '1px solid var(--border-raw)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      paddingBottom: '20px',
      gap: '6px',
      flexShrink: 0,
    }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            title={item.label}
            style={{
              width: '44px', height: '44px',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isActive ? '#82b460' : 'var(--stone)',
              background: isActive ? 'rgba(90,138,74,0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(90,138,74,0.35)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            <Icon size={18} />
            {/* Active left tab */}
            {isActive && (
              <span style={{
                position: 'absolute',
                left: 0, top: '25%',
                width: '3px', height: '50%',
                background: 'var(--moss-light)',
                borderRadius: '0 3px 3px 0',
              }} />
            )}
          </button>
        );
      })}
    </aside>
  );
};
