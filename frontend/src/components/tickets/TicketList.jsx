import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../common/Badge';
import EmptyState from '../common/EmptyState';

const formatRelativeTime = (dateString) => {
  const diffHours = Math.round((new Date() - new Date(dateString)) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

export function TicketList({
  tickets = [],
  baseUrl = '/staff/tickets',
  emptyTitle = 'No tickets match your filters',
  emptyAction,
}) {
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return <EmptyState title={emptyTitle} actionLabel={emptyAction?.label} onAction={emptyAction?.onClick} />;
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2.5 px-4 font-medium">Ticket</th>
              <th className="py-2.5 px-4 font-medium">Status</th>
              <th className="py-2.5 px-4 font-medium">Priority</th>
              <th className="py-2.5 px-4 font-medium hidden md:table-cell">Assignee</th>
              <th className="py-2.5 px-4 font-medium text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => navigate(`${baseUrl}/${ticket.id}`)}
                className="hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{ticket.subject}</span>
                    <OverdueBadge isOverdue={ticket.isOverdue} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {ticket.customer?.name || 'Customer'}
                  </p>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="py-3 px-4 hidden md:table-cell whitespace-nowrap">
                  {ticket.assignee ? (
                    ticket.assignee.name
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(ticket.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketList;
