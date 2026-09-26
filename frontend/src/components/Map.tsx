import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloodSensor } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { Compass, Layers, ShieldAlert, Waves, CloudRain, Battery, Radio, Crosshair, X } from 'lucide-react';

interface MapProps {
  sensors: FloodSensor[];
  selectedSensor?: FloodSensor | null;
  onSelectSensor?: (sensor: FloodSensor) => void;
}

// Helper component to smoothly pan/zoom map when sensor is selected
const MapController: React.FC<{ targetCoords?: [number, number] | null }> = ({ targetCoords }) => {
  const map = useMap();
  React.useEffect(() => {
    if (targetCoords) {
      map.setView(targetCoords, 13, { animate: true });
    }
  }, [targetCoords, map]);
  return null;
};

// Create custom SVG DivIcon for each sensor risk color
const createSensorIcon = (tier: FloodSensor['riskTier'], isSelected: boolean) => {
  const meta = RISK_COLORS[tier] || RISK_COLORS.SAFE;
  const isDanger = tier === 'DANGER';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      ${
        isDanger || isSelected
          ? `<div style="
              position: absolute;
              inset: -4px;
              border-radius: 50%;
              border: 2px solid ${meta.color};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              opacity: 0.75;
            "></div>`
          : ''
      }
      <div style="
        width: ${isSelected ? '24px' : '18px'};
        height: ${isSelected ? '24px' : '18px'};
        border-radius: 50%;
        background: ${meta.color};
        border: 2.5px solid #ffffff;
        box-shadow: ${meta.glow};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      ">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-flood-marker',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

export const Map: React.FC<MapProps> = ({
  sensors = [],
  selectedSensor: propSelected,
  onSelectSensor
}) => {
  const [internalSelected, setInternalSelected] = useState<FloodSensor | null>(null);
  const [mapLayer, setMapLayer] = useState<'dark' | 'topo'>('dark');
  const [showInundationZones, setShowInundationZones] = useState<boolean>(true);

  const selectedSensor = propSelected || internalSelected;

  const handleMarkerClick = (sensor: FloodSensor) => {
    setInternalSelected(sensor);
    if (onSelectSensor) onSelectSensor(sensor);
  };

  // Center of Pine River Basin / Bay Delta
  const defaultCenter: [number, number] = [37.7700, -122.4250];

  const tileUrl = mapLayer === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div
      className="field-panel relative overflow-hidden flex flex-col"
      style={{
        height: '480px',
        border: '1px solid rgba(74,143,168,0.3)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Top Map Toolbar Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-zinc-950/90 border border-white/15 px-3 py-1.5 rounded-md text-[11px] font-mono text-zinc-300 flex items-center gap-2 shadow-lg backdrop-blur-md">
          <Compass size={14} className="text-cyan-400" />
          <span className="font-bold text-white tracking-wider">BAY-DELTA · PINE RIVER BASIN</span>
        </div>

        {/* Layer toggle */}
        <button
          onClick={() => setMapLayer(l => l === 'dark' ? 'topo' : 'dark')}
          className="bg-zinc-950/90 hover:bg-zinc-900 border border-white/15 px-2.5 py-1.5 rounded-md text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors"
        >
          <Layers size={13} className="text-zinc-400" />
          {mapLayer === 'dark' ? 'DARK RADAR' : 'TERRAIN'}
        </button>

        {/* Inundation Zones toggle */}
        <button
          onClick={() => setShowInundationZones(z => !z)}
          className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md border transition-colors ${
            showInundationZones
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
              : 'bg-zinc-950/90 text-zinc-400 border-white/15'
          }`}
        >
          <Waves size={13} />
          INUNDATION BUFFER {showInundationZones ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Top Right Live Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] pointer-events-auto hidden md:block">
        <div className="bg-zinc-950/90 border border-white/15 p-2 rounded-md shadow-lg backdrop-blur-md flex flex-col gap-1.5 text-[10px] font-mono">
          <span className="text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Sensor Risk State:</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-200">Green = Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-zinc-200">Yellow = Watch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-zinc-200">Orange = Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-zinc-200">Red = Danger</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="w-full h-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#0e1210' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
          />

          <MapController
            targetCoords={selectedSensor ? [selectedSensor.latitude, selectedSensor.longitude] : null}
          />

          {/* Render Inundation Buffer Circles for High Risk Nodes */}
          {showInundationZones && sensors.map(sensor => {
            const isDanger = sensor.riskTier === 'DANGER';
            const isWarning = sensor.riskTier === 'WARNING';
            if (!isDanger && !isWarning) return null;

            return (
              <Circle
                key={`buffer-${sensor.id}`}
                center={[sensor.latitude, sensor.longitude]}
                radius={isDanger ? 1400 : 900}
                pathOptions={{
                  color: isDanger ? '#ef4444' : '#f97316',
                  fillColor: isDanger ? '#ef4444' : '#f97316',
                  fillOpacity: isDanger ? 0.18 : 0.12,
                  dashArray: '4, 6',
                  weight: 1.5,
                }}
              />
            );
          })}

          {/* Render All Sensor Markers */}
          {sensors.map((sensor) => {
            const isSelected = selectedSensor?.id === sensor.id;
            const icon = createSensorIcon(sensor.riskTier, isSelected);
            const riskMeta = RISK_COLORS[sensor.riskTier] || RISK_COLORS.SAFE;

            return (
              <Marker
                key={sensor.id}
                position={[sensor.latitude, sensor.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => handleMarkerClick(sensor),
                }}
              >
                {/* Interactive Leaflet Popup */}
                <Popup className="flood-sensor-popup">
                  <div className="p-1 font-sans text-xs text-zinc-100 min-w-[210px]">
                    <div className="flex items-center justify-between border-b border-zinc-700 pb-1 mb-2">
                      <span className="font-mono font-bold text-cyan-400">{sensor.id}</span>
                      <span
                        className="px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase"
                        style={{
                          background: riskMeta.bg,
                          color: riskMeta.text,
                          border: `1px solid ${riskMeta.border}`
                        }}
                      >
                        {sensor.riskTier}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white mb-2 leading-snug">
                      {sensor.name}
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded mb-2 font-mono text-[11px]">
                      <div>
                        <div className="text-zinc-400">Water Level</div>
                        <div className="font-bold text-cyan-300">{sensor.waterLevel.toFixed(2)}m</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Rainfall</div>
                        <div className="font-bold text-blue-300">{sensor.rainfallRate.toFixed(1)} mm/h</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Flood Limit</div>
                        <div className="font-bold text-red-400">{sensor.floodThreshold.toFixed(2)}m</div>
                      </div>
                      <div>
                        <div className="text-zinc-400">Risk Score</div>
                        <div className="font-bold text-orange-400">{sensor.riskScore}/100</div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 flex justify-between items-center pt-1 border-t border-zinc-800">
                      <span>Batt: {sensor.batteryLevel}%</span>
                      <span>Status: {sensor.status}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected Sensor Floating Info Drawer */}
      {selectedSensor && (
        <div className="absolute bottom-3 right-3 z-[1000] w-80 bg-zinc-950/95 border border-cyan-500/40 rounded-lg p-3.5 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
                Selected Field Node
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {selectedSensor.name}
              </h4>
              <span className="text-[11px] font-mono text-zinc-400">
                {selectedSensor.id} · {selectedSensor.basin}
              </span>
            </div>
            <button
              onClick={() => setInternalSelected(null)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2.5 font-mono text-xs">
            <div className="bg-black/40 p-2 rounded border border-white/5">
              <span className="text-[10px] text-zinc-400">STAGE HEIGHT</span>
              <div className="text-base font-bold text-cyan-300">
                {selectedSensor.waterLevel.toFixed(2)}m
              </div>
            </div>
            <div className="bg-black/40 p-2 rounded border border-white/5">
              <span className="text-[10px] text-zinc-400">RAINFALL RATE</span>
              <div className="text-base font-bold text-indigo-300">
                {selectedSensor.rainfallRate.toFixed(1)} mm/h
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1">
              <Battery size={13} className="text-emerald-400" /> {selectedSensor.batteryLevel}%
            </span>
            <span className="flex items-center gap-1">
              <Radio size={13} className="text-cyan-400" /> {selectedSensor.status}
            </span>
            <span className="text-zinc-500">
              {selectedSensor.latitude.toFixed(4)}, {selectedSensor.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
