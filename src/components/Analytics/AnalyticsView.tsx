import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  Activity,
  Users,
  Ambulance,
  Radio,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  exportFullOperationalReport,
  exportIncidentsToCSV,
  exportZoneAnalyticsToCSV
} from '../../services/storageService';

export const AnalyticsView: React.FC = () => {
  const { zones, incidents, alerts, nodes, responseUnits } = useApp();
  const [timeRange, setTimeRange] = useState<string>('today');

  // Incidents by Severity
  const severityCounts = {
    Critical: incidents.filter(i => i.priority === 'Critical').length,
    High: incidents.filter(i => i.priority === 'High').length,
    Medium: incidents.filter(i => i.priority === 'Medium').length,
    Low: incidents.filter(i => i.priority === 'Low').length
  };
  const severityChartData = [
    { name: 'Critical', value: severityCounts.Critical, color: '#dc2626' },
    { name: 'High', value: severityCounts.High, color: '#ea580c' },
    { name: 'Medium', value: severityCounts.Medium, color: '#d97706' },
    { name: 'Low', value: severityCounts.Low, color: '#2563eb' }
  ];

  // Incidents by Zone
  const zoneIncidentCounts = zones.map(z => ({
    name: z.sector,
    incidents: incidents.filter(i => i.zoneId === z.id).length,
    riskScore: z.riskScore
  }));

  // Incidents by Category
  const catMap: Record<string, number> = {};
  incidents.forEach(inc => {
    catMap[inc.type] = (catMap[inc.type] || 0) + 1;
  });
  const categoryData = Object.entries(catMap).map(([cat, count]) => ({
    name: cat.replace('Emergency', '').replace('Report', '').trim(),
    count
  }));

  // Response Unit Fleet Utilisation
  const unitStats = {
    Available: responseUnits.filter(u => u.status === 'Available').length,
    Dispatched: responseUnits.filter(u => u.status === 'Dispatched' || u.status === 'Responding').length,
    Busy: responseUnits.filter(u => u.status === 'Busy').length,
    Offline: responseUnits.filter(u => u.status === 'Offline').length
  };
  const unitChartData = [
    { name: 'Available', value: unitStats.Available, color: '#10b981' },
    { name: 'Dispatched', value: unitStats.Dispatched, color: '#3b82f6' },
    { name: 'Busy', value: unitStats.Busy, color: '#f59e0b' },
    { name: 'Offline', value: unitStats.Offline, color: '#64748b' }
  ];

  // Alert Stats
  const totalAlerts = alerts.length;
  const ackedAlerts = alerts.filter(a => a.acknowledged).length;
  const ackPercentage = totalAlerts > 0 ? Math.round((ackedAlerts / totalAlerts) * 100) : 100;

  // Node Uptime %
  const onlineNodes = nodes.filter(n => n.connectivityStatus === 'Online' || n.connectivityStatus === 'Reconnected').length;
  const nodeUptime = Math.round((onlineNodes / nodes.length) * 100);

  return (
    <div className="space-y-6">
      {/* View Header with Date Filter and Export Buttons */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Analytics, Post-Disaster Audit &amp; Reports
          </h1>
          <p className="text-xs text-slate-500">
            Export official situation reports, incident logs, and sectoral risk histories for administrative evaluation.
          </p>
        </div>

        {/* Date Filter & Export Group */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-medium"
            >
              <option value="today">Today (Active Maha Snan)</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
            </select>
          </div>

          <button
            onClick={() => exportIncidentsToCSV(incidents)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Incidents CSV</span>
          </button>

          <button
            onClick={() => exportZoneAnalyticsToCSV(zones)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Zone Risk CSV</span>
          </button>

          <button
            onClick={() => exportFullOperationalReport(zones, incidents, alerts, nodes)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Situation Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Alert Ack Rate</span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1">
            {ackPercentage}%
          </div>
          <span className="text-[11px] text-slate-500">
            {ackedAlerts} of {totalAlerts} acknowledged
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Fleet Deployment Rate</span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1">
            {Math.round(((unitStats.Dispatched + unitStats.Busy) / responseUnits.length) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500">
            {unitStats.Dispatched + unitStats.Busy} active missions
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">LoRa Mesh Node Uptime</span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1">
            {nodeUptime}%
          </div>
          <span className="text-[11px] text-slate-500">
            {onlineNodes} of {nodes.length} nodes active
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Avg Resolution Time</span>
          <div className="font-mono text-2xl font-bold text-slate-900 mt-1">
            18.4 <span className="text-xs font-normal text-slate-500">mins</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Benchmark: under 25 mins
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Incidents by Priority */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Incidents by Priority</h2>
          <p className="text-xs text-slate-500 mb-4">Severity distribution across all registered events</p>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fleet Utilisation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Response Fleet Utilisation</h2>
          <p className="text-xs text-slate-500 mb-4">Readiness vs active field mission commitments</p>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={unitChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {unitChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incidents by Sector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Incidents by Sector</h2>
          <p className="text-xs text-slate-500 mb-4">Event frequency across monitored ghat sectors</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneIncidentCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="incidents" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Incidents by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Incidents by Type</h2>
          <p className="text-xs text-slate-500 mb-4">Occurrence breakdown by emergency category</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
