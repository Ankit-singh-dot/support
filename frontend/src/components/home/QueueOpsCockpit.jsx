import React, { useState } from 'react';
import {
  Clock,
  Lock,
  MessageSquare,
  Shield,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Send,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../common/Badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';

const SAMPLE_QUEUE = [
  {
    id: 'TK-8491',
    subject: 'SAML SSO 403 Forbidden after rotating IdP signing certificate',
    customer: 'Sarah Lin (CTO, StackPulse)',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    isOverdue: true,
    assignee: 'Jane Agent',
    updatedAt: '12m ago',
    category: 'Authentication',
    notesCount: 3,
  },
  {
    id: 'TK-8492',
    subject: 'Webhook event retry queue exhausting backoff exponential curve',
    customer: 'Alex Rivera (DevOps Lead, FinFlow)',
    status: 'OPEN',
    priority: 'HIGH',
    isOverdue: false,
    assignee: 'Unassigned',
    updatedAt: '42m ago',
    category: 'API Webhooks',
    notesCount: 1,
  },
  {
    id: 'TK-8493',
    subject: 'Request invoice address amendment for EU VAT reverse charge',
    customer: 'Elena Rostova (Finance Ops)',
    status: 'WAITING_ON_CUSTOMER',
    priority: 'LOW',
    isOverdue: false,
    assignee: 'Support Lead',
    updatedAt: '3h ago',
    category: 'Billing',
    notesCount: 2,
  },
];

export function QueueOpsCockpit() {
  const [selectedTicketId, setSelectedTicketId] = useState('TK-8491');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'properties'
  const [composerMode, setComposerMode] = useState('INTERNAL_NOTE');
  const [quickNote, setQuickNote] = useState('');
  const [ticketList, setTicketList] = useState(SAMPLE_QUEUE);

  const selectedTicket = ticketList.find((t) => t.id === selectedTicketId) || ticketList[0];

  const handleSendNote = (e) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    setQuickNote('');
  };

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card shadow-2xl shadow-zinc-950/5 overflow-hidden text-left font-sans">
      {/* Top Window Chrome */}
      <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="w-3 h-3 rounded-full bg-border" />
          </div>
          <span className="font-mono text-[11px] text-muted-foreground font-medium pl-2 border-l border-border">
            support-ops.workspace.internal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Queue • 24h SLA Active
          </span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
        {/* Left Column: Triage List */}
        <div className="md:col-span-5 border-r border-border bg-background/50 flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              Incoming Tickets ({ticketList.length})
            </span>
            <span className="text-[11px] text-muted-foreground">Auto-Refreshed</span>
          </div>

          <div className="divide-y divide-border/60 overflow-y-auto flex-1">
            {ticketList.map((ticket) => {
              const isSelected = ticket.id === selectedTicket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={cn(
                    'p-3.5 cursor-pointer transition-all select-none',
                    isSelected
                      ? 'bg-accent text-accent-foreground border-l-2 border-l-primary'
                      : 'hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[11px] font-medium text-muted-foreground">
                      #{ticket.id}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{ticket.updatedAt}</span>
                  </div>

                  <p className="text-xs font-semibold leading-snug line-clamp-2 text-foreground mb-2">
                    {ticket.subject}
                  </p>

                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={ticket.status} size="xs" />
                      <PriorityBadge priority={ticket.priority} size="xs" />
                    </div>
                    {ticket.isOverdue && <OverdueBadge isOverdue={true} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-border bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Deterministic PostgreSQL Queue</span>
            <span className="font-mono text-[10px]">Freshdesk SLA standard</span>
          </div>
        </div>

        {/* Right Column: Ticket Detail & Confidential Note Preview */}
        <div className="md:col-span-7 flex flex-col bg-background">
          {/* Header */}
          <div className="p-4 border-b border-border space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-muted-foreground">
                  #{selectedTicket.id}
                </span>
                <StatusBadge status={selectedTicket.status} />
                <PriorityBadge priority={selectedTicket.priority} />
              </div>
              <span className="text-xs text-muted-foreground">
                Assignee: <strong className="text-foreground">{selectedTicket.assignee}</strong>
              </span>
            </div>

            <h4 className="text-sm font-semibold text-foreground leading-snug">
              {selectedTicket.subject}
            </h4>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
              <User className="w-3.5 h-3.5" />
              <span>{selectedTicket.customer}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-primary">Enterprise SLA</span>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[220px]">
            {/* Customer Message */}
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback>SL</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground">{selectedTicket.customer}</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                    Customer
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">10:15 AM</span>
              </div>
              <p className="text-foreground/90 leading-relaxed">
                After rotating our SAML IdP certificates on Okta this morning, all SSO login callbacks are rejected with 403 Forbidden.
              </p>
            </div>

            {/* Confidential Team Note */}
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold">Jane Agent (Support)</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded">
                    Internal Note
                  </span>
                </div>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-400">10:22 AM</span>
              </div>
              <p className="leading-relaxed">
                Checked IdP certificate assertion. The x509 cert fingerprint cache hasn't invalidated in the auth cluster. Invalidating Redis auth cache now.
              </p>
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-medium pt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Strictly isolated: Customers never receive internal notes</span>
              </div>
            </div>
          </div>

          {/* Quick Action Composer Bar */}
          <div className="p-3 border-t border-border bg-muted/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md">
                <button
                  type="button"
                  onClick={() => setComposerMode('INTERNAL_NOTE')}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1',
                    composerMode === 'INTERNAL_NOTE'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Lock className="w-3 h-3" />
                  Internal Note
                </button>
                <button
                  type="button"
                  onClick={() => setComposerMode('PUBLIC_REPLY')}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1',
                    composerMode === 'PUBLIC_REPLY'
                      ? 'bg-background text-foreground shadow-2xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MessageSquare className="w-3 h-3" />
                  Public Reply
                </button>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                Press ⌘↵ to commit
              </span>
            </div>

            <form onSubmit={handleSendNote} className="flex items-center gap-2">
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder={
                  composerMode === 'INTERNAL_NOTE'
                    ? 'Write confidential note for support team...'
                    : 'Write public response to customer...'
                }
                className="flex-1 px-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button type="submit" size="sm" className="h-8 text-xs font-medium gap-1 px-3">
                <Send className="w-3 h-3" />
                Post
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueueOpsCockpit;
