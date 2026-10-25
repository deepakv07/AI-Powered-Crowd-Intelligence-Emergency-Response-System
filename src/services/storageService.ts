import {
  CommunicationMessage,
  CommunicationNode,
  EmergencyAlert,
  Incident,
  MonitoringZone,
  ResponseUnit,
  SafetyThresholds
} from '../types';
import {
  INITIAL_ALERTS,
  INITIAL_COMM_NODES,
  INITIAL_INCIDENTS,
  INITIAL_RESPONSE_UNITS,
  INITIAL_SAFETY_THRESHOLDS,
  INITIAL_ZONES
} from '../data/initialData';

const STORAGE_KEYS = {
  ZONES: 'kumbhrakshak_zones_v1',
  INCIDENTS: 'kumbhrakshak_incidents_v1',
  RESPONSE_UNITS: 'kumbhrakshak_units_v1',
  ALERTS: 'kumbhrakshak_alerts_v1',
  NODES: 'kumbhrakshak_nodes_v1',
  THRESHOLDS: 'kumbhrakshak_thresholds_v1',
  ACTIVE_SITE: 'kumbhrakshak_active_site_v1',
  ACTIVE_ROLE: 'kumbhrakshak_active_role_v1'
};

export const storageService = {
  loadZones(): MonitoringZone[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ZONES);
      return data ? JSON.parse(data) : INITIAL_ZONES;
    } catch {
      return INITIAL_ZONES;
    }
  },

  saveZones(zones: MonitoringZone[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    } catch (e) {
      console.warn('Failed to save zones to localStorage', e);
    }
  },

  loadIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return data ? JSON.parse(data) : INITIAL_INCIDENTS;
    } catch {
      return INITIAL_INCIDENTS;
    }
  },

  saveIncidents(incidents: Incident[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.warn('Failed to save incidents to localStorage', e);
    }
  },

  loadResponseUnits(): ResponseUnit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESPONSE_UNITS);
      return data ? JSON.parse(data) : INITIAL_RESPONSE_UNITS;
    } catch {
      return INITIAL_RESPONSE_UNITS;
    }
  },

  saveResponseUnits(units: ResponseUnit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RESPONSE_UNITS, JSON.stringify(units));
    } catch (e) {
      console.warn('Failed to save response units to localStorage', e);
    }
  },

  loadAlerts(): EmergencyAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  },

  saveAlerts(alerts: EmergencyAlert[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Failed to save alerts to localStorage', e);
    }
  },

  loadNodes(): CommunicationNode[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NODES);
      return data ? JSON.parse(data) : INITIAL_COMM_NODES;
    } catch {
      return INITIAL_COMM_NODES;
    }
  },

  saveNodes(nodes: CommunicationNode[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
    } catch (e) {
      console.warn('Failed to save nodes to localStorage', e);
    }
  },

  loadThresholds(): SafetyThresholds {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
      return data ? JSON.parse(data) : INITIAL_SAFETY_THRESHOLDS;
    } catch {
      return INITIAL_SAFETY_THRESHOLDS;
    }
  },

  saveThresholds(thresholds: SafetyThresholds): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
    } catch (e) {
      console.warn('Failed to save thresholds to localStorage', e);
    }
  },

  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed to clear localStorage', e);
    }
  }
};

/**
 * Calculates straight-line distance in meters between two lat/lng coordinates (Haversine formula).
 * Useful for estimated proximity of response units to incident locations.
 */
