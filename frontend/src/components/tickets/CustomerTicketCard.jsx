import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Heart, Ticket, ShieldAlert, Sparkles, QrCode, ArrowRight } from 'lucide-react';

const STATUS_CONFIG = {
  OPEN: {
    label: 'OPEN',
    bg: 'bg-blue-50 text-blue-600 border-blue-200/60',
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
  },
  WAITING_ON_CUSTOMER: {
    label: 'PENDING INFO',
    bg: 'bg-purple-50 text-purple-700 border-purple-200/60',
  },
  RESOLVED: {
    label: 'RESOLVED',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  },
  CANCELLED: {
    label: 'CANCELLED',
    bg: 'bg-rose-50 text-rose-600 border-rose-200/60',
  },
  CLOSED: {
    label: 'CLOSED',
    bg: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
};

export function CustomerTicketCard({ ticket, user }) {
  const navigate = useNavigate();

  const statusInfo = STATUS_CONFIG[ticket.status] || {
    label: ticket.status || 'OPEN',
    bg: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  // Format date & time like in the reference image: "21 May 2026 at 09:30"
  const formattedDate = (() => {
    try {
      const d = new Date(ticket.createdAt || Date.now());
      const datePart = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timePart = d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${datePart} at ${timePart}`;
    } catch (e) {
      return 'Today';
    }
  })();

  // Ticket code formatted like "AII-CAR-001" or "DF-TICK-001"
  const ticketCode = ticket.ticketCode || `DF-TICK-${(ticket.id || '001').slice(-3).toUpperCase()}`;

  // Customer display details
  const customerName = ticket.customer?.name || user?.name || 'Customer';
  const customerPhone = ticket.customer?.phone || user?.phone || '+91 9557904746';

  // Category or Department
  const category = ticket.category || 'Support';

  return (
    <div
      onClick={() => navigate(`/portal/tickets/${ticket.id}`)}
      className="group relative bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      {/* Left Section: Icon & Info */}
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        {/* Soft Rounded Icon Container */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl shrink-0 border border-rose-100/60 shadow-xs transition-transform group-hover:scale-105">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1">
          {/* Ticket Subject / Department */}
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate tracking-tight group-hover:text-blue-600 transition-colors">
            {ticket.subject || 'Support Ticket'}
          </h3>

          {/* Metadata Row: Category · Date & Time · Location/Channel */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-neutral-500 mt-0.5">
            <span className="font-medium text-neutral-700">{category}</span>
            <span>·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span className="text-neutral-500">Support Desk</span>
          </div>

          {/* Requester Row: Patient/Requester name · Phone */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-600 mt-1.5">
            <span>
              Requester: <strong className="font-semibold text-neutral-800">{customerName}</strong>
            </span>
            <span className="text-neutral-300">·</span>
            <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
              <Phone className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span>{customerPhone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Ticket Code, Status Badge, Quick Action */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
        {/* Ticket Code Monospace Pill */}
        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200/70 tracking-wider">
          {ticketCode}
        </span>

        {/* Status Pill Badge */}
        <span
          className={`font-bold text-[11px] px-3.5 py-0.5 rounded-full border uppercase tracking-wider ${statusInfo.bg}`}
        >
          {statusInfo.label}
        </span>

        {/* Action Pill (QR / View) */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 group-hover:bg-blue-50 border border-neutral-200/80 group-hover:border-blue-200 text-neutral-600 group-hover:text-blue-600 text-[11px] font-semibold transition-colors">
          <QrCode className="w-3.5 h-3.5 text-blue-500" />
          <span>Ticket QR</span>
        </div>
      </div>
    </div>
  );
}

export default CustomerTicketCard;