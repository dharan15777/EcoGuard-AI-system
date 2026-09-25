import { apiClient } from './apiClient';

export const authService = {
  async getCurrentUser() {
    const res = await apiClient.get('/users/me');
    return res?.data || {
      id: 'USR-1001',
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@ecoguard.ai',
      role: 'ADMIN',
      department: 'Chief Environmental Scientist'
    };
  }
};
