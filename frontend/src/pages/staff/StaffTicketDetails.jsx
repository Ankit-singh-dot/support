import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConversationTimeline from '../../components/tickets/ConversationTimeline';
import ReplyComposer from '../../components/tickets/ReplyComposer';
import PropertiesPanel from '../../components/tickets/PropertiesPanel';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/common/Badge';
import { ArrowLeft, User, AlertCircle } from 'lucide-react';

const formatDateTimeFull = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
};

export function StaffTicketDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [entries, setEntries] = useState([]);
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState(null);

  const loadTicketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ticketData, entriesData, historyData, agentsData] = await Promise.all([
        apiClient.getTicket(id),
        apiClient.getTicketEntries(id).catch(() => []),
        apiClient.getTicketHistory(id).catch(() => []),
        isAdmin
          ? apiClient.listAgents().catch(() => [])
          : Promise.resolve([]),
      ]);
      setTicket(ticketData);
      setEntries(entriesData || []);
      setHistory(historyData || []);
      setAgents(agentsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  const handlePostReply = async ({ content, type }) => {
    setSubmittingReply(true);
    try {
      await apiClient.createTicketEntry(id, { content, type });
      await loadTicketData();
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateProperties = async (updates) => {
    try {
      const updatedTicket = await apiClient.updateTicket(id, updates);
      setTicket(updatedTicket);
      // Reload history to reflect the changes
      const historyData = await apiClient.getTicketHistory(id);
      setHistory(historyData);
    } catch (err) {
      if (err.status === 409) {
        alert(`Concurrency conflict: ${err.message}\nRefreshing ticket to latest state.`);
        await loadTicketData();
      } else {
        alert(`Failed to update properties: ${err.message}`);
      }
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading ticket workspace..." />;

  if (error || !ticket) {
    const isForbidden =
      error &&
      (error.includes('403') ||
        error.toLowerCase().includes('access denied') ||
        error.toLowerCase().includes('not assigned'));
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-2xl border border-neutral-200/90 shadow-2xs font-sans mt-8">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-neutral-900">
          {isForbidden ? 'Task Access Restricted' : 'Error Loading Ticket'}
        </h3>
        <p className="text-xs text-neutral-500 mt-2 mb-6 leading-relaxed">
          {error || 'This ticket could not be loaded or does not exist.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to={isAdmin ? '/staff/tickets' : '/staff/assigned'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            &larr; {isAdmin ? 'Return to Master Queue' : 'Return to My Assigned Tickets'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to={isAdmin ? '/staff/tickets' : '/staff/assigned'}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isAdmin ? 'Back to Ticket Queue' : 'Back to My Assigned Tickets'}</span>
        </Link>
      </div>

      {/* Ticket Header Card matching reference image */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
              #{ticket.id.slice(0, 8)}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {ticket.isOverdue && <OverdueBadge isOverdue={true} />}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            {ticket.subject}
          </h1>
        </div>

        <div className="text-xs text-neutral-500 text-left md:text-right font-normal space-y-1">
          <p>
            Created: <span className="font-medium text-neutral-700">{formatDateTimeFull(ticket.createdAt)}</span>
          </p>
          <p>
            Updated: <span className="font-medium text-neutral-700">{formatDateTimeFull(ticket.updatedAt)}</span>
          </p>
        </div>
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Original Ticket Submission + Conversation + Composer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Original Ticket Submission Card */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800 flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-600" />
                Original Ticket Submission
              </span>
              <span className="text-neutral-400 font-mono text-xs">
                {formatDateTimeFull(ticket.createdAt)}
              </span>
            </div>
            <div className="p-4 bg-neutral-50/90 border border-neutral-100/90 rounded-xl text-neutral-900 text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Conversation Stream */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Conversation with Support ({entries.length})
            </h3>
            <ConversationTimeline entries={entries} />
          </div>

          {/* Tabbed Staff Composer */}
          <div>
            <ReplyComposer
              onSubmit={handlePostReply}
              isStaff={true}
              isLoading={submittingReply}
            />
          </div>
        </div>

        {/* Right Column: 3 Distinct Cards (Properties, Customer Info, Activity) */}
        <div className="lg:col-span-4 sticky top-20">
          <PropertiesPanel
            ticket={ticket}
            agents={agents}
            isStaff={true}
            isAdmin={isAdmin}
            onUpdateProperties={handleUpdateProperties}
            history={history}
            entries={entries}
          />
        </div>
      </div>
    </div>
  );
}

export default StaffTicketDetails;
