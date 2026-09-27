import React from 'react';
import { LayoutDashboard, Cpu, AlertTriangle, BarChart3, Home, User, LogIn, Leaf, Waves, Flame, Mountain } from 'lucide-react';

const navItems = [
  { id: 'home',      icon: Home,            label: 'Overview' },
  { id: 'flood',     icon: Waves,           label: 'Flood Detection Monitoring' },
  { id: 'fire',      icon: Flame,           label: 'Forest Fire Detection Monitoring' },
  { id: 'landslide', icon: Mountain,        label: 'Landslide Detection Monitoring' },
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
        const isActive = item.id === 'flood'
          ? (activePage === 'flood' || activePage === 'dashboard')
          : activePage === item.id;

        const activeColor = item.id === 'fire'
          ? '#fb923c'
          : item.id === 'flood'
          ? '#38bdf8'
          : item.id === 'landslide'
          ? '#fbbf24'
          : '#82b460';

        const activeBg = item.id === 'fire'
          ? 'rgba(249,115,22,0.18)'
          : item.id === 'flood'
          ? 'rgba(56,189,248,0.18)'
          : item.id === 'landslide'
          ? 'rgba(245,158,11,0.18)'
          : 'rgba(90,138,74,0.15)';

        const activeBorder = item.id === 'fire'
          ? '1px solid rgba(249,115,22,0.45)'
          : item.id === 'flood'
          ? '1px solid rgba(56,189,248,0.45)'
          : item.id === 'landslide'
          ? '1px solid rgba(245,158,11,0.45)'
          : '1px solid rgba(90,138,74,0.35)';

        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            title={item.label}
            style={{
              width: '44px', height: '44px',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isActive ? activeColor : 'var(--stone)',
              background: isActive ? activeBg : 'transparent',
              border: isActive ? activeBorder : '1px solid transparent',
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
                background: activeColor,
                borderRadius: '0 3px 3px 0',
              }} />
            )}
          </button>
        );
      })}
    </aside>
  );
};
