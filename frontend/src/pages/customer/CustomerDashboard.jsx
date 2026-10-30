import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ArrowRight,
  Shield,
  User,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';

export function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState(() => {
    try {
      const cached = localStorage.getItem('support_desk_customer_tickets');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('support_desk_customer_tickets');
      return !cached;
    } catch (e) {
      return true;
    }
  });
  const [error, setError] = useState(null);

  // Fetch live tickets for this customer
  const loadCustomerTickets = async () => {
    try {
      if (!tickets.length) setLoading(true);
      setError(null);
      const res = await apiClient.listTickets({ sortBy: 'createdAt', sortOrder: 'desc' });
      const ticketList = res?.tickets || (Array.isArray(res) ? res : []);
      setTickets(ticketList);
      try {
        localStorage.setItem('support_desk_customer_tickets', JSON.stringify(ticketList));
      } catch (e) {}
    } catch (err) {
      console.warn('[CustomerDashboard] Failed to fetch live tickets:', err);
      if (!tickets.length) {
        setError(err.message || 'Could not load your tickets.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerTickets();
  }, []);

  // Compute live ticket counts strictly from authenticated customer's tickets
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter(
      (t) => t.status === 'IN_PROGRESS' || t.status === 'WAITING_ON_CUSTOMER'
    ).length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    return { total, open, inProgress, resolved };
  }, [tickets]);

  // First name extraction for greeting: "Hello, {first name} 👋"
  const firstName = useMemo(() => {
    if (user?.name && user.name !== 'Customer') {
      return user.name.split(' ')[0];
    }
    return 'there';
  }, [user]);

  // Format date helper: "29 Oct 2026, 18:30"
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return '—';
    }
  };

  const recentTickets = tickets.slice(0, 5);

  return (
    <div className="space-y-8 font-sans">
      {/* ══════════════════════════════════════════════════════
          TOP GREETING & HERO ACTION
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
            <span>Hello,</span>
            <span className="text-blue-600 capitalize">{firstName}</span>
            <span>👋</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Raise support requests, track progress, and communicate with your support team.
          </p>
        </div>

        <Link to="/portal/tickets/new">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Raise a New Ticket</span>
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
          FOUR TICKET SUMMARY CARDS
      ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-neutral-950">{metrics.total}</div>
          <span className="text-[11px] text-neutral-400 mt-1">All tickets submitted</span>
        </div>

        {/* Open Tickets */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">{metrics.open}</div>
          <span className="text-[11px] text-neutral-400 mt-1">Awaiting staff triage</span>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{metrics.inProgress}</div>
          <span className="text-[11px] text-neutral-400 mt-1">Being actively investigated</span>
        </div>

        {/* Resolved */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{metrics.resolved}</div>
          <span className="text-[11px] text-neutral-400 mt-1">Closed successfully</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RECENT TICKETS SECTION
      ══════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-950 tracking-tight">Recent Tickets</h2>
          {tickets.length > 0 && (
            <Link
              to="/portal/tickets"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 flex items-center gap-1 transition-colors"
            >
              <span>View all tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center bg-white rounded-2xl border border-neutral-200/80">
            <LoadingSpinner text="Loading recent tickets..." />
          </div>
        ) : tickets.length === 0 ? (
          /* Empty State matching Requirement 4 */
          <div className="p-12 text-center rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
              <Ticket className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-base font-bold text-neutral-900">No support tickets yet</h3>
              <p className="text-xs text-neutral-500 mt-1">
                No support tickets yet. Create your first ticket and our team will help you.
              </p>
            </div>
            <Link to="/portal/tickets/new">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs transition-all shadow-sm active:scale-95 cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Create Your First Ticket</span>
              </button>
            </Link>
          </div>
        ) : (
          /* Tickets Table / List */
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-neutral-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 hidden md:table-cell">Assigned Agent</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Created</th>
                    <th className="py-3 px-4 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentTickets.map((t) => {
                    const shortId = t.id ? `DF-${t.id.slice(0, 8).toUpperCase()}` : '—';
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/portal/tickets/${t.id}`)}
                        className="hover:bg-neutral-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-neutral-800 whitespace-nowrap">
                          {shortId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-900 max-w-xs truncate">
                          {t.subject}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell text-neutral-600 whitespace-nowrap">
                          {t.assignee ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-neutral-800">
                              <User className="w-3.5 h-3.5 text-neutral-400" />
                              <span>{t.assignee.name}</span>
                            </span>
                          ) : (
                            <span className="text-neutral-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell text-neutral-500 whitespace-nowrap">
                          {formatDate(t.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right text-neutral-500 whitespace-nowrap">
                          {formatDate(t.updatedAt || t.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;