export function calculateDistanceMeters(
  coords1: [number, number],
  coords2: [number, number]
): number {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coords1[0] * Math.PI) / 180;
  const lat2 = (coords2[0] * Math.PI) / 180;
  const deltaLat = ((coords2[0] - coords1[0]) * Math.PI) / 180;
  const deltaLng = ((coords2[1] - coords1[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * CSV Exporters
 */
export function exportIncidentsToCSV(incidents: Incident[]): void {
  const headers = [
    'Incident ID',
    'Category',
    'Priority',
    'Status',
    'Zone',
    'Reported Time',
    'Description',
    'Assigned Unit',
    'Reporter Role',
    'Resolved Time'
  ];

  const rows = incidents.map(inc => [
    `"${inc.id}"`,
    `"${inc.type}"`,
    `"${inc.priority}"`,
    `"${inc.status}"`,
    `"${inc.zoneName}"`,
    `"${inc.reportedTime}"`,
    `"${(inc.description || '').replace(/"/g, '""')}"`,
    `"${inc.assignedUnitName || 'Unassigned'}"`,
    `"${inc.reporterRole || 'Control Room'}"`,
    `"${inc.resolvedAt || 'Active'}"`
  ]);

  const csvContent =
    '# KumbhRakshak Emergency Operations Incident Export (SIMULATED DATA)\n' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  downloadCSV(csvContent, `kumbhrakshak_incidents_${Date.now()}.csv`);
}

export function exportZoneAnalyticsToCSV(zones: MonitoringZone[]): void {
  const headers = [
    'Zone ID',
    'Zone Name',
    'Sector',
    'Risk Score',
    'Risk Level',
    'Density (people/m2)',
    'Max Safe Threshold',
    'Estimated Crowd Count',
    'Capacity Max',
    'Surge Growth Rate (%)',
    'Avg Movement Speed (m/s)',
    'Turbulence Irregularity (%)',
    'Temperature (C)',
    'Humidity (%)',
    'Smoke Sensor',
    'Recommended Action'
  ];

  const rows = zones.map(z => [
    `"${z.id}"`,
    `"${z.name}"`,
    `"${z.sector}"`,
    z.riskScore,
    `"${z.riskLevel}"`,
    z.density.toFixed(2),
    z.safetyThreshold.toFixed(2),
    z.currentCount,
    z.capacityMax,
    z.growthRate.toFixed(1),
    z.movementSpeed.toFixed(2),
    z.movementIrregularity,
    z.temperature.toFixed(1),
    z.humidity.toFixed(0),
    z.smokeDetected ? 'ALERT' : 'Normal',
    `"${(z.recommendedAction || '').replace(/"/g, '""')}"`
  ]);

  const csvContent =
    '# KumbhRakshak Zone Safety & Crowd Intelligence Export (SIMULATED DATA)\n' +
    [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  downloadCSV(csvContent, `kumbhrakshak_zone_intelligence_${Date.now()}.csv`);
}

export function exportFullOperationalReport(
  zones: MonitoringZone[],
  incidents: Incident[],
  alerts: EmergencyAlert[],
  nodes: CommunicationNode[]
): void {
  const totalCrowd = zones.reduce((sum, z) => sum + z.currentCount, 0);
  const highRiskZones = zones.filter(z => z.riskLevel === 'High' || z.riskLevel === 'Critical');
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const unackAlerts = alerts.filter(a => !a.acknowledged);

  const report = [
    '========================================================================',
    'KUMBHRAKSHAK COMMAND CENTRE — OPERATIONAL SITUATION REPORT',
    'STATUS: SIMULATED DEMONSTRATION DATA ONLY — NOT CONNECTED TO OFFICIAL SYSTEMS',
    `GENERATED AT: ${new Date().toISOString()}`,
    '========================================================================',
    '',
    '1. EXECUTIVE METRICS',
    `Total Monitored Crowd: ${totalCrowd.toLocaleString()} pilgrims`,
    `Monitored Sectors: ${zones.length}`,
    `Critical / High Risk Sectors: ${highRiskZones.length} (${highRiskZones.map(z => z.sector).join(', ') || 'None'})`,
    `Active Incidents: ${activeIncidents.length}`,
    `Unacknowledged Alerts: ${unackAlerts.length}`,
    `Resilient Mesh Nodes Online: ${nodes.filter(n => n.connectivityStatus === 'Online').length} / ${nodes.length}`,
    '',
    '2. ZONE RISK SUMMARY',
    ...zones.map(
      z => ` - [${z.sector}] ${z.name}: Risk Score ${z.riskScore}/100 (${z.riskLevel}) | Density ${z.density.toFixed(1)} p/m2 | Speed ${z.movementSpeed.toFixed(2)} m/s | Temp ${z.temperature.toFixed(1)}°C`
    ),
    '',
    '3. ACTIVE INCIDENTS',
    ...(activeIncidents.length > 0
      ? activeIncidents.map(
          i => ` - [${i.priority.toUpperCase()}] ${i.id} - ${i.type} at ${i.zoneName} (${i.status}) -> ${i.description}`
        )
      : [' - No active unresolved incidents']),
    '',
    '4. RECENT CRITICAL ALERTS',
    ...alerts.slice(0, 5).map(
      a => ` - [${a.severity}] ${a.id} (${a.zoneName}): ${a.reason} [Action: ${a.recommendedAction}]`
    )
  ].join('\n');

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kumbhrakshak_situation_report_${Date.now()}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Web Audio synthetic chime for critical alerts (accessible, zero external assets)
 */
export function playAlertTone(severity: 'Critical' | 'High' | 'Normal' = 'Normal'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'Critical' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(severity === 'Critical' ? 880 : 587.33, ctx.currentTime);
    if (severity === 'Critical') {
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
    }

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio context may be restricted by autoplay policy before user gesture
  }
}
