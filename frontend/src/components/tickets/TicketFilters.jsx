import React from 'react';
import { Search, Filter, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function TicketFilters({
  filters,
  onChange,
  onReset,
  agents = [],
  isStaff = false,
  showAssigneeFilter,
}) {
  const canFilterAssignee = showAssigneeFilter !== undefined ? showAssigneeFilter : isStaff;

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-2xs space-y-3 mb-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by subject or customer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
          />
        </div>

        {/* Status */}
        <div className="md:col-span-2">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Priority */}
        <div className="md:col-span-2">
          <select
            value={filters.priority || 'ALL'}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Assignee (Admin only or staff when permitted) */}
        {canFilterAssignee && (
          <div className="md:col-span-2">
            <select
              value={filters.assigneeId || ''}
              onChange={(e) => handleChange('assigneeId', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to Me</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort */}
        <div className={canFilterAssignee ? 'md:col-span-2' : 'md:col-span-4'}>
          <select
            value={`${filters.sortBy || 'updatedAt'}_${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              onChange({ ...filters, sortBy, sortOrder });
            }}
            className="w-full px-2.5 py-1.5 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
          >
            <option value="updatedAt_desc">Recently Updated</option>
            <option value="createdAt_desc">Newest Created</option>
            <option value="createdAt_asc">Oldest Created</option>
            <option value="priority_desc">Priority (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Filter Row 2: Overdue Toggle & Reset */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.isOverdue === 'true'}
            onChange={(e) => handleChange('isOverdue', e.target.checked ? 'true' : '')}
            className="rounded border-input text-rose-600 focus:ring-rose-500 accent-rose-600"
          />
          <span className="flex items-center gap-1 font-medium text-foreground">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Show Overdue Tickets Only (&gt;24h)
          </span>
        </label>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default TicketFilters;
