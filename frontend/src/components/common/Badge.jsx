import React from 'react';
import { Badge as ShadcnBadge } from '../ui/badge';
import { cn } from '@/lib/utils';

const STATUS = {
  OPEN: {
    label: 'Open',
    dot: 'bg-blue-600',
    pill: 'bg-blue-50 text-blue-700 border-blue-200/80',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    dot: 'bg-amber-600',
    pill: 'bg-amber-50 text-amber-800 border-amber-200/80',
  },
  WAITING_ON_CUSTOMER: {
    label: 'Waiting on Customer',
    dot: 'bg-purple-600',
    pill: 'bg-purple-50 text-purple-700 border-purple-200/80',
  },
  RESOLVED: {
    label: 'Resolved',
    dot: 'bg-emerald-600',
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
};

const PRIORITY = {
  LOW: {
    label: 'Low',
    pill: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  MEDIUM: {
    label: 'Medium',
    pill: 'bg-amber-50 text-amber-800 border-amber-200/80',
  },
  HIGH: {
    label: 'High',
    pill: 'bg-orange-50 text-orange-800 border-orange-200/80',
  },
  URGENT: {
    label: 'Urgent',
    pill: 'bg-rose-50 text-rose-800 border-rose-200/80',
  },
};

export function StatusBadge({ status, size = 'sm', className = '' }) {
  const config = STATUS[status] || {
    label: status,
    dot: 'bg-zinc-400',
    pill: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border select-none',
        config.pill,
        size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm', className = '' }) {
  const config = PRIORITY[priority] || {
    label: priority,
    pill: 'bg-neutral-50 text-neutral-700 border-neutral-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border select-none',
        config.pill,
        size === 'xs' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5',
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function OverdueBadge({ isOverdue, className = '' }) {
  if (!isOverdue) return null;
  return (
    <span
      className={cn(
        'shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 select-none',
        className
      )}
    >
      Overdue
    </span>
  );
}

export function RoleBadge({ role, className = '' }) {
  const isStaff = role === 'ADMIN' || role === 'AGENT';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize select-none',
        role === 'ADMIN'
          ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
          : role === 'AGENT'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-blue-50 text-blue-700 border-blue-200',
        className
      )}
    >
      {role?.toLowerCase()}
    </span>
  );
}

export { ShadcnBadge as Badge };
