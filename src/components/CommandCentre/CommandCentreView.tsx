import React from 'react';
import {
  Users,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Ambulance,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Play,
  Pause
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const CommandCentreView: React.FC = () => {
  const {
    zones,
    incidents,
    responseUnits,
    alerts,
    nodes,
    isSimulationRunning,
    toggleSimulationRunning,
    startEmergencyScenario,
    setActiveTab,
    setSelectedZoneId,
    setSelectedIncidentId,
    injectQuickEvent
  } = useApp();

  // Metrics
  const totalCrowdEstimate = zones.reduce((sum, z) => sum + z.currentCount, 0);
  const highDensityZones = zones.filter(z => z.density >= z.safetyThreshold);
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
  const criticalIncidents = activeIncidents.filter(i => i.priority === 'Critical' || i.priority === 'High');
  const availableUnits = responseUnits.filter(u => u.status === 'Available');
  const criticalAlerts = alerts.filter(a => !a.acknowledged && (a.severity === 'Critical' || a.severity === 'High'));
  const onlineNodes = nodes.filter(n => n.connectivityStatus === 'Online');

  // Sorted Highest-Risk Areas
  const highestRiskZones = [...zones].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  // Time-series demonstration curve for Sangam crowd density (past 6 hours)
  const densityTrendData = [
    { time: '12:00', density: 2.1, count: 38000, safeLimit: 3.0 },
    { time: '13:00', density: 2.4, count: 44000, safeLimit: 3.0 },
    { time: '14:00', density: 2.8, count: 52000, safeLimit: 3.0 },
    { time: '15:00', density: 3.1, count: 58000, safeLimit: 3.0 },
    { time: '16:00', density: 3.4, count: 62400, safeLimit: 3.0 },
    { time: '17:00 (Current)', density: zones[0]?.density || 3.4, count: zones[0]?.currentCount || 62400, safeLimit: 3.0 }
  ];

  // Category breakdown for incidents
  const incidentCategoryCounts: Record<string, number> = {};
  incidents.forEach(inc => {
    incidentCategoryCounts[inc.type] = (incidentCategoryCounts[inc.type] || 0) + 1;
  });
  const incidentChartData = Object.entries(incidentCategoryCounts).map(([cat, count]) => ({
    name: cat.replace('Emergency', '').replace('Report', '').trim(),
    count
  }));

  const riskLevelsCount = {
    Critical: zones.filter(z => z.riskLevel === 'Critical').length,
    High: zones.filter(z => z.riskLevel === 'High').length,
    Moderate: zones.filter(z => z.riskLevel === 'Moderate').length,
    Low: zones.filter(z => z.riskLevel === 'Low').length
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Moderate':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Scenario Trigger Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-blue-400 font-semibold">
              Live Operations Control Room
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">
              Prayagraj Triveni Sangam Sector Command
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Kumbh Mela Smart Crowd Safety &amp; Disaster Mitigation Dashboard
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl">
            Coordinated GIS spatial risk analytics, rule-based crowd-crush early warning engine, and resilient mesh communication monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggleSimulationRunning}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              isSimulationRunning
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-750'
                : 'bg-amber-900/60 border-amber-700 text-amber-200 hover:bg-amber-900'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulationRunning ? 'Pause Engine' : 'Resume Engine'}</span>
          </button>

          <button
            onClick={startEmergencyScenario}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-sm active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Run Emergency Drill</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (6 Metric Cards as specified) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Estimated Crowd */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Estimated Crowd</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {totalCrowdEstimate.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Across 8 Sectors</span>
          </div>
        </div>

        {/* Card 2: High Density Zones */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Overcrowded Zones</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {highDensityZones.length}{' '}
            <span className="text-xs font-normal text-slate-500">/ {zones.length}</span>
          </div>
          <div className="text-[11px] text-orange-700 font-medium mt-1">
            {highDensityZones.length > 0 ? 'Exceeding 3.0 p/m²' : 'All within safe limits'}
          </div>
        </div>

        {/* Card 3: Active Incidents */}
        <div
          onClick={() => setActiveTab('incidents')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Active Incidents</span>
            <Activity className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {activeIncidents.length}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            {criticalIncidents.length} Critical / High Priority
          </div>
        </div>

        {/* Card 4: Available Units */}
        <div
          onClick={() => setActiveTab('medical')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Response Units</span>
            <Ambulance className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {availableUnits.length}{' '}
            <span className="text-xs font-normal text-slate-500">/ {responseUnits.length}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Available for immediate dispatch
          </div>
        </div>

        {/* Card 5: Critical Alerts */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Urgent Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {criticalAlerts.length}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            Requires operator acknowledgement
          </div>
        </div>

        {/* Card 6: Connected Mesh Nodes */}
        <div
          onClick={() => setActiveTab('connectivity')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Resilient Mesh Nodes</span>
            <Radio className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 tabular-nums">
            {onlineNodes.length}{' '}
            <span className="text-xs font-normal text-slate-500">/ {nodes.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            LoRa &amp; satellite backhaul
          </div>
        </div>
      </div>

      {/* Main Grid: Live Charts and Highest Risk Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Crowd Density Trend & Incidents Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          {/* Chart 1: Crowd Density Over Time */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Sector 1 (Sangam Ghat) Crowd Density Timeline
                </h2>
                <p className="text-xs text-slate-500">
                  Observed density vs 3.0 people/m² critical safety threshold
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Density (p/m²)
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
                  Safety Limit (3.0)
                </span>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={densityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="density"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#densityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Sensor observation interval: 30 seconds</span>
              <span className="font-mono">Last sync: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Chart 2 & Risk Distribution Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Distribution Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Risk Distribution Across Sectors
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Current severity classification for all 8 monitored sectors
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-rose-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600" />
                      Critical (Score 75–100)
                    </span>
                    <span className="font-mono font-bold text-slate-900">{riskLevelsCount.Critical} sectors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full transition-all"
                      style={{ width: `${(riskLevelsCount.Critical / zones.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-orange-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      High (Score 50–74)
                    </span>
                    <span className="font-mono font-bold text-slate-900">{riskLevelsCount.High} sectors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${(riskLevelsCount.High / zones.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Moderate (Score 25–49)
                    </span>
                    <span className="font-mono font-bold text-slate-900">{riskLevelsCount.Moderate} sectors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{ width: `${(riskLevelsCount.Moderate / zones.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      Low (Score 0–24)
                    </span>
                    <span className="font-mono font-bold text-slate-900">{riskLevelsCount.Low} sectors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${(riskLevelsCount.Low / zones.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Incidents by Category Chart */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                Incidents by Category
              </h2>
              <p className="text-xs text-slate-500 mb-2">
                Active &amp; recent emergency dispatch classifications
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentChartData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      angle={-15}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {incidentChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#60a5fa'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Highest Risk Zones & Fast Dispatch */}
        <div className="space-y-5">
          {/* Highest-Risk Areas Ranking */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Highest-Risk Areas</h2>
                <p className="text-xs text-slate-500">Prioritized by AI risk calculation</p>
              </div>
              <button
                onClick={() => setActiveTab('intelligence')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Full Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {highestRiskZones.map(zone => (
                <div
                  key={zone.id}
                  onClick={() => {
                    setSelectedZoneId(zone.id);
                    setActiveTab('map');
                  }}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {zone.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{zone.density.toFixed(1)} p/m²</span>
                        <span>·</span>
                        <span>{zone.currentCount.toLocaleString()} pilgrims</span>
                        <span>·</span>
                        <span>{zone.growthRate > 0 ? `+${zone.growthRate}%` : `${zone.growthRate}%`}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold font-mono border ${getRiskBadgeColor(
                          zone.riskLevel
                        )}`}
                      >
                        {zone.riskScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                    Action: {zone.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Scenario Injection Shortcuts */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Simulation Injections
            </h2>
            <p className="text-[11px] text-slate-500 mb-3">
              Trigger instant real-time events to test platform response:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => injectQuickEvent('crowd-surge')}
                className="p-2 rounded bg-white border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-slate-800 text-left font-medium transition-colors flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5 text-orange-600" />
                <span>Crowd Surge</span>
              </button>

              <button
                onClick={() => injectQuickEvent('medical')}
                className="p-2 rounded bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-left font-medium transition-colors flex items-center gap-2"
              >
                <Ambulance className="w-3.5 h-3.5 text-blue-600" />
                <span>Medical Triage</span>
              </button>

              <button
                onClick={() => injectQuickEvent('smoke')}
                className="p-2 rounded bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50/50 text-slate-800 text-left font-medium transition-colors flex items-center gap-2"
              >
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span>Smoke Alarm</span>
              </button>

              <button
                onClick={() => injectQuickEvent('node-outage')}
                className="p-2 rounded bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 text-left font-medium transition-colors flex items-center gap-2"
              >
                <Radio className="w-3.5 h-3.5 text-slate-700" />
                <span>Mesh Blackout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Emergency Events & Active Units Quick Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Events */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Recent Incidents &amp; Alerts</h2>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All ({incidents.length})
            </button>
          </div>

          <div className="space-y-2">
            {incidents.slice(0, 4).map(inc => (
              <div
                key={inc.id}
                onClick={() => {
                  setSelectedIncidentId(inc.id);
                  setActiveTab('incidents');
                }}
                className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{inc.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-800 truncate">{inc.type}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500 truncate">{inc.zoneName}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{inc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                      inc.status === 'Resolved'
                        ? 'bg-slate-100 text-slate-600'
                        : inc.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Team Availability Status */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Field Response Teams Status</h2>
            <button
              onClick={() => setActiveTab('medical')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Manage Units ({responseUnits.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {responseUnits.slice(0, 6).map(unit => (
              <div
                key={unit.id}
                className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-900 truncate">{unit.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{unit.currentZone}</div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold uppercase shrink-0 ${
                    unit.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : unit.status === 'Dispatched'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {unit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
