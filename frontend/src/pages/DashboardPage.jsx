import React from 'react';
import { Dashboard } from '../components/Dashboard';

export const DashboardPage = ({ sensors, alerts, onAcknowledgeAlert, historicalData }) => {
  return (
    <div>
      <Dashboard 
        sensors={sensors} 
        alerts={alerts} 
        onAcknowledgeAlert={onAcknowledgeAlert}
        historicalData={historicalData}
      />
    </div>
  );
};
