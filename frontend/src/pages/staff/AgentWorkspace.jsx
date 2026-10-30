import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/common/Badge';
import {
  Headphones,
  Inbox,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  UserPlus,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentWorkspace() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState(isAdmin ? 'unassigned' : 'active');
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [metrics, setMetrics] = useState({
    myAssigned: 0,
    unassigned: 0,
    overdue: 0,
    resolved: 0,
    urgent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Load agents for Admin assignment controls
  useEffect(() => {
    if (isAdmin) {
      apiClient.listAgents().then(setAgents).catch(console.error);
    }
  }, [isAdmin]);

  const loadData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        const dash = await apiClient.getDashboard().catch(() => null);

        let statusParam = statusFilter !== 'ALL' ? statusFilter : undefined;
        let assigneeParam = undefined;

        if (!isAdmin) {
          // Support Agent: Strictly scoped to tasks assigned by Admin
          assigneeParam = 'me';
          if (activeTab === 'waiting' && statusFilter === 'ALL') {
            statusParam = 'WAITING_ON_CUSTOMER';
          } else if (activeTab === 'resolved' && statusFilter === 'ALL') {
            statusParam = 'RESOLVED';
          }
        } else {
          // Administrator: Can view unassigned pool, specific assignments, or full queue
          if (activeTab === 'unassigned') {
            assigneeParam = 'unassigned';
          } else if (activeTab === 'assigned') {
            // All assigned tickets
          }
        }

        const res = await apiClient.listTickets({
          search: search.trim() || undefined,
          status: statusParam,
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
          assigneeId: assigneeParam,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          limit: 50,
        });

        let fetched = res.tickets || [];
        if (!isAdmin && activeTab === 'active' && statusFilter === 'ALL') {
          fetched = fetched.filter(
            (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
          );
        }

        setTickets(fetched);

        if (dash && dash.metrics) {
          setMetrics({
            myAssigned: dash.metrics.myAssignedActive || 0,
            unassigned: dash.metrics.open || 0,
            overdue: dash.metrics.overdue || 0,
            resolved: dash.metrics.resolved || 0,
            urgent: dash.metrics.urgent || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load agent workspace:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAdmin, activeTab, search, statusFilter, priorityFilter]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle quick status advance by Agent
  const handleQuickStatus = async (ticket, newStatus) => {
    setActionLoadingId(ticket.id);
    setNotification(null);

    try {
      await apiClient.updateTicket(ticket.id, {
        status: newStatus,
        expectedUpdatedAt: ticket.updatedAt,
      });

      setNotification({
        type: 'success',
        message: `Updated status for #${ticket.id.slice(0, 8)} to ${newStatus.replace(/_/g, ' ')}`,
      });

      await loadData(true);
    } catch (err) {
      if (err.status === 409) {
        setNotification({
          type: 'error',
          message: `Ticket was modified concurrently by another user. Reloading fresh state.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to update ticket status.',
        });
      }
      await loadData(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle ticket assignment by Admin
  const handleAssignTicket = async (ticket, targetAgentId) => {
    setActionLoadingId(ticket.id);
    setNotification(null);

    try {
      await apiClient.updateTicket(ticket.id, {
        assigneeId: targetAgentId === '' ? null : targetAgentId,
        expectedAssigneeId: ticket.assigneeId || null,
        expectedUpdatedAt: ticket.updatedAt,
      });

      const agentObj = agents.find((a) => a.id === targetAgentId);
      setNotification({
        type: 'success',
        message: targetAgentId
          ? `Ticket #${ticket.id.slice(0, 8)} successfully assigned to ${agentObj?.name || 'Agent'}.`
          : `Ticket #${ticket.id.slice(0, 8)} moved to unassigned queue.`,
      });

      await loadData(true);
    } catch (err) {
      if (err.status === 409) {
        setNotification({
          type: 'error',
          message: `Concurrency conflict: ${err.message || 'Ticket was modified concurrently.'}`,
        });
      } else {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to update assignment.',
        });
      }
      await loadData(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {isAdmin ? 'Operations Dispatch & Agent Workspace' : 'Support Agent Workspace'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                {isAdmin ? 'Admin Dispatch' : 'Assigned Desk'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Logged in as <strong className="text-foreground">{user?.name}</strong> ({user?.email}) •{' '}
              {isAdmin
                ? 'Assign customer tickets to agents, track SLA compliance, and dispatch support work.'
                : 'Tasks assigned to you by Administrator. Resolve customer tickets, reply, and update status.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {isAdmin && (
            <Link
              to="/staff/agents"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-all shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Manage Agents</span>
            </Link>
          )}

          <Link
            to={isAdmin ? '/staff/tickets' : '/staff/assigned'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium transition-all shadow-2xs"
          >
            <span>{isAdmin ? 'All Tickets' : 'My Assigned Tickets'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {notification && (
        <div
          className={cn(
            'p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 border shadow-2xs animate-in fade-in duration-200',
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="truncate">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Live KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isAdmin ? 'Active Desk Workload' : 'My Active Workload'}
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {metrics.myAssigned}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isAdmin ? 'Assigned tasks currently open' : 'Tasks assigned to you'}
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setActiveTab('unassigned')}
            className={cn(
              'text-left p-4 rounded-xl border transition-all cursor-pointer shadow-2xs',
              activeTab === 'unassigned'
                ? 'bg-background border-neutral-950 ring-1 ring-neutral-950'
                : 'bg-card border-border hover:bg-muted/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Unassigned Queue</span>
              <Inbox className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {metrics.unassigned}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting agent assignment</p>
          </button>
        ) : (
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Urgent Priority</span>
              <AlertTriangle className={cn('w-4 h-4', metrics.urgent > 0 ? 'text-amber-600' : 'text-muted-foreground')} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {metrics.urgent}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">High priority tasks</p>
          </div>
        )}

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">SLA Overdue (&gt;24h)</span>
            <ShieldAlert
              className={cn(
                'w-4 h-4',
                metrics.overdue > 0 ? 'text-rose-600 animate-pulse' : 'text-muted-foreground'
              )}
            />
          </div>
          <div
            className={cn(
              'text-2xl font-bold tracking-tight tabular-nums',
              metrics.overdue > 0 ? 'text-rose-600' : 'text-foreground'
            )}
          >
            {metrics.overdue}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Requires immediate attention</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {isAdmin ? 'Desk Resolved' : 'Resolved by Me'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {metrics.resolved}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total tickets resolved</p>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        {/* Navigation Tabs & Filter Bar */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start flex-wrap">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('unassigned')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                    activeTab === 'unassigned'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span>Unassigned Queue</span>
                  {metrics.unassigned > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-900 text-white font-mono">
                      {metrics.unassigned}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'assigned'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Assigned Tasks
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'all'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All Tickets
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('active')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'active'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Active Tasks
                </button>
                <button
                  onClick={() => setActiveTab('waiting')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'waiting'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Waiting on Customer
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'resolved'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Resolved
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    activeTab === 'all'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All My Tasks
                </button>
              </>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket subject..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="p-12 text-center">
            <LoadingSpinner text="Retrieving live queue from Neon PostgreSQL..." />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center space-y-3 font-sans">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-foreground text-sm">
              {isAdmin
                ? activeTab === 'unassigned'
                  ? 'No unassigned tickets in triage queue'
                  : 'No tickets found matching the selected filters'
                : 'You currently have no tasks in this category'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isAdmin
                ? 'All customer support tickets are currently assigned to active team agents or marked resolved.'
                : 'Only tickets explicitly assigned to you by an administrator will appear here. As soon as a ticket is assigned, it will automatically populate your workspace.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {tickets.map((t) => {
              const isAssignedToMe = t.assigneeId === user?.id;
              const isUnassigned = !t.assigneeId;
              const isProcessing = actionLoadingId === t.id;

              return (
                <div
                  key={t.id}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Ticket Info & Badges */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground font-semibold">
                        #{t.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                      {t.isOverdue && <OverdueBadge isOverdue={true} />}

                      {/* Assignment indicator */}
                      {isAssignedToMe ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          <span>Assigned to You</span>
                        </span>
                      ) : isUnassigned ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Unassigned
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                          Assigned: {t.assignee?.name || 'Agent'}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/staff/tickets/${t.id}`}
                      className="block font-bold text-sm sm:text-base text-foreground hover:text-neutral-900 transition-colors hover:underline"
                    >
                      {t.subject}
                    </Link>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {t.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 flex-wrap">
                      <span>
                        Customer: <strong className="text-foreground">{t.customer?.name}</strong>{' '}
                        ({t.customer?.email})
                      </span>
                      <span>Updated: {new Date(t.updatedAt).toLocaleTimeString()}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{t._count?.entries || 0} messages</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Interactive Quick Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    {/* Admin Assignment Dropdown */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                          Assign:
                        </label>
                        <select
                          disabled={isProcessing}
                          value={t.assigneeId || ''}
                          onChange={(e) => handleAssignTicket(t, e.target.value)}
                          className="px-2.5 py-1.5 text-xs border border-input rounded-lg bg-background text-foreground font-medium focus:ring-1 focus:ring-ring disabled:opacity-50"
                        >
                          <option value="">Unassigned</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name} ({ag.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quick status selector for Agent */}
                    {!isAdmin && isAssignedToMe && (
                      <select
                        disabled={isProcessing}
                        value={t.status}
                        onChange={(e) => handleQuickStatus(t, e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-input rounded-lg bg-background text-foreground font-medium focus:ring-1 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="WAITING_ON_CUSTOMER">Waiting Customer</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    )}

                    {/* Open Ticket Details */}
                    <Link
                      to={`/staff/tickets/${t.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium transition-all shadow-2xs"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentWorkspace;
