import {
  CommunicationNode,
  EmergencyAlert,
  EvacuationRoute,
  FacilityMarker,
  GatheringSite,
  Incident,
  MonitoringZone,
  ResponseUnit,
  SafetyThresholds
} from '../types';

export const GATHERING_SITES: GatheringSite[] = [
  {
    id: 'prayagraj',
    name: 'Prayagraj — Maha Kumbh Mela',
    location: 'Triveni Sangam, Uttar Pradesh, India',
    centerCoordinates: [25.4295, 81.8845],
    zoom: 14,
    description: 'Confluence of Ganga, Yamuna and mythical Saraswati. Largest mass gathering.'
  },
  {
    id: 'haridwar',
    name: 'Haridwar — Kumbh Mela',
    location: 'Har Ki Pauri, Uttarakhand, India',
    centerCoordinates: [29.9575, 78.1728],
    zoom: 14,
    description: 'Brahmakund and sacred bathing ghats along the Ganges riverfront.'
  },
  {
    id: 'ujjain',
    name: 'Ujjain — Simhastha Kumbh',
    location: 'Shipra River Ghats, Madhya Pradesh, India',
    centerCoordinates: [23.1828, 75.7682],
    zoom: 14,
    description: 'Sacred Shipra riverfront and Mahakaleshwar temple approaches.'
  },
  {
    id: 'nashik',
    name: 'Nashik — Trimbak Kumbh',
    location: 'Ramkund Godavari, Maharashtra, India',
    centerCoordinates: [19.9975, 73.7898],
    zoom: 14,
    description: 'Ramkund holy dip tanks and Trimbakeshwar pilgrimage routes.'
  }
];

