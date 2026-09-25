import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState({
    id: 'USR-1001',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@ecoguard.ai',
    role: 'ADMIN',
    department: 'Chief Environmental Scientist'
  });

  useEffect(() => {
    authService.getCurrentUser().then(u => {
      if (u) setUser(u);
    });
  }, []);

  return { user };
};
