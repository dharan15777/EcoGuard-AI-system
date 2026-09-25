// Authentication & Role Enforcement Middleware
const env = require('../config/environment');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // For development and demonstration, bypass if mock token or bearer token present
  if (!token && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized: Access token missing' });
  }

  req.user = {
    id: 'USR-1001',
    name: 'Dr. Elena Rostova',
    role: 'ADMIN',
    email: 'elena.rostova@ecoguard.ai'
  };

  next();
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