export const INITIAL_ZONES: MonitoringZone[] = [
  {
    id: 'zone-sangam-ghat',
    name: 'Sector 1 — Triveni Sangam Main Ghat',
    sector: 'Sector 1',
    siteId: 'prayagraj',
    coordinates: [25.4295, 81.8845],
    radiusMeters: 450,
    capacityMax: 85000,
    currentCount: 62400,
    density: 3.4,
    safetyThreshold: 3.0,
    growthRate: 8.5,
    movementSpeed: 0.65,
    movementIrregularity: 38,
    temperature: 34.2,
    humidity: 68,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e1',
    lastUpdated: 'Just now',
    riskScore: 54,
    riskLevel: 'High',
    riskFactors: [],
    recommendedAction: 'Restrict gate entry; activate holding areas; alert nearest medical team.'
  },
  {
    id: 'zone-fort-road',
    name: 'Sector 2 — Fort Road & Akshayavat Approach',
    sector: 'Sector 2',
    siteId: 'prayagraj',
    coordinates: [25.4270, 81.8790],
    radiusMeters: 380,
    capacityMax: 45000,
    currentCount: 22100,
    density: 1.8,
    safetyThreshold: 3.0,
    growthRate: 2.1,
    movementSpeed: 1.15,
    movementIrregularity: 15,
    temperature: 33.8,
    humidity: 64,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e2',
    lastUpdated: '1 min ago',
    riskScore: 22,
    riskLevel: 'Low',
    riskFactors: [],
    recommendedAction: 'Routine surveillance; maintain standard ghat patrolling.'
  },
  {
    id: 'zone-shastri-bridge',
    name: 'Sector 3 — Shastri Bridge & Gate 4 Junction',
    sector: 'Sector 3',
    siteId: 'prayagraj',
    coordinates: [25.4380, 81.8890],
    radiusMeters: 400,
    capacityMax: 50000,
    currentCount: 38700,
    density: 3.8,
    safetyThreshold: 3.0,
    growthRate: 14.2,
    movementSpeed: 0.48,
    movementIrregularity: 44,
    temperature: 35.1,
    humidity: 71,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e3',
    lastUpdated: 'Just now',
    riskScore: 68,
    riskLevel: 'High',
    riskFactors: [],
    recommendedAction: 'Regulate pedestrian influx at bridge ramp; open diversion chute.'
  },
  {
    id: 'zone-jhusi-camp',
    name: 'Sector 4 — Jhusi Pilgrim Encampment',
    sector: 'Sector 4',
    siteId: 'prayagraj',
    coordinates: [25.4350, 81.9010],
    radiusMeters: 520,
    capacityMax: 70000,
    currentCount: 31000,
    density: 1.6,
    safetyThreshold: 3.0,
    growthRate: -1.4,
    movementSpeed: 1.1,
    movementIrregularity: 12,
    temperature: 33.5,
    humidity: 66,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e1',
    lastUpdated: '2 mins ago',
    riskScore: 18,
    riskLevel: 'Low',
    riskFactors: [],
    recommendedAction: 'Routine surveillance; ensure drinking water stations remain stocked.'
  },
  {
    id: 'zone-arail-ghat',
    name: 'Sector 5 — Arail Ghat & South Riverfront',
    sector: 'Sector 5',
    siteId: 'prayagraj',
    coordinates: [25.4180, 81.8820],
    radiusMeters: 420,
    capacityMax: 40000,
    currentCount: 16800,
    density: 1.4,
    safetyThreshold: 3.0,
    growthRate: 3.0,
    movementSpeed: 1.2,
    movementIrregularity: 14,
    temperature: 34.0,
    humidity: 65,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e1',
    lastUpdated: '3 mins ago',
    riskScore: 16,
    riskLevel: 'Low',
    riskFactors: [],
    recommendedAction: 'Normal operation; monitor boat ferry docking intervals.'
  },
  {
    id: 'zone-daraganj-corridor',
    name: 'Sector 6 — Daraganj Ingress Corridor',
    sector: 'Sector 6',
    siteId: 'prayagraj',
    coordinates: [25.4420, 81.8780],
    radiusMeters: 360,
    capacityMax: 35000,
    currentCount: 22400,
    density: 2.8,
    safetyThreshold: 3.0,
    growthRate: 9.8,
    movementSpeed: 0.85,
    movementIrregularity: 28,
    temperature: 35.6,
    humidity: 72,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e4',
    lastUpdated: '1 min ago',
    riskScore: 42,
    riskLevel: 'Moderate',
    riskFactors: [],
    recommendedAction: 'Stage traffic police at narrow street necks; prevent vendor encroachment.'
  },
  {
    id: 'zone-pontoon-bridges',
    name: 'Sector 7 — Kali Marg Pontoon Bridges',
    sector: 'Sector 7',
    siteId: 'prayagraj',
    coordinates: [25.4330, 81.8920],
    radiusMeters: 320,
    capacityMax: 30000,
    currentCount: 20100,
    density: 3.1,
    safetyThreshold: 2.8,
    growthRate: 11.2,
    movementSpeed: 0.72,
    movementIrregularity: 34,
    temperature: 34.5,
    humidity: 69,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e1',
    lastUpdated: 'Just now',
    riskScore: 51,
    riskLevel: 'High',
    riskFactors: [],
    recommendedAction: 'Enforce one-way tidal flow across pontoon spans. Halt counterflow.'
  },
  {
    id: 'zone-parade-ground',
    name: 'Sector 8 — Parade Ground Holding Arena',
    sector: 'Sector 8',
    siteId: 'prayagraj',
    coordinates: [25.4340, 81.8680],
    radiusMeters: 600,
    capacityMax: 120000,
    currentCount: 44000,
    density: 1.1,
    safetyThreshold: 3.5,
    growthRate: 1.5,
    movementSpeed: 1.3,
    movementIrregularity: 8,
    temperature: 34.8,
    humidity: 62,
    smokeDetected: false,
    fireRiskLevel: 'Normal',
    evacuationRouteId: 'route-e2',
    lastUpdated: '2 mins ago',
    riskScore: 12,
    riskLevel: 'Low',
    riskFactors: [],
    recommendedAction: 'Available for overflow holding. Ready PA broadcast systems.'
  }
];

