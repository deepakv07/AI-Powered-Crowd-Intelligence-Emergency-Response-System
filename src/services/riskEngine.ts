import { Incident, MonitoringZone, RiskFactor, RiskLevel } from '../types';

export interface RiskCalculationResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  recommendedAction: string;
  isOverrideTriggered: boolean;
}

/**
 * KumbhRakshak Explainable Risk Engine
 * Multi-factor probabilistic risk scoring algorithm for mass-gathering crowd safety.
 * Calibrated against standard crowd dynamics thresholds (Fruin Level of Service, Still crowd density safety norms).
 */
export function calculateZoneRisk(
  zone: Omit<MonitoringZone, 'riskScore' | 'riskLevel' | 'riskFactors' | 'recommendedAction'>,
  activeZoneIncidents: Incident[] = []
): RiskCalculationResult {
  const factors: RiskFactor[] = [];

  // Factor 1: Density relative to safety threshold (Weight: 35%)
  // Normal safety limit is ~2.5 - 3.5 p/m2. >4.5 p/m2 indicates severe crush risk.
  const densityRatio = zone.density / (zone.safetyThreshold || 3.0);
  let densityScore = Math.min(100, Math.round(densityRatio * 50));
  if (zone.density >= 5.0) densityScore = 100;
  else if (zone.density >= 4.0) densityScore = Math.max(80, densityScore);
  else if (zone.density <= 1.5) densityScore = Math.min(25, densityScore);

  factors.push({
    name: 'Crowd Density vs Capacity Limit',
    score: densityScore,
    weight: 0.35,
    contribution: Math.round(densityScore * 0.35),
    explanation: `${zone.density.toFixed(1)} people/m² (Threshold: ${zone.safetyThreshold.toFixed(1)} p/m² - ${(densityRatio * 100).toFixed(0)}% of safe limit)`
  });

  // Factor 2: Growth Rate & Surge Velocity (Weight: 15%)
  // Rapid growth (>15% in 5 min) indicates unexpected surge or incoming procession
  let growthScore = 0;
  if (zone.growthRate > 30) growthScore = 100;
  else if (zone.growthRate > 20) growthScore = 80;
  else if (zone.growthRate > 10) growthScore = 55;
  else if (zone.growthRate > 0) growthScore = Math.round(zone.growthRate * 4);
  else growthScore = 5; // stable or decreasing

  factors.push({
    name: 'Crowd Surge & Inflow Velocity',
    score: growthScore,
    weight: 0.15,
    contribution: Math.round(growthScore * 0.15),
    explanation: `${zone.growthRate > 0 ? '+' : ''}${zone.growthRate.toFixed(1)}% count change over 5-min rolling observation`
  });

  // Factor 3: Movement Speed & Counterflow Irregularity (Weight: 20%)
  // Slow movement (<0.4 m/s) coupled with high irregularity indicates turbulent counterflow
  let velocityScore = 0;
  if (zone.movementSpeed < 0.3 && zone.movementIrregularity > 60) {
    velocityScore = 95;
  } else if (zone.movementSpeed < 0.5 && zone.movementIrregularity > 40) {
    velocityScore = 75;
  } else {
    velocityScore = Math.round(
      zone.movementIrregularity * 0.6 + Math.max(0, (1.2 - zone.movementSpeed) * 40)
    );
  }
  velocityScore = Math.min(100, Math.max(0, velocityScore));

  factors.push({
    name: 'Flow Turbulence & Counterflow',
    score: velocityScore,
    weight: 0.20,
    contribution: Math.round(velocityScore * 0.20),
    explanation: `Speed: ${zone.movementSpeed.toFixed(2)} m/s, Turbulence Index: ${zone.movementIrregularity}%`
  });

  // Factor 4: Environmental & Microclimate Stress (Weight: 15%)
  // High ambient temp (>38C) + high humidity creates severe heat exhaustion & panic risk
  let heatScore = 10;
  if (zone.temperature >= 42) heatScore = 90;
  else if (zone.temperature >= 38) heatScore = 70;
  else if (zone.temperature >= 34) heatScore = 45;
  else heatScore = 15;

  if (zone.humidity > 80 && zone.temperature > 32) {
    heatScore = Math.min(100, heatScore + 15);
  }

  factors.push({
    name: 'Environmental Heat & Biometeorology',
    score: heatScore,
    weight: 0.15,
    contribution: Math.round(heatScore * 0.15),
    explanation: `${zone.temperature.toFixed(1)}°C, ${zone.humidity.toFixed(0)}% RH (Heat index stress)`
  });

  // Factor 5: Confirmed Active Incidents in Zone (Weight: 15%)
  const unresolvedIncidents = activeZoneIncidents.filter(inc => inc.status !== 'Resolved');
  let incidentScore = 0;
  if (unresolvedIncidents.some(i => i.priority === 'Critical')) incidentScore = 100;
  else if (unresolvedIncidents.some(i => i.priority === 'High')) incidentScore = 75;
  else if (unresolvedIncidents.length > 1) incidentScore = 50;
  else if (unresolvedIncidents.length === 1) incidentScore = 30;

  factors.push({
    name: 'Active Zone Incidents & Dispatches',
    score: incidentScore,
    weight: 0.15,
    contribution: Math.round(incidentScore * 0.15),
    explanation: `${unresolvedIncidents.length} active emergency incidents registered in this sector`
  });

  // Calculate weighted aggregate baseline
  let rawScore = factors.reduce((sum, f) => sum + f.contribution, 0);

  // Critical Incident Overrides:
  // Requirement: "A verified fire or other critical incident must be allowed to override a low aggregate score and generate an urgent alert."
  let isOverrideTriggered = false;
  if (zone.smokeDetected || zone.fireRiskLevel === 'Critical') {
    isOverrideTriggered = true;
    rawScore = Math.max(88, rawScore);
    factors.unshift({
      name: 'CRITICAL OVERRIDE: Smoke / Fire Sensor Triggered',
      score: 95,
      weight: 1.0,
      contribution: 95,
      explanation: 'Smoke detected by sensor node; overrides baseline score to force immediate priority action',
      isOverrideTriggered: true
    });
  } else if (unresolvedIncidents.some(i => i.type === 'Potential Crowd Crush' || i.type === 'Blocked Evacuation Route')) {
    isOverrideTriggered = true;
    rawScore = Math.max(82, rawScore);
    factors.unshift({
      name: 'CRITICAL OVERRIDE: Active Stampede / Evacuation Blockage Hazard',
      score: 90,
      weight: 1.0,
      contribution: 90,
      explanation: 'Confirmed high-priority incident on critical ingress/egress corridor',
      isOverrideTriggered: true
    });
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Categorize risk level
  let level: RiskLevel = 'Low';
  let recommendedAction = 'Routine surveillance; maintain standard ghat patrolling.';

  if (finalScore >= 75) {
    level = 'Critical';
    if (zone.smokeDetected) {
      recommendedAction = 'Deploy immediate Fire & Rescue tender, sound area klaxon, open evacuation gates.';
    } else if (zone.density >= 4.5) {
      recommendedAction = 'Halt upstream ingress barriers. Divert crowd via alternate ghat bypass. Dispatch Rapid Response Police.';
    } else {
      recommendedAction = 'Execute emergency protocol: Deploy crowd-dispersal units, broadcast PA instructions.';
    }
  } else if (finalScore >= 50) {
    level = 'High';
    recommendedAction = 'Restrict gate entry; activate holding areas; alert nearest medical first-aid team; prepare dynamic diversion.';
  } else if (finalScore >= 25) {
    level = 'Moderate';
    recommendedAction = 'Elevate monitoring cadence; inspect exit choke points; stage water distribution teams.';
  }

  return {
    score: finalScore,
    level,
    factors,
    recommendedAction,
    isOverrideTriggered
  };
}
