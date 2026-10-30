import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Ticket,
  ArrowUpDown,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';

export function CustomerTickets() {
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
  const [total, setTotal] = useState(() => {
    try {
      const cached = localStorage.getItem('support_desk_customer_tickets');
      return cached ? JSON.parse(cached).length : 0;
    } catch (e) {
      return 0;
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

  // Filters & Sorting matching Requirement 6
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Newest) | 'asc' (Oldest)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        sortBy: 'createdAt',
        sortOrder,
      };
      if (status !== 'ALL') params.status = status;
      if (priority !== 'ALL') params.priority = priority;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.listTickets(params);
      const list = res?.tickets || (Array.isArray(res) ? res : []);
      setTickets(list);
      setTotal(res?.total ?? list.length);
    } catch (err) {
      console.warn('Failed to fetch customer tickets:', err);
      setError(err.message || 'Could not load your support tickets.');
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, sortOrder]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-950 tracking-tight">
            My Support Tickets
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Showing {tickets.length} of {total} tickets submitted by your account.
          </p>
        </div>

        <Link to="/portal/tickets/new">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs transition-all shadow-sm active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Raise a New Ticket</span>
          </button>
        </Link>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search by Ticket ID or Subject */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID (e.g. DF-...) or subject..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium text-neutral-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CUSTOMER">Pending Info</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium text-neutral-800"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            {/* Sort Order (Newest / Oldest) */}
            <button
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-medium transition-colors cursor-pointer"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <span>{sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket List Table */}
      {loading ? (
        <div className="py-16 flex justify-center bg-white rounded-2xl border border-neutral-200/80">
          <LoadingSpinner text="Loading your support tickets..." />
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
            <Ticket className="w-7 h-7 stroke-[1.5]" />
          </div>
          <div className="max-w-sm mx-auto">
            <h3 className="text-base font-bold text-neutral-900">
              {search || status !== 'ALL' || priority !== 'ALL'
                ? 'No matching tickets found'
                : 'No support tickets yet'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {search || status !== 'ALL' || priority !== 'ALL'
                ? 'Try clearing your search terms or adjusting the status/priority filters.'
                : 'No support tickets yet. Create your first ticket and our team will help you.'}
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
                {tickets.map((t) => {
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
                      <td className="py-3 px-4 font-semibold text-neutral-900 max-w-sm truncate">
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
  );
}

export default CustomerTickets;