export const INITIAL_FACILITIES: FacilityMarker[] = [
  {
    id: 'fac-med-01',
    name: 'Sangam Emergency Trauma Camp',
    type: 'Medical Camp / Hospital',
    coordinates: [25.4288, 81.8825],
    zone: 'Sector 1',
    contact: 'VHF Ch 4 / +91-532-2401',
    details: '20 Triage cots, 4 Defibrillators, IV fluid reserves, 2 standby ALS ambulances'
  },
  {
    id: 'fac-med-02',
    name: 'Jhusi 100-Bed Field Hospital',
    type: 'Medical Camp / Hospital',
    coordinates: [25.4360, 81.9030],
    zone: 'Sector 4',
    contact: 'VHF Ch 4 / +91-532-2402',
    details: 'Full surgery team, oxygen plant, heatstroke cooling ice baths'
  },
  {
    id: 'fac-pol-01',
    name: 'Unified Police Command Center',
    type: 'Police Post',
    coordinates: [25.4305, 81.8810],
    zone: 'Sector 1',
    contact: 'VHF Ch 1 / +91-532-2100',
    details: 'Central dispatch, CCTV feeds, aerial drone surveillance ground control'
  },
  {
    id: 'fac-pol-02',
    name: 'Daraganj Security Outpost',
    type: 'Police Post',
    coordinates: [25.4410, 81.8770],
    zone: 'Sector 6',
    contact: 'VHF Ch 1 / +91-532-2104',
    details: 'Barricade management, crowd diversion control post'
  },
  {
    id: 'fac-fire-01',
    name: 'Parade Ground Fire & Rescue Station',
    type: 'Fire Station',
    coordinates: [25.4330, 81.8690],
    zone: 'Sector 8',
    contact: 'VHF Ch 2 / 101',
    details: '3 Foam tenders, 2 rapid motorcycles, hydraulic cutters, rescue gear'
  },
  {
    id: 'fac-gate-01',
    name: 'Gate 1 — North Railway Ingress',
    type: 'Entry Gate',
    coordinates: [25.4450, 81.8800],
    zone: 'Sector 6',
    contact: 'Gate Master Post 1',
    details: 'Automated turnstile counter sensors, metal detection arches'
  },
  {
    id: 'fac-gate-02',
    name: 'Gate 4 — Shastri Bridge Southern Descent',
    type: 'Entry Gate',
    coordinates: [25.4375, 81.8905],
    zone: 'Sector 3',
    contact: 'Gate Master Post 4',
    details: 'Pedestrian holding chutes with radio-linked crowd throttle barriers'
  },
  {
    id: 'fac-asm-01',
    name: 'Assembly Arena Alpha — Arail High Plateau',
    type: 'Emergency Assembly Point',
    coordinates: [25.4160, 81.8840],
    zone: 'Sector 5',
    contact: 'Relief Coordinator Arail',
    details: 'Open flood-safe muster ground, capacity 50,000, water distribution pipes'
  },
  {
    id: 'fac-lost-01',
    name: 'Central Khoya-Paya (Lost & Found) Booth',
    type: 'Lost & Found Center',
    coordinates: [25.4310, 81.8830],
    zone: 'Sector 1',
    contact: 'VHF Ch 5 / 1920',
    details: 'Biometric registration, computerized missing child photo matching'
  }
];

