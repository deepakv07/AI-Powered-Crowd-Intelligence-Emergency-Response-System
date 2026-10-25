import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Filter,
  Maximize2,
  Compass,
  AlertTriangle,
  Ambulance,
  Shield,
  Flame,
  DoorOpen,
  MapPin,
  X,
  Navigation,
  ArrowRight,
  Radio,
  Thermometer,
  Droplets,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDistanceMeters } from '../../services/storageService';
import { MonitoringZone, Incident, FacilityMarker, EvacuationRoute, ResponseUnit } from '../../types';

export const GISMapView: React.FC = () => {
  const {
    zones,
    incidents,
    responseUnits,
    facilities,
    evacuationRoutes,
    activeSite,
    allSites,
    setActiveSiteId,
    selectedZoneId,
    setSelectedZoneId,
    selectedIncidentId,
    setSelectedIncidentId,
    setActiveTab,
    createIncident
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter toggles
  const [showCrowdZones, setShowCrowdZones] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showMedical, setShowMedical] = useState<boolean>(true);
  const [showPolice, setShowPolice] = useState<boolean>(true);
  const [showFire, setShowFire] = useState<boolean>(true);
  const [showGates, setShowGates] = useState<boolean>(true);
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState<boolean>(true);
  const [showResponseUnits, setShowResponseUnits] = useState<boolean>(true);
  const [isOfflineVectorMode, setIsOfflineVectorMode] = useState<boolean>(false);

  // Selected item detail drawer
  const [activeDetail, setActiveDetail] = useState<{
    type: 'zone' | 'incident' | 'facility' | 'unit';
    data: MonitoringZone | Incident | FacilityMarker | ResponseUnit;
  } | null>(null);

  // Synchronize activeDetail when selectedZoneId changes from other views
  useEffect(() => {
    if (selectedZoneId) {
      const z = zones.find(zone => zone.id === selectedZoneId);
      if (z) {
        setActiveDetail({ type: 'zone', data: z });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(z.coordinates, 15, { animate: true });
        }
      }
    }
  }, [selectedZoneId, zones]);

  useEffect(() => {
    if (selectedIncidentId) {
      const inc = incidents.find(i => i.id === selectedIncidentId);
      if (inc) {
        setActiveDetail({ type: 'incident', data: inc });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(inc.coordinates, 16, { animate: true });
        }
      }
    }
  }, [selectedIncidentId, incidents]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: activeSite.centerCoordinates,
      zoom: activeSite.zoom,
      zoomControl: false
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Tile Layer
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | KumbhRakshak Demo'
    });

    tileLayer.addTo(map);

    tileLayer.on('tileerror', () => {
      // Fallback notification if tile loading fails
      setIsOfflineVectorMode(true);
    });

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeSite]);

  // Center map when site changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(activeSite.centerCoordinates, activeSite.zoom);
    }
  }, [activeSite]);

  // Render Map Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Evacuation Routes (Polylines)
    if (showEvacuationRoutes) {
      evacuationRoutes.forEach(route => {
        const color = route.status === 'Clear' ? '#10b981' : route.status === 'Congested' ? '#f59e0b' : '#ef4444';
        const polyline = L.polyline(route.path, {
          color,
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.85
        });

        polyline.bindTooltip(
          `<strong>${route.name}</strong><br/>Status: ${route.status} (${route.capacityPerHour.toLocaleString()} p/hr)`,
          { sticky: true }
        );

        polyline.addTo(group);
      });
    }

    // 2. Crowd Density Risk Zones (Circles / Polygons)
    if (showCrowdZones) {
      zones.forEach(zone => {
        const getZoneColor = (level: string) => {
          switch (level) {
            case 'Critical':
              return '#dc2626';
            case 'High':
              return '#ea580c';
            case 'Moderate':
              return '#ca8a04';
            default:
              return '#16a34a';
          }
        };

        const isSelected = selectedZoneId === zone.id;
        const color = getZoneColor(zone.riskLevel);

        const circle = L.circle(zone.coordinates, {
          radius: zone.radiusMeters,
          color,
          fillColor: color,
          fillOpacity: isSelected ? 0.45 : 0.25,
          weight: isSelected ? 3 : 2
        });

        circle.on('click', () => {
          setSelectedZoneId(zone.id);
          setActiveDetail({ type: 'zone', data: zone });
        });

        circle.bindTooltip(
          `<div style="font-family: inherit; padding: 2px;">
            <strong style="color: ${color};">${zone.sector}: ${zone.name}</strong><br/>
            <span>Risk Score: <strong>${zone.riskScore}/100</strong> (${zone.riskLevel})</span><br/>
            <span>Density: <strong>${zone.density.toFixed(1)}</strong> p/m² | Count: ${zone.currentCount.toLocaleString()}</span>
          </div>`,
          { sticky: true }
        );

        circle.addTo(group);
      });
    }

    // 3. Facilities (Medical, Police, Fire, Gates, Assembly)
    facilities.forEach(fac => {
      let isVisible = false;
      let markerColor = '#2563eb';
      let iconSvg = '📍';

      if (fac.type.includes('Medical') && showMedical) {
        isVisible = true;
        markerColor = '#dc2626';
        iconSvg = '+';
      } else if (fac.type.includes('Police') && showPolice) {
        isVisible = true;
        markerColor = '#1d4ed8';
        iconSvg = '★';
      } else if (fac.type.includes('Fire') && showFire) {
        isVisible = true;
        markerColor = '#d97706';
        iconSvg = '▲';
      } else if ((fac.type.includes('Gate') || fac.type.includes('Assembly') || fac.type.includes('Lost')) && showGates) {
        isVisible = true;
        markerColor = '#475569';
        iconSvg = '■';
      }

      if (isVisible) {
        const customIcon = L.divIcon({
          className: 'custom-facility-pin',
          html: `<div style="
            background-color: ${markerColor};
            color: #ffffff;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
          ">${iconSvg}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker(fac.coordinates, { icon: customIcon });
        marker.on('click', () => {
          setActiveDetail({ type: 'facility', data: fac });
        });
        marker.bindTooltip(`<strong>${fac.name}</strong><br/>${fac.type} (${fac.zone})`);
        marker.addTo(group);
      }
    });

    // 4. Response Units
    if (showResponseUnits) {
      responseUnits.forEach(unit => {
        const isAvail = unit.status === 'Available';
        const unitIcon = L.divIcon({
          className: 'custom-unit-pin',
          html: `<div style="
            background-color: ${isAvail ? '#059669' : '#d97706'};
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            font-family: monospace;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.25);
            border: 1px solid #ffffff;
            cursor: pointer;
          ">${unit.id.replace('UNIT-', '')}</div>`,
          iconSize: [40, 18],
          iconAnchor: [20, 9]
        });

        const marker = L.marker(unit.coordinates, { icon: unitIcon });
        marker.on('click', () => {
          setActiveDetail({ type: 'unit', data: unit });
        });
        marker.bindTooltip(`<strong>${unit.name}</strong><br/>Status: ${unit.status} (${unit.currentZone})`);
        marker.addTo(group);
      });
    }

    // 5. Active Incidents (Pulsing Warning Marker)
    if (showIncidents) {
      incidents
        .filter(inc => inc.status !== 'Resolved')
        .forEach(inc => {
          const isCritical = inc.priority === 'Critical';
          const incidentIcon = L.divIcon({
            className: 'custom-incident-pin',
            html: `<div style="
              background-color: ${isCritical ? '#dc2626' : '#ea580c'};
              color: #ffffff;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              box-shadow: 0 0 12px ${isCritical ? 'rgba(220, 38, 38, 0.8)' : 'rgba(234, 88, 12, 0.6)'};
              border: 2px solid #ffffff;
              cursor: pointer;
              animation: ${isCritical ? 'critical-pulse 1.5s infinite' : 'none'};
            ">!</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          const marker = L.marker(inc.coordinates, { icon: incidentIcon });
          marker.on('click', () => {
            setSelectedIncidentId(inc.id);
            setActiveDetail({ type: 'incident', data: inc });
          });
          marker.bindTooltip(
            `<strong>[${inc.priority.toUpperCase()}] ${inc.type}</strong><br/>${inc.description}`
          );
          marker.addTo(group);
        });
    }
  }, [
    zones,
    incidents,
    responseUnits,
    facilities,
    evacuationRoutes,
    showCrowdZones,
    showIncidents,
    showMedical,
    showPolice,
    showFire,
    showGates,
    showEvacuationRoutes,
    showResponseUnits,
    selectedZoneId
  ]);

  // Fit All Zones
  const handleFitAllZones = () => {
    if (!mapInstanceRef.current || zones.length === 0) return;
    const bounds = L.latLngBounds(zones.map(z => z.coordinates));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  // Find nearest available response unit to current active zone/incident
  const getNearestUnits = (targetCoords: [number, number]) => {
    return responseUnits
      .map(unit => ({
        unit,
        distanceMeters: calculateDistanceMeters(targetCoords, unit.coordinates)
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col shadow-xs">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Site Switcher Pill */}
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-lg px-3 py-1.5 flex items-center gap-2 pointer-events-auto">
          <Compass className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-semibold uppercase leading-tight">
              Demonstration Site
            </span>
            <select
              value={activeSite.id}
              onChange={e => setActiveSiteId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {allSites.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layer Filter Toggles */}
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-auto overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          <button
            onClick={() => setShowCrowdZones(p => !p)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showCrowdZones ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Crowd Zones
          </button>

          <button
            onClick={() => setShowIncidents(p => !p)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showIncidents ? 'bg-red-100 text-red-900 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Incidents
          </button>

          <button
            onClick={() => setShowMedical(p => !p)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showMedical ? 'bg-rose-100 text-rose-900 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Medical
          </button>

          <button
            onClick={() => setShowPolice(p => !p)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showPolice ? 'bg-blue-100 text-blue-900 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Police
          </button>

          <button
            onClick={() => setShowEvacuationRoutes(p => !p)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showEvacuationRoutes ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Evacuation Routes
          </button>

          <button
            onClick={() => setShowResponseUnits(p => !p)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              showResponseUnits ? 'bg-slate-800 text-white font-semibold' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Units
          </button>

          <button
            onClick={handleFitAllZones}
            className="p-1 rounded text-slate-600 hover:bg-slate-100 border-l border-slate-200 ml-1"
            title="Fit All Monitoring Zones"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Leaflet Map Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Offline Vector Grid Fallback (Active if OSM tiles are unreachable or toggled) */}
      {isOfflineVectorMode && (
        <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col p-6 text-white overflow-y-auto">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold">Tactical GIS Vector Fallback Mode</h3>
                <p className="text-xs text-slate-400">
                  OpenStreetMap tiles offline/sandboxed. Displaying local vector coordinates and sector grid.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOfflineVectorMode(false)}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-slate-300"
            >
              Retry Tiles
            </button>
          </div>

          {/* SVG Tactical Representation */}
          <div className="flex-1 bg-slate-950 rounded-lg p-4 border border-slate-800 relative min-h-[350px]">
            <svg className="w-full h-full" viewBox="0 0 800 500">
              {/* Rivers */}
              <path
                d="M 50,120 Q 250,180 400,240 T 750,380"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="32"
                strokeOpacity="0.4"
              />
              <path
                d="M 50,380 Q 250,320 400,240 T 750,220"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="28"
                strokeOpacity="0.4"
              />
              <text x="360" y="225" fill="#60a5fa" fontSize="12" fontWeight="bold">
                Triveni Sangam Confluence
              </text>

              {/* Zones */}
              {zones.map((zone, idx) => {
                const x = 120 + (idx % 4) * 160;
                const y = 80 + Math.floor(idx / 4) * 180;
                const color =
                  zone.riskLevel === 'Critical'
                    ? '#ef4444'
                    : zone.riskLevel === 'High'
                    ? '#f97316'
                    : zone.riskLevel === 'Moderate'
                    ? '#eab308'
                    : '#10b981';

                return (
                  <g
                    key={zone.id}
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setActiveDetail({ type: 'zone', data: zone });
                    }}
                    className="cursor-pointer"
                  >
                    <circle cx={x} cy={y} r="45" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="2" />
                    <text x={x} y={y - 8} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      {zone.sector}
                    </text>
                    <text x={x} y={y + 8} fill="#cbd5e1" fontSize="9" textAnchor="middle">
                      {zone.density.toFixed(1)} p/m²
                    </text>
                    <text x={x} y={y + 22} fill={color} fontSize="9" fontWeight="bold" textAnchor="middle">
                      Score: {zone.riskScore}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Map Legend Overlay in Bottom Left */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 shadow-md rounded-lg p-2.5 text-[11px] space-y-1.5 hidden md:block max-w-xs">
        <span className="font-bold text-slate-900 block border-b border-slate-100 pb-1">
          Crowd Risk Legend (Simulated)
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-slate-700">0–24: Low Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-700">25–49: Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
            <span className="text-slate-700">50–74: High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
            <span className="text-slate-700">75–100: Critical</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
          Click any zone or marker to view telemetry &amp; nearest units.
        </div>
      </div>

      {/* Slide-in Detail Drawer on Right */}
      {activeDetail && (
        <div className="absolute top-3 right-3 bottom-3 z-20 w-80 md:w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 p-4 flex flex-col overflow-y-auto animate-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {activeDetail.type}
              </span>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {'name' in activeDetail.data ? activeDetail.data.name : (activeDetail.data as Incident).type}
              </h3>
            </div>
            <button
              onClick={() => setActiveDetail(null)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Zone Specific Detail */}
          {activeDetail.type === 'zone' && (() => {
            const z = activeDetail.data as MonitoringZone;
            const nearestUnits = getNearestUnits(z.coordinates);
            const activeZoneIncidents = incidents.filter(i => i.zoneId === z.id && i.status !== 'Resolved');

            return (
              <div className="py-3 space-y-4 text-xs">
                {/* Score & Density Strip */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Risk Score
                    </span>
                    <div className="font-mono text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{z.riskScore}/100</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-sans uppercase font-bold ${
                          z.riskLevel === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : z.riskLevel === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : z.riskLevel === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {z.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Crowd Density
                    </span>
                    <div className="font-mono text-lg font-bold text-slate-900">
                      {z.density.toFixed(1)}{' '}
                      <span className="text-[11px] font-normal text-slate-500">p/m²</span>
                    </div>
                  </div>
                </div>

                {/* Key Observations */}
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Estimated People:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {z.currentCount.toLocaleString()} / {z.capacityMax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Flow Velocity:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {z.movementSpeed.toFixed(2)} m/s ({z.movementIrregularity}% turbulence)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Microclimate:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {z.temperature.toFixed(1)}°C · {z.humidity.toFixed(0)}% RH
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Smoke / Flame Sensor:</span>
                    <span
                      className={`font-semibold ${
                        z.smokeDetected ? 'text-rose-600 font-bold' : 'text-emerald-700'
                      }`}
                    >
                      {z.smokeDetected ? 'DETECTED / ALERT' : 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Recommended Mitigation Action */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-blue-950">
                  <span className="font-bold text-[11px] uppercase tracking-wide block text-blue-800 mb-1">
                    AI Recommended Protocol:
                  </span>
                  <p className="text-xs leading-relaxed">{z.recommendedAction}</p>
                </div>

                {/* Active Incidents in Zone */}
                <div>
                  <span className="font-bold text-slate-800 text-xs block mb-1">
                    Active Incidents in this Sector ({activeZoneIncidents.length}):
                  </span>
                  {activeZoneIncidents.length === 0 ? (
                    <span className="text-slate-400 italic">No active incidents</span>
                  ) : (
                    <div className="space-y-1.5">
                      {activeZoneIncidents.map(inc => (
                        <div
                          key={inc.id}
                          onClick={() => {
                            setSelectedIncidentId(inc.id);
                            setActiveTab('incidents');
                          }}
                          className="p-2 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{inc.type}</span>
                            <div className="text-[11px] text-slate-500 font-mono">{inc.id}</div>
                          </div>
                          <span className="text-[10px] font-bold text-red-600 px-1.5 py-0.5 bg-red-50 rounded border border-red-200">
                            {inc.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nearest Available Response Units (Calculated Proximity) */}
                <div>
                  <span className="font-bold text-slate-800 text-xs block mb-1">
                    Nearest Units (Estimated Proximity):
                  </span>
                  <div className="space-y-1.5">
                    {nearestUnits.map(({ unit, distanceMeters }) => (
                      <div
                        key={unit.id}
                        className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{unit.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {unit.type} · {distanceMeters < 1000 ? `${distanceMeters}m away` : `${(distanceMeters / 1000).toFixed(1)}km away`}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            unit.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {unit.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action: Log Incident at this Zone */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      createIncident({
                        type: 'Crowd Congestion',
                        zoneId: z.id,
                        priority: z.riskScore >= 75 ? 'Critical' : z.riskScore >= 50 ? 'High' : 'Medium',
                        description: `Operator triggered safety dispatch at ${z.name}`
                      });
                      setActiveTab('incidents');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-xs"
                  >
                    Log Incident at {z.sector}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Incident Specific Detail */}
          {activeDetail.type === 'incident' && (() => {
            const inc = activeDetail.data as Incident;
            return (
              <div className="py-3 space-y-4 text-xs">
                <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-red-950">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-red-700">{inc.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 uppercase">
                      {inc.priority} Priority
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-red-900 mt-1">{inc.type}</h4>
                  <p className="text-xs text-red-800 mt-1">{inc.description}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-semibold text-slate-800">{inc.zoneName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-semibold text-blue-700">{inc.status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Assigned Team:</span>
                    <span className="font-semibold text-slate-800">
                      {inc.assignedUnitName || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Reported Time:</span>
                    <span className="font-mono text-slate-800">{inc.reportedTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedIncidentId(inc.id);
                    setActiveTab('incidents');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-xs"
                >
                  Open Incident Resolution Console
                </button>
              </div>
            );
          })()}

          {/* Facility Specific Detail */}
          {activeDetail.type === 'facility' && (() => {
            const fac = activeDetail.data as FacilityMarker;
            return (
              <div className="py-3 space-y-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Facility Type</span>
                  <div className="font-bold text-slate-900 text-sm">{fac.type}</div>
                  <div className="text-slate-600 mt-1">{fac.details}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Sector:</span>
                    <span className="font-semibold text-slate-800">{fac.zone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Radio Channel:</span>
                    <span className="font-mono font-semibold text-slate-800">{fac.contact}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Response Unit Specific Detail */}
          {activeDetail.type === 'unit' && (() => {
            const u = activeDetail.data as ResponseUnit;
            return (
              <div className="py-3 space-y-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-slate-900">{u.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                        u.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-1">{u.name}</div>
                  <div className="text-slate-500">{u.type} · {u.personnelCount} Personnel</div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Current Zone:</span>
                    <span className="font-semibold text-slate-800">{u.currentZone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Comm Channel:</span>
                    <span className="font-mono font-semibold text-slate-800">{u.contactChannel}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-slate-500 block mb-1">Equipment on Board:</span>
                    <div className="flex flex-wrap gap-1">
                      {u.equipment.map((eq, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('medical')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs transition-colors shadow-xs"
                >
                  Manage Unit in Response Fleet
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
