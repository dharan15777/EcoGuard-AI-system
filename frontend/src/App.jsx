import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { SensorManagement } from './pages/SensorManagement';
import { AlertHistory } from './pages/AlertHistory';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { UserProfile } from './pages/UserProfile';
import { useSensorData } from './hooks/useSensorData';
import { useAlerts } from './hooks/useAlerts';
import { useAuth } from './hooks/useAuth';

export function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const { sensors } = useSensorData();
  const { alerts, acknowledgeAlert } = useAlerts();
  const { user } = useAuth();

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
        return (
          <AlertHistory
            alerts={alerts}
            onAcknowledgeAlert={acknowledgeAlert}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'login':
        return <LoginPage onLoginSuccess={() => setActivePage('dashboard')} />;
      case 'profile':
        return <UserProfile user={user} />;
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
      <Navbar activePage={activePage} setActivePage={setActivePage} user={user} />
      
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
