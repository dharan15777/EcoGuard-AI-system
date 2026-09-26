import React, { useState } from 'react';
import { convertGeoToPixelPercent } from '../utils/mapHelpers';
import { Layers, Compass, X } from 'lucide-react';

const TYPE_COLORS = {
  'FLOOD_WATER_LEVEL':       '#4a8fa8',
  'WILDFIRE_THERMAL':        '#c84040',
  'AIR_QUALITY_AQI':         '#9a7ec8',
  'LANDSLIDE_SOIL_MOISTURE': '#c47e35',
  'METEOROLOGICAL':          '#5a8a4a',
};

export const Map = ({ sensors = [], alerts = [], onSelectSensor }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [layer, setLayer] = useState('topo');

  const handlePinClick = (sensor) => {
    setSelectedNode(sensor.id === selectedNode?.id ? null : sensor);
    if (onSelectSensor) onSelectSensor(sensor);
  };

  return (
    <div className="map-container">

      {/* Control Bar */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 20,
        display: 'flex', gap: '8px'
      }}>
        {/* Zone label */}
        <div style={{
          background: 'rgba(12,17,11,0.9)',
          border: '1px solid var(--border-raw)',
          borderRadius: '5px',
          padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: '7px',
          fontSize: '0.68rem', fontWeight: '600',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          letterSpacing: '0.06em',
          backdropFilter: 'blur(6px)',
        }}>
          <Compass size={13} color="var(--moss-light)" />
          BAY-DELTA · SF FOOTHILLS
        </div>

        {/* Layer toggle */}
        <button
          onClick={() => setLayer(l => l === 'topo' ? 'satellite' : 'topo')}
          style={{
            background: 'rgba(12,17,11,0.9)',
            border: '1px solid var(--border-raw)',
            color: 'var(--text-secondary)',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex', alignItems: 'center', gap: '5px',
            backdropFilter: 'blur(6px)',
            letterSpacing: '0.06em',
          }}
        >
          <Layers size={12} /> {layer.toUpperCase()}
        </button>
      </div>

      {/* Map Canvas */}
      <div className="mock-map-canvas" style={{
        background: layer === 'topo'
          ? 'linear-gradient(160deg, #161e14 0%, #1a2518 40%, #131b11 100%)'
          : 'linear-gradient(160deg, #0e1510 0%, #1c251a 40%, #111810 100%)',
      }}>

        {/* Topographic SVG terrain */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}>
          {/* Elevation contours */}
          {[0.15, 0.28, 0.42, 0.56, 0.7, 0.84].map((r, i) => (
            <ellipse key={i} cx="65%" cy="45%" rx={`${r * 55}%`} ry={`${r * 38}%`}
              stroke="#82b460" strokeWidth="0.8" fill="none" />
          ))}
          {/* River channel */}
          <path d="M 0,65% Q 25%,55% 42%,68% T 75%,62% T 100%,72%"
            fill="none" stroke="#4a8fa8" strokeWidth="3" strokeDasharray="6 3" opacity="0.6" />
          {/* Mountain ridge */}
          <path d="M 55%,20% L 65%,40% L 75%,22% L 85%,45%"
            fill="none" stroke="#8a9e8a" strokeWidth="1.5" opacity="0.5" />
        </svg>

        {/* Fire zone overlay */}
        {alerts.some(a => a.hazardType === 'WILDFIRE') && (
          <div style={{
            position: 'absolute', top: '34%', left: '38%',
            width: '160px', height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(200,64,64,0.18) 0%, transparent 70%)',
            border: '1px dashed rgba(200,64,64,0.45)',
            pointerEvents: 'none',
          }}>
            <span style={{
              position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '0.55rem', color: 'rgba(200,100,80,0.9)', fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap', letterSpacing: '0.08em', fontWeight: '700'
            }}>
              FIRE PERIMETER
            </span>
          </div>
        )}

        {/* Sensor Pins */}
        {sensors.map(sensor => {
          const coords    = convertGeoToPixelPercent(sensor.latitude, sensor.longitude);
          const isAlert   = sensor.status === 'ALERTING' || (sensor.riskScore ?? 0) > 0.7;
          const isSelected = selectedNode?.id === sensor.id;
          const pinColor  = isAlert ? 'var(--crimson)' : TYPE_COLORS[sensor.type] || 'var(--moss-light)';

          return (
            <div
              key={sensor.id}
              className="map-sensor-pin"
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              onClick={() => handlePinClick(sensor)}
            >
              {/* Outer ring (alert pulse) */}
              {isAlert && (
                <div style={{
                  position: 'absolute', inset: '-6px',
                  borderRadius: '50%',
                  border: `1.5px solid ${pinColor}`,
                  animation: 'pulse-dot 1s ease-in-out infinite',
                  opacity: 0.5,
                }} />
              )}
              {/* Pin dot */}
              <div style={{
                width: isSelected ? '14px' : '10px',
                height: isSelected ? '14px' : '10px',
                borderRadius: '50%',
                background: pinColor,
                border: `2px solid ${isSelected ? '#fff' : 'rgba(0,0,0,0.5)'}`,
                boxShadow: `0 0 ${isAlert ? 10 : 6}px ${pinColor}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                zIndex: 2,
                position: 'relative',
              }} />
              {/* Label */}
              <div className="pin-label" style={{
                background: 'rgba(10,14,10,0.9)',
                border: `1px solid ${pinColor}44`,
                color: 'var(--text-secondary)',
                fontSize: '0.6rem',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: '3px',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>
                {sensor.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Card */}
      {selectedNode && (
        <div style={{
          position: 'absolute', bottom: '14px', right: '14px',
          width: '260px',
          background: 'rgba(14,18,13,0.97)',
          border: '1px solid var(--border-active)',
          borderRadius: '7px',
          padding: '14px',
          zIndex: 30,
          boxShadow: 'var(--shadow-glow-moss)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {selectedNode.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.05em' }}>
                {selectedNode.id}
              </div>
            </div>
            <button onClick={() => setSelectedNode(null)} style={{ color: 'var(--text-muted)', padding: '2px' }}>
              <X size={14} />
            </button>
          </div>
          {[
            { label: 'STATUS',   value: selectedNode.status, color: selectedNode.status === 'ONLINE' ? 'var(--moss-light)' : 'var(--crimson)' },
            { label: 'BATTERY',  value: `${selectedNode.batteryLevel || 95}%`, color: 'var(--text-primary)' },
            { label: 'COORDS',   value: `${selectedNode.latitude?.toFixed(4)}, ${selectedNode.longitude?.toFixed(4)}`, color: 'var(--river-light)' },
            { label: 'FIRMWARE', value: selectedNode.firmwareVersion || 'v2.4.1', color: 'var(--text-secondary)' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border-raw)' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.07em' }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', color: row.color, fontWeight: '600' }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