export const INITIAL_RESPONSE_UNITS: ResponseUnit[] = [
  {
    id: 'UNIT-MED-01',
    name: 'Medical Team 01 (Sangam Rapid Care)',
    type: 'Medical Team',
    status: 'Available',
    coordinates: [25.4285, 81.8830],
    currentZone: 'Sector 1',
    assignedIncidentId: null,
    personnelCount: 4,
    equipment: ['Trauma Pack', 'AED Defibrillator', 'Rehydration Kits', 'Portable Oxygen'],
    lastUpdate: '1 min ago',
    contactChannel: 'VHF Ch 4'
  },
  {
    id: 'UNIT-MED-02',
    name: 'ALS Riverfront Ambulance 02',
    type: 'Ambulance',
    status: 'Available',
    coordinates: [25.4278, 81.8805],
    currentZone: 'Sector 2',
    assignedIncidentId: null,
    personnelCount: 3,
    equipment: ['Ventilator', 'ECG Monitor', 'Stretcher Lift', 'Spine Boards'],
    lastUpdate: 'Just now',
    contactChannel: 'VHF Ch 4'
  },
  {
    id: 'UNIT-MED-03',
    name: 'Mobile Heat-Triage Golf Cart',
    type: 'Medical Team',
    status: 'Busy',
    coordinates: [25.4370, 81.8880],
    currentZone: 'Sector 3',
    assignedIncidentId: 'INC-2026-088',
    personnelCount: 2,
    equipment: ['Cooling Wraps', 'Electrolyte Packs', 'Vitals Monitor'],
    lastUpdate: '4 mins ago',
    contactChannel: 'VHF Ch 4'
  },
  {
    id: 'UNIT-POL-01',
    name: 'Rapid Police Intervention Platoon 01',
    type: 'Police / Security',
    status: 'Available',
    coordinates: [25.4315, 81.8800],
    currentZone: 'Sector 1',
    assignedIncidentId: null,
    personnelCount: 12,
    equipment: ['Crowd Barriers', 'Megaphones', 'Body Cams', 'Radio Relay'],
    lastUpdate: 'Just now',
    contactChannel: 'VHF Ch 1'
  },
  {
    id: 'UNIT-POL-02',
    name: 'Daraganj Choke Point Patrol',
    type: 'Police / Security',
    status: 'Available',
    coordinates: [25.4415, 81.8775],
    currentZone: 'Sector 6',
    assignedIncidentId: null,
    personnelCount: 8,
    equipment: ['Directional Signage', 'Whistles', 'Rope Cordon'],
    lastUpdate: '2 mins ago',
    contactChannel: 'VHF Ch 1'
  },
  {
    id: 'UNIT-FIRE-01',
    name: 'Heavy Foam Tender 01',
    type: 'Fire & Rescue',
    status: 'Available',
    coordinates: [25.4335, 81.8700],
    currentZone: 'Sector 8',
    assignedIncidentId: null,
    personnelCount: 5,
    equipment: ['Foam Cannon', 'Hydraulic Cutter', 'Smoke Ejectors', 'Breathing App'],
    lastUpdate: '5 mins ago',
    contactChannel: 'VHF Ch 2'
  },
  {
    id: 'UNIT-FIRE-02',
    name: 'Motorcycle Fire Quick Strike',
    type: 'Fire & Rescue',
    status: 'Available',
    coordinates: [25.4365, 81.8900],
    currentZone: 'Sector 3',
    assignedIncidentId: null,
    personnelCount: 2,
    equipment: ['Compressed Air Foam System (CAFS)', 'Extinguishers', 'First Aid'],
    lastUpdate: '1 min ago',
    contactChannel: 'VHF Ch 2'
  },
  {
    id: 'UNIT-CROWD-01',
    name: 'Sewa Volunteer Crowd Marshals',
    type: 'Crowd Management',
    status: 'Available',
    coordinates: [25.4290, 81.8860],
    currentZone: 'Sector 1',
    assignedIncidentId: null,
    personnelCount: 16,
    equipment: ['Holding Pen Ropes', 'Illuminated Batons', 'Public Address Mic'],
    lastUpdate: 'Just now',
    contactChannel: 'VHF Ch 3'
  },
  {
    id: 'UNIT-CROWD-02',
    name: 'NDRF Confluence Boat Squadron',
    type: 'Crowd Management',
    status: 'Available',
    coordinates: [25.4300, 81.8875],
    currentZone: 'Sector 1',
    assignedIncidentId: null,
    personnelCount: 6,
    equipment: ['Rigid Inflatable Boats', 'Life Jackets', 'Rescue Throw Bags', 'Sonar'],
    lastUpdate: '3 mins ago',
    contactChannel: 'VHF Ch 3'
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-088',
    type: 'Heat-Related Illness',
    zoneId: 'zone-shastri-bridge',
    zoneName: 'Sector 3 — Shastri Bridge & Gate 4 Junction',
    priority: 'Medium',
    status: 'Responding',
    coordinates: [25.4372, 81.8885],
    reportedTime: '12 mins ago',
    description: 'Elderly pilgrim exhibiting signs of acute dehydration and heat exhaustion near Gate 4 ramp.',
    assignedUnitId: 'UNIT-MED-03',
    assignedUnitName: 'Mobile Heat-Triage Golf Cart',
    reporterRole: 'Field Marshal S. Sharma',
    notes: [
      {
        timestamp: '12 mins ago',
        author: 'Field Marshal S. Sharma',
        text: 'Pilgrim was assisted into shade. Requested electrolyte solution and ice packs.'
      },
      {
        timestamp: '8 mins ago',
        author: 'UNIT-MED-03 Paramedic',
        text: 'Vitals stable; administering oral rehydration salt; escorting to Sector 3 shade tent.'
      }
    ],
    history: [
      { timestamp: '12 mins ago', action: 'Incident reported via field mobile terminal', user: 'Field Marshal S. Sharma' },
      { timestamp: '10 mins ago', action: 'Dispatched UNIT-MED-03 to location', user: 'Control Room Operator' },
      { timestamp: '8 mins ago', action: 'Status changed to Responding', user: 'UNIT-MED-03 Paramedic' }
    ]
  },
  {
    id: 'INC-2026-087',
    type: 'Crowd Congestion',
    zoneId: 'zone-pontoon-bridges',
    zoneName: 'Sector 7 — Kali Marg Pontoon Bridges',
    priority: 'High',
    status: 'Acknowledged',
    coordinates: [25.4328, 81.8925],
    reportedTime: '24 mins ago',
    description: 'Bathing crowd stopped to take photos on Pontoon Bridge 3, creating a counterflow bottleneck.',
    assignedUnitId: null,
    assignedUnitName: null,
    reporterRole: 'Drone Surveillance Team',
    notes: [
      {
        timestamp: '24 mins ago',
        author: 'Drone Surveillance Team',
        text: 'Pedestrian flow slowed to under 0.3 m/s. Recommend police broadcast to clear walkway.'
      }
    ],
    history: [
      { timestamp: '24 mins ago', action: 'Automated video analytics flagged movement irregularity', user: 'AI Risk Engine' },
      { timestamp: '20 mins ago', action: 'Incident acknowledged by Control Room', user: 'Duty Inspector V. Rawat' }
    ]
  },
  {
    id: 'INC-2026-085',
    type: 'Missing-Person Report',
    zoneId: 'zone-sangam-ghat',
    zoneName: 'Sector 1 — Triveni Sangam Main Ghat',
    priority: 'Low',
    status: 'Resolved',
    coordinates: [25.4290, 81.8840],
    reportedTime: '1 hr ago',
    description: '7-year-old boy separated from parents near Bathing Platform 2. Yellow kurta.',
    assignedUnitId: null,
    assignedUnitName: null,
    reporterRole: 'Khoya-Paya Volunteer',
    resolvedAt: '35 mins ago',
    notes: [
      {
        timestamp: '35 mins ago',
        author: 'Khoya-Paya Booth Lead',
        text: 'Child matched at Central Lost & Found center and reunited with family.'
      }
    ],
    history: [
      { timestamp: '1 hr ago', action: 'Report registered at Booth 1', user: 'Khoya-Paya Volunteer' },
      { timestamp: '35 mins ago', action: 'Incident marked Resolved', user: 'Khoya-Paya Booth Lead' }
    ]
  }
];

