import React, { useState } from 'react';
import { Navbar }           from './components/Navbar';
import { Sidebar }          from './components/Sidebar';
import { HomePage }         from './pages/HomePage';
import { DashboardPage }    from './pages/DashboardPage';
import { SensorManagement } from './pages/SensorManagement';
import { AlertHistory }     from './pages/AlertHistory';
import { AnalyticsPage }    from './pages/AnalyticsPage';
import { UserProfile }      from './pages/UserProfile';
import { LandingPage }      from './pages/LandingPage';
import { useSensorData }    from './hooks/useSensorData';
import { useAlerts }        from './hooks/useAlerts';
import { useAuth }          from './hooks/useAuth';
import { Leaf, Loader2 }    from 'lucide-react';

/* ── Full-screen spinner shown during session restore ─────────────── */
const AppLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#0e1210', gap: '18px',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '10px',
      background: 'linear-gradient(140deg, #3d6e30 0%, #2a4e24 100%)',
      border: '1px solid rgba(90,138,74,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 20px rgba(90,138,74,0.2)',
    }}>
      <Leaf size={24} color="#82b460" />
    </div>
    <Loader2 size={20} color="#5a8a4a" style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const { sensors }                 = useSensorData();
  const { alerts, acknowledgeAlert} = useAlerts();
  const { user, loading, login, loginWithGoogle, logout } = useAuth();

  // ── While restoring session show a loader ─────────────────────────
  if (loading) return <AppLoader />;

  // ── Not authenticated → show landing page ─────────────────────────
  if (!user) {
    return (
      <LandingPage
        onLogin={login}
        onGoogleLogin={loginWithGoogle}
      />
    );
  }

  // ── Authenticated → show main app ─────────────────────────────────
  const renderActiveView = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={setActivePage} />;
      case 'dashboard':
        return (
          <DashboardPage
            sensors={sensors}
            alerts={alerts}
            onAcknowledgeAlert={acknowledgeAlert}
          />
        );
      case 'sensors':
        return <SensorManagement sensors={sensors} />;
      case 'alerts':
        return <AlertHistory alerts={alerts} onAcknowledgeAlert={acknowledgeAlert} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'profile':
        return <UserProfile user={user} onLogout={logout} />;
      default:
        return (
          <DashboardPage
            sensors={sensors}
            alerts={alerts}
            onAcknowledgeAlert={acknowledgeAlert}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
        onLogout={logout}
      />
      <div className="app-layout">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="main-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;
