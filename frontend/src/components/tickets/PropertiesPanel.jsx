import React, { useState, useMemo } from 'react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import Button from '../common/Button';
import {
  Diamond,
  User,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    dot: 'bg-blue-600',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dot: 'bg-amber-600',
  },
  WAITING_ON_CUSTOMER: {
    label: 'Waiting on Customer',
    dot: 'bg-purple-600',
  },
  RESOLVED: {
    label: 'Resolved',
    dot: 'bg-emerald-600',
  },
};

const formatTimeActivity = (dateStr) => {
  if (!dateStr) return { date: '', time: '' };
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { date, time };
};

export function PropertiesPanel({
  ticket,
  agents = [],
  isStaff = false,
  isAdmin = false,
  onUpdateProperties,
  history = [],
  entries = [],
}) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const statusConfig = STATUS_CONFIG[ticket.status] || {
    label: ticket.status,
    dot: 'bg-neutral-400',
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        status,
        priority,
        expectedAssigneeId: ticket.assigneeId || null,
        expectedUpdatedAt: ticket.updatedAt,
      };
      if (isAdmin) {
        payload.assigneeId = assigneeId === '' ? null : assigneeId;
      }
      await onUpdateProperties(payload);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  // Compile full ticket activity timeline matching reference layout
  const activities = useMemo(() => {
    const list = [];

    // 1. Creation event
    if (ticket && ticket.createdAt) {
      list.push({
        id: 'ticket-created',
        date: ticket.createdAt,
        title: `Ticket created by ${ticket.customer?.name || 'customer'}`,
        preview: ticket.description || 'Need To be replaced!!!',
      });
    }

    // 2. Replies and entries
    (entries || []).forEach((entry) => {
      const authorRole = entry.author?.role;
      const authorName = entry.author?.name || (authorRole === 'ADMIN' ? 'System Admin' : 'Support Staff');
      list.push({
        id: `entry-${entry.id}`,
        date: entry.createdAt,
        title:
          entry.type === 'INTERNAL_NOTE'
            ? `Internal note by ${authorName}`
            : `Replied by ${authorName}`,
        preview: entry.content,
      });
    });

    // 3. Property audit history
    (history || []).forEach((item) => {
      let title = `${item.action} by ${item.actor?.name || 'Admin'}`;
      let preview = '';
      if (item.action === 'STATUS_CHANGED') {
        title = `Status updated to ${item.newValue}`;
        preview = `Status changed from ${item.oldValue} to ${item.newValue}`;
      } else if (item.action === 'ASSIGNED') {
        title = `Assigned to ${item.newValue || 'Agent'}`;
        preview = `Ticket assigned by ${item.actor?.name || 'Admin'}`;
      } else if (item.action === 'PRIORITY_CHANGED') {
        title = `Priority set to ${item.newValue}`;
        preview = `Priority updated from ${item.oldValue} to ${item.newValue}`;
      } else if (item.oldValue && item.newValue) {
        preview = `${item.oldValue} → ${item.newValue}`;
      }

      list.push({
        id: `history-${item.id}`,
        date: item.createdAt,
        title,
        preview,
      });
    });

    // Sort descending (latest activity at the top)
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [ticket, entries, history]);

  return (
    <div className="space-y-4 font-sans">
      {/* SLA Overdue Warning if applicable */}
      {ticket.isOverdue && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-semibold text-rose-900">SLA Overdue Warning</h5>
            <p className="text-rose-700 mt-0.5 leading-relaxed">
              This ticket has remained unresolved for more than 24 hours.
            </p>
          </div>
        </div>
      )}

      {/* Card 1: TICKET PROPERTIES */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
            <Diamond className="w-3.5 h-3.5 text-neutral-600" />
            <span>Ticket Properties</span>
          </div>
          {isStaff && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>

        {isEditing ? (
          /* Staff Edit Form */
          <div className="space-y-4 text-xs pt-1">
            <div className="space-y-1.5">
              <label className="text-neutral-700 font-semibold block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white text-neutral-900 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-700 font-semibold block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white text-neutral-900 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-700 font-semibold block">Assignee</label>
              {isAdmin ? (
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white text-neutral-900 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="">Unassigned</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center gap-2 text-neutral-800 font-medium">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{ticket.assignee ? `${ticket.assignee.name} (Assigned by Admin)` : 'Unassigned'}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button
                onClick={handleSave}
                isLoading={isUpdating}
                size="sm"
                className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold py-2"
              >
                Save Changes
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStatus(ticket.status);
                  setPriority(ticket.priority);
                  setAssigneeId(ticket.assigneeId || '');
                  setIsEditing(false);
                }}
                className="px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Exact 1:1 Reference View matching image */
          <div className="space-y-4 pt-1 text-xs">
            {/* Status */}
            <div className="space-y-1.5">
              <span className="text-neutral-500 font-medium block">Status</span>
              <div className="flex items-center gap-2 font-medium text-neutral-900">
                <span className={cn('w-2 h-2 rounded-full shrink-0', statusConfig.dot)} />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <span className="text-neutral-500 font-medium block">Priority</span>
              <div>
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <span className="text-neutral-500 font-medium block">Assignee</span>
              <div className="p-3 bg-neutral-50/80 border border-neutral-200/80 rounded-xl flex items-center gap-2 text-neutral-800 font-medium">
                <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span>
                  {ticket.assignee ? `${ticket.assignee.name} (Assigned by Admin)` : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: CUSTOMER INFORMATION */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-3 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider pb-3 border-b border-neutral-100">
          <User className="w-3.5 h-3.5 text-neutral-600" />
          <span>Customer Information</span>
        </div>

        <div className="text-xs space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-normal">Name</span>
            <span className="font-bold text-neutral-900">{ticket.customer?.name || 'Customer'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 font-normal">Email</span>
            <span className="text-neutral-900 font-normal">{ticket.customer?.email || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Card 3: TICKET ACTIVITY */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4 font-sans">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider pb-3 border-b border-neutral-100">
          <Clock className="w-3.5 h-3.5 text-neutral-600" />
          <span>Ticket Activity</span>
        </div>

        <div className="pt-2">
          {activities.length === 0 ? (
            <p className="text-xs text-neutral-400 italic">No activity recorded yet.</p>
          ) : (
            <div className="relative space-y-6">
              {activities.map((act, index) => {
                const isFirst = index === 0;
                const isLast = index === activities.length - 1;
                const { date, time } = formatTimeActivity(act.date);

                return (
                  <div key={act.id || index} className="relative flex items-start gap-3">
                    {/* Connecting Vertical Track Line */}
                    {!isLast && (
                      <div className="absolute left-[6.5px] top-[14px] bottom-[-24px] w-[1.5px] bg-neutral-200" />
                    )}

                    {/* Dot Indicator: Blue for latest active event, neutral gray for previous */}
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 z-10 transition-colors',
                        isFirst
                          ? 'bg-blue-600 ring-4 ring-blue-50'
                          : 'bg-neutral-300 ring-4 ring-neutral-50'
                      )}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-neutral-900 leading-snug">
                          {act.title}
                        </h5>
                        <div className="text-[11px] text-neutral-400 font-mono text-right shrink-0 leading-tight">
                          <div>{date}</div>
                          <div>{time}</div>
                        </div>
                      </div>
                      {act.preview && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                          {act.preview}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
