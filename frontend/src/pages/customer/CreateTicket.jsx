import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RaiseTicketCard from '../../components/tickets/RaiseTicketCard';

export function CreateTicket() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 font-sans py-2">
      <div className="flex items-center gap-2">
        <Link
          to="/portal/tickets"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Tickets</span>
        </Link>
      </div>

      <RaiseTicketCard />
    </div>
  );
}

export default CreateTicket;
