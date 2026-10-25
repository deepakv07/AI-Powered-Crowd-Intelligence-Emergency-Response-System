import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Flame,
  Thermometer,
  Droplets,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Info,
  MapPin,
  Compass
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { MonitoringZone } from '../../types';

export const CrowdIntelligenceView: React.FC = () => {
  const { zones, setSelectedZoneId, setActiveTab } = useApp();
  const [selectedZone, setSelectedZone] = useState<MonitoringZone>(zones[0] || {} as MonitoringZone);

  // Mock 24-hr historical risk trend for the selected zone
  const mockHistoricalTrend = [
    { time: '06:00', risk: 14, density: 1.2 },
    { time: '08:00', risk: 22, density: 1.8 },
    { time: '10:00', risk: 35, density: 2.3 },
    { time: '12:00', risk: 48, density: 2.9 },
    { time: '14:00', risk: 62, density: 3.3 },
    { time: '16:00', risk: 58, density: 3.1 },
    { time: 'Now', risk: selectedZone.riskScore, density: selectedZone.density }
  ];

  const getRiskBadge = (level: string) => {
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
      {/* Required Validation Notice */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-white text-sm">
            Explainable Decision-Support Model Notice:
          </span>
          <p className="text-slate-300 leading-relaxed">
            This module demonstrates an explainable, multi-factor decision-support prototype. It is not a certified stampede-prediction system and must not replace trained incident command personnel or physical safety protocols. Operational field deployment requires validated sensor hardware, dynamic crowd calibration, and empirical validation.
          </p>
        </div>
      </div>

      {/* Main Grid: Zone Selector & Active Telemetry Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sector List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Monitored Sectors</h2>
            <span className="text-xs text-slate-500 font-mono">{zones.length} active zones</span>
          </div>

          <div className="space-y-2">
            {zones.map(zone => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {zone.sector}: {zone.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getRiskBadge(
                        zone.riskLevel
                      )}`}
                    >
                      {zone.riskLevel} ({zone.riskScore})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 mt-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Density</span>
                      <span className="font-semibold text-slate-800">{zone.density.toFixed(1)} p/m²</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Surge</span>
                      <span className="font-semibold text-slate-800">
                        {zone.growthRate > 0 ? `+${zone.growthRate.toFixed(1)}%` : `${zone.growthRate.toFixed(1)}%`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Speed</span>
                      <span className="font-semibold text-slate-800">{zone.movementSpeed.toFixed(2)} m/s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle & Right Columns (2 spans): Deep Multi-Factor Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header of Selected Zone */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedZone.sector}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{selectedZone.siteId.toUpperCase()} Gathering Area</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedZone.name}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Composite Risk Score
                  </span>
                  <div className="font-mono text-2xl font-bold text-slate-900">
                    {selectedZone.riskScore}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedZoneId(selectedZone.id);
                    setActiveTab('map');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View on GIS</span>
                </button>
              </div>
            </div>

            {/* Current Sensor Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                  Crowd Density
                </span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {selectedZone.density.toFixed(1)} <span className="text-xs font-normal">p/m²</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Limit: {selectedZone.safetyThreshold.toFixed(1)} p/m²
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                  Movement Speed
                </span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {selectedZone.movementSpeed.toFixed(2)} <span className="text-xs font-normal">m/s</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Turbulence: {selectedZone.movementIrregularity}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                  Surge Rate (5m)
                </span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {selectedZone.growthRate > 0 ? `+${selectedZone.growthRate.toFixed(1)}%` : `${selectedZone.growthRate.toFixed(1)}%`}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedZone.currentCount.toLocaleString()} count
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">
                  Thermal / Smoke
                </span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {selectedZone.temperature.toFixed(1)}°C
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {selectedZone.smokeDetected ? 'Smoke Alert' : 'Sensors Clear'}
                </span>
              </div>
            </div>

            {/* Explainable Factor Weights Breakdown */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Explainable Risk Factor Contributions
                </h3>
                <span className="text-[11px] text-slate-500">
                  Multi-factor weighted sum (0–100 scale)
                </span>
              </div>

              <div className="space-y-3">
                {selectedZone.riskFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {factor.isOverride ? (
                          <span className="text-red-600 font-bold">⚡ {factor.name}</span>
                        ) : (
                          factor.name
                        )}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-slate-500">
                          Raw Score: <strong>{factor.score}</strong> (Weight {(factor.weight * 100).toFixed(0)}%)
                        </span>
                        <span className="text-slate-900 font-bold">
                          +{factor.contribution} pts
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          factor.isOverride
                            ? 'bg-rose-600'
                            : factor.score >= 75
                            ? 'bg-rose-500'
                            : factor.score >= 50
                            ? 'bg-orange-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, factor.score)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 italic block">
                      {factor.explanation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action Box */}
            <div className="mt-5 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-[11px] font-bold uppercase text-blue-900 block mb-0.5">
                Current Standard Operating Procedure (SOP):
              </span>
              <p className="text-xs text-blue-950 font-medium">
                {selectedZone.recommendedAction}
              </p>
            </div>
          </div>

          {/* Historical Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Historical Risk Score Progression ({selectedZone.sector})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hourly risk trajectory based on rolling observations
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistoricalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#ea580c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#riskGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
