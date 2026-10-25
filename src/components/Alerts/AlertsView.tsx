import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Volume2,
  VolumeX,
  PlusCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlertCategory, AlertSeverity, EmergencyAlert } from '../../types';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    zones,
    acknowledgeAlert,
    resolveAlert,
    convertAlertToIncident,
    thresholds,
    updateThresholds,
    setActiveTab,
    setSelectedIncidentId
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [ackFilter, setAckFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (zoneFilter !== 'all' && alert.zoneId !== zoneFilter) return false;
    if (ackFilter === 'unack' && alert.acknowledged) return false;
    if (ackFilter === 'ack' && !alert.acknowledged) return false;
    return true;
  });

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-50 border-rose-300 text-rose-950';
      case 'High':
        return 'bg-orange-50 border-orange-200 text-orange-950';
      case 'Moderate':
        return 'bg-amber-50 border-amber-200 text-amber-950';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-950';
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'text-rose-700 bg-rose-100 font-bold';
      case 'High':
        return 'text-orange-700 bg-orange-100 font-bold';
      case 'Moderate':
        return 'text-amber-700 bg-amber-100 font-semibold';
      default:
        return 'text-blue-700 bg-blue-100 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Alerts &amp; Notification Operations
          </h1>
          <p className="text-xs text-slate-500">
            Real-time threshold breaches, crowd surge alarms, and sensor warnings requiring operator acknowledgement.
          </p>
        </div>

        {/* Audio notification toggle & unack counter */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateThresholds({ soundAlertsEnabled: !thresholds.soundAlertsEnabled })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              thresholds.soundAlertsEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {thresholds.soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{thresholds.soundAlertsEnabled ? 'Alert Chime: ON' : 'Alert Chime: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={ackFilter}
            onChange={e => setAckFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Notification States</option>
            <option value="unack">Pending Acknowledgement Only</option>
            <option value="ack">Acknowledged Only</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Informational">Informational</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={e => setZoneFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none"
          >
            <option value="all">All Sectors</option>
            {zones.map(z => (
              <option key={z.id} value={z.id}>
                {z.sector}: {z.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 text-xs font-mono">
          Showing {filteredAlerts.length} of {alerts.length} notifications
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 italic text-xs">
            No emergency alerts matching current criteria.
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'Critical';
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-all shadow-xs ${getSeverityStyle(
                  alert.severity
                )} ${isCritical && !alert.acknowledged ? 'animate-critical-pulse ring-2 ring-red-400' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold">{alert.id}</span>
                      <span>·</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded uppercase font-mono ${getSeverityBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      <span>·</span>
                      <span className="text-xs font-semibold">{alert.category}</span>
                      <span>·</span>
                      <span className="text-xs font-medium text-slate-600">{alert.zoneName}</span>
                      <span>·</span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timeGenerated}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mt-1">{alert.reason}</h3>

                    <div className="bg-white/80 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-800">
                      <span className="font-bold text-[11px] uppercase text-slate-600 block mb-0.5">
                        Recommended Immediate Protocol:
                      </span>
                      <p>{alert.recommendedAction}</p>
                    </div>

                    {alert.acknowledged && (
                      <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Acknowledged by {alert.acknowledgedBy || 'Operator'} at {alert.acknowledgedAt || 'recently'}
                        </span>
                      </div>
                    )}

                    {alert.convertedIncidentId && (
                      <div className="text-[11px] text-blue-800 font-medium flex items-center gap-1.5 pt-0.5">
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          Linked to active Incident: <strong>{alert.convertedIncidentId}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                      >
                        Acknowledge Alert
                      </button>
                    )}

                    {!alert.convertedIncidentId && (
                      <button
                        onClick={() => convertAlertToIncident(alert.id)}
                        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                        title="Create an official incident record from this alert"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Convert to Incident</span>
                      </button>
                    )}

                    {alert.convertedIncidentId && (
                      <button
                        onClick={() => {
                          setSelectedIncidentId(alert.convertedIncidentId || null);
                          setActiveTab('incidents');
                        }}
                        className="text-xs text-blue-700 hover:underline font-semibold"
                      >
                        View Incident →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Simulated notification feed. In production deployment, automated alerts route to field SMS, VHF trunking radio, and TETRA dispatch networks.
        </span>
      </div>
    </div>
  );
};
