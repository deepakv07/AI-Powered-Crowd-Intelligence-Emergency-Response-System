# KumbhRakshak — Smart Crowd Safety & Disaster Response Platform

> **Demonstration prototype using simulated data. Not connected to official Kumbh Mela operations. Risk scores, routes and alerts are illustrative and must not be used for real-world emergency decisions.**

KumbhRakshak is an integrated, GIS-enabled emergency operations and crowd-safety management prototype designed for massive religious gatherings such as Maha Kumbh Mela.

---

## 🌟 Key Capabilities & Modules

1. **Command Centre Operations Dashboard**
   - Live KPI cards: Total estimated crowd, high-density sectors, active incidents, available response units, unacknowledged critical alerts, and active LoRa mesh nodes.
   - Real-time crowd density timeline chart with critical safety thresholds.
   - Sector risk distribution, incidents by category, and highest-risk areas ranking.
   - Simulation controls (Pause, Resume, Quick Scenario Event Injection).

2. **Interactive GIS Risk Map**
   - Full-page Leaflet map centered at Prayagraj Triveni Sangam (with site switcher for Haridwar, Ujjain, and Nashik).
   - Color-coded circular risk overlays (Low, Moderate, High, Critical) based on continuous multi-factor assessment.
   - Interactive markers for Medical Camps, Police & Security Posts, Fire Stations, Ingress/Egress Gates, and Emergency Assembly Areas.
   - Evacuation routes with animated/dashed status paths and capacity throughput.
   - Dynamic right-side detail drawer showing nearest available response units (calculated Euclidean/Haversine proximity in meters).
   - Offline tactical vector grid fallback mode if map tiles cannot load.

3. **Explainable Crowd Intelligence & Risk Engine**
   - Mathematical, multi-factor probabilistic risk scoring algorithm (0–100 scale).
   - Weight decomposition: Density vs capacity limit (35%), surge velocity (15%), flow turbulence & counterflow (20%), microclimate/heat index (15%), and confirmed incidents (15%).
   - Critical incident override logic: Verified smoke/fire or bridge blockages immediately force priority escalation.

4. **Emergency Incident Management**
   - Complete incident lifecycle: Reported → Acknowledged → Team Dispatched → Responding → Resolved.
   - Rich incident records with sector coordinates, priority ratings, field notes timeline, and audit history.
   - Interactive modal to log new incidents with automatic alert generation and local team dispatch.
   - LocalStorage persistence and 1-click CSV export.

5. **Medical, Rescue & Security Coordination**
   - Fleet manager for Medical Teams, ALS Ambulances, Police Platoons, Fire Tenders, and Crowd Marshals.
   - Automated closest available response team finder based on incident location coordinates.
   - Dedicated field health triage logging for heat exhaustion, dehydration, and crush injuries.

6. **Alerts & Notification Centre**
   - In-app notification feed with severity-based filtering (Critical, High, Moderate, Informational).
   - 1-click "Convert Alert to Incident" workflow.
   - Web Audio synthesized frequency chime for critical warnings (accessible, zero external dependencies).

7. **Connectivity Resilience & Store-and-Forward Mesh Simulator**
   - LoRaWAN and satellite backhaul node telemetry (battery, signal quality, packet queue).
   - Outage simulation: Disconnect nodes to observe how emergency packets queue in non-volatile memory instead of dropping.
   - Reconnect nodes to trigger automatic flush and delivery confirmation.

8. **Analytics & Post-Disaster Audit Reports**
   - Recharts visual breakdowns: Incidents by severity, sector, and category; response unit utilisation; LoRa mesh uptime.
   - Export tools: Incidents CSV, Zone Intelligence CSV, and full plain-text Situation Report (SITREP).

9. **Settings & Operational Governance**
   - Multi-role simulation switcher: Control Room Operator, Incident Commander, Medical Coordinator, Police Dispatcher, Field Supervisor.
   - Configurable safety thresholds (density limit, surge %, thermal alert threshold).
   - Clear non-biometric privacy and data ethics policy.

---

## 🚀 10-Step Coordinated Emergency Drill

Click **"Run Emergency Simulation"** in the top bar to run the guided 10-phase operational scenario:
1. Rapid crowd surge at Sector 1 (Sangam Confluence Ghat).
2. Risk engine escalates zone score to Critical (88/100).
3. High-priority alert broadcast across the console.
4. Command centre KPI metrics spike.
5. GIS map highlights Sector 1 with critical buffer zone and diversion route.
6. Incident logged and Rapid Police Platoon 01 dispatched.
7. Gateway link failure simulated on LoRa Node.
8. Priority dispatch message buffered in local store-and-forward queue.
9. Link restored and buffered packet delivered.
10. Incident resolved and crowd density normalizes to safe baseline.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4)
- **Mapping:** Leaflet with OpenStreetMap & Tactical Vector Fallback
- **Visualization:** Recharts
- **Icons:** Lucide React
- **Persistence:** LocalStorage Service Layer
- **Audio:** Web Audio API Frequency Oscillator

---

## 📦 Running Locally

```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Run production build
npm run build
```
