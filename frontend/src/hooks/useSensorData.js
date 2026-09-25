import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { MOCK_SENSORS } from '../utils/constants';

export const useSensorData = () => {
  const [sensors, setSensors] = useState(MOCK_SENSORS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSensors = async () => {
      const data = await dataService.fetchSensors();
      if (isMounted && data && data.length > 0) {
        setSensors(data);
      }
      if (isMounted) setLoading(false);
    };

    loadSensors();
    const interval = setInterval(loadSensors, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { sensors, loading };
};
