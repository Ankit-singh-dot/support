import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import logoImage from '@/assets/animation-logo-transparent.png';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '../ui/field';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Ticket,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function RaiseTicketCard({ className, onSuccess, ...props }) {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (subject.trim().length < 3) {
      setError('Subject must be at least 3 characters long.');
      return;
    }
    if (description.trim().length < 5) {
      setError('Description must be at least 5 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const created = await apiClient.createTicket({
        subject: subject.trim(),
        priority,
        description: description.trim(),
      });

      const displayId = created.id
        ? `DF-${created.id.slice(0, 8).toUpperCase()}`
        : 'New Ticket';
      setSuccessInfo({ id: created.id, displayId });

      try {
        const cached = JSON.parse(
          localStorage.getItem('support_desk_customer_tickets') || '[]'
        );
        cached.unshift(created);
        localStorage.setItem(
          'support_desk_customer_tickets',
          JSON.stringify(cached)
        );
      } catch (e) {}

      if (onSuccess) {
        onSuccess(created);
      }

      // Navigate after brief confirmation
      setTimeout(() => {
        navigate(`/portal/tickets/${created.id}`);
      }, 1000);
    } catch (err) {
      setError(
        err.message || 'Failed to submit ticket. Please verify your connection.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4 font-sans', className)} {...props}>
      <Card className="overflow-hidden p-0 border border-neutral-200/90 shadow-2xl rounded-3xl bg-white">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Column: Support Request Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-4 bg-white z-10"
          >
            <FieldGroup>
              <div className="flex flex-col items-start gap-1 text-left mb-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60 mb-1">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Support Request</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
                  Raise a Support Ticket
                </h1>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Submit your request and our support engineering desk will get on it.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successInfo && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Ticket created successfully!</p>
                    <p className="text-emerald-700 text-[11px]">
                      Ticket ID: <strong className="font-mono">{successInfo.displayId}</strong>. Redirecting...
                    </p>
                  </div>
                </div>
              )}

              {/* Subject */}
              <Field>
                <FieldLabel htmlFor="ticket-subject">Subject *</FieldLabel>
                <Input
                  id="ticket-subject"
                  type="text"
                  required
                  placeholder="e.g. Cannot connect WhatsApp webhook"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="text-xs h-10 rounded-xl bg-neutral-50/70 border-neutral-200"
                />
              </Field>

              {/* Priority */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="ticket-priority">Priority</FieldLabel>
                  <span className="text-[11px] text-neutral-400">Default: Medium</span>
                </div>
                <select
                  id="ticket-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900 text-neutral-900 font-medium cursor-pointer"
                >
                  <option value="LOW">Low (General inquiry)</option>
                  <option value="MEDIUM">Medium (Standard issue)</option>
                  <option value="HIGH">High (Time-sensitive)</option>
                  <option value="URGENT">Urgent (Critical blocker)</option>
                </select>
              </Field>

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="ticket-description">Description *</FieldLabel>
                <Textarea
                  id="ticket-description"
                  required
                  rows={4}
                  placeholder="Provide full details: What happened? Steps to reproduce? Error messages seen?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs resize-none rounded-xl bg-neutral-50/70 border-neutral-200"
                />
              </Field>

              {/* Submit Button */}
              <Field className="pt-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-xs font-semibold gap-2 shadow-xs cursor-pointer rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                </Button>
              </Field>

              {/* Separator & Quick Topic Shortcuts */}
              <FieldSeparator>Or quick select category</FieldSeparator>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSubject('Technical Integration Issue: ')}
                  className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 text-[11px] font-medium text-neutral-600 hover:text-neutral-950 hover:bg-white text-center truncate transition-colors cursor-pointer"
                >
                  Integration
                </button>
                <button
                  type="button"
                  onClick={() => setSubject('Account & Permissions Inquiry: ')}
                  className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 text-[11px] font-medium text-neutral-600 hover:text-neutral-950 hover:bg-white text-center truncate transition-colors cursor-pointer"
                >
                  Account
                </button>
                <button
                  type="button"
                  onClick={() => setSubject('Bug Report: ')}
                  className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50/50 text-[11px] font-medium text-neutral-600 hover:text-neutral-950 hover:bg-white text-center truncate transition-colors cursor-pointer"
                >
                  Bug Report
                </button>
              </div>

              <FieldDescription className="text-center text-[11px]">
                Target response time: <strong className="text-neutral-900">Under 24 Hours SLA</strong>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right Column: Home Page Phase 1 Animation & Grid Background */}
          <div
            className="relative hidden md:flex flex-col items-center justify-between p-6 sm:p-8 overflow-hidden select-none bg-[#fafafc] border-l border-neutral-200/80 min-h-[580px]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.045) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.045) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
            }}
          >
            {/* Ambient radiant color flares from Home Page */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute -top-12 -right-12 w-80 h-80 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(147,197,253,0.45) 0%, rgba(199,210,254,0.25) 50%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
              <div
                className="absolute -bottom-8 -left-8 w-72 h-72 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 65%)',
                  filter: 'blur(35px)',
                }}
              />
            </div>

            {/* Top Header Tag */}
            <div className="w-full flex items-center justify-between z-20 relative">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  D
                </div>
                <span className="font-bold tracking-tight text-sm text-neutral-900">
                  DeskFlow Support
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-neutral-200/90 text-[10px] font-mono uppercase tracking-wider text-neutral-700 shadow-2xs backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Engine Active</span>
              </span>
            </div>

            {/* Center: Phase 1 3D Rotating Logo + Curved "Ticket raised" SVG Arc */}
            <div
              className="relative w-full h-[380px] flex flex-col items-center justify-center my-auto cursor-pointer"
              style={{ perspective: 1200 }}
            >
              {/* ── "Ticket raised" Curved Indicator & Associated Text Box ── */}
              <div className="absolute inset-0 pointer-events-none z-20">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 420 340"
                  fill="none"
                >
                  {/* Curved connecting arc towards the 3D logo */}
                  <motion.path
                    d="M 60 85 C 70 140, 115 185, 175 185"
                    stroke="rgba(99, 102, 241, 0.65)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.85, delay: 0.2, ease: 'easeOut' }}
                  />

                  {/* Pulsing Solid Dot at the end of the arc line */}
                  <motion.circle
                    cx="175"
                    cy="185"
                    r="5"
                    fill="#6366f1"
                    initial={{ scale: 0 }}
                    animate={{
                      scale: [1, 1.35, 1],
                      fill: ['#6366f1', '#818cf8', '#6366f1'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.8,
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.8))',
                    }}
                  />
                </svg>

                {/* Floating Text Box: "Ticket raised" with ping indicator */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: 0.25, type: 'spring', damping: 14 }}
                  className="absolute left-4 top-12 pointer-events-auto"
                >
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-200/90 shadow-[0_6px_20px_rgba(99,102,241,0.15)] hover:shadow-lg transition-shadow"
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40" />
                      <div className="relative w-2 h-2 rounded-full bg-indigo-600 shadow-sm" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 tracking-wide whitespace-nowrap">
                      Ticket raised
                    </span>
                  </motion.div>
                </motion.div>
              </div>

              {/* 3D Levitation & Elevation Tilt Wrapper */}
              <motion.div
                className="relative flex items-center justify-center z-10"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                  y: [-7, 7, -7],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Realistic 3D Rotating Logo */}
                <motion.div
                  className="w-56 h-56 sm:w-64 sm:h-64 relative flex items-center justify-center"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  animate={{
                    rotateY: [360, 0],
                    rotateX: [8, 12, 8],
                  }}
                  transition={{
                    rotateY: {
                      duration: 4.8,
                      repeat: Infinity,
                      ease: 'linear',
                    },
                    rotateX: {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                >
                  {/* Ambient Soft Glow Behind Logo */}
                  <div
                    className="absolute inset-2 rounded-full pointer-events-none -z-10"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(129,140,248,0.22) 50%, transparent 70%)',
                      filter: 'blur(30px)',
                    }}
                  />

                  {/* 3D Logo Front Face */}
                  <img
                    src={logoImage}
                    alt="DeskFlow 3D Support Logo"
                    className="w-full h-full object-contain filter contrast-105 select-none pointer-events-none"
                    style={{
                      opacity: 1,
                      backfaceVisibility: 'visible',
                      filter:
                        'drop-shadow(0 20px 30px rgba(59, 130, 246, 0.3)) drop-shadow(0 8px 12px rgba(99, 102, 241, 0.22))',
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Dynamic 3D Contact Shadow on the Floor */}
              <motion.div
                className="w-40 sm:w-48 h-5 rounded-full bg-slate-900/15 blur-md -mt-2 z-0"
                animate={{
                  scaleX: [1, 0.65, 1],
                  scaleY: [1, 0.75, 1],
                  opacity: [0.35, 0.2, 0.35],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            {/* Bottom Footer Info */}
            <div className="w-full pt-3 border-t border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-500 font-mono z-20 relative">
              <span>DeskFlow v2.0 Engine</span>
              <span>24/7 SLA Resolution</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RaiseTicketCard;