export const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'ALT-1092',
    timeGenerated: '3 mins ago',
    zoneId: 'zone-shastri-bridge',
    zoneName: 'Sector 3 — Shastri Bridge & Gate 4 Junction',
    category: 'Crowd Safety',
    severity: 'High',
    reason: 'Crowd density reached 3.8 p/m² with +14.2% surge rate at pedestrian bridge bottleneck.',
    recommendedAction: 'Restrict Gate 4 ingress. Activate dynamic pedestrian bypass around sector flank.',
    acknowledged: false,
    resolved: false
  },
  {
    id: 'ALT-1089',
    timeGenerated: '15 mins ago',
    zoneId: 'zone-pontoon-bridges',
    zoneName: 'Sector 7 — Kali Marg Pontoon Bridges',
    category: 'Crowd Safety',
    severity: 'Moderate',
    reason: 'Movement irregularity 34% detected; crowd velocity dropped below 0.7 m/s.',
    recommendedAction: 'Deploy marshals to keep bridge walkway continuously moving.',
    acknowledged: true,
    acknowledgedBy: 'Duty Operator',
    acknowledgedAt: '12 mins ago',
    resolved: false
  },
  {
    id: 'ALT-1082',
    timeGenerated: '35 mins ago',
    zoneId: 'zone-daraganj-corridor',
    zoneName: 'Sector 6 — Daraganj Ingress Corridor',
    category: 'Environmental',
    severity: 'Moderate',
    reason: 'Ambient temperature reached 35.6°C with 72% relative humidity (Heat Index Warning).',
    recommendedAction: 'Dispatch mist sprayer vehicles; announce shaded hydration points on PA.',
    acknowledged: true,
    acknowledgedBy: 'Medical Desk',
    acknowledgedAt: '30 mins ago',
    resolved: false
  }
];

