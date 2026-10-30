import React from 'react';
import { TrendingUp, ArrowRight, ShieldAlert } from 'lucide-react';
import { Pie, PieChart, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';
import { cn } from '@/lib/utils';

export function AdminAnalyticsSection({ metrics }) {
  const {
    open = 0,
    inProgress = 0,
    waitingOnCustomer = 0,
    resolved = 0,
    overdue = 0,
    total = 0,
  } = metrics || {};

  // 1. Live Ticket Status Pie Data
  const chartData = [
    { status: 'open', label: 'Open', count: open, fill: '#2563eb' },
    { status: 'inProgress', label: 'In Progress', count: inProgress, fill: '#059669' },
    { status: 'waitingOnCustomer', label: 'Waiting Customer', count: waitingOnCustomer, fill: '#7c3aed' },
    { status: 'resolved', label: 'Resolved', count: resolved, fill: '#64748b' },
  ].filter((item) => item.count > 0);

  // Fallback if brand new or 0 tickets
  const displayData =
    chartData.length > 0
      ? chartData
      : [{ status: 'open', label: 'Open', count: 1, fill: '#2563eb' }];

  const chartConfig = {
    count: {
      label: 'Tickets',
    },
    open: {
      label: 'Open',
      color: '#2563eb',
    },
    inProgress: {
      label: 'In Progress',
      color: '#059669',
    },
    waitingOnCustomer: {
      label: 'Waiting on Customer',
      color: '#7c3aed',
    },
    resolved: {
      label: 'Resolved',
      color: '#64748b',
    },
  };

  const activeTotal = open + inProgress + waitingOnCustomer;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // 2. Flowchart Pipeline Stages
  const flowStages = [
    {
      id: 'open',
      title: '1. New & Triage',
      badge: 'Incoming',
      count: open,
      color: 'border-blue-200/80 bg-blue-50/60 text-blue-900',
      dotColor: 'bg-blue-600',
      description: 'Customer requests awaiting agent pickup or triage.',
      path: '/staff/tickets?status=OPEN',
    },
    {
      id: 'in_progress',
      title: '2. Under Investigation',
      badge: 'In Progress',
      count: inProgress,
      color: 'border-emerald-200/80 bg-emerald-50/60 text-emerald-900',
      dotColor: 'bg-emerald-600',
      description: 'Active tasks currently being resolved by assigned agents.',
      path: '/staff/tickets?status=IN_PROGRESS',
    },
    {
      id: 'waiting',
      title: '3. Awaiting Customer',
      badge: 'Pending Info',
      count: waitingOnCustomer,
      color: 'border-amber-200/80 bg-amber-50/60 text-amber-900',
      dotColor: 'bg-amber-600',
      description: 'Blocked waiting on feedback, logs, or customer confirmation.',
      path: '/staff/tickets?status=WAITING_ON_CUSTOMER',
    },
    {
      id: 'resolved',
      title: '4. Successfully Resolved',
      badge: 'Fulfilled',
      count: resolved,
      color: 'border-neutral-200/80 bg-neutral-50/80 text-neutral-800',
      dotColor: 'bg-neutral-500',
      description: 'Closed tickets with full SLA satisfaction verified.',
      path: '/staff/tickets?status=RESOLVED',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Live Pie Chart */}
        <div id="analytics" className="lg:col-span-5 flex flex-col scroll-mt-24">
          <Card className="flex flex-col h-full bg-white border-neutral-200/90 shadow-2xs rounded-2xl">
            <CardHeader className="items-center pb-2">
              <CardTitle className="text-base font-bold text-neutral-950">
                Ticket Distribution Breakdown
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Real-time queue distribution across all statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-2 flex items-center justify-center">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[220px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={displayData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    strokeWidth={2}
                  >
                    {displayData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>

            {/* Custom Legend */}
            <div className="px-6 py-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                <span className="text-neutral-500">Open:</span>
                <span className="font-semibold text-neutral-900 ml-auto">{open}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                <span className="text-neutral-500">In Progress:</span>
                <span className="font-semibold text-neutral-900 ml-auto">{inProgress}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                <span className="text-neutral-500">Waiting:</span>
                <span className="font-semibold text-neutral-900 ml-auto">{waitingOnCustomer}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                <span className="text-neutral-500">Resolved:</span>
                <span className="font-semibold text-neutral-900 ml-auto">{resolved}</span>
              </div>
            </div>

            <CardFooter className="flex-col gap-1.5 text-xs pt-3 border-t border-neutral-100 mt-auto">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span>{resolutionRate}% overall resolution rate</span>
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <div className="text-neutral-400 text-[11px]">
                Showing {total} total tickets tracked in Neon PostgreSQL
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Support Lifecycle Flow Chart */}
        <div id="lifecycle" className="lg:col-span-7 flex flex-col scroll-mt-24">
          <Card className="flex flex-col h-full bg-white border-neutral-200/90 shadow-2xs rounded-2xl">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-neutral-950">
                  Support Lifecycle Pipeline Flow
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500 mt-1">
                  Step-by-step triage, investigation, and resolution pipeline
                </CardDescription>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                {activeTotal} Active in Queue
              </span>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between py-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {flowStages.map((stage) => (
                  <div
                    key={stage.id}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden group shadow-2xs',
                      stage.color
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold tracking-tight flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full shrink-0', stage.dotColor)} />
                        {stage.title}
                      </span>
                      <span className="font-mono text-base font-extrabold tabular-nums">
                        {stage.count}
                      </span>
                    </div>

                    <p className="text-[11px] opacity-85 leading-relaxed mb-3">
                      {stage.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-current/10">
                      <span className="font-medium">{stage.badge}</span>
                      <a
                        href={stage.path}
                        className="opacity-75 group-hover:opacity-100 flex items-center gap-0.5 font-semibold transition-opacity hover:underline"
                      >
                        View <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* SLA Warning banner if overdue exists */}
              {overdue > 0 && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between text-xs text-rose-900">
                  <div className="flex items-center gap-2 min-w-0">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="truncate">
                      <strong>{overdue} ticket{overdue > 1 ? 's' : ''}</strong> exceeded the 24h SLA target and require immediate escalation.
                    </span>
                  </div>
                  <a
                    href="/staff/tickets?isOverdue=true"
                    className="font-semibold underline shrink-0 hover:text-rose-700 ml-2"
                  >
                    View Overdue
                  </a>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>Automatic real-time transitions from triage to resolution</span>
              <span className="font-mono text-[11px] text-neutral-400">DeskFlow Engine v2.0</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsSection;
