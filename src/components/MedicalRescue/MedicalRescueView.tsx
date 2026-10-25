import React, { useState } from 'react';
import {
  Ambulance,
  Shield,
  Flame,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Radio,
  Thermometer,
  Droplets,
  AlertTriangle,
  HeartPulse,
  Navigation,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDistanceMeters } from '../../services/storageService';
import { ResponseUnit, ResponseUnitStatus, ResponseUnitType } from '../../types';

export const MedicalRescueView: React.FC = () => {
  const {
    responseUnits,
    incidents,
    releaseUnit,
    assignUnitToIncident,
    createIncident,
    setActiveTab,
    setSelectedZoneId
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<string>(
    incidents.find(i => i.status !== 'Resolved')?.id || ''
  );

  // Manual Health Triage Log Modal
  const [isHealthLogOpen, setIsHealthLogOpen] = useState<boolean>(false);
  const [triageSector, setTriageSector] = useState<string>('zone-sangam-ghat');
  const [triageIssue, setTriageIssue] = useState<string>('Heat-Related Illness');
  const [triageDesc, setTriageDesc] = useState<string>('');

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');

  // Filter units
  const filteredUnits = responseUnits.filter(u => {
    if (categoryFilter !== 'all' && u.type !== categoryFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  const targetIncident = incidents.find(i => i.id === selectedIncidentForDispatch);

  // Calculate nearest available units to target incident
  const nearestUnitsToTarget = targetIncident
    ? responseUnits
        .filter(u => u.status === 'Available')
        .map(u => ({
          unit: u,
          distMeters: calculateDistanceMeters(targetIncident.coordinates, u.coordinates)
        }))
        .sort((a, b) => a.distMeters - b.distMeters)
    : [];

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageDesc.trim()) return;

    createIncident({
      type: triageIssue === 'Heat-Related Illness' ? 'Heat-Related Illness' : 'Medical Emergency',
      zoneId: triageSector,
      priority: 'High',
      description: `Manual Health Triage: ${triageDesc}`
    });

    setIsHealthLogOpen(false);
    setTriageDesc('');
  };

  const getStatusBadge = (status: ResponseUnitStatus) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Dispatched':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Responding':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Busy':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getTypeIcon = (type: ResponseUnitType) => {
    switch (type) {
      case 'Medical Team':
      case 'Ambulance':
        return <Ambulance className="w-4 h-4 text-rose-600" />;
      case 'Police / Security':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Fire & Rescue':
        return <Flame className="w-4 h-4 text-amber-600" />;
      default:
        return <Users className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Medical, Rescue &amp; Security Coordination
          </h1>
          <p className="text-xs text-slate-500">
            Real-time fleet staging, proximity dispatching, and field medical triage logging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsHealthLogOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Log Field Medical Triage</span>
          </button>
        </div>
      </div>

      {/* Proximity Dispatch Tool Panel */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>Nearest Available Unit Proximity Dispatch</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Estimated Euclidean/Haversine proximity calculation for demonstration purposes. Not a verified fastest traffic route.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Target Incident:</span>
            <select
              value={selectedIncidentForDispatch}
              onChange={e => setSelectedIncidentForDispatch(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none"
            >
              {activeIncidents.length === 0 ? (
                <option value="">No Active Incidents</option>
              ) : (
                activeIncidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    [{inc.priority}] {inc.id} — {inc.type} ({inc.zoneName})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {targetIncident ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {nearestUnitsToTarget.slice(0, 3).map(({ unit, distMeters }, idx) => (
              <div
                key={unit.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      #{idx + 1} Closest Unit
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {distMeters < 1000 ? `${distMeters}m away` : `${(distMeters / 1000).toFixed(1)}km away`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100">{unit.name}</h4>
                  <div className="text-[11px] text-slate-400">
                    {unit.type} · Staged at {unit.currentZone}
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-700 flex justify-end">
                  <button
                    onClick={() => assignUnitToIncident(targetIncident.id, unit.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded transition-colors"
                  >
                    Dispatch to {targetIncident.id}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic py-2">
            Select an active incident above to view the closest available response teams.
          </div>
        )}
      </div>

      {/* Fleet Filter Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Unit Type:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
          >
            <option value="all">All Fleet Types</option>
            <option value="Medical Team">Medical Team</option>
            <option value="Ambulance">Ambulance</option>
            <option value="Police / Security">Police / Security</option>
            <option value="Fire & Rescue">Fire &amp; Rescue</option>
            <option value="Crowd Management">Crowd Management</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Responding">Responding</option>
            <option value="Busy">Busy</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUnits.map(unit => (
          <div
            key={unit.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {getTypeIcon(unit.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 truncate">
                      {unit.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {unit.id} · {unit.type}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${getStatusBadge(
                    unit.status
                  )}`}
                >
                  {unit.status}
                </span>
              </div>

              <div className="text-xs space-y-1 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Station:</span>
                  <span className="font-semibold text-slate-800">{unit.currentZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Personnel:</span>
                  <span className="font-semibold text-slate-800">{unit.personnelCount} Officers / Medics</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Radio Channel:</span>
                  <span className="font-mono text-slate-800">{unit.contactChannel}</span>
                </div>
                {unit.assignedIncidentId && (
                  <div className="flex justify-between bg-blue-50 p-1.5 rounded border border-blue-100">
                    <span className="text-blue-700 font-semibold">Active Mission:</span>
                    <span className="font-mono font-bold text-blue-900">{unit.assignedIncidentId}</span>
                  </div>
                )}
              </div>

              {/* Equipment badges */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Equipment:
                </span>
                <div className="flex flex-wrap gap-1">
                  {unit.equipment.map((eq, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-50 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Release or Reassign */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedZoneId(unit.currentZone);
                  setActiveTab('map');
                }}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px]"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate</span>
              </button>

              {unit.status !== 'Available' ? (
                <button
                  onClick={() => releaseUnit(unit.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded text-xs transition-colors"
                >
                  Mark Available / Complete Task
                </button>
              ) : (
                <span className="text-[11px] text-emerald-700 font-medium">Ready for dispatch</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Health Triage Modal */}
      {isHealthLogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Log Field Health &amp; Triage Incident</h3>
              <button onClick={() => setIsHealthLogOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleTriageSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition / Category</label>
                <select
                  value={triageIssue}
                  onChange={e => setTriageIssue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="Heat-Related Illness">Heat-Related Illness / Dehydration</option>
                  <option value="Medical Emergency">Trauma / Crush Injury / Collapse</option>
                  <option value="Asthma / Smoke Inhalation">Respiratory / Smoke Inhalation</option>
                  <option value="Cardiac / Syncope">Cardiac / Syncope</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghat / Sector Location</label>
                <select
                  value={triageSector}
                  onChange={e => setTriageSector(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                >
                  <option value="zone-sangam-ghat">Sector 1: Sangam Main Ghat</option>
                  <option value="zone-shastri-bridge">Sector 3: Shastri Bridge Ramp</option>
                  <option value="zone-jhusi-camp">Sector 4: Jhusi Pilgrim Camp</option>
                  <option value="zone-arail-ghat">Sector 5: Arail Ghat</option>
                  <option value="zone-daraganj-corridor">Sector 6: Daraganj Corridor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Triage Observation &amp; Symptoms</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Patient vitals, observed symptoms, immediate first aid supplied..."
                  value={triageDesc}
                  onChange={e => setTriageDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHealthLogOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-1.5 rounded-lg"
                >
                  Log Triage Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
