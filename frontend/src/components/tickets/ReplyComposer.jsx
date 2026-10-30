import React, { useState } from 'react';
import { Send, Lock, MessageSquare, Paperclip, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReplyComposer({ onSubmit, isStaff = false, isLoading = false }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('PUBLIC_REPLY'); // 'PUBLIC_REPLY' | 'INTERNAL_NOTE'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Message content cannot be empty.');
      return;
    }
    setError('');

    try {
      await onSubmit({ content: content.trim(), type });
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    }
  };

  const isInternalNote = type === 'INTERNAL_NOTE';

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-2xs p-5 space-y-4 bg-white transition-all font-sans',
        isInternalNote
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-neutral-200/90'
      )}
    >
      {/* Header / Tabs */}
      {isStaff ? (
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('PUBLIC_REPLY')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                type === 'PUBLIC_REPLY'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              )}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Public Reply to Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setType('INTERNAL_NOTE')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                type === 'INTERNAL_NOTE'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              )}
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Internal Staff Note</span>
            </button>
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">
            {isInternalNote ? 'Visible to staff only' : 'Visible to customer & team'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-900 pb-1">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Send a Public Reply to Support</span>
        </div>
      )}

      {/* Internal note privacy banner */}
      {isInternalNote && (
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>This note is private. It will only be visible to support staff and never shown to the customer.</span>
        </div>
      )}

      {/* Composer form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-medium">
            {error}
          </div>
        )}

        <textarea
          rows={4}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError('');
          }}
          placeholder={
            isStaff
              ? isInternalNote
                ? 'Add an internal note for your support team (e.g., reproduction steps, logs, escalation)...'
                : 'Write your response to the customer...'
              : 'Write your response to the customer...'
          }
          className="w-full p-4 text-xs sm:text-sm rounded-xl border border-neutral-200/90 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed resize-none shadow-2xs font-normal"
        />

        {/* Action Bar matching screenshot */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer select-none">
            <Paperclip className="w-3.5 h-3.5 text-neutral-500" />
            <span>Attach file (optional)</span>
            <HelpCircle className="w-3 h-3 text-neutral-400 ml-0.5" />
          </div>

          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer',
              'bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Sending...' : 'Send Reply'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReplyComposer;
