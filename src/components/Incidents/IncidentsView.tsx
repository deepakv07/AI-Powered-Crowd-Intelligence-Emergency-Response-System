import React, { useState } from 'react';
import {
  AlertOctagon,
  Plus,
  Filter,
  Download,
  Search,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Ambulance,
  MessageSquare,
  FileText,
  RotateCcw,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportIncidentsToCSV } from '../../services/storageService';
import { Incident, IncidentCategory, IncidentPriority, IncidentStatus } from '../../types';

export const IncidentsView: React.FC = () => {
  const {
    incidents,
    zones,
    responseUnits,
    createIncident,
    updateIncidentStatus,
    assignUnitToIncident,
    addIncidentNote,
    selectedIncidentId,
    setSelectedIncidentId,
    setActiveTab,
    currentRole
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Create Incident Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newType, setNewType] = useState<IncidentCategory>('Crowd Congestion');
  const [newZoneId, setNewZoneId] = useState<string>(zones[0]?.id || 'zone-sangam-ghat');
  const [newPriority, setNewPriority] = useState<IncidentPriority>('High');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newAssignedUnitId, setNewAssignedUnitId] = useState<string>('');

  // Selected Detail Modal State
  const activeIncident = incidents.find(i => i.id === selectedIncidentId);
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Filtered Incidents
  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && inc.type !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchText = `${inc.id} ${inc.type} ${inc.description} ${inc.zoneName} ${inc.assignedUnitName || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    createIncident({
      type: newType,
      zoneId: newZoneId,
      priority: newPriority,
      description: newDescription,
      assignedUnitId: newAssignedUnitId || undefined
    });

    setIsCreateModalOpen(false);
    setNewDescription('');
    setNewAssignedUnitId('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIncident || !newNoteText.trim()) return;
    addIncidentNote(activeIncident.id, newNoteText);
    setNewNoteText('');
  };

  const getPriorityStyle = (priority: IncidentPriority) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const getStatusStyle = (status: IncidentStatus) => {
    switch (status) {
      case 'Resolved':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'Responding':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Team Dispatched':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Acknowledged':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  const categories: IncidentCategory[] = [
    'Crowd Congestion',
    'Potential Crowd Crush',
    'Medical Emergency',
    'Missing-Person Report',
    'Fire or Smoke',
    'Heat-Related Illness',
    'Blocked Evacuation Route',
    'Infrastructure / Safety'
  ];

  return (
    <div className="space-y-5">
      {/* View Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Emergency Incident Management
          </h1>
          <p className="text-xs text-slate-500">
            Log, dispatch, track, and resolve emergency occurrences across monitored Kumbh sectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportIncidentsToCSV(incidents)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Download Incident Records CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, sector, description or team..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Team Dispatched">Team Dispatched</option>
            <option value="Responding">Responding</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Sector / Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No incidents match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inc.id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getPriorityStyle(
                          inc.priority
                        )}`}
                      >
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inc.type}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                      {inc.zoneName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getStatusStyle(
                          inc.status
                        )}`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {inc.assignedUnitName ? (
                        <span className="font-medium text-blue-700 flex items-center gap-1">
                          <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate max-w-[140px]">{inc.assignedUnitName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {inc.reportedTime}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedIncidentId(inc.id);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Incident Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight">Log Emergency Incident</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as IncidentPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                  >
                    <option value="Critical">Critical (Immediate Hazard)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sector / Location</label>
                <select
                  value={newZoneId}
                  onChange={e => setNewZoneId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.sector}: {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe observation, visual landmarks, estimated count, and immediate hazards..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Response Team (Optional)
                </label>
                <select
                  value={newAssignedUnitId}
                  onChange={e => setNewAssignedUnitId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                >
                  <option value="">Leave Unassigned (Dispatch Later)</option>
                  {responseUnits.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.type}) — {u.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-xs"
                >
                  Log &amp; Broadcast Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Detail / Update Drawer */}
      {activeIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-base text-blue-400">
                  {activeIncident.id}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-bold text-sm">{activeIncident.type}</span>
              </div>
              <button
                onClick={() => setSelectedIncidentId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Description & Location */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <strong>{activeIncident.zoneName}</strong>
                  </span>
                  <span className="text-slate-400 font-mono">Reported: {activeIncident.reportedTime}</span>
                </div>
                <p className="text-slate-800 text-sm leading-relaxed">{activeIncident.description}</p>
              </div>

              {/* Status and Action Buttons */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] block">
                  Workflow Status Transition:
                </span>

                <div className="flex flex-wrap gap-2">
                  {(['Reported', 'Acknowledged', 'Team Dispatched', 'Responding', 'Resolved'] as IncidentStatus[]).map(
                    st => {
                      const isCurrent = activeIncident.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => updateIncidentStatus(activeIncident.id, st)}
                          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors border ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Assign Team Row */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] block">
                  Assigned Response Unit:
                </span>

                <div className="flex items-center gap-3">
                  <select
                    value={activeIncident.assignedUnitId || ''}
                    onChange={e => {
                      if (e.target.value) {
                        assignUnitToIncident(activeIncident.id, e.target.value);
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                  >
                    <option value="">No Unit Assigned</option>
                    {responseUnits.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.type}) — {u.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Incident Notes Log */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] block">
                  Operational Notes &amp; Updates:
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {activeIncident.notes.map((note, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                        <span className="font-semibold text-slate-700">{note.author}</span>
                        <span>{note.timestamp}</span>
                      </div>
                      <p className="text-slate-800">{note.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Add operational update or field SITREP note..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs"
                  >
                    Post Note
                  </button>
                </form>
              </div>

              {/* History Timeline */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] block">
                  Audit History:
                </span>
                <div className="space-y-1 text-[11px] text-slate-500 font-mono">
                  {activeIncident.history.map((h, i) => (
                    <div key={i} className="flex justify-between border-b border-slate-100 pb-1">
                      <span>• {h.action}</span>
                      <span>{h.timestamp} ({h.user})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedIncidentId(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
