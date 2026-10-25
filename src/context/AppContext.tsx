import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  CommunicationMessage,
  CommunicationNode,
  EmergencyAlert,
  EvacuationRoute,
  FacilityMarker,
  GatheringSite,
  Incident,
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  MessagePriority,
  MonitoringZone,
  ResponseUnit,
  SafetyThresholds,
  UserRole
} from '../types';
import {
  GATHERING_SITES,
  INITIAL_ALERTS,
  INITIAL_COMM_NODES,
  INITIAL_EVACUATION_ROUTES,
  INITIAL_FACILITIES,
  INITIAL_INCIDENTS,
  INITIAL_RESPONSE_UNITS,
  INITIAL_SAFETY_THRESHOLDS,
  INITIAL_ZONES
} from '../data/initialData';
import { calculateZoneRisk } from '../services/riskEngine';
import { playAlertTone, storageService } from '../services/storageService';

export interface ToastInfo {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  // Navigation & View
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;

  // Domain State
  activeSite: GatheringSite;
  allSites: GatheringSite[];
  setActiveSiteId: (siteId: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  zones: MonitoringZone[];
  incidents: Incident[];
  responseUnits: ResponseUnit[];
  alerts: EmergencyAlert[];
  nodes: CommunicationNode[];
  messages: CommunicationMessage[];
  facilities: FacilityMarker[];
  evacuationRoutes: EvacuationRoute[];
  thresholds: SafetyThresholds;

  // Simulation Controls
  isSimulationRunning: boolean;
  setIsSimulationRunning: (running: boolean) => void;
  toggleSimulationRunning: () => void;
  simulationTick: number;

  // Emergency Scenario Walkthrough
  isScenarioModalOpen: boolean;
  setIsScenarioModalOpen: (open: boolean) => void;
  scenarioStep: number;
  startEmergencyScenario: () => void;
  advanceEmergencyScenario: () => void;
  closeEmergencyScenario: () => void;

  // Actions
  createIncident: (data: {
    type: IncidentCategory;
    zoneId: string;
    priority: IncidentPriority;
    description: string;
    coordinates?: [number, number];
    assignedUnitId?: string;
  }) => Incident;
  updateIncidentStatus: (id: string, status: IncidentStatus, note?: string) => void;
  assignUnitToIncident: (incidentId: string, unitId: string) => void;
  releaseUnit: (unitId: string) => void;
  addIncidentNote: (incidentId: string, text: string) => void;

  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  convertAlertToIncident: (alertId: string) => void;

  toggleNodeConnection: (nodeId: string) => void;
  queueMessageForNode: (nodeId: string, priority: MessagePriority, payload: string) => void;
  deliverQueuedMessages: (nodeId: string) => void;

  updateThresholds: (thresholds: Partial<SafetyThresholds>) => void;
  resetDemoData: () => void;
  injectQuickEvent: (type: 'medical' | 'smoke' | 'node-outage' | 'restore-node' | 'crowd-surge') => void;

  // Notifications
  toast: ToastInfo | null;
  showToast: (text: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [activeSiteId, setActiveSiteId] = useState<string>('prayagraj');
  const [currentRole, setCurrentRole] = useState<UserRole>('operator');

  // Core Persistent State
  const [zones, setZones] = useState<MonitoringZone[]>(() => {
    const raw = storageService.loadZones();
    return raw.map(z => {
      const assessed = calculateZoneRisk(z, []);
      return {
        ...z,
        riskScore: assessed.score,
        riskLevel: assessed.level,
        riskFactors: assessed.factors,
        recommendedAction: assessed.recommendedAction
      };
    });
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => storageService.loadIncidents());
  const [responseUnits, setResponseUnits] = useState<ResponseUnit[]>(() => storageService.loadResponseUnits());
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => storageService.loadAlerts());
  const [nodes, setNodes] = useState<CommunicationNode[]>(() => storageService.loadNodes());
  const [messages, setMessages] = useState<CommunicationMessage[]>([
    {
      id: 'msg-101',
      nodeId: 'NODE-LORA-01',
      nodeName: 'Gateway Alpha — Sangam Watch Tower',
      priority: 'High Safety Alert',
      payload: 'Bathing platform 2 ingress throttle request received. Gate queue at 82%.',
      timestamp: '5 mins ago',
      status: 'Delivered',
      retryCount: 0,
      deliveredAt: '5 mins ago'
    },
    {
      id: 'msg-102',
      nodeId: 'NODE-LORA-04',
      nodeName: 'Backhaul Relay Delta — Shastri Bridge',
      priority: 'Routine Status Update',
      payload: 'Pedestrian counter telemetry packet sync. Total throughput 3,420 p/hr.',
      timestamp: '1 min ago',
      status: 'Delivered',
      retryCount: 0,
      deliveredAt: '1 min ago'
    }
  ]);
  const [facilities] = useState<FacilityMarker[]>(INITIAL_FACILITIES);
  const [evacuationRoutes] = useState<EvacuationRoute[]>(INITIAL_EVACUATION_ROUTES);
  const [thresholds, setThresholds] = useState<SafetyThresholds>(() => storageService.loadThresholds());

  // Simulation Running State
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [simulationTick, setSimulationTick] = useState<number>(0);

  // Emergency Scenario Guided Walkthrough
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [scenarioStep, setScenarioStep] = useState<number>(0);

  // Toast
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, text, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Persist whenever core items change
  useEffect(() => {
    storageService.saveZones(zones);
  }, [zones]);

  useEffect(() => {
    storageService.saveIncidents(incidents);
  }, [incidents]);

  useEffect(() => {
    storageService.saveResponseUnits(responseUnits);
  }, [responseUnits]);

  useEffect(() => {
    storageService.saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    storageService.saveNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    storageService.saveThresholds(thresholds);
  }, [thresholds]);

  // Active site object
  const activeSite = GATHERING_SITES.find(s => s.id === activeSiteId) || GATHERING_SITES[0];

  // Periodic simulation loop (updates crowds, fluctuating speed, environmental values slightly)
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isSimulationRunning) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      return;
    }

