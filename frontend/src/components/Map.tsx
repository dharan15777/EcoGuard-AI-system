import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FireSensor } from '../types/fire';
import { FIRE_RISK_COLORS, NEARBY_VILLAGES, RESPONSE_BASES } from '../utils/fireConstants';
import { Compass, Layers, ShieldAlert, Flame, Wind, Droplets, Thermometer, Battery, Radio, Crosshair, X, Home, Shield, AlertTriangle } from 'lucide-react';

interface MapProps {
  sensors: FireSensor[];
  selectedSensor?: FireSensor | null;
  onSelectSensor?: (sensor: FireSensor) => void;
}

// Controller to smoothly pan/zoom map when sensor is selected
const MapController: React.FC<{ targetCoords?: [number, number] | null }> = ({ targetCoords }) => {
  const map = useMap();
  React.useEffect(() => {
    if (targetCoords) {
      map.setView(targetCoords, 12, { animate: true });
    }
  }, [targetCoords, map]);
  return null;
};

// Create custom SVG DivIcon for each fire sensor risk color
const createFireSensorIcon = (tier: FireSensor['riskTier'], isSelected: boolean) => {
  const meta = FIRE_RISK_COLORS[tier] || FIRE_RISK_COLORS.LOW;
  const isExtreme = tier === 'EXTREME';
  const isHigh = tier === 'HIGH';

  const html = `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
      ${
        isExtreme || isSelected
          ? `<div style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              border: 2.5px solid ${meta.color};
              animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
              opacity: 0.8;
            "></div>`
          : ''
      }
      <div style="
        width: ${isSelected ? '28px' : '22px'};
        height: ${isSelected ? '28px' : '22px'};
        border-radius: 50%;
        background: ${meta.color};
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 16px ${meta.color};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      ">
        <div style="width: 7px; height: 7px; border-radius: 50%; background: #ffffff;"></div>
      </div>
      ${
        isExtreme
          ? `<div style="
              position: absolute;
              top: -6px;
              right: -4px;
              font-size: 14px;
              filter: drop-shadow(0 0 4px #ef4444);
            ">🔥</div>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    className: 'custom-fire-marker',
    html,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

// Custom Icon for Nearby Villages
const createVillageIcon = (risk: string) => {
  const color = risk === 'EXTREME' ? '#ef4444' : risk === 'HIGH' ? '#f97316' : '#f59e0b';
  const html = `
    <div style="
      background: #0f172a;
      border: 1.5px solid ${color};
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 3px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      white-space: nowrap;
    ">
      <span>🏘️</span>
      <span style="color: ${color}">Village</span>
    </div>
  `;
  return L.divIcon({
    className: 'custom-village-marker',
    html,
    iconSize: [60, 22],
    iconAnchor: [30, 11]
  });
};

// Custom Icon for Emergency Response Bases
const createResponseBaseIcon = () => {
  const html = `
    <div style="
      background: #064e3b;
      border: 1.5px solid #10b981;
      color: #a7f3d0;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 3px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      white-space: nowrap;
    ">
      <span>🛡️</span>
      <span>Base</span>
    </div>
  `;
  return L.divIcon({
    className: 'custom-base-marker',
    html,
    iconSize: [50, 22],
    iconAnchor: [25, 11]
  });
};

export const Map: React.FC<MapProps> = ({
  sensors = [],
  selectedSensor: propSelected,
  onSelectSensor
}) => {
  const [internalSelected, setInternalSelected] = useState<FireSensor | null>(null);
  const [mapLayer, setMapLayer] = useState<'topo' | 'satellite' | 'osm'>('satellite');
  const [showSpreadZones, setShowSpreadZones] = useState<boolean>(true);
  const [showVillages, setShowVillages] = useState<boolean>(true);

  const selectedSensor = propSelected || internalSelected;

  const handleMarkerClick = (sensor: FireSensor) => {
    setInternalSelected(sensor);
    if (onSelectSensor) onSelectSensor(sensor);
  };

  // Center on Bandipur - Nilgiri Western Ghats Forest Reserve in India
  const defaultCenter: [number, number] = [11.6620, 76.6340];

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
        attribution: '&copy; Esri &mdash; World Topographic Map'
      };
    }
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    };
  };

  const tileConfig = getTileConfig();

  // Active fire zones (sensors with EXTREME or HIGH risk)
  const activeFireSensors = sensors.filter(s => s.riskTier === 'EXTREME');
  const highRiskSensors = sensors.filter(s => s.riskTier === 'HIGH');

  return (
    <div
      className="field-panel p-6 rounded-xl flex flex-col justify-between"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(249,115,22,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-950/70 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Flame size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Compass size={13} /> SECTION 6 · GEOSPATIAL WILDFIRE SPREAD NETWORK
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Fire Spread Prediction & Tactical Risk Map
            </h2>
          </div>
        </div>

        {/* Layer Switchers & Overlays Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Base Layer Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-400 px-2 font-semibold flex items-center gap-1">
              <Layers size={12} /> Base:
            </span>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                mapLayer === 'satellite' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapLayer('topo')}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                mapLayer === 'topo' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Topography
            </button>
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                mapLayer === 'osm' ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Street
            </button>
          </div>

          {/* Spread Zones Toggle */}
          <button
            onClick={() => setShowSpreadZones(v => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showSpreadZones
                ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-white/10'
            }`}
          >
            <Flame size={13} />
            {showSpreadZones ? 'Fire Spread Zones ON' : 'Spread Zones OFF'}
          </button>

          {/* Villages & Bases Toggle */}
          <button
            onClick={() => setShowVillages(v => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showVillages
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-white/10'
            }`}
          >
            <Home size={13} />
            {showVillages ? 'Villages & Bases ON' : 'Villages OFF'}
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
        <MapContainer
          center={defaultCenter}
          zoom={11}
          scrollWheelZoom={true}
          className="w-full h-full"
          style={{ background: '#0b1120' }}
        >
          <MapController
            targetCoords={selectedSensor ? [selectedSensor.latitude, selectedSensor.longitude] : null}
          />

          <TileLayer
            key={tileConfig.url}
            url={tileConfig.url}
            attribution={tileConfig.attribution}
            maxZoom={18}
          />

          {/* Active Fire Perimeters (Red Pulsing Circles) */}
          {showSpreadZones &&
            activeFireSensors.map(sensor => (
              <React.Fragment key={`spread-${sensor.id}`}>
                {/* Active Fire Flamefront Core */}
                <Circle
                  center={[sensor.latitude, sensor.longitude]}
                  radius={1200}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.35,
                    weight: 2.5
                  }}
                />
                {/* 6-Hour Predicted Downwind Spread Zone (Elliptical vector towards SE) */}
                <Circle
                  center={[sensor.latitude - 0.018, sensor.longitude + 0.015]}
                  radius={2800}
                  pathOptions={{
                    color: '#f97316',
                    fillColor: '#f97316',
                    fillOpacity: 0.18,
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                />
                {/* Wind Vector Direction Indicator Line */}
                <Polyline
                  positions={[
                    [sensor.latitude, sensor.longitude],
                    [sensor.latitude - 0.035, sensor.longitude + 0.03]
                  ]}
                  pathOptions={{
                    color: '#fbbf24',
                    weight: 3,
                    dashArray: '8, 8'
                  }}
                />
              </React.Fragment>
            ))}

          {/* High-Risk Warning Zones (Orange Circles) */}
          {showSpreadZones &&
            highRiskSensors.map(sensor => (
              <Circle
                key={`high-${sensor.id}`}
                center={[sensor.latitude, sensor.longitude]}
                radius={1600}
                pathOptions={{
                  color: '#f97316',
                  fillColor: '#f97316',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '5, 5'
                }}
              />
            ))}

          {/* Forest Fire Sensor Markers */}
          {sensors.map(sensor => {
            const isSelected = selectedSensor?.id === sensor.id;
            const meta = FIRE_RISK_COLORS[sensor.riskTier] || FIRE_RISK_COLORS.LOW;

            return (
              <Marker
                key={sensor.id}
                position={[sensor.latitude, sensor.longitude]}
                icon={createFireSensorIcon(sensor.riskTier, isSelected)}
                eventHandlers={{
                  click: () => handleMarkerClick(sensor)
                }}
              >
                <Popup className="custom-fire-popup" closeButton={false}>
                  <div className="p-3 bg-slate-950 text-white rounded-lg min-w-[240px] text-xs font-sans">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                      <span className="font-mono font-bold text-orange-400">{sensor.id}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ background: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}
                      >
                        {sensor.riskTier}
                      </span>
                    </div>

                    <div className="font-bold text-slate-100 text-sm mb-1">{sensor.name}</div>
                    <div className="text-slate-400 text-[11px] mb-2">{sensor.locationName}</div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-2 rounded border border-white/5 font-mono mb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Temperature:</span>
                        <strong className="text-orange-300 text-sm">{sensor.temperature.toFixed(1)}°C</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Humidity:</span>
                        <strong className="text-cyan-300 text-sm">{sensor.humidity}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Smoke Level:</span>
                        <strong className="text-amber-300 text-sm">{sensor.smokePPM} ppm</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Wind Velocity:</span>
                        <strong className="text-white text-sm">{sensor.windSpeed} km/h</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                      <span>Status: <strong className="text-emerald-400">{sensor.status}</strong></span>
                      <span>Battery: <strong className="text-white">{sensor.batteryLevel.toFixed(0)}%</strong></span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Nearby Villages Markers */}
          {showVillages &&
            NEARBY_VILLAGES.map(village => (
              <Marker
                key={village.id}
                position={[
                  village.id === 'VIL-01' ? 11.58 : village.id === 'VIL-02' ? 11.55 : village.id === 'VIL-03' ? 11.59 : 11.81,
                  village.id === 'VIL-01' ? 76.73 : village.id === 'VIL-02' ? 76.64 : village.id === 'VIL-03' ? 76.57 : 76.69
                ]}
                icon={createVillageIcon(village.riskLevel)}
              >
                <Popup className="custom-fire-popup" closeButton={false}>
                  <div className="p-3 bg-slate-950 text-white rounded-lg min-w-[220px] text-xs">
                    <div className="font-bold text-sm text-amber-300 mb-1">🏘️ {village.name}</div>
                    <div className="text-slate-300 text-xs mb-2">Population: <strong>{village.population.toLocaleString()}</strong></div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
                      <span>Distance: <strong>{village.distanceKm} km {village.bearing}</strong></span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{village.riskLevel} RISK</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Emergency Response Bases Markers */}
          {showVillages &&
            RESPONSE_BASES.map(base => (
              <Marker
                key={base.id}
                position={[base.latitude, base.longitude]}
                icon={createResponseBaseIcon()}
              >
                <Popup className="custom-fire-popup" closeButton={false}>
                  <div className="p-3 bg-slate-950 text-white rounded-lg min-w-[220px] text-xs">
                    <div className="font-bold text-sm text-emerald-300 mb-1">🛡️ {base.name}</div>
                    <div className="text-slate-300 text-xs mb-1">Personnel on Duty: <strong>{base.personnelOnDuty} Rangers</strong></div>
                    <div className="text-emerald-400 font-bold text-[11px]">Readiness Status: {base.status}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Selected Sensor Floating Overlay Card */}
        {selectedSensor && (
          <div className="absolute top-4 left-4 z-[1000] w-80 bg-slate-950/95 border border-orange-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-mono">
                  {selectedSensor.id} · CANOPY TELEMETRY
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">
                  {selectedSensor.name}
                </h4>
              </div>
              <button
                onClick={() => setInternalSelected(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
              <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                <span className="text-[10px] text-slate-400 block">Temperature:</span>
                <span className="text-orange-300 font-bold text-base">{selectedSensor.temperature.toFixed(1)}°C</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                <span className="text-[10px] text-slate-400 block">Relative Humidity:</span>
                <span className="text-cyan-300 font-bold text-base">{selectedSensor.humidity}%</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                <span className="text-[10px] text-slate-400 block">Smoke Particulate:</span>
                <span className="text-amber-300 font-bold text-base">{selectedSensor.smokePPM} ppm</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-white/5">
                <span className="text-[10px] text-slate-400 block">Wind Velocity:</span>
                <span className="text-white font-bold text-base">{selectedSensor.windSpeed} km/h</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Risk Assessment:</span>
              <span
                className="px-2.5 py-0.5 rounded font-bold text-[11px] uppercase tracking-wide"
                style={{
                  background: FIRE_RISK_COLORS[selectedSensor.riskTier].bg,
                  color: FIRE_RISK_COLORS[selectedSensor.riskTier].text,
                  border: `1px solid ${FIRE_RISK_COLORS[selectedSensor.riskTier].border}`
                }}
              >
                {selectedSensor.riskTier} (Score: {selectedSensor.riskScore}/100)
              </span>
            </div>
          </div>
        )}

        {/* Legend Overlay at Bottom Right */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-950/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
            Fire Spread Color Coding
          </div>
          <div className="flex flex-col gap-1.5 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
              <span className="text-slate-300">Green = Safe (Low Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
              <span className="text-slate-300">Yellow = Moderate Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm" />
              <span className="text-slate-300">Orange = High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse" />
              <span className="text-red-400 font-bold">Red = Active Fire Zone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
