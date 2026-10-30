import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminAnalyticsSection from '../../components/dashboard/AdminAnalyticsSection';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Headphones,
  ArrowRight,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function StaffDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d' | '3m'

  const isAgent = user?.role === 'AGENT';

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiClient.getDashboard();
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const { metrics, recentTickets = [], ticketsTimeline = [] } = data || {};
  const openCount = metrics?.open ?? 0;
  const inProgressCount = metrics?.inProgress ?? 0;
  const waitingCount = metrics?.waitingOnCustomer ?? 0;
  const overdueCount = metrics?.overdue ?? 0;
  const totalCount = metrics?.total ?? 0;

  // Real Ticket Raised Timeline Graph computation based on actual DB creation timestamps
  const chartData = useMemo(() => {
    const now = new Date();
    const timeline = ticketsTimeline || [];

    if (timeRange === '7d') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

        const raised = timeline.filter((t) => {
          const tDate = new Date(t.createdAt).toISOString().split('T')[0];
          return tDate === dateStr;
        }).length;

        const resolved = timeline.filter((t) => {
          const tDate = new Date(t.createdAt).toISOString().split('T')[0];
          return tDate === dateStr && t.status === 'RESOLVED';
        }).length;

        days.push({
          label,
          fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          raised,
          resolved,
        });
      }
      return days;
    }

    if (timeRange === '30d') {
      const intervals = [];
      const step = 5;
      for (let i = 25; i >= 0; i -= step) {
        const dEnd = new Date(now);
        dEnd.setDate(dEnd.getDate() - i);
        const dStart = new Date(dEnd);
        dStart.setDate(dStart.getDate() - step);

        const label = dEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const raised = timeline.filter((t) => {
          const tDate = new Date(t.createdAt);
          return tDate > dStart && tDate <= dEnd;
        }).length;

        const resolved = timeline.filter((t) => {
          const tDate = new Date(t.createdAt);
          return tDate > dStart && tDate <= dEnd && t.status === 'RESOLVED';
        }).length;

        intervals.push({
          label,
          fullDate: `Period ending ${dEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          raised,
          resolved,
        });
      }
      return intervals;
    }

    // Default: '3m'
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yVal = d.getFullYear();
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const raised = timeline.filter((t) => {
        const tDate = new Date(t.createdAt);
        return tDate.getMonth() === mIdx && tDate.getFullYear() === yVal;
      }).length;

      const resolved = timeline.filter((t) => {
        const tDate = new Date(t.createdAt);
        return tDate.getMonth() === mIdx && tDate.getFullYear() === yVal && t.status === 'RESOLVED';
      }).length;

      months.push({
        label,
        fullDate: label,
        raised,
        resolved,
      });
    }
    return months;
  }, [timeRange, ticketsTimeline]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-neutral-500 font-sans">
        <LoadingSpinner />
        <span className="mt-3 text-xs font-mono">
          Loading {isAgent ? 'Agent' : 'Admin'} Workspace...
        </span>
      </div>
    );
  }

  const firstName = user?.name ? user.name.split(' ')[0] : isAgent ? 'Support Agent' : 'System Admin';

  return (
    <div className="space-y-8 font-sans">
      {/* ══════════════════════════════════════════════════════
          TOP GREETING & HERO ACTION
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'text-[10px] font-bold px-2.5 py-0.5 rounded-full border',
                isAgent
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-neutral-100 text-neutral-800 border-neutral-300'
              )}
            >
              {isAgent ? 'AGENT PORTAL' : 'ADMIN CONSOLE'}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {isAgent ? 'My Assigned Tasks Scope' : 'Master Overview'}
            </span>
          </div>

          <h1 className="text-3xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
            <span>Hello,</span>
            <span className="text-blue-600 capitalize">{firstName}</span>
            <span>👋</span>
          </h1>

          <p className="text-sm text-neutral-500 mt-1">
            {isAgent
              ? overdueCount > 0
                ? `You have ${overdueCount} assigned ticket waiting over 24 hours.`
                : 'Here is your personal queue of tasks assigned directly to you by Administrator.'
              : overdueCount > 0
              ? `${overdueCount} ticket has been waiting over 24 hours.`
              : 'Here is what is happening across your support engineering queues.'}
          </p>
        </div>

        <Link to="/staff/agent">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer">
            <Headphones className="w-4 h-4 text-emerald-400" />
            <span>Launch Agent Console</span>
          </button>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          FOUR METRIC CARDS (Different for Agent vs Admin)
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Workload */}
        <Link
          to={isAgent ? '/staff/assigned' : '/staff/tickets?status=OPEN'}
          className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isAgent ? 'My Assigned Tickets' : 'Open Tickets'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                {isAgent ? <UserCheck className="w-4 h-4" /> : <Inbox className="w-4 h-4" />}
              </div>
            </div>
            <div className="text-3xl font-black text-blue-600">
              {isAgent ? totalCount : openCount}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-1 font-semibold text-neutral-900">
              <span>{isAgent ? 'Assigned to me' : 'Trending up'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 inline" />
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isAgent ? 'Tasks delegated by Admin' : 'Awaiting staff triage'}
            </p>
          </div>
        </Link>

        {/* Card 2: Open / Triage Tasks */}
        <Link
          to={isAgent ? '/staff/assigned?status=OPEN' : '/staff/tickets?status=IN_PROGRESS'}
          className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isAgent ? 'My Open Tasks' : 'In Progress'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                {isAgent ? <Inbox className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
            </div>
            <div className="text-3xl font-black text-amber-600">
              {isAgent ? openCount : inProgressCount}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-1 font-semibold text-neutral-900">
              <span>{isAgent ? 'Awaiting pickup' : 'Under investigation'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-600 inline" />
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isAgent ? 'Tasks requiring initial response' : 'Assigned to engineers'}
            </p>
          </div>
        </Link>

        {/* Card 3: In Progress / Working Tasks */}
        <Link
          to={isAgent ? '/staff/assigned?status=IN_PROGRESS' : '/staff/tickets?status=WAITING_ON_CUSTOMER'}
          className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isAgent ? 'Working (In Progress)' : 'Waiting Customer'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-600">
              {isAgent ? inProgressCount : waitingCount}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs">
            <div className="flex items-center gap-1 font-semibold text-neutral-900">
              <span>{isAgent ? 'Under active resolution' : 'Pending response'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-600 inline" />
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isAgent ? 'Active investigation in progress' : 'Awaiting customer logs'}
            </p>
          </div>
        </Link>

        {/* Card 4: Overdue SLA */}
        <Link
          to={isAgent ? '/staff/assigned?isOverdue=true' : '/staff/tickets?isOverdue=true'}
          className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {isAgent ? 'My Overdue Tasks' : 'Overdue SLA (24h)'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className={cn('text-3xl font-black', overdueCount > 0 ? 'text-rose-600' : 'text-neutral-950')}>
              {overdueCount}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs">
            <div className={cn('flex items-center gap-1 font-semibold', overdueCount > 0 ? 'text-rose-700' : 'text-neutral-900')}>
              <span>{overdueCount > 0 ? 'Action required' : 'SLA compliant'}</span>
              {overdueCount > 0 ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 inline" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {overdueCount > 0
                ? isAgent
                  ? 'Your task exceeded 24h SLA'
                  : '1 ticket exceeded 24h SLA'
                : 'All response times on schedule'}
            </p>
          </div>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN CHART: REAL TICKET RAISED & ASSIGNED TIMELINE
      ══════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-950 tracking-tight">
              {isAgent ? 'My Assigned Ticket Inflow Timeline' : 'Ticket Raised & Resolution Timeline'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isAgent
                ? 'Real tickets assigned to your queue by date'
                : timeRange === '7d'
                ? 'Real tickets raised day-by-day (Last 7 days)'
                : timeRange === '30d'
                ? 'Real tickets raised across past 30 days'
                : 'Real monthly ticket intake (Last 3 months)'}
            </p>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                timeRange === '7d'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                timeRange === '30d'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Last 30 days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('3m')}
              className={cn(
                'px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer',
                timeRange === '3m'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Last 3 months
            </button>
          </div>
        </div>

        {/* Recharts Area Chart with Real Data */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRaised" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataItem = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 p-3 rounded-xl shadow-lg text-xs space-y-1 font-sans">
                        <p className="font-bold text-neutral-950">{dataItem.fullDate || dataItem.label}</p>
                        <p className="text-blue-600 font-semibold flex items-center justify-between gap-4">
                          <span>{isAgent ? 'Assigned Tasks:' : 'Tickets Raised:'}</span>
                          <span className="font-mono font-bold text-sm">{dataItem.raised}</span>
                        </p>
                        <p className="text-emerald-700 font-semibold flex items-center justify-between gap-4">
                          <span>Resolved:</span>
                          <span className="font-mono font-bold text-sm">{dataItem.resolved}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="raised"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRaised)"
                name={isAgent ? 'Assigned Tasks' : 'Tickets Raised'}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual Analytics: Ticket Status Pie Chart & Support Lifecycle Flow Chart */}
      <AdminAnalyticsSection metrics={metrics} />

      {/* Recent Assigned Tickets Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-950 tracking-tight">
              {isAgent ? 'My Assigned Tickets Queue' : 'Recent Tickets'}
            </h2>
            <p className="text-xs text-neutral-500">
              {isAgent
                ? 'Tasks assigned specifically to you by Administrator'
                : 'Active incoming inquiries and customer issues'}
            </p>
          </div>
          <Link
            to={isAgent ? '/staff/assigned' : '/staff/tickets'}
            className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>{isAgent ? 'View all my assigned tasks' : 'View all queue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-400 text-xs">
            {isAgent
              ? 'You currently have no tickets assigned to you by Administrator.'
              : 'No recent tickets recorded in system.'}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200/90 bg-white overflow-hidden divide-y divide-neutral-100 shadow-2xs">
            {recentTickets.map((t) => (
              <Link
                key={t.id}
                to={`/staff/tickets/${t.id}`}
                className="p-4 hover:bg-neutral-50/80 transition-colors flex items-center justify-between gap-4 flex-wrap cursor-pointer group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/80 font-medium">
                      #{t.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={t.status} size="xs" />
                    <PriorityBadge priority={t.priority} size="xs" />
                    {t.isOverdue && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Overdue SLA
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors truncate">
                    {t.subject}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Customer: <span className="font-medium text-neutral-700">{t.customer?.name || 'Customer'}</span> ({t.customer?.email || 'N/A'})
                  </p>
                </div>

                <div className="text-xs text-neutral-400 font-mono text-right shrink-0">
                  <p>{new Date(t.createdAt).toLocaleDateString()}</p>
                  <p className="text-[11px] text-neutral-500">
                    {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default StaffDashboard;
