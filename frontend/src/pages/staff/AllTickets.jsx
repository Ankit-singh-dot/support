import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import TicketList from '../../components/tickets/TicketList';
import TicketFilters from '../../components/tickets/TicketFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export function AllTickets() {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'ALL',
    priority: searchParams.get('priority') || 'ALL',
    assigneeId: searchParams.get('assigneeId') || '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    isOverdue: searchParams.get('isOverdue') || '',
  });

  // Load agents for filter dropdown (Admin only)
  useEffect(() => {
    if (!isAdmin) return;
    async function fetchAgents() {
      try {
        const list = await apiClient.listAgents();
        setAgents(list);
      } catch (err) {
        console.error('Failed to load agents list:', err);
      }
    }
    fetchAgents();
  }, [isAdmin]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.listTickets(filters);
      setTickets(res.tickets || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load staff tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      assigneeId: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      isOverdue: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isAdmin ? 'All Support Tickets (Master Queue)' : 'My Assigned Support Tickets'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? `Displaying ${tickets.length} of ${total} total tickets in the support operations queue.`
              : `Displaying your assigned workload (${total} tickets assigned to you by administrator).`}
          </p>
        </div>
      </div>

      <TicketFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        agents={agents}
        isStaff={true}
        showAssigneeFilter={isAdmin}
      />

      {loading ? (
        <LoadingSpinner text="Filtering tickets from database..." />
      ) : (
        <TicketList
          tickets={tickets}
          baseUrl="/staff/tickets"
          emptyTitle={
            isAdmin
              ? 'No tickets found matching current criteria'
              : 'You currently have no tasks assigned to you by an administrator'
          }
        />
      )}
    </div>
  );
}

export default AllTickets;
