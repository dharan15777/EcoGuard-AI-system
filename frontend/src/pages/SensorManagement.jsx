import React, { useState } from 'react';
import { Cpu, Plus, X, MapPin } from 'lucide-react';
import { SensorCard } from '../components/SensorCard';

const FILTER_TABS = [
  { key: 'ALL',                    label: 'All Nodes' },
  { key: 'FLOOD_WATER_LEVEL',      label: 'Hydrology' },
  { key: 'WILDFIRE_THERMAL',       label: 'Thermal' },
  { key: 'AIR_QUALITY_AQI',        label: 'Air Quality' },
  { key: 'LANDSLIDE_SOIL_MOISTURE',label: 'Geotechnical' },
  { key: 'METEOROLOGICAL',         label: 'Weather' },
];

const INPUT_STYLE = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '5px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-raw)',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const LABEL_STYLE = {
  fontSize: '0.65rem',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '6px',
};

export const SensorManagement = ({ sensors = [] }) => {
  const [filterType, setFilterType]   = useState('ALL');
  const [showModal, setShowModal]     = useState(false);
  const [newSensor, setNewSensor]     = useState({
    name: '', type: 'FLOOD_WATER_LEVEL', latitude: 37.77, longitude: -122.42
  });

  const filtered = filterType === 'ALL'
    ? sensors
    : sensors.filter(s => s.type === filterType);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div className="overline" style={{ marginBottom: '4px' }}>Field Network</div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Node Management
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Configure, calibrate, and monitor field hardware. {sensors.length} nodes registered.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'rgba(90,138,74,0.15)',
            border: '1px solid rgba(90,138,74,0.4)',
            color: 'var(--moss-light)',
            padding: '9px 16px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={15} /> Register Node
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: '600',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              background: filterType === tab.key ? 'rgba(90,138,74,0.18)' : 'rgba(255,255,255,0.04)',
              color: filterType === tab.key ? 'var(--moss-light)' : 'var(--text-secondary)',
              border: filterType === tab.key ? '1px solid rgba(90,138,74,0.4)' : '1px solid var(--border-raw)',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
            {tab.key !== 'ALL' && (
              <span style={{ marginLeft: '5px', opacity: 0.6, fontSize: '0.65rem' }}>
                ({sensors.filter(s => s.type === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="field-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Cpu size={24} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            NO NODES MATCH THIS FILTER
          </div>
        </div>
      ) : (
        <div className="sensor-grid">
          {filtered.map(s => <SensorCard key={s.id} sensor={s} />)}
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200
        }}>
          <div className="field-panel" style={{
            width: '460px',
            padding: '28px',
            background: 'rgba(16, 22, 15, 0.98)',
            border: '1px solid var(--border-active)',
            boxShadow: 'var(--shadow-glow-moss)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div>
                <div className="overline" style={{ marginBottom: '2px' }}>Node Registration</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>Provision Field Node</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={LABEL_STYLE}>Node Name</label>
                <input
                  type="text"
                  value={newSensor.name}
                  onChange={e => setNewSensor({ ...newSensor, name: e.target.value })}
                  placeholder="e.g. Bear Canyon River Stage Node"
                  style={INPUT_STYLE}
                />
              </div>

              <div>
                <label style={LABEL_STYLE}>Sensor Type</label>
                <select
                  value={newSensor.type}
                  onChange={e => setNewSensor({ ...newSensor, type: e.target.value })}
                  style={{ ...INPUT_STYLE, background: 'rgba(0,0,0,0.3)' }}
                >
                  <option value="FLOOD_WATER_LEVEL">Hydrological — Water Stage</option>
                  <option value="WILDFIRE_THERMAL">Thermal — Fire Detection</option>
                  <option value="AIR_QUALITY_AQI">Air Quality — Particulate</option>
                  <option value="LANDSLIDE_SOIL_MOISTURE">Geotechnical — Soil / Tilt</option>
                  <option value="METEOROLOGICAL">Meteorological — Weather</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={LABEL_STYLE}>Latitude</label>
                  <input
                    type="number" step="0.0001"
                    value={newSensor.latitude}
                    onChange={e => setNewSensor({ ...newSensor, latitude: parseFloat(e.target.value) })}
                    style={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Longitude</label>
                  <input
                    type="number" step="0.0001"
                    value={newSensor.longitude}
                    onChange={e => setNewSensor({ ...newSensor, longitude: parseFloat(e.target.value) })}
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 10px',
                background: 'rgba(74,143,168,0.08)',
                border: '1px solid rgba(74,143,168,0.2)',
                borderRadius: '5px',
                fontSize: '0.72rem', color: 'var(--river-light)',
                fontFamily: 'var(--font-mono)'
              }}>
                <MapPin size={12} /> Deployment coordinates will be verified against zone boundary.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 16px', borderRadius: '5px',
                  color: 'var(--text-muted)', fontSize: '0.82rem',
                  border: '1px solid var(--border-raw)', background: 'transparent',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 18px', borderRadius: '5px',
                  background: 'rgba(90,138,74,0.2)',
                  border: '1px solid rgba(90,138,74,0.5)',
                  color: 'var(--moss-light)',
                  fontWeight: '700', fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Provision Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
