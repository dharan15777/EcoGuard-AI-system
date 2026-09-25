import React from 'react';
import { LayoutDashboard, Cpu, AlertTriangle, BarChart3, Home, User, LogIn } from 'lucide-react';

export const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'home', label: 'Overview Home', icon: Home },
    { id: 'dashboard', label: 'GIS Command Center', icon: LayoutDashboard },
    { id: 'sensors', label: 'Sensor Nodes', icon: Cpu },
    { id: 'alerts', label: 'Emergency Alerts', icon: AlertTriangle },
    { id: 'analytics', label: 'Predictive Analytics', icon: BarChart3 },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'login', label: 'Authentication', icon: LogIn }
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'rgba(15, 23, 42, 0.6)',
      borderRight: '1px solid var(--border-glass)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              background: isActive ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)' : 'transparent',
              border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={18} color={isActive ? '#10b981' : '#64748b'} />
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};
