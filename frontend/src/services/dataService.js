import { apiClient } from './apiClient';

export const dataService = {
  async getDashboardSummary() {
    const res = await apiClient.get('/dashboard/summary');
    return res?.data || null;
  },

  async fetchSensors() {
    const res = await apiClient.get('/sensors');
    return res?.data || [];
  },

  async fetchAlerts() {
    const res = await apiClient.get('/alerts');
    return res?.data || [];
  },

  async acknowledgeAlert(alertId) {
    return await apiClient.patch(`/alerts/${alertId}/acknowledge`, { userName: 'Dr. Elena Rostova' });
  }
};
