import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloodSensor } from '../types/flood';
import { RISK_COLORS } from '../utils/floodConstants';
import { Compass, Layers, ShieldAlert, Waves, CloudRain, Battery, Radio, Crosshair, X, MapPin } from 'lucide-react';

interface MapProps {
  sensors: FloodSensor[];
  selectedSensor?: FloodSensor | null;
  onSelectSensor?: (sensor: FloodSensor) => void;
}

// Controller to smoothly pan/zoom map when sensor is selected
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
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      ${
        isDanger || isSelected
          ? `<div style="
              position: absolute;
              inset: -5px;
              border-radius: 50%;
              border: 2px solid ${meta.color};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              opacity: 0.75;
            "></div>`
          : ''
      }
      <div style="
        width: ${isSelected ? '26px' : '20px'};
        height: ${isSelected ? '26px' : '20px'};
        border-radius: 50%;
        background: ${meta.color};
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 14px ${meta.color};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      ">
        <div style="width: 7px; height: 7px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-flood-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

export const Map: React.FC<MapProps> = ({
  sensors = [],
  selectedSensor: propSelected,
  onSelectSensor
}) => {
  const [internalSelected, setInternalSelected] = useState<FloodSensor | null>(null);
  const [mapLayer, setMapLayer] = useState<'topo' | 'satellite' | 'osm'>('topo');
  const [showInundationZones, setShowInundationZones] = useState<boolean>(true);

  const selectedSensor = propSelected || internalSelected;

  const handleMarkerClick = (sensor: FloodSensor) => {
    setInternalSelected(sensor);
    if (onSelectSensor) onSelectSensor(sensor);
  };

  // Center on Brahmaputra River Basin, Assam, India
  const defaultCenter: [number, number] = [26.6500, 93.3000];

  // Tile layers with 100% free access and NO watermark/API key requirement
  const getTileConfig = () => {
    if (mapLayer === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &mdash; World Imagery'
      };
    }
    if (mapLayer === 'topo') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &mdash; Topographic Basemap'
      };
    }
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    };
  };

  const tileConfig = getTileConfig();

  return (
    <div
      className="field-panel relative overflow-hidden flex flex-col rounded-xl"
      style={{
        height: '520px',
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
      }}
    >
      {/* Top Map Toolbar Overlay */}
      <div className="absolute top-3.5 left-3.5 z-[1000] flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-slate-950/95 border border-white/15 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 shadow-xl backdrop-blur-md">
          <Compass size={15} className="text-cyan-400" />
          <span className="font-bold text-white tracking-wide">Brahmaputra River Basin · Assam, India</span>
          <span className="text-slate-400">·</span>
          <span className="text-cyan-300 font-semibold">{sensors.length} Active Hydro Nodes</span>
        </div>

        {/* Layer toggle buttons */}
        <div className="flex items-center bg-slate-950/95 p-0.5 rounded-lg border border-white/15 shadow-xl backdrop-blur-md text-xs">
          <button
            onClick={() => setMapLayer('topo')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              mapLayer === 'topo' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Topographic
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              mapLayer === 'satellite' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapLayer('osm')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              mapLayer === 'osm' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Streets
          </button>
        </div>

        {/* Inundation Buffer Toggle */}
        <button
          onClick={() => setShowInundationZones(z => !z)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xl backdrop-blur-md border transition-all ${
            showInundationZones
              ? 'bg-cyan-950/95 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-950/90 text-slate-400 border-white/15 hover:text-white'
          }`}
        >
          <Waves size={14} />
          Inundation Zones {showInundationZones ? 'Enabled' : 'Hidden'}
        </button>
      </div>

      {/* Top Right Live Risk Color Key */}
      <div className="absolute top-3.5 right-3.5 z-[1000] pointer-events-auto">
        <div className="bg-slate-950/95 border border-white/15 p-2.5 rounded-lg shadow-xl backdrop-blur-md flex flex-col gap-1.5 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider mb-0.5">
            Sensor Risk Classification
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-200 text-[11px] font-medium">Green = Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="text-slate-200 text-[11px] font-medium">Yellow = Watch</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
            <span className="text-slate-200 text-[11px] font-medium">Orange = Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />
            <span className="text-slate-200 text-[11px] font-medium">Red = Danger</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="w-full h-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={8}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', background: '#0a0e12' }}
        >
          <TileLayer
            attribution={tileConfig.attribution}
            url={tileConfig.url}
          />

          <MapController
            targetCoords={selectedSensor ? [selectedSensor.latitude, selectedSensor.longitude] : null}
          />

          {/* Inundation Buffer Circles for High Risk Nodes */}
          {showInundationZones && sensors.map(sensor => {
            const isDanger = sensor.riskTier === 'DANGER';
            const isWarning = sensor.riskTier === 'WARNING';
            if (!isDanger && !isWarning) return null;

            return (
              <Circle
                key={`buffer-${sensor.id}`}
                center={[sensor.latitude, sensor.longitude]}
                radius={isDanger ? 1600 : 1000}
                pathOptions={{
                  color: isDanger ? '#ef4444' : '#f97316',
                  fillColor: isDanger ? '#ef4444' : '#f97316',
                  fillOpacity: isDanger ? 0.22 : 0.14,
                  dashArray: '5, 8',
                  weight: 2,
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
                  <div className="p-1 font-sans text-xs text-slate-100 min-w-[230px]">
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 mb-2">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{sensor.id}</span>
                      <span
                        className="px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide"
                        style={{
                          background: riskMeta.bg,
                          color: riskMeta.text,
                          border: `1px solid ${riskMeta.border}`
                        }}
                      >
                        {sensor.riskTier}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white mb-2 leading-tight">
                      {sensor.name}
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-lg mb-2 text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">Water Level</div>
                        <div className="font-bold text-cyan-300 font-mono text-sm">{sensor.waterLevel.toFixed(2)}m</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Rainfall Rate</div>
                        <div className="font-bold text-indigo-300 font-mono text-sm">{sensor.rainfallRate.toFixed(1)} mm/h</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Danger Limit</div>
                        <div className="font-bold text-red-400 font-mono">{sensor.floodThreshold.toFixed(2)}m</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Risk Score</div>
                        <div className="font-bold text-orange-400 font-mono">{sensor.riskScore} / 100</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between items-center pt-1.5 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Battery size={13} className="text-emerald-400" /> {sensor.batteryLevel}%
                      </span>
                      <span className="font-medium text-emerald-400">● {sensor.status}</span>
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
        <div className="absolute bottom-4 right-4 z-[1000] w-84 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md pointer-events-auto">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                Selected Hydro Node
              </span>
              <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                {selectedSensor.name}
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {selectedSensor.id} · {selectedSensor.basin}
              </span>
            </div>
            <button
              onClick={() => setInternalSelected(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 my-3">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Stage Height</span>
              <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                {selectedSensor.waterLevel.toFixed(2)}m
              </div>
              <span className="text-[10px] text-slate-400">Limit: {selectedSensor.floodThreshold.toFixed(2)}m</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Rainfall Rate</span>
              <div className="text-lg font-bold text-indigo-300 font-mono mt-0.5">
                {selectedSensor.rainfallRate.toFixed(1)} <span className="text-xs">mm/h</span>
              </div>
              <span className="text-[10px] text-slate-400">Score: {selectedSensor.riskScore}/100</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-white/10">
            <span className="flex items-center gap-1 font-mono">
              <Battery size={14} className="text-emerald-400" /> {selectedSensor.batteryLevel}%
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
              ● {selectedSensor.status}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {selectedSensor.latitude.toFixed(4)}, {selectedSensor.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
