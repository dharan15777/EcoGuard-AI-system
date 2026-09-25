class Location {
  constructor(data) {
    this.id = data.id || `LOC-${Math.floor(100 + Math.random() * 900)}`;
    this.name = data.name;
    this.region = data.region || 'North Basin Sector';
    this.centerLat = data.centerLat;
    this.centerLng = data.centerLng;
    this.radiusKm = data.radiusKm || 15.0;
    this.activeSensorsCount = data.activeSensorsCount || 0;
    this.riskLevel = data.riskLevel || 'LOW';
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Location;
