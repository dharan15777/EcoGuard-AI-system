import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LandslideSensor, NearbyHillVillage, HillRoad } from '../types/landslide';
import { LANDSLIDE_RISK_COLORS, NEARBY_HILL_VILLAGES, HILL_ROADS } from '../utils/landslideConstants';
import { Mountain, Layers, ShieldAlert, Droplets, Move, Activity, Compass, Battery, Radio, Crosshair, X, Home, Navigation, AlertTriangle } from 'lucide-react';

interface LandslideMapProps {
  sensors: LandslideSensor[];
  selectedSensor?: LandslideSensor | null;
  onSelectSensor?: (sensor: LandslideSensor) => void;
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

// Create custom SVG DivIcon for each sensor based on risk tier
const createSensorIcon = (tier: LandslideSensor['riskTier'], isSelected: boolean) => {
  const meta = LANDSLIDE_RISK_COLORS[tier] || LANDSLIDE_RISK_COLORS.LOW;
  const isCritical = tier === 'CRITICAL';

  const html = `
    <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
      ${
        isCritical || isSelected
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
      <div style="
        position: absolute;
        bottom: -15px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid ${meta.color};
        color: ${meta.text};
        font-size: 9px;
        font-weight: 800;
        font-family: monospace;
        padding: 1px 4px;
        border-radius: 4px;
        white-space: nowrap;
      ">
        ${tier}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-landslide-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

// Village Icon
const createVillageIcon = (risk: string) => {
  const color = risk === 'CRITICAL' ? '#ef4444' : risk === 'HIGH' ? '#f97316' : '#10b981';
  const html = `
    <div style="
      width: 24px; height: 24px;
      border-radius: 6px;
      background: #0f172a;
      border: 2px solid ${color};
      box-shadow: 0 0 10px ${color};
      display: flex; align-items: center; justify-content: center;
      color: ${color};
      font-size: 11px;
    ">
      🏠
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-village-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
};

export const LandslideMap: React.FC<LandslideMapProps> = ({
  sensors,
  selectedSensor,
  onSelectSensor
}) => {
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [showSlopes, setShowSlopes] = useState<boolean>(true);
  const [showVillages, setShowVillages] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [inspectSensor, setInspectSensor] = useState<LandslideSensor | null>(null);

  // Center on Wayanad Western Ghats Escarpment (Kerala, India)
  const defaultCenter: [number, number] = [11.545, 76.165];
  const targetCenter: [number, number] | null = selectedSensor
    ? [selectedSensor.latitude, selectedSensor.longitude]
    : null;

  // High-Risk Slope polygon coordinates
  const criticalSlopePolygon: [number, number][] = [
    [11.542, 76.168],
    [11.536, 76.176],
    [11.532, 76.182],
    [11.546, 76.185],
    [11.548, 76.174]
  ];

  // SH-59 Hill Highway polyline
  const sh59RoadCoords: [number, number][] = [
    [11.558, 76.120],
    [11.554, 76.135],
    [11.548, 76.155],
    [11.542, 76.168],
    [11.538, 76.175],
    [11.549, 76.184]
  ];

  const handleMarkerClick = (s: LandslideSensor) => {
    setInspectSensor(s);
    if (onSelectSensor) onSelectSensor(s);
  };

  return (
    <div
      className="field-panel p-6 rounded-xl flex flex-col justify-between relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,15,26,0.98) 100%)',
        border: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
      }}
    >
      {/* Top Header & Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Mountain size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>WAYANAD ESCARPMENT (KERALA, INDIA) · TOPOGRAPHIC GEO-GRID</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Landslide Risk & Runout Hazard Map
            </h2>
          </div>
        </div>

        {/* Map Layers Toggles */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-slate-400 px-1 font-semibold flex items-center gap-1">
            <Layers size={13} /> Layers:
          </span>

          <button
            onClick={() => setShowSensors(v => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              showSensors ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sensors ({sensors.length})
          </button>

          <button
            onClick={() => setShowSlopes(v => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              showSlopes ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hazard Slopes
          </button>

          <button
            onClick={() => setShowVillages(v => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              showVillages ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Villages
          </button>

          <button
            onClick={() => setShowRoads(v => !v)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              showRoads ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Hill Roads
          </button>
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className="w-full h-[460px] rounded-xl overflow-hidden border border-white/10 relative shadow-inner">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          {/* Dark high-contrast basemap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={18}
          />

          <MapController targetCoords={targetCenter} />

          {/* High-Risk Slope Failure Polygon */}
          {showSlopes && (
            <>
              <Polygon
                positions={criticalSlopePolygon}
                pathOptions={{
                  color: '#ef4444',
                  fillColor: '#ef4444',
                  fillOpacity: 0.28,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              >
                <Popup>
                  <div className="text-slate-900 p-1 text-xs">
                    <strong className="text-red-600 font-bold block">
                      ⚠️ CRITICAL SHEAR COLLAPSE ZONE #1
                    </strong>
                    <span>Chooralmala - Mundakkai Scarp Escarpment</span>
                    <div className="mt-1 text-[11px] text-slate-700">
                      Displacement: <strong>+22.4 mm</strong> · Moisture: <strong>88.5%</strong>
                    </div>
                  </div>
                </Popup>
              </Polygon>

              {/* Buffer Zone */}
              <Circle
                center={[11.5385, 76.1720]}
                radius={900}
                pathOptions={{
                  color: '#f97316',
                  fillColor: '#f97316',
                  fillOpacity: 0.12,
                  weight: 1.5
                }}
              />
            </>
          )}

          {/* Hill Roads (SH-59) */}
          {showRoads && (
            <Polyline
              positions={sh59RoadCoords}
              pathOptions={{
                color: '#ef4444',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 8'
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1 text-xs">
                  <strong className="text-red-600 font-bold block">
                    ⛔ SH-59 Hill Highway (CLOSED)
                  </strong>
                  <span>Meppadi – Chooralmala Route</span>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Landslide Debris Block Probability: <strong>92%</strong>
                  </div>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* Villages */}
          {showVillages &&
            NEARBY_HILL_VILLAGES.map(v => (
              <Marker
                key={v.id}
                position={[
                  v.id === 'VIL-WAY-01' ? 11.536 : v.id === 'VIL-WAY-02' ? 11.546 : v.id === 'VIL-WAY-03' ? 11.523 : 11.556,
                  v.id === 'VIL-WAY-01' ? 76.176 : v.id === 'VIL-WAY-02' ? 76.185 : v.id === 'VIL-WAY-03' ? 76.192 : 76.126
                ]}
                icon={createVillageIcon(v.riskLevel)}
              >
                <Popup>
                  <div className="text-slate-900 p-1 text-xs">
                    <strong className="block text-sm font-bold text-slate-900">{v.name}</strong>
                    <div>Population: <strong>{v.population.toLocaleString()}</strong></div>
                    <div>Distance to Scarp: <strong>{v.distanceKm} km</strong></div>
                    <div className="mt-1">
                      Status:{' '}
                      <span className="font-bold text-red-600 uppercase">
                        {v.evacuationStatus}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Sensor Stations */}
          {showSensors &&
            sensors.map(s => (
              <Marker
                key={s.id}
                position={[s.latitude, s.longitude]}
                icon={createSensorIcon(s.riskTier, selectedSensor?.id === s.id)}
                eventHandlers={{
                  click: () => handleMarkerClick(s)
                }}
              >
                <Popup>
                  <div className="text-slate-900 p-1 text-xs min-w-[210px]">
                    <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                      <strong className="text-slate-900 font-bold">{s.name}</strong>
                      <span className="text-[10px] font-mono text-slate-500">{s.id}</span>
                    </div>
                    <div className="space-y-0.5 text-[11px]">
                      <div>Soil Moisture: <strong>{s.soilMoisture}%</strong> ({s.soilSaturationLevel})</div>
                      <div>Rainfall Rate: <strong>{s.rainfallRate} mm/h</strong></div>
                      <div>Displacement: <strong className="text-red-600">+{s.groundDisplacement} mm</strong></div>
                      <div>Ground Vibration: <strong>{s.groundVibration} mm/s PPV</strong></div>
                      <div>Slope Tilt: <strong>{s.slopeTiltAngle}°</strong></div>
                      <div className="pt-1 mt-1 border-t text-[11px]">
                        Status: <strong className="uppercase text-red-600">{s.riskTier} RISK</strong>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Legend Box */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-white/10 p-2.5 rounded-lg text-[11px] text-slate-300 z-[1000] shadow-xl backdrop-blur-md flex flex-col gap-1">
          <div className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">
            Landslide Threat Zones
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />
            <span>Critical Failure Zone (Displacement &gt; 18mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Risk Slope (Moisture &gt; 75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Moderate Creep Scarp</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Safe Valley Floor Buffer</span>
          </div>
        </div>

        {/* Quick Location Reset */}
        <button
          onClick={() => {
            if (onSelectSensor && sensors[0]) onSelectSensor(sensors[0]);
          }}
          className="absolute top-3 right-3 bg-slate-950/90 hover:bg-slate-900 border border-white/15 p-2 rounded-lg text-slate-300 z-[1000] shadow-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Crosshair size={14} /> Center Wayanad Escarpment
        </button>
      </div>

      {/* Selected Sensor Quick Telemetry Tray */}
      {inspectSensor && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div>
              <span className="font-bold text-white">{inspectSensor.name}</span>
              <span className="text-slate-400 text-[11px] ml-2 font-mono">({inspectSensor.id}) · {inspectSensor.locationName}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <span>Moisture: <strong className="text-cyan-400">{inspectSensor.soilMoisture}%</strong></span>
            <span>Rain: <strong className="text-indigo-400">{inspectSensor.rainfallRate} mm/h</strong></span>
            <span>Displacement: <strong className="text-red-400">+{inspectSensor.groundDisplacement} mm</strong></span>
            <span>Vibration: <strong className="text-amber-400">{inspectSensor.groundVibration} mm/s</strong></span>
            <button
              onClick={() => setInspectSensor(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandslideMap;
