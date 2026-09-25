const { SYSTEM_ROLES } = require('../config/constants');

class User {
  constructor(data) {
    this.id = data.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role || SYSTEM_ROLES.OPERATOR;
    this.department = data.department || 'Disaster Response Command';
    this.phoneNumber = data.phoneNumber || '+1-555-0199';
    this.avatar = data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = User;
