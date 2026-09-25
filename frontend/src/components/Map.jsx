import React, { useState } from 'react';
import { convertGeoToPixelPercent } from '../utils/mapHelpers';
import { Layers, ZoomIn, ZoomOut, Compass, Navigation } from 'lucide-react';

export const Map = ({ sensors = [], alerts = [], onSelectSensor }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [mapLayer, setMapLayer] = useState('hazard'); // hazard, satellite, topo

  const handlePinClick = (sensor) => {
    setSelectedNode(sensor);
    if (onSelectSensor) onSelectSensor(sensor);
  };

  return (
    <div className="map-container">
      {/* Map Control Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 20,
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-glass)',
          borderRadius: '10px',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          <Navigation size={14} color="#10b981" />
          <span>Interactive GIS Grid • San Francisco Bay & Sierra Foothills</span>
        </div>

        <button 
          onClick={() => setMapLayer(mapLayer === 'hazard' ? 'satellite' : 'hazard')}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-glass)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Layers size={14} /> Layer: {mapLayer.toUpperCase()}
        </button>
      </div>

      {/* Map Visual Simulation Canvas */}
      <div className="mock-map-canvas">
        {/* River & Mountain vector terrain contours */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.25, pointerEvents: 'none' }}>
          <path d="M 0,220 Q 250,180 400,280 T 800,240 T 1200,320" fill="none" stroke="#06b6d4" strokeWidth="6" strokeDasharray="4 2" />
          <path d="M 100,50 Q 300,120 600,80 T 1000,140" fill="none" stroke="#10b981" strokeWidth="2" />
          <polygon points="650,100 780,240 590,260" fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.3)" />
        </svg>

        {/* Hazard Zone Overlay */}
        <div style={{
          position: 'absolute',
          top: '38%',
          left: '32%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 70%, transparent 100%)',
          border: '1px dashed rgba(239, 68, 68, 0.5)',
          pointerEvents: 'none'
        }}>
          <span style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '0.65rem', color: '#f87171', fontWeight: 'bold' }}>
            WILDFIRE SPREAD RISK PERIMETER
          </span>
        </div>

        {/* Render Interactive Sensor Pins */}
        {sensors.map((sensor) => {
          const coords = convertGeoToPixelPercent(sensor.latitude, sensor.longitude);
          const isAlerting = sensor.status === 'ALERTING' || sensor.riskScore > 0.7;

          return (
            <div
              key={sensor.id}
              className="map-sensor-pin"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              onClick={() => handlePinClick(sensor)}
            >
              <div className={`pin-dot ${isAlerting ? 'pulse-alert' : ''}`} />
              <div className="pin-label">
                {sensor.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Overlay Card if clicked */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '280px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glass-active)',
          borderRadius: '12px',
          padding: '16px',
          zIndex: 30,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{selectedNode.name}</h4>
            <button 
              onClick={() => setSelectedNode(null)}
              style={{ background: 'transparent', color: '#94a3b8', fontSize: '1rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {selectedNode.id} • Lat: {selectedNode.latitude.toFixed(4)}, Lng: {selectedNode.longitude.toFixed(4)}
          </p>
          <div style={{ marginTop: '10px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <strong style={{ color: selectedNode.status === 'ONLINE' ? '#34d399' : '#f43f5e' }}>{selectedNode.status}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Battery Reserve:</span>
              <strong>{selectedNode.batteryLevel || 95}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Edge AI Model:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{selectedNode.edgeAiModel || 'flood_v1.tflite'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
