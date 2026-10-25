import React from 'react';
import {
  Bell,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldAlert,
  Flame,
  Radio,
  Users,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    activeTab,
    alerts,
    isSimulationRunning,
    toggleSimulationRunning,
    startEmergencyScenario,
    resetDemoData,
    thresholds,
    updateThresholds,
    currentRole,
    setCurrentRole,
    activeSite,
    allSites,
    setActiveSiteId,
    setActiveTab,
    injectQuickEvent
  } = useApp();

  const unackAlerts = alerts.filter(a => !a.acknowledged);

  const tabLabels: Record<string, string> = {
    command: 'Command Centre',
    map: 'Live GIS Risk Map',
    intelligence: 'Crowd Intelligence',
    incidents: 'Emergency Incidents',
    medical: 'Medical & Rescue',
    alerts: 'Alerts & Notifications',
    connectivity: 'Connectivity Status',
    analytics: 'Analytics & Reports',
    settings: 'System & Roles'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-6 shadow-xs">
      {/* Zone 1: Brand and Breadcrumb */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-xs">
            KR
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
              KumbhRakshak
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline whitespace-nowrap">
              Disaster Mitigation &amp; Crowd Safety
            </span>
          </div>
        </div>

        <span className="text-slate-300 hidden md:inline">|</span>

        {/* Site Selector Dropdown */}
        <div className="relative hidden lg:flex items-center">
          <Compass className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <select
            value={activeSite.id}
            onChange={e => setActiveSiteId(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            title="Switch Gathering Demonstration Site"
          >
            {allSites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-300 hidden xl:inline">/</span>
        <span className="text-xs font-semibold text-slate-600 hidden xl:inline">
          {tabLabels[activeTab] || 'Operational Console'}
        </span>
      </div>

      {/* Zone 2: Simulation Controls & Quick Injections */}
      <div className="hidden md:flex items-center gap-2">
        {/* Play/Pause Simulation Ticker */}
        <button
          onClick={toggleSimulationRunning}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
            isSimulationRunning
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title={isSimulationRunning ? 'Pause Crowd Fluctuation Simulation' : 'Resume Simulation'}
        >
          {isSimulationRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulation Live</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulation Paused</span>
            </>
          )}
        </button>

        {/* Quick Injections Dropdown */}
        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50 text-xs text-slate-700">
          <span className="px-2 py-1 text-[11px] font-medium text-slate-500 border-r border-slate-200">
            Inject:
          </span>
          <button
            onClick={() => injectQuickEvent('crowd-surge')}
            className="px-2 py-1 hover:bg-slate-200 flex items-center gap-1 transition-colors"
            title="Inject Crowd Surge at Sangam Ghat"
          >
            <Users className="w-3 h-3 text-orange-600" />
            <span className="hidden xl:inline">Surge</span>
          </button>
          <button
            onClick={() => injectQuickEvent('smoke')}
            className="px-2 py-1 hover:bg-slate-200 flex items-center gap-1 border-l border-slate-200 transition-colors"
            title="Inject Smoke Sensor Alert"
          >
            <Flame className="w-3 h-3 text-red-600" />
            <span className="hidden xl:inline">Smoke</span>
          </button>
          <button
            onClick={() => injectQuickEvent('node-outage')}
            className="px-2 py-1 hover:bg-slate-200 flex items-center gap-1 border-l border-slate-200 transition-colors"
            title="Simulate LoRa Node Blackout"
          >
            <Radio className="w-3 h-3 text-slate-600" />
            <span className="hidden xl:inline">Blackout</span>
          </button>
        </div>

        {/* Audio Alert Toggle */}
        <button
          onClick={() => updateThresholds({ soundAlertsEnabled: !thresholds.soundAlertsEnabled })}
          className={`p-1.5 rounded-md border text-xs transition-colors ${
            thresholds.soundAlertsEnabled
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
          title={thresholds.soundAlertsEnabled ? 'Sound alert tone enabled' : 'Sound alert tone disabled (click to enable)'}
        >
          {thresholds.soundAlertsEnabled ? (
            <Volume2 className="w-4 h-4 text-blue-700" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Reset State */}
        <button
          onClick={resetDemoData}
          className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Reset demonstration data to default baseline"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: Primary Action & Role & Alert Badge */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Unacknowledged Alerts Icon */}
        <button
          onClick={() => setActiveTab('alerts')}
          className="relative p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          title={`${unackAlerts.length} unacknowledged alerts`}
        >
          <Bell className="w-4 h-4" />
          {unackAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unackAlerts.length}
            </span>
          )}
        </button>

        {/* Active Role Selector */}
        <select
          value={currentRole}
          onChange={e => setCurrentRole(e.target.value as UserRole)}
          className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 hidden sm:block cursor-pointer"
          title="Switch Active Simulated Operations Role"
        >
          <option value="operator">Role: Control Operator</option>
          <option value="commander">Role: Incident Commander</option>
          <option value="medical">Role: Medical Coordinator</option>
          <option value="police">Role: Police Dispatch</option>
          <option value="field">Role: Field Supervisor</option>
        </select>

        {/* Primary CTA: Run Emergency Simulation */}
        <button
          onClick={startEmergencyScenario}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-md font-semibold text-xs transition-colors shadow-xs active:scale-95 whitespace-nowrap"
          title="Start 10-Step End-to-End Coordinated Emergency Drill"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Run Emergency Simulation</span>
        </button>
      </div>
    </header>
  );
};
