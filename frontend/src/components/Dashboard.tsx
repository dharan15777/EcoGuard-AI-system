import React from 'react';
import { FloodDashboard } from './FloodDashboard';
import { FireDashboard } from './FireDashboard';

interface DashboardProps {
  sensors?: any[];
  alerts?: any[];
  onAcknowledgeAlert?: (alertId: string) => void;
  historicalData?: any[];
  initialMode?: 'flood' | 'fire';
}

export const Dashboard: React.FC<DashboardProps> = ({
  sensors,
  alerts,
  onAcknowledgeAlert,
  historicalData,
  initialMode = 'flood'
}) => {
  return initialMode === 'fire' ? (
    <FireDashboard
      sensors={sensors}
      alerts={alerts}
      onAcknowledgeAlert={onAcknowledgeAlert}
      historicalData={historicalData}
    />
  ) : (
    <FloodDashboard
      sensors={sensors}
      alerts={alerts}
      onAcknowledgeAlert={onAcknowledgeAlert}
      historicalData={historicalData}
    />
  );
};

export default Dashboard;
