import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const INITIAL_ALERTS = [
  {
    id: 'ALT-109283',
    sensorId: 'SN-FIR-01',
    sensorName: 'Sierra Thermal Optics Node 04',
    hazardType: 'WILDFIRE',
    severity: 'CRITICAL',
    title: 'Thermal Anomaly Detected - High Wildfire Risk',
    description: 'IR Sensor registered rapid temperature rise to 84°C accompanied by heavy CO2 spike.',
    locationName: 'Sierra Foothill Reserve',
    triggeredAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'ALT-109284',
    sensorId: 'SN-FLD-01',
    sensorName: 'Pine River Hydro Node Alpha',
    hazardType: 'FLOOD',
    severity: 'HIGH',
    title: 'Water Level Exceeded Flood Stage Threshold',
    description: 'River stage height reached 4.8m (Warning threshold: 4.2m). Upstream discharge increasing.',
    locationName: 'Pine River Valley',
    triggeredAt: new Date(Date.now() - 1200000).toISOString(),
    status: 'ACTIVE'
  }
];

export const useAlerts = () => {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const acknowledgeAlert = async (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a));
    await dataService.acknowledgeAlert(id);
  };

  return { alerts, acknowledgeAlert };
};
