import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Building2,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Plus,
  FileText,
  MapPin,
  Activity,
  Filter,
  Layers,
} from 'lucide-react';

// ── TYPES ──
interface KpiCardProps {
  title: string;
  value: string | number;
  subtext: string;
  trend: string;
  isPositive: boolean;
  icon: React.ReactNode;
  gradient: string;
}

interface StateMetric {
  name: string;
  units: number;
  coordinators: number;
  rolloutsActive: number;
  completionRate: number;
}

// ── KPI CARD COMPONENT ──
const KpiCard = ({ title, value, subtext, trend, isPositive, icon, gradient }: KpiCardProps) => (
  <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    {/* Decorative gradient corner */}
    <div
      className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] transition-transform duration-500 group-hover:scale-150`}
    />

    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
          {title}
        </span>
        <h3 className="text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
      </div>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-indigo-100`}
      >
        {icon}
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
      <span className="text-xs text-gray-500">{subtext}</span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
      >
        <TrendingUp className={`h-3.5 w-3.5 ${!isPositive && 'rotate-180'}`} />
        {trend}
      </span>
    </div>
  </div>
);

export default function Dashboard() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // ── STATIC METRIC DATA ──
  const kpis: KpiCardProps[] = [
    {
      title: 'Active Rollouts',
      value: '8 Active',
      subtext: '12 campaigns launched total',
      trend: '+15.4%',
      isPositive: true,
      icon: <Layers className="h-6 w-6" />,
      gradient: 'from-indigo-500 to-indigo-650',
    },
    {
      title: 'Program Units',
      value: '412 Units',
      subtext: '98.5% coordinator assignment',
      trend: '+8.2%',
      isPositive: true,
      icon: <Building2 className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Task Completion',
      value: '84.2%',
      subtext: '1,240 tasks closed',
      trend: '+12.1%',
      isPositive: true,
      icon: <CheckCircle2 className="h-6 w-6" />,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      title: 'Knowledge Base',
      value: '45 Items',
      subtext: '5 categories published',
      trend: '+4.8%',
      isPositive: true,
      icon: <BookOpen className="h-6 w-6" />,
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  const stateMetrics: StateMetric[] = [
    { name: 'Maharashtra', units: 185, coordinators: 182, rolloutsActive: 3, completionRate: 92 },
    { name: 'Gujarat', units: 92, coordinators: 90, rolloutsActive: 2, completionRate: 88 },
    { name: 'Rajasthan', units: 64, coordinators: 62, rolloutsActive: 1, completionRate: 85 },
    { name: 'Karnataka', units: 48, coordinators: 48, rolloutsActive: 1, completionRate: 94 },
    { name: 'Uttar Pradesh', units: 23, coordinators: 20, rolloutsActive: 1, completionRate: 79 },
  ];

  const tasksOverview = {
    total: 1472,
    pending: 120,
    inProgress: 312,
    completed: 980,
    closed: 60,
  };

  const recentRollouts = [
    {
      id: 'R-092',
      name: 'Q2 Clean India Sanitation Drive',
      unitsTargeted: 185,
      progress: 74,
      status: 'In Progress',
      plannedEnd: '25 Jun 2026',
      state: 'Maharashtra',
    },
    {
      id: 'R-091',
      name: 'National Blood Donation Fest 2026',
      unitsTargeted: 412,
      progress: 100,
      status: 'Completed',
      plannedEnd: '10 Jun 2026',
      state: 'All States',
    },
    {
      id: 'R-093',
      name: 'Cyber Security Awareness Campaign',
      unitsTargeted: 92,
      progress: 25,
      status: 'In Progress',
      plannedEnd: '18 Jul 2026',
      state: 'Gujarat',
    },
  ];

  const recentMediaResources = [
    {
      title: 'NSS Volunteer Training Manual 2.0',
      category: 'Training Material',
      format: 'PDF',
      date: '14 Jun 2026',
      views: 245,
    },
    {
      title: 'Standard Operating Guidelines (SOP) for Program Units',
      category: 'Guidelines',
      format: 'PDF',
      date: '10 Jun 2026',
      views: 480,
    },
    {
      title: 'Revised Budget and Grants Allocation notice',
      category: 'Notice',
      format: 'DOCX',
      date: '05 Jun 2026',
      views: 189,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER & QUICK ACTION ROW ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">National Dashboard</h1>
          <p className="text-sm text-gray-500">
            Real-time analytics and monitoring matrix across all states, program units, and
            campaigns
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
            <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
            System Live
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
            <Plus className="h-4 w-4" />
            Configure New Campaign
          </button>
        </div>
      </div>

      {/* ── KPI HIGHLIGHTS GRID ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} />
        ))}
      </div>

      {/* ── ANALYTICS DETAILS ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Tasks Portal & Rollout Progress */}
        <div className="space-y-6 lg:col-span-2">
          {/* ── TASK PORTAL METRIC CARD ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Tasks Portal Overview</h3>
                <p className="text-xs text-gray-500">
                  Breakdown of {tasksOverview.total} tasks assigned to coordinators
                </p>
              </div>
              <div className="text-indigo-650 rounded-xl bg-indigo-50 p-2">
                <LayoutDashboard className="h-4 w-4" />
              </div>
            </div>

            {/* Visual Progress Bars */}
            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    Completed Tasks
                  </span>
                  <span className="text-gray-900">
                    {tasksOverview.completed} / {tasksOverview.total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: `${(tasksOverview.completed / tasksOverview.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
                  <span className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                    In Progress
                  </span>
                  <span className="mt-1 block text-lg font-bold text-indigo-700">
                    {tasksOverview.inProgress}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
                  <span className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                    Pending
                  </span>
                  <span className="mt-1 block text-lg font-bold text-amber-600">
                    {tasksOverview.pending}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center">
                  <span className="block text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                    Closed
                  </span>
                  <span className="mt-1 block text-lg font-bold text-purple-700">
                    {tasksOverview.closed}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RECENT CAMPAIGNS LIST ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Active Rollouts & Progress</h3>
                <p className="text-xs text-gray-500">
                  Detailed campaign statuses and unit outreach
                </p>
              </div>
              <button className="text-indigo-650 flex items-center gap-1.5 text-xs font-semibold hover:underline">
                View All Campaigns <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              {recentRollouts.map((rollout) => (
                <div
                  key={rollout.id}
                  className="group flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-gray-400">
                        {rollout.id}
                      </span>
                      <h4 className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-indigo-600">
                        {rollout.name}
                      </h4>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" /> {rollout.state}
                      </span>
                      <span>•</span>
                      <span className="text-[11px]">{rollout.unitsTargeted} targeted units</span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-4">
                    <div className="w-24">
                      <div className="mb-1 flex justify-between text-[10px] text-gray-500">
                        <span>Progress</span>
                        <span className="font-semibold">{rollout.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full ${rollout.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-650'}`}
                          style={{ width: `${rollout.progress}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        rollout.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {rollout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: State distribution & Media Resources */}
        <div className="space-y-6">
          {/* ── STATE-WISE MATRIX TARGETING ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">State Metrics Matrix</h3>
                <p className="text-xs text-gray-500">NSS deployment metrics across key states</p>
              </div>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>

            <div className="mt-4 space-y-3">
              {stateMetrics.map((state) => (
                <button
                  key={state.name}
                  onClick={() => setSelectedState(selectedState === state.name ? null : state.name)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    selectedState === state.name
                      ? 'border-indigo-500 bg-indigo-50/30 shadow-sm'
                      : 'border-gray-100 hover:bg-gray-50/70'
                  }`}
                >
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{state.name}</span>
                    <div className="mt-0.5 flex gap-2 text-[10px] text-gray-500">
                      <span>{state.units} Units</span>
                      <span>•</span>
                      <span>{state.rolloutsActive} Active Rollout</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-700">
                      {state.completionRate}% completion
                    </span>
                    <div className="mt-1 text-[10px] font-medium text-emerald-600">
                      {state.coordinators}/{state.units} coordinators active
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── KNOWLEDGE BASE & RECENT RESOURCES ── */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Media & Guidelines</h3>
                <p className="text-xs text-gray-500">Latest publications in Media Corner</p>
              </div>
              <BookOpen className="h-4 w-4 text-amber-500" />
            </div>

            <div className="mt-4 space-y-4">
              {recentMediaResources.map((resource, idx) => (
                <div key={idx} className="group flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-xs leading-relaxed font-semibold text-gray-800 transition-colors group-hover:text-amber-700">
                      {resource.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[8px] text-gray-600 uppercase">
                        {resource.format}
                      </span>
                      <span>{resource.category}</span>
                      <span>•</span>
                      <span>{resource.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
