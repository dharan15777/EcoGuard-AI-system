import React, { useState } from 'react';
import { Cpu, Plus, RefreshCw, Battery, Radio, ShieldCheck, MapPin } from 'lucide-react';
import { SensorCard } from '../components/SensorCard';

export const SensorManagement = ({ sensors = [] }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: '',
    type: 'FLOOD_WATER_LEVEL',
    latitude: 37.77,
    longitude: -122.42
  });

  const filtered = filterType === 'ALL' ? sensors : sensors.filter(s => s.type === filterType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Sensor Node Management</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Configure and calibrate edge hardware, flash firmware, and monitor RF RSSI
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Register Edge Node
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['ALL', 'FLOOD_WATER_LEVEL', 'WILDFIRE_THERMAL', 'AIR_QUALITY_AQI', 'LANDSLIDE_SOIL_MOISTURE'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '600',
              background: filterType === type ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
              color: filterType === type ? '#34d399' : 'var(--text-secondary)',
              border: filterType === type ? '1px solid #10b981' : '1px solid var(--border-glass)'
            }}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Sensor Cards List */}
      <div className="sensor-grid">
        {filtered.map(s => (
          <SensorCard key={s.id} sensor={s} />
        ))}
      </div>

      {/* Registration Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ width: '480px', padding: '28px', background: '#0f172a', border: '1px solid var(--border-glass-active)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Provision New Edge Node</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Node Name</label>
                <input 
                  type="text" 
                  value={newSensor.name} 
                  onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                  placeholder="e.g. Bear Canyon Flood Stage Sensor"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Sensor Type</label>
                <select 
                  value={newSensor.type}
                  onChange={(e) => setNewSensor({ ...newSensor, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#1e293b', border: '1px solid var(--border-glass)', color: '#fff' }}
                >
                  <option value="FLOOD_WATER_LEVEL">Flood Hydro Sensor</option>
                  <option value="WILDFIRE_THERMAL">Wildfire Thermal IR Sensor</option>
                  <option value="AIR_QUALITY_AQI">Air Quality Index Station</option>
                  <option value="LANDSLIDE_SOIL_MOISTURE">Landslide Soil Tilt Sensor</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Latitude</label>
                  <input 
                    type="number" 
                    value={newSensor.latitude} 
                    onChange={(e) => setNewSensor({ ...newSensor, latitude: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Longitude</label>
                  <input 
                    type="number" 
                    value={newSensor.longitude} 
                    onChange={(e) => setNewSensor({ ...newSensor, longitude: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', color: '#94a3b8' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: '700' }}
              >
                Save & Provision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