    simulationRef.current = setInterval(() => {
      setSimulationTick(prev => prev + 1);

      setZones(prevZones => {
        return prevZones.map(zone => {
          // Subtle realistic natural fluctuation
          const deltaDensity = (Math.random() - 0.48) * 0.08;
          const newDensity = Math.max(0.5, Math.min(6.5, +(zone.density + deltaDensity).toFixed(2)));
          const newCount = Math.round(newDensity * (zone.capacityMax / zone.safetyThreshold));
          const newSpeed = Math.max(0.2, Math.min(1.4, +(zone.movementSpeed + (Math.random() - 0.5) * 0.04).toFixed(2)));
          const newTemp = +(zone.temperature + (Math.random() - 0.5) * 0.1).toFixed(1);

          // Get active incidents for this zone
          const zoneIncidents = incidents.filter(i => i.zoneId === zone.id);
          const assessment = calculateZoneRisk(
            {
              ...zone,
              density: newDensity,
              currentCount: newCount,
              movementSpeed: newSpeed,
              temperature: newTemp
            },
            zoneIncidents
          );

          return {
            ...zone,
            density: newDensity,
            currentCount: newCount,
            movementSpeed: newSpeed,
            temperature: newTemp,
            riskScore: assessment.score,
            riskLevel: assessment.level,
            riskFactors: assessment.factors,
            recommendedAction: assessment.recommendedAction,
            lastUpdated: 'Just now'
          };
        });
      });
    }, 6000);

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, [isSimulationRunning, incidents]);

  // Re-assess zone risks when incidents change
  const recalculateAllZoneRisks = useCallback(() => {
    setZones(prevZones =>
      prevZones.map(zone => {
        const zoneIncidents = incidents.filter(i => i.zoneId === zone.id);
        const assessment = calculateZoneRisk(zone, zoneIncidents);
        return {
          ...zone,
          riskScore: assessment.score,
          riskLevel: assessment.level,
          riskFactors: assessment.factors,
          recommendedAction: assessment.recommendedAction
        };
      })
    );
  }, [incidents]);

  // Incident Actions
  const createIncident = useCallback(
    (data: {
      type: IncidentCategory;
      zoneId: string;
      priority: IncidentPriority;
      description: string;
      coordinates?: [number, number];
      assignedUnitId?: string;
    }): Incident => {
      const zone = zones.find(z => z.id === data.zoneId);
      const zoneName = zone ? zone.name : 'Sector 1 — Triveni Sangam';
      const coordinates = data.coordinates || (zone ? zone.coordinates : [25.4295, 81.8845]);
      const newId = `INC-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

      let assignedUnitName: string | null = null;
      if (data.assignedUnitId) {
        const unit = responseUnits.find(u => u.id === data.assignedUnitId);
        if (unit) {
          assignedUnitName = unit.name;
          setResponseUnits(prev =>
            prev.map(u => (u.id === unit.id ? { ...u, status: 'Dispatched', assignedIncidentId: newId } : u))
          );
        }
      }

      const newIncident: Incident = {
        id: newId,
        type: data.type,
        zoneId: data.zoneId,
        zoneName,
        priority: data.priority,
        status: data.assignedUnitId ? 'Team Dispatched' : 'Reported',
        coordinates,
        reportedTime: 'Just now',
        description: data.description,
        assignedUnitId: data.assignedUnitId || null,
        assignedUnitName,
        reporterRole: currentRole === 'operator' ? 'Control Room Operator' : `${currentRole.toUpperCase()} Officer`,
        notes: [
          {
            timestamp: 'Just now',
            author: 'Control Room',
            text: `Incident logged: ${data.description}`
          }
        ],
        history: [
          {
            timestamp: 'Just now',
            action: `Incident created with priority ${data.priority}`,
            user: currentRole
          }
        ]
      };

      setIncidents(prev => [newIncident, ...prev]);

      // If priority is Critical or High, generate an emergency alert
      if (data.priority === 'Critical' || data.priority === 'High') {
        const alertId = `ALT-${Math.floor(Math.random() * 9000) + 1000}`;
        const newAlert: EmergencyAlert = {
          id: alertId,
          timeGenerated: 'Just now',
          zoneId: data.zoneId,
          zoneName,
          category: data.type.includes('Fire') ? 'Fire/Smoke' : data.type.includes('Medical') ? 'Medical' : 'Crowd Safety',
          severity: data.priority,
          reason: `Incident ${newId} logged: ${data.description}`,
          recommendedAction: 'Coordinate immediate response dispatch and notify perimeter holding points.',
          acknowledged: false,
          resolved: false,
          convertedIncidentId: newId
        };
        setAlerts(prev => [newAlert, ...prev]);

        if (thresholds.soundAlertsEnabled) {
          playAlertTone(data.priority);
        }
      }

      showToast(`Emergency Incident ${newId} logged successfully.`, 'success');
      return newIncident;
    },
    [zones, responseUnits, currentRole, thresholds.soundAlertsEnabled, showToast]
  );

  const updateIncidentStatus = useCallback(
    (id: string, status: IncidentStatus, noteText?: string) => {
      setIncidents(prev =>
        prev.map(inc => {
          if (inc.id !== id) return inc;
          const updatedNotes = [...inc.notes];
          if (noteText) {
            updatedNotes.push({
              timestamp: 'Just now',
              author: currentRole,
              text: noteText
            });
          }
          const updatedHistory = [
            ...inc.history,
            {
              timestamp: 'Just now',
              action: `Status updated to ${status}${noteText ? ` — ${noteText}` : ''}`,
              user: currentRole
            }
          ];

          return {
            ...inc,
            status,
            notes: updatedNotes,
            history: updatedHistory,
            resolvedAt: status === 'Resolved' ? 'Just now' : inc.resolvedAt
          };
        })
      );

      // If resolved, release assigned unit
      if (status === 'Resolved') {
        setResponseUnits(prev =>
          prev.map(u => (u.assignedIncidentId === id ? { ...u, status: 'Available', assignedIncidentId: null } : u))
        );
      }

      showToast(`Incident ${id} status updated to ${status}`, 'info');
      recalculateAllZoneRisks();
    },
    [currentRole, showToast, recalculateAllZoneRisks]
  );

  const assignUnitToIncident = useCallback(
    (incidentId: string, unitId: string) => {
      const unit = responseUnits.find(u => u.id === unitId);
      if (!unit) return;

      setIncidents(prev =>
        prev.map(inc => {
          if (inc.id !== incidentId) return inc;
          return {
            ...inc,
            assignedUnitId: unit.id,
            assignedUnitName: unit.name,
            status: 'Team Dispatched',
            history: [
              ...inc.history,
              {
                timestamp: 'Just now',
                action: `Assigned unit ${unit.name} (${unit.id})`,
                user: currentRole
              }
            ]
          };
        })
      );

      setResponseUnits(prev =>
        prev.map(u => (u.id === unitId ? { ...u, status: 'Dispatched', assignedIncidentId: incidentId, lastUpdate: 'Just now' } : u))
      );

      showToast(`Dispatched ${unit.name} to Incident ${incidentId}`, 'success');
      recalculateAllZoneRisks();
    },
    [responseUnits, currentRole, showToast, recalculateAllZoneRisks]
  );

  const releaseUnit = useCallback(
    (unitId: string) => {
      setResponseUnits(prev =>
        prev.map(u => (u.id === unitId ? { ...u, status: 'Available', assignedIncidentId: null, lastUpdate: 'Just now' } : u))
      );
      showToast(`Unit ${unitId} released and set to Available`, 'info');
    },
    [showToast]
  );

  const addIncidentNote = useCallback(
    (incidentId: string, text: string) => {
      setIncidents(prev =>
        prev.map(inc => {
          if (inc.id !== incidentId) return inc;
          return {
            ...inc,
            notes: [
              ...inc.notes,
              {
                timestamp: 'Just now',
                author: currentRole,
                text
              }
            ]
          };
        })
      );
      showToast('Note added to incident log', 'info');
    },
    [currentRole, showToast]
  );

  // Alerts
  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId
            ? { ...a, acknowledged: true, acknowledgedBy: currentRole, acknowledgedAt: 'Just now' }
            : a
        )
      );
      showToast(`Alert ${alertId} acknowledged`, 'info');
    },
    [currentRole, showToast]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      setAlerts(prev =>
        prev.map(a =>
          a.id === alertId ? { ...a, resolved: true, acknowledged: true } : a
        )
      );
      showToast(`Alert ${alertId} marked resolved`, 'success');
    },
    [showToast]
  );

  const convertAlertToIncident = useCallback(
    (alertId: string) => {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      const priorityMap: Record<string, IncidentPriority> = {
        Critical: 'Critical',
        High: 'High',
        Moderate: 'Medium',
        Informational: 'Low'
      };

      const categoryMap: Record<string, IncidentCategory> = {
        'Crowd Safety': 'Crowd Congestion',
        Medical: 'Medical Emergency',
        'Fire/Smoke': 'Fire or Smoke',
        Environmental: 'Heat-Related Illness',
        Connectivity: 'Infrastructure / Safety'
      };

      const created = createIncident({
        type: categoryMap[alert.category] || 'Crowd Congestion',
        zoneId: alert.zoneId,
        priority: priorityMap[alert.severity] || 'High',
        description: `Generated from Alert ${alert.id}: ${alert.reason}`
      });

      setAlerts(prev =>
        prev.map(a => (a.id === alertId ? { ...a, acknowledged: true, convertedIncidentId: created.id } : a))
      );
      showToast(`Converted Alert ${alertId} to Incident ${created.id}`, 'success');
    },
    [alerts, createIncident, showToast]
  );

  // Communication & Resilient Mesh
  const toggleNodeConnection = useCallback(
    (nodeId: string) => {
      setNodes(prev =>
        prev.map(node => {
          if (node.id !== nodeId) return node;
          const isCurrentlyOffline = node.connectivityStatus === 'Offline';
          const newStatus = isCurrentlyOffline ? 'Reconnected' : 'Offline';
          const newSignal = isCurrentlyOffline ? 'Strong' : 'Disconnected';

          // If reconnecting, deliver any pending messages!
          if (isCurrentlyOffline && node.pendingMessages > 0) {
            setMessages(prevMsgs =>
              prevMsgs.map(m =>
                m.nodeId === nodeId && m.status === 'Queued'
                  ? { ...m, status: 'Delivered', deliveredAt: 'Just now' }
                  : m
              )
            );
          }

          return {
            ...node,
            connectivityStatus: newStatus,
            signalStatus: newSignal,
            pendingMessages: isCurrentlyOffline ? 0 : node.pendingMessages,
            totalDelivered: isCurrentlyOffline ? node.totalDelivered + node.pendingMessages : node.totalDelivered,
            lastSeen: 'Just now'
          };
        })
      );

      const target = nodes.find(n => n.id === nodeId);
      const isOff = target?.connectivityStatus === 'Offline';
      showToast(
        isOff
          ? `Mesh node ${nodeId} reconnected! Pending queue flushed.`
          : `Simulated network link lost on ${nodeId}. Local store-and-forward queue activated.`,
        isOff ? 'success' : 'warning'
      );
    },
    [nodes, showToast]
  );

  const queueMessageForNode = useCallback(
    (nodeId: string, priority: MessagePriority, payload: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      const isOffline = node.connectivityStatus === 'Offline';
      const msgId = `msg-${Date.now().toString().slice(-4)}`;

      const newMsg: CommunicationMessage = {
        id: msgId,
        nodeId,
        nodeName: node.name,
        priority,
        payload,
        timestamp: 'Just now',
        status: isOffline ? 'Queued' : 'Delivered',
        retryCount: 0,
        deliveredAt: isOffline ? undefined : 'Just now'
      };

      setMessages(prev => [newMsg, ...prev]);

      setNodes(prev =>
        prev.map(n => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            pendingMessages: isOffline ? n.pendingMessages + 1 : n.pendingMessages,
            totalDelivered: isOffline ? n.totalDelivered : n.totalDelivered + 1,
            lastSeen: 'Just now'
          };
        })
      );

      showToast(
        isOffline
          ? `Node ${nodeId} is OFFLINE. Message ${msgId} stored in resilient local queue.`
          : `Message ${msgId} dispatched and delivered to ${nodeId} via active backhaul.`,
        isOffline ? 'warning' : 'success'
      );
    },
    [nodes, showToast]
  );

  const deliverQueuedMessages = useCallback(
    (nodeId: string) => {
      setMessages(prev =>
        prev.map(m =>
          m.nodeId === nodeId && m.status === 'Queued'
            ? { ...m, status: 'Delivered', deliveredAt: 'Just now' }
            : m
        )
      );

      setNodes(prev =>
        prev.map(n => {
          if (n.id !== nodeId) return n;
          return {
            ...n,
            connectivityStatus: 'Online',
            signalStatus: 'Strong',
            totalDelivered: n.totalDelivered + n.pendingMessages,
            pendingMessages: 0,
            lastSeen: 'Just now'
          };
        })
      );

      showToast(`All queued messages for ${nodeId} successfully delivered!`, 'success');
    },
    [showToast]
  );

  // Quick Injections
  const injectQuickEvent = useCallback(
    (type: 'medical' | 'smoke' | 'node-outage' | 'restore-node' | 'crowd-surge') => {
      if (type === 'medical') {
        createIncident({
          type: 'Medical Emergency',
          zoneId: 'zone-sangam-ghat',
          priority: 'High',
          description: 'Two elderly devotees collapsed due to sudden crush pressure near Platform 4.'
        });
      } else if (type === 'smoke') {
        setZones(prev =>
          prev.map(z => {
            if (z.id === 'zone-daraganj-corridor') {
              return {
                ...z,
                smokeDetected: true,
                fireRiskLevel: 'Critical',
                riskScore: 92,
                riskLevel: 'Critical'
              };
            }
            return z;
          })
        );
        createIncident({
          type: 'Fire or Smoke',
          zoneId: 'zone-daraganj-corridor',
          priority: 'Critical',
          description: 'Dense smoke detected near electrical transformer box on Daraganj relief road.'
        });
        showToast('Smoke sensor triggered in Sector 6! Critical alert elevated.', 'error');
      } else if (type === 'node-outage') {
        toggleNodeConnection('NODE-LORA-04');
      } else if (type === 'restore-node') {
        deliverQueuedMessages('NODE-LORA-04');
      } else if (type === 'crowd-surge') {
        setZones(prev =>
          prev.map(z => {
            if (z.id === 'zone-sangam-ghat') {
              const surgeDensity = 4.8;
              const surgeCount = 82000;
              return {
                ...z,
                density: surgeDensity,
                currentCount: surgeCount,
                growthRate: 28.5,
                movementSpeed: 0.32,
                movementIrregularity: 62,
                riskScore: 89,
                riskLevel: 'Critical',
                recommendedAction: 'Halt upstream pontoon gates! Divert crowd to Arail Plateau immediately.'
              };
            }
            return z;
          })
        );
        createIncident({
          type: 'Potential Crowd Crush',
          zoneId: 'zone-sangam-ghat',
          priority: 'Critical',
          description: 'Rapid surge at Sangam confluence ghat. Flow velocity fell to 0.32 m/s, density 4.8 p/m².'
        });
        showToast('Sudden crowd surge triggered at Triveni Sangam Ghat!', 'error');
      }
    },
    [createIncident, toggleNodeConnection, deliverQueuedMessages, showToast]
  );

  // 10-Step Coordinated Emergency Drill
  const startEmergencyScenario = useCallback(() => {
    setScenarioStep(1);
    setIsScenarioModalOpen(true);
    setActiveTab('command');

    // Step 1: Rapid surge at Sector 1
    setZones(prev =>
      prev.map(z => {
        if (z.id === 'zone-sangam-ghat') {
          return {
            ...z,
            density: 4.6,
            currentCount: 79000,
            growthRate: 26.0,
            movementSpeed: 0.35,
            movementIrregularity: 58
          };
        }
        return z;
      })
    );
    showToast('Emergency Scenario: Step 1 — Sudden crowd influx detected at Sangam Ghat', 'warning');
  }, [showToast]);

  const advanceEmergencyScenario = useCallback(() => {
    setScenarioStep(current => {
      const next = current + 1;
      if (next === 2) {
        // Step 2: Risk Engine raises score
        setZones(prev =>
          prev.map(z => {
            if (z.id === 'zone-sangam-ghat') {
              return {
                ...z,
                riskScore: 88,
                riskLevel: 'Critical',
                recommendedAction: 'Execute emergency protocol: Deploy crowd-dispersal units, halt gate ingress.'
              };
            }
            return z;
          })
        );
        showToast('Scenario Step 2: Risk Engine escalates Sangam Ghat to CRITICAL (Score 88)', 'error');
      } else if (next === 3) {
        // Step 3: High priority alert generated
        const alertId = 'ALT-DRILL-01';
        setAlerts(prev => [
          {
            id: alertId,
            timeGenerated: 'Just now',
            zoneId: 'zone-sangam-ghat',
            zoneName: 'Sector 1 — Triveni Sangam Main Ghat',
            category: 'Crowd Safety',
            severity: 'Critical',
            reason: 'SIMULATED DRILL: Density 4.6 p/m² exceeding safety limit with severe turbulence 58%.',
            recommendedAction: 'Divert oncoming procession to Arail bypass. Close Gate 1 ingress.',
            acknowledged: false,
            resolved: false
          },
          ...prev
        ]);
        if (thresholds.soundAlertsEnabled) playAlertTone('Critical');
        showToast('Scenario Step 3: Critical crowd-congestion warning broadcast', 'error');
      } else if (next === 4) {
        // Step 4: Command centre updates
        setActiveTab('command');
        showToast('Scenario Step 4: Command Centre metrics spike — High density warnings active', 'info');
      } else if (next === 5) {
        // Step 5: GIS Map highlights affected area
        setActiveTab('map');
        setSelectedZoneId('zone-sangam-ghat');
        showToast('Scenario Step 5: GIS Map highlighted Sector 1 with critical buffer zone', 'info');
      } else if (next === 6) {
        // Step 6: Create or open incident and assign response unit
        const drillInc = createIncident({
          type: 'Potential Crowd Crush',
          zoneId: 'zone-sangam-ghat',
          priority: 'Critical',
          description: 'Emergency Drill: Severe bottleneck at bathing steps. Crowd counterflow reported.',
          assignedUnitId: 'UNIT-POL-01'
        });
        setSelectedIncidentId(drillInc.id);
        setActiveTab('incidents');
        showToast('Scenario Step 6: Incident INC-DRILL logged and Unit POL-01 dispatched', 'success');
      } else if (next === 7) {
        // Step 7: Connectivity interruption
        toggleNodeConnection('NODE-LORA-01');
        setActiveTab('connectivity');
        showToast('Scenario Step 7: Gateway Alpha link lost — Local node isolated', 'warning');
      } else if (next === 8) {
        // Step 8: Emergency message queued during outage
        queueMessageForNode(
          'NODE-LORA-01',
          'Critical Emergency',
          'PRIORITY-1 DISPATCH: Police Platoon 01 on scene at Sangam Steps. Reinforcements required at Gate 2.'
        );
        showToast('Scenario Step 8: Priority message queued on offline node buffer', 'warning');
      } else if (next === 9) {
        // Step 9: Connectivity restored and queued messages delivered
        deliverQueuedMessages('NODE-LORA-01');
        showToast('Scenario Step 9: LoRa Gateway link restored! Store-and-forward queue flushed', 'success');
      } else if (next === 10) {
        // Step 10: Operator resolves incident, density normalizes
        setZones(prev =>
          prev.map(z => {
            if (z.id === 'zone-sangam-ghat') {
              return {
                ...z,
                density: 2.9,
                currentCount: 54000,
                growthRate: 1.2,
                movementSpeed: 0.95,
                movementIrregularity: 22,
                riskScore: 38,
                riskLevel: 'Moderate'
              };
            }
            return z;
          })
        );
        setActiveTab('command');
        showToast('Scenario Step 10: Incident resolved. Sector density normalized to safe thresholds.', 'success');
      }
      return next;
    });
  }, [createIncident, toggleNodeConnection, queueMessageForNode, deliverQueuedMessages, thresholds.soundAlertsEnabled, showToast]);

  const closeEmergencyScenario = useCallback(() => {
    setIsScenarioModalOpen(false);
    setScenarioStep(0);
  }, []);

  const resetDemoData = useCallback(() => {
    storageService.clearAll();
    setZones(INITIAL_ZONES);
    setIncidents(INITIAL_INCIDENTS);
    setResponseUnits(INITIAL_RESPONSE_UNITS);
    setAlerts(INITIAL_ALERTS);
    setNodes(INITIAL_COMM_NODES);
    setThresholds(INITIAL_SAFETY_THRESHOLDS);
    setSelectedZoneId(null);
    setSelectedIncidentId(null);
    setIsScenarioModalOpen(false);
    setScenarioStep(0);
    showToast('All demonstration data reset to baseline state.', 'info');
  }, [showToast]);

  const updateThresholds = useCallback(
    (newThresholds: Partial<SafetyThresholds>) => {
      setThresholds(prev => ({ ...prev, ...newThresholds }));
      showToast('Safety thresholds updated.', 'success');
    },
    [showToast]
  );

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedZoneId,
        setSelectedZoneId,
        selectedIncidentId,
        setSelectedIncidentId,
        activeSite,
        allSites: GATHERING_SITES,
        setActiveSiteId,
        currentRole,
        setCurrentRole,
        zones,
        incidents,
        responseUnits,
        alerts,
        nodes,
        messages,
        facilities,
        evacuationRoutes,
        thresholds,
        isSimulationRunning,
        setIsSimulationRunning,
        toggleSimulationRunning: () => setIsSimulationRunning(p => !p),
        simulationTick,
        isScenarioModalOpen,
        setIsScenarioModalOpen,
        scenarioStep,
        startEmergencyScenario,
        advanceEmergencyScenario,
        closeEmergencyScenario,
        createIncident,
        updateIncidentStatus,
        assignUnitToIncident,
        releaseUnit,
        addIncidentNote,
        acknowledgeAlert,
        resolveAlert,
        convertAlertToIncident,
        toggleNodeConnection,
        queueMessageForNode,
        deliverQueuedMessages,
        updateThresholds,
        resetDemoData,
        injectQuickEvent,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
