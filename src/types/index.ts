export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type IncidentCategory =
  | 'Crowd Congestion'
  | 'Potential Crowd Crush'
  | 'Medical Emergency'
  | 'Missing-Person Report'
  | 'Fire or Smoke'
  | 'Heat-Related Illness'
  | 'Blocked Evacuation Route'
  | 'Infrastructure / Safety';

export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Reported'
  | 'Acknowledged'
  | 'Team Dispatched'
  | 'Responding'
  | 'Resolved';

export type ResponseUnitType =
  | 'Medical Team'
  | 'Ambulance'
  | 'Police / Security'
  | 'Fire & Rescue'
  | 'Crowd Management';

export type ResponseUnitStatus =
  | 'Available'
  | 'Dispatched'
  | 'Responding'
  | 'Busy'
  | 'Offline';

export type AlertSeverity = 'Informational' | 'Moderate' | 'High' | 'Critical';

export type AlertCategory =
  | 'Crowd Safety'
  | 'Medical'
  | 'Fire/Smoke'
  | 'Environmental'
  | 'Connectivity';

export type NodeConnectivityStatus = 'Online' | 'Weak link' | 'Offline' | 'Reconnected';

export type MessagePriority = 'Critical Emergency' | 'High Safety Alert' | 'Routine Status Update';

export type MessageStatus = 'Queued' | 'Transmitting' | 'Delivered' | 'Failed';

export type UserRole =
  | 'operator'
  | 'commander'
  | 'medical'
  | 'police'
  | 'field';

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  contribution: number;
  explanation: string;
  isOverride?: boolean;
  isOverrideTriggered?: boolean;
}

export interface MonitoringZone {
  id: string;
  name: string;
  sector: string;
  siteId: string;
  coordinates: [number, number];
  radiusMeters: number;
  capacityMax: number;
  currentCount: number;
  density: number; // people per sq meter
  safetyThreshold: number; // e.g. 3.0 people/m2
  growthRate: number; // % change per 5m interval
  movementSpeed: number; // m/s (normal 1.0 - 1.2 m/s)
  movementIrregularity: number; // 0 - 100% (counterflow / stop-and-go / turbulence)
  temperature: number; // Celsius
  humidity: number; // percentage
  smokeDetected: boolean;
  fireRiskLevel: 'Normal' | 'Warning' | 'Critical';
  evacuationRouteId: string;
  lastUpdated: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendedAction: string;
}

export interface IncidentNote {
  timestamp: string;
  author: string;
  text: string;
}

export interface IncidentHistoryItem {
  timestamp: string;
  action: string;
  user: string;
}

export interface Incident {
  id: string;
  type: IncidentCategory;
  zoneId: string;
  zoneName: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  coordinates: [number, number];
  reportedTime: string;
  description: string;
  assignedUnitId: string | null;
  assignedUnitName: string | null;
  reporterRole: string;
  notes: IncidentNote[];
  history: IncidentHistoryItem[];
  resolvedAt?: string;
}

export interface ResponseUnit {
  id: string;
  name: string;
  type: ResponseUnitType;
  status: ResponseUnitStatus;
  coordinates: [number, number];
  currentZone: string;
  assignedIncidentId: string | null;
  personnelCount: number;
  equipment: string[];
  lastUpdate: string;
  contactChannel: string;
}

export interface EmergencyAlert {
  id: string;
  timeGenerated: string;
  zoneId: string;
  zoneName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  reason: string;
  recommendedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  convertedIncidentId?: string;
}

export interface CommunicationNode {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  type: 'LoRa Gateway' | 'Cellular / Satellite Backhaul' | 'BLE Mesh Anchor';
  batteryPercent: number;
  signalStatus: 'Strong' | 'Fair' | 'Weak' | 'Disconnected';
  lastSeen: string;
  pendingMessages: number;
  connectivityStatus: NodeConnectivityStatus;
  totalDelivered: number;
  coordinates: [number, number];
}

export interface CommunicationMessage {
  id: string;
  nodeId: string;
  nodeName: string;
  priority: MessagePriority;
  payload: string;
  timestamp: string;
  status: MessageStatus;
  retryCount: number;
  deliveredAt?: string;
}

export interface FacilityMarker {
  id: string;
  name: string;
  type:
    | 'Medical Camp / Hospital'
    | 'Police Post'
    | 'Fire Station'
    | 'Entry Gate'
    | 'Exit Gate'
    | 'Emergency Assembly Point'
    | 'Lost & Found Center'
    | 'Sector Command Post';
  coordinates: [number, number];
  zone: string;
  contact: string;
  details: string;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  zone: string;
  status: 'Clear' | 'Congested' | 'Blocked' | 'Alternative Active';
  path: [number, number][];
  capacityPerHour: number;
  notes: string;
}

export interface GatheringSite {
  id: string;
  name: string;
  location: string;
  centerCoordinates: [number, number];
  zoom: number;
  description: string;
}

export interface SafetyThresholds {
  densityWarning: number; // e.g. 3.0 people/m2
  densityCritical: number; // e.g. 4.5 people/m2
  growthRateCritical: number; // e.g. 25% in 5 min
  temperatureWarning: number; // e.g. 38 C
  humidityWarning: number; // e.g. 75 %
  autoAlertEnabled: boolean;
  soundAlertsEnabled: boolean;
}
