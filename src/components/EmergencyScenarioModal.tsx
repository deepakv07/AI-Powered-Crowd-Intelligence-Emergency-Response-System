import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  X,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EmergencyScenarioModal: React.FC = () => {
  const {
    isScenarioModalOpen,
    scenarioStep,
    advanceEmergencyScenario,
    closeEmergencyScenario,
    resetDemoData
  } = useApp();

  if (!isScenarioModalOpen) return null;

  const stepsInfo = [
    {
      num: 1,
      title: 'Crowd Surge Influx at Sangam Steps',
      desc: 'Rapid crowd density increase simulated at Sector 1 (Triveni Sangam). Inflow surge reaches +26%/5min and density climbs to 4.6 p/m².'
    },
    {
      num: 2,
      title: 'Multi-Factor Risk Engine Escalation',
      desc: 'Explainable AI risk calculation flags the zone as CRITICAL (Risk Score 88/100). Safety capacity limits breached.'
    },
    {
      num: 3,
      title: 'High-Priority Warning Generated',
      desc: 'Automated crowd-congestion & potential crush hazard alert ALT-DRILL-01 generated and dispatched to operations console.'
    },
    {
      num: 4,
      title: 'Command Centre Dashboard Synchronizes',
      desc: 'Real-time KPI metric cards, high-density count, and sectoral risk heat indicators reflect emergency state across the board.'
    },
    {
      num: 5,
      title: 'Interactive GIS Map Highlights Sector',
      desc: 'GIS Risk Map pans and pulses critical red boundary around Sangam Ghat, with recommended diversion route Alpha highlighted.'
    },
    {
      num: 6,
      title: 'Incident Creation & Unit POL-01 Dispatch',
      desc: 'Incident logged in Incident Management system; Rapid Police Platoon 01 dispatched to manage flow barriers.'
    },
    {
      num: 7,
      title: 'Simulate LoRa Gateway Link Outage',
      desc: 'Cellular & primary backhaul connection at Gateway Alpha interrupted. Node enters offline disconnected state.'
    },
    {
      num: 8,
      title: 'Resilient Local Message Queued',
      desc: 'Critical field reinforcement message is safely held in node store-and-forward buffer rather than dropped.'
    },
    {
      num: 9,
      title: 'Link Restored & Queued Packets Delivered',
      desc: 'Mesh communication link recovered; buffered emergency message delivered immediately with zero packet loss.'
    },
    {
      num: 10,
      title: 'Incident Resolution & Stabilization',
      desc: 'Barriers deployed, crowd dispersed to holding areas, incident marked Resolved, and risk score returns to safe moderate baseline.'
    }
  ];

  const currentStepData = stepsInfo[scenarioStep - 1] || stepsInfo[0];
  const isFinished = scenarioStep >= 10;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Coordinated Emergency Response Drill
              </h2>
              <p className="text-xs text-slate-400">
                10-Step End-to-End Simulation Walkthrough
              </p>
            </div>
          </div>
          <button
            onClick={closeEmergencyScenario}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {stepsInfo.map(s => (
            <div
              key={s.num}
              className={`flex-1 h-full transition-all duration-300 ${
                s.num < scenarioStep
                  ? 'bg-blue-600'
                  : s.num === scenarioStep
                  ? 'bg-red-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Current Step Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Phase {scenarioStep} of 10
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Target: Sector 1 (Sangam Confluence)
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-2">
              {isFinished ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <span>{currentStepData.title}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentStepData.desc}
            </p>
          </div>

          {/* Drill Steps Scroller */}
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 border-t border-slate-100 pt-3">
            {stepsInfo.map(s => {
              const status =
                s.num < scenarioStep
                  ? 'completed'
                  : s.num === scenarioStep
                  ? 'current'
                  : 'pending';

              return (
                <div
                  key={s.num}
                  className={`flex items-start gap-2.5 p-2 rounded text-xs transition-colors ${
                    status === 'current'
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-900 font-medium'
                      : status === 'completed'
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="font-mono font-bold w-5 shrink-0">
                    {s.num < scenarioStep ? '✓' : `${s.num}.`}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold">{s.title}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              resetDemoData();
              closeEmergencyScenario();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={closeEmergencyScenario}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
            >
              Exit Drill
            </button>

            {!isFinished ? (
              <button
                onClick={advanceEmergencyScenario}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-1.5 rounded shadow-xs transition-colors"
              >
                <span>Trigger Next Step ({scenarioStep + 1}/10)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={closeEmergencyScenario}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-1.5 rounded shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Drill Complete — Dismiss</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
