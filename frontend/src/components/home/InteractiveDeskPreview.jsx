import React, { useState } from 'react';
import {
  MessageSquare,
  Lock,
  Clock,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
  Eye,
  Check,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';

export function InteractiveDeskPreview() {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'customer'
  const [composerMode, setComposerMode] = useState('PUBLIC_REPLY'); // 'PUBLIC_REPLY' | 'INTERNAL_NOTE'
  const [ticketStatus, setTicketStatus] = useState('IN_PROGRESS');
  const [ticketPriority, setTicketPriority] = useState('URGENT');
  const [ticketAssignee, setTicketAssignee] = useState('Jane Agent');

  const [notes, setNotes] = useState([
    {
      id: 1,
      author: 'Alice Cooper',
      role: 'CUSTOMER',
      type: 'PUBLIC_REPLY',
      time: '10:15 AM',
      content: 'Our SAML SSO endpoint returned 403 Forbidden after rotating certificates this morning.',
    },
    {
      id: 2,
      author: 'Jane Agent',
      role: 'AGENT',
      type: 'INTERNAL_NOTE',
      time: '10:22 AM',
      content: 'Internal Note: Confirmed Okta cert thumbprint discrepancy. Reloaded security credentials cache.',
    },
    {
      id: 3,
      author: 'Jane Agent',
      role: 'AGENT',
      type: 'PUBLIC_REPLY',
      time: '10:30 AM',
      content: 'Hello Alice, we refreshed the trusted x509 cert thumbprints in the auth service. Please retry authentication.',
    },
  ]);

  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setNotes((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: activeTab === 'customer' ? 'Alice Cooper' : 'Jane Agent',
        role: activeTab === 'customer' ? 'CUSTOMER' : 'AGENT',
        type: activeTab === 'customer' ? 'PUBLIC_REPLY' : composerMode,
        time: 'Just now',
        content: newComment.trim(),
      },
    ]);
    setNewComment('');
  };

  // Filter notes for customer (Internal notes NEVER visible to customer)
  const visibleNotes = activeTab === 'customer'
    ? notes.filter((n) => n.type === 'PUBLIC_REPLY')
    : notes;

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-lg overflow-hidden text-left font-sans">
      {/* Top Preview Control Header */}
      <div className="bg-muted/40 px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
          </div>
          <span className="text-xs font-medium text-muted-foreground pl-2 border-l border-border">
            Interactive Support Console Sandbox
          </span>
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center bg-muted/80 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('staff')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              activeTab === 'staff'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Staff Desk View
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              activeTab === 'customer'
                ? 'bg-background text-foreground shadow-2xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Customer Portal View
          </button>
        </div>
      </div>

      {/* Ticket Header */}
      <div className="p-5 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-background">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-muted-foreground">#TK-89421</span>
            <StatusBadge status={ticketStatus} />
            <PriorityBadge priority={ticketPriority} />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <Clock className="w-3 h-3 text-emerald-600" />
              SLA Compliant (&lt;4h remaining)
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            SAML SSO Login fails with assertion error 403
          </h3>
        </div>

        <div className="text-xs text-muted-foreground text-right">
          <span className="block font-medium text-foreground">Customer: Alice Cooper</span>
          <span className="font-mono text-[11px]">Acme Enterprise Tier</span>
        </div>
      </div>

      {/* Main Two-Column Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
        {/* Left Column: Conversation & Composer */}
        <div className="md:col-span-8 p-5 border-r border-border flex flex-col justify-between space-y-4 bg-background">
          {/* Conversation history */}
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
            {visibleNotes.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'p-3.5 rounded-lg border text-xs transition-all space-y-1.5',
                  item.type === 'INTERNAL_NOTE'
                    ? 'bg-amber-50/70 border-amber-200/90 dark:bg-amber-950/30 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
                    : 'bg-muted/30 border-border text-foreground'
                )}
              >
                <div className="flex items-center justify-between font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.author}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {item.role}
                    </Badge>
                    {item.type === 'INTERNAL_NOTE' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 px-1.5 py-0.2 rounded">
                        <Lock className="w-2.5 h-2.5" />
                        Private Note
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{item.time}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={handleAddComment} className="pt-3 border-t border-border space-y-2.5">
            {activeTab === 'staff' && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setComposerMode('PUBLIC_REPLY')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5',
                    composerMode === 'PUBLIC_REPLY'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Public Reply
                </button>
                <button
                  type="button"
                  onClick={() => setComposerMode('INTERNAL_NOTE')}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5',
                    composerMode === 'INTERNAL_NOTE'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Lock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  Internal Note (Confidential)
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  activeTab === 'customer'
                    ? 'Write a reply to support team...'
                    : composerMode === 'INTERNAL_NOTE'
                    ? 'Write confidential note (never shown to customer)...'
                    : 'Write a public reply to Alice...'
                }
                className="flex-1 px-3 py-2 text-xs border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground"
              />
              <Button type="submit" size="sm" className="text-xs font-medium gap-1 px-4">
                <Send className="w-3 h-3" />
                Submit
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Properties Panel */}
        <div className="md:col-span-4 p-5 bg-muted/20 space-y-4 text-xs">
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
            Ticket Properties
          </h4>

          {/* Status Dropdown */}
          <div className="space-y-1.5">
            <label className="text-foreground font-medium">Status</label>
            <select
              value={ticketStatus}
              onChange={(e) => setTicketStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_ON_CUSTOMER">Waiting on Customer</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="space-y-1.5">
            <label className="text-foreground font-medium">Priority</label>
            <select
              value={ticketPriority}
              onChange={(e) => setTicketPriority(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-foreground font-medium">Assigned Agent</label>
            <select
              value={ticketAssignee}
              onChange={(e) => setTicketAssignee(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Jane Agent">Jane Agent (Assigned)</option>
              <option value="System Admin">System Admin</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          {/* Live Security Guarantee Card */}
          <div className="p-3 bg-background rounded-lg border border-border shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Role Privacy Barrier
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {activeTab === 'customer'
                ? 'Internal notes are strictly filtered at the database level. Customers cannot query or inspect staff notes.'
                : 'Staff members have full access to internal notes and the audit history.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveDeskPreview;
