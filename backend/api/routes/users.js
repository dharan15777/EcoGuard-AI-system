const express = require('express');
const router = express.Router();
const User = require('../../models/User');

const users = [
  new User({ id: 'USR-1001', name: 'Dr. Elena Rostova', email: 'elena.rostova@ecoguard.ai', role: 'ADMIN', department: 'Chief Environmental Scientist' }),
  new User({ id: 'USR-1002', name: 'Marcus Thorne', email: 'marcus.t@ecoguard.ai', role: 'OPERATOR', department: 'Disaster Response Command' }),
  new User({ id: 'USR-1003', name: 'Sarah Chen', email: 'sarah.c@ecoguard.ai', role: 'FIELD_TECH', department: 'Edge IoT Hardware Team' })
];

// GET /api/v1/users - List system users
router.get('/', (req, res) => {
  res.json({ status: 'success', count: users.length, data: users });
});

// GET /api/v1/users/me - Current user profile
router.get('/me', (req, res) => {
  res.json({ status: 'success', data: users[0] });
});

module.exports = router;
