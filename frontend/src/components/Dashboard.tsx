import React from 'react';
import { FloodDashboard } from './FloodDashboard';
import { FireDashboard } from './FireDashboard';
import { LandslideDashboard } from './LandslideDashboard';

interface DashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
  initialMode?: 'flood' | 'fire' | 'landslide';
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensors,
  alerts,
  onAcknowledgeAlert,
  historicalData,
  initialMode = 'flood'
}) => {
  if (initialMode === 'landslide') {
    return (
      <LandslideDashboard
        sensors={sensors}
        alerts={alerts}
        onAcknowledgeAlert={onAcknowledgeAlert}
        historicalData={historicalData}
      />
    );
  }

  if (initialMode === 'fire') {
    return (
      <FireDashboard
        sensors={sensors}
        alerts={alerts}
        onAcknowledgeAlert={onAcknowledgeAlert}
        historicalData={historicalData}
      />
    );
  }

  return (
    <FloodDashboard
      sensors={sensors}
      alerts={alerts}
      onAcknowledgeAlert={onAcknowledgeAlert}
      historicalData={historicalData}
    />
  );
};

export default Dashboard;