export const INITIAL_COMM_NODES: CommunicationNode[] = [
  {
    id: 'NODE-LORA-01',
    name: 'Gateway Alpha — Sangam Watch Tower',
    zoneId: 'zone-sangam-ghat',
    zoneName: 'Sector 1 — Triveni Sangam Main Ghat',
    type: 'LoRa Gateway',
    batteryPercent: 94,
    signalStatus: 'Strong',
    lastSeen: '12s ago',
    pendingMessages: 0,
    connectivityStatus: 'Online',
    totalDelivered: 1420,
    coordinates: [25.4300, 81.8840]
  },
  {
    id: 'NODE-LORA-02',
    name: 'Mesh Anchor Beta — Pontoon Bridge 3',
    zoneId: 'zone-pontoon-bridges',
    zoneName: 'Sector 7 — Kali Marg Pontoon Bridges',
    type: 'BLE Mesh Anchor',
    batteryPercent: 88,
    signalStatus: 'Strong',
    lastSeen: '8s ago',
    pendingMessages: 0,
    connectivityStatus: 'Online',
    totalDelivered: 980,
    coordinates: [25.4332, 81.8920]
  },
  {
    id: 'NODE-LORA-03',
    name: 'Gateway Gamma — Daraganj Choke Node',
    zoneId: 'zone-daraganj-corridor',
    zoneName: 'Sector 6 — Daraganj Ingress Corridor',
    type: 'LoRa Gateway',
    batteryPercent: 79,
    signalStatus: 'Fair',
    lastSeen: '25s ago',
    pendingMessages: 0,
    connectivityStatus: 'Online',
    totalDelivered: 1105,
    coordinates: [25.4418, 81.8785]
  },
  {
    id: 'NODE-LORA-04',
    name: 'Backhaul Relay Delta — Shastri Bridge',
    zoneId: 'zone-shastri-bridge',
    zoneName: 'Sector 3 — Shastri Bridge & Gate 4 Junction',
    type: 'Cellular / Satellite Backhaul',
    batteryPercent: 68,
    signalStatus: 'Fair',
    lastSeen: '18s ago',
    pendingMessages: 0,
    connectivityStatus: 'Online',
    totalDelivered: 2040,
    coordinates: [25.4378, 81.8895]
  },
  {
    id: 'NODE-LORA-05',
    name: 'Gateway Epsilon — Jhusi Encampment',
    zoneId: 'zone-jhusi-camp',
    zoneName: 'Sector 4 — Jhusi Pilgrim Encampment',
    type: 'LoRa Gateway',
    batteryPercent: 91,
    signalStatus: 'Strong',
    lastSeen: '14s ago',
    pendingMessages: 0,
    connectivityStatus: 'Online',
    totalDelivered: 840,
    coordinates: [25.4352, 81.9015]
  },
  {
    id: 'NODE-LORA-06',
    name: 'Gateway Zeta — Parade Ground Hub',
    zoneId: 'zone-parade-ground',
    zoneName: 'Sector 8 — Parade Ground Holding Arena',
    type: 'LoRa Gateway',
    batteryPercent: 96,
    signalStatus: 'Strong',
    lastSeen: '6s ago',
    pendingMessages: 0,
    connectivityStatus: 'Online',
    totalDelivered: 3120,
    coordinates: [25.4345, 81.8685]
  }
];

