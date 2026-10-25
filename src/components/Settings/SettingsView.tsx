import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Lock,
  RotateCcw,
  Cpu,
  Radio,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    thresholds,
    updateThresholds,
    currentRole,
    setCurrentRole,
    resetDemoData,
    showToast
  } = useApp();

  const [localDensityWarn, setLocalDensityWarn] = useState<number>(thresholds.densityWarning);
  const [localDensityCrit, setLocalDensityCrit] = useState<number>(thresholds.densityCritical);
  const [localSurgeCrit, setLocalSurgeCrit] = useState<number>(thresholds.growthRateCritical);
  const [localTempWarn, setLocalTempWarn] = useState<number>(thresholds.temperatureWarning);
  const [localAutoAlert, setLocalAutoAlert] = useState<boolean>(thresholds.autoAlertEnabled);
  const [localSoundAlert, setLocalSoundAlert] = useState<boolean>(thresholds.soundAlertsEnabled);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds({
      densityWarning: Number(localDensityWarn),
      densityCritical: Number(localDensityCrit),
      growthRateCritical: Number(localSurgeCrit),
      temperatureWarning: Number(localTempWarn),
      autoAlertEnabled: localAutoAlert,
      soundAlertsEnabled: localSoundAlert
    });
  };

  const roles: { role: UserRole; title: string; desc: string }[] = [
    {
      role: 'operator',
      title: 'Control Room Operator',
      desc: 'Monitors incoming alerts, updates incident status, and coordinates multi-agency dispatch.'
    },
    {
      role: 'commander',
      title: 'Incident Commander',
      desc: 'Authorizes high-level sector diversions, holding pen releases, and inter-agency SOP escalation.'
    },
    {
      role: 'medical',
      title: 'Medical Coordinator',
      desc: 'Dispatches ALS ambulances, manages field trauma triage cots, and monitors heatstroke alerts.'
    },
    {
      role: 'police',
      title: 'Police & Security Dispatcher',
      desc: 'Coordinates pontoon bridge cordons, gate turnstile throttle controls, and perimeter security.'
    },
    {
      role: 'field',
      title: 'Field Supervisor',
      desc: 'On-ground marshal lead with field mobile terminal for direct eye-witness reporting.'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* View Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            System Settings, Governance &amp; Architecture
          </h1>
          <p className="text-xs text-slate-500">
            Configure safety thresholds, switch simulated operational roles, and review privacy architecture.
          </p>
        </div>

        <button
          onClick={resetDemoData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo to Baseline</span>
        </button>
      </div>

      {/* GitHub Repository Sync & Export Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-blue-400 font-bold">
                Target Repository
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                deepakv07 / AI-Powered-Crowd-Intelligence-Emergency-Response-System
              </span>
            </div>
            <h2 className="text-base font-bold text-white">
              Export / Push Code to GitHub Repository
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              All source code, GIS map layers, explainable AI risk scoring engine, and resilient mesh communication components are packaged and ready to upload to your GitHub repository.
            </p>
          </div>

          <a
            href="/kumbhrakshak-project.zip"
            download="kumbhrakshak-full-project.zip"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors shrink-0"
          >
            <FileCheck className="w-4 h-4" />
            <span>Download Project ZIP</span>
          </a>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
            Option A — Push to GitHub from Terminal (1-Minute Setup):
          </span>
          <pre className="font-mono text-[11px] text-emerald-400 bg-black/60 p-2.5 rounded overflow-x-auto selection:bg-emerald-900">
{`# 1. Unzip or clone your repo locally
git clone https://github.com/deepakv07/AI-Powered-Crowd-Intelligence-Emergency-Response-System.git
cd AI-Powered-Crowd-Intelligence-Emergency-Response-System

# 2. Extract files into the folder and push
git add .
git commit -m "Add KumbhRakshak crowd safety and disaster response platform"
git push origin main`}
          </pre>
          <span className="text-slate-400 text-[11px] block">
            💡 Or reply with your GitHub Personal Access Token (`ghp_...` with <code>repo</code> write permission), and I can run the push command directly to your repository!
          </span>
        </div>
      </div>

      {/* Role Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Operational Role Simulator</h2>
          <p className="text-xs text-slate-500">
            Switch your active persona to test specialized privileges and workflow actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map(r => {
            const isActive = currentRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => {
                  setCurrentRole(r.role);
                  showToast(`Role switched to ${r.title}`, 'info');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-400'
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900">{r.title}</span>
                  {isActive && (
                    <span className="text-[10px] font-mono font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Thresholds Configuration Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Safety Thresholds &amp; Rule Engine Parameters</h2>
          <p className="text-xs text-slate-500">
            Calibrate automated triggers for early crowd-density warnings and environmental alerts.
          </p>
        </div>

        <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Crowd Density Warning Limit (people/m²)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="6.0"
                value={localDensityWarn}
                onChange={e => setLocalDensityWarn(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Triggers Moderate/High risk alerts when exceeded (Fruin Level D/E).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Crowd Density Critical Crush Limit (people/m²)
              </label>
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="8.0"
                value={localDensityCrit}
                onChange={e => setLocalDensityCrit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Immediately elevates zone risk score to Critical (Fruin Level F crowd stop).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                5-Minute Crowd Surge Velocity Threshold (%)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                max="50"
                value={localSurgeCrit}
                onChange={e => setLocalSurgeCrit(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Detects sudden procession influxes or train station arrivals.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Environmental Temperature Warning (°C)
              </label>
              <input
                type="number"
                step="0.5"
                min="30"
                max="50"
                value={localTempWarn}
                onChange={e => setLocalTempWarn(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
              />
              <span className="text-[10px] text-slate-400">
                Triggers heatstroke and dehydration prevention protocols.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localAutoAlert}
                onChange={e => setLocalAutoAlert(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-800">
                Enable Automated Rule-Based Alert Ingestion
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localSoundAlert}
                onChange={e => setLocalSoundAlert(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-800">
                Enable Web Audio Synthesized Chime for Critical Alerts
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-xs"
            >
              Save Calibration Settings
            </button>
          </div>
        </form>
      </div>

      {/* Privacy, Ethics & Non-Biometric Architecture Notice (Section 17) */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
          <Shield className="w-4 h-4" />
          <span>Privacy, Civil Liberties &amp; Data Ethics Notice</span>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            <strong>No Facial Recognition or Individual Tracking:</strong> KumbhRakshak is strictly architected on anonymous aggregate crowd physics (spatial optical flow and density estimation per square meter). The system does not identify individuals, scan faces, or store biometric credentials.
          </p>
          <p>
            <strong>Simulated Healthcare &amp; Incident Records:</strong> All medical triage, lost-and-found records, and dispatch calls in this prototype are synthetic illustrative data. No real personal health information (PHI) is processed or retained.
          </p>
          <p>
            <strong>Production Security Requirements:</strong> Operational deployment requires strict RBAC (Role-Based Access Control), cryptographic device signing for LoRa/ESP32 gateways, end-to-end TLS encryption, and immutable audit logging compliant with national emergency management protocols.
          </p>
        </div>
      </div>

      {/* Hardware & Future API Integration Architecture (Section 18) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Cpu className="w-4 h-4 text-slate-700" />
          <span>Future Hardware &amp; Backend API Integration Hooks</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          The prototype service layer is decoupled from UI components. To connect live field hardware:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 font-mono text-[11px]">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block font-sans">
              1. ESP32 &amp; LoRaWAN Gateway Integration
            </span>
            <p className="text-slate-500 font-sans">
              MQTT topic: <code className="text-blue-700">kumbh/nodes/{'{node_id}'}/telemetry</code>
            </p>
            <p className="text-slate-500 font-sans">
              Ingests battery voltage, packet SNR, temperature, and pyroelectric sensor flags.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block font-sans">
              2. Fast CCTV Crowd Ingress Inference
            </span>
            <p className="text-slate-500 font-sans">
              REST endpoint: <code className="text-blue-700">POST /api/v1/zones/{'{zone_id}'}/density</code>
            </p>
            <p className="text-slate-500 font-sans">
              Compatible with YOLOv8-crowd or CSRNet head-count estimation pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
