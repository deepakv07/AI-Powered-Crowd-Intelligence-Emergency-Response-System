import React from 'react';
import {
  LayoutDashboard,
  Map,
  Users,
  AlertOctagon,
  Ambulance,
  Bell,
  Wifi,
  BarChart3,
  Sliders,
  Radio,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  badgeColor?: string;
  subtext?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, incidents, alerts, nodes, zones } = useApp();

  const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved').length;
  const criticalAlertsCount = alerts.filter(a => !a.acknowledged && (a.severity === 'Critical' || a.severity === 'High')).length;
  const offlineNodesCount = nodes.filter(n => n.connectivityStatus === 'Offline').length;
  const highRiskZonesCount = zones.filter(z => z.riskLevel === 'High' || z.riskLevel === 'Critical').length;

  const navItems: NavItem[] = [
    {
      id: 'command',
      label: 'Command Centre',
      icon: LayoutDashboard,
      subtext: 'Executive Overview'
    },
    {
      id: 'map',
      label: 'Live GIS Map',
      icon: Map,
      badgeCount: highRiskZonesCount > 0 ? highRiskZonesCount : undefined,
      badgeColor: 'text-orange-400 font-mono',
      subtext: 'Spatial Risk & Tracking'
    },
    {
      id: 'intelligence',
      label: 'Crowd Intelligence',
      icon: Users,
      subtext: 'AI Multi-Factor Scoring'
    },
    {
      id: 'incidents',
      label: 'Emergency Incidents',
      icon: AlertOctagon,
      badgeCount: activeIncidentsCount > 0 ? activeIncidentsCount : undefined,
      badgeColor: 'text-red-400 font-mono font-bold',
      subtext: 'Triage & Resolution'
    },
    {
      id: 'medical',
      label: 'Medical & Rescue',
      icon: Ambulance,
      subtext: 'Unit Dispatch & Staging'
    },
    {
      id: 'alerts',
      label: 'Alerts & Notifications',
      icon: Bell,
      badgeCount: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      badgeColor: 'text-rose-400 font-mono font-bold',
      subtext: 'Automated & Manual'
    },
    {
      id: 'connectivity',
      label: 'Connectivity Status',
      icon: Wifi,
      badgeCount: offlineNodesCount > 0 ? offlineNodesCount : undefined,
      badgeColor: 'text-amber-400 font-mono',
      subtext: 'Resilient LoRa Mesh'
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      subtext: 'Trends & CSV Export'
    },
    {
      id: 'settings',
      label: 'Settings & Roles',
      icon: Sliders,
      subtext: 'Thresholds & Audit'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Platform Title Lockup */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400">
              Operations Active
            </span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            Prayagraj
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <div className="flex flex-col truncate">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span
                    className={`text-[10px] leading-tight truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.subtext}
                  </span>
                </div>
              </div>

              {item.badgeCount !== undefined && (
                <span className={`text-[11px] ml-2 shrink-0 ${item.badgeColor || 'text-slate-300'}`}>
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operations Quick Telemetry Status in Footer */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>LoRa Nodes</span>
          </span>
          <span className="font-mono text-slate-300">
            {nodes.filter(n => n.connectivityStatus === 'Online').length}/{nodes.length} Up
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Risk Index</span>
          </span>
          <span className="font-mono text-slate-300">
            {highRiskZonesCount > 0 ? `${highRiskZonesCount} Sectors Flagged` : 'Nominal'}
          </span>
        </div>

        <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
          Aggregated crowd telemetry. Non-biometric.
        </div>
      </div>
    </aside>
  );
};
