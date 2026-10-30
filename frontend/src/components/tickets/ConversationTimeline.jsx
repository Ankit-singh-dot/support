import React from 'react';
import { Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConversationTimeline({ entries = [] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-neutral-400 bg-white rounded-2xl border border-neutral-200/80">
        No conversation messages yet.
      </div>
    );
  }

  const formatMessageTimestamp = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${date}, ${time}`;
  };

  return (
    <div className="space-y-4 font-sans">
      {entries.map((entry) => {
        const isInternalNote = entry.type === 'INTERNAL_NOTE';
        const isCustomer = entry.author?.role === 'CUSTOMER';
        const isAdmin = entry.author?.role === 'ADMIN';
        const initial = entry.author?.name ? entry.author.name.charAt(0).toUpperCase() : 'S';

        return (
          <div
            key={entry.id}
            className={cn(
              'rounded-2xl border shadow-2xs p-5 space-y-3.5 transition-all bg-white',
              isInternalNote
                ? 'border-amber-300 ring-1 ring-amber-200'
                : 'border-neutral-200/90'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                    isInternalNote
                      ? 'bg-amber-200 text-amber-900'
                      : isAdmin
                      ? 'bg-blue-100 text-blue-600'
                      : isCustomer
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-emerald-100 text-emerald-800'
                  )}
                >
                  {initial}
                </div>

                <span className="font-bold text-neutral-900 text-sm">
                  {entry.author?.name || 'Support Staff'}
                </span>

                <span className="bg-neutral-100 text-neutral-600 border border-neutral-200/70 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                  {entry.author?.role === 'ADMIN'
                    ? 'Admin'
                    : entry.author?.role === 'AGENT'
                    ? 'Agent'
                    : 'Customer'}
                </span>

                {isInternalNote && (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-800 text-[10px] bg-amber-200/70 px-2 py-0.5 rounded-md border border-amber-300">
                    <Lock className="w-3 h-3" />
                    Internal Note
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatMessageTimestamp(entry.createdAt)}</span>
              </div>
            </div>

            {/* Message Body */}
            <div
              className={cn(
                'p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap font-normal',
                isInternalNote
                  ? 'bg-amber-50/80 text-amber-950 border border-amber-200/80'
                  : 'bg-neutral-50/90 text-neutral-800 border border-neutral-100/90'
              )}
            >
              {entry.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ConversationTimeline;