export const INITIAL_EVACUATION_ROUTES: EvacuationRoute[] = [
  {
    id: 'route-e1',
    name: 'Evacuation Route Alpha: Sangam Ghat to Arail Plateau',
    zone: 'Sector 1 to Sector 5',
    status: 'Clear',
    capacityPerHour: 18000,
    notes: 'Wide alluvial sand track with dual Pontoon Bridge 2 access. High-volume egress.',
    path: [
      [25.4295, 81.8845],
      [25.4280, 81.8840],
      [25.4240, 81.8835],
      [25.4200, 81.8830],
      [25.4160, 81.8840]
    ]
  },
  {
    id: 'route-e2',
    name: 'Evacuation Route Bravo: Fort Road to Parade Arena',
    zone: 'Sector 2 to Sector 8',
    status: 'Clear',
    capacityPerHour: 22000,
    notes: 'Paved multilane arterial roadway. Designated primary emergency vehicle conduit.',
    path: [
      [25.4270, 81.8790],
      [25.4285, 81.8750],
      [25.4310, 81.8710],
      [25.4340, 81.8680]
    ]
  },
  {
    id: 'route-e3',
    name: 'Evacuation Route Charlie: Shastri Ramp Diversion Flank',
    zone: 'Sector 3',
    status: 'Congested',
    capacityPerHour: 12000,
    notes: 'Ramp bottleneck. Pedestrians should be diverted through northern riverbank sands.',
    path: [
      [25.4380, 81.8890],
      [25.4365, 81.8920],
      [25.4350, 81.8970],
      [25.4350, 81.9010]
    ]
  },
  {
    id: 'route-e4',
    name: 'Evacuation Route Delta: Daraganj North Relief Chute',
    zone: 'Sector 6',
    status: 'Clear',
    capacityPerHour: 9000,
    notes: 'Narrow urban street segment. One-way outward pedestrian flow strictly enforced.',
    path: [
      [25.4420, 81.8780],
      [25.4450, 81.8760],
      [25.4480, 81.8750]
    ]
  }
];

export const INITIAL_SAFETY_THRESHOLDS: SafetyThresholds = {
  densityWarning: 3.0,
  densityCritical: 4.5,
  growthRateCritical: 20.0,
  temperatureWarning: 38.0,
  humidityWarning: 75.0,
  autoAlertEnabled: true,
  soundAlertsEnabled: false
};
