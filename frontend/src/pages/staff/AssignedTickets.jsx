import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import TicketList from '../../components/tickets/TicketList';
import TicketFilters from '../../components/tickets/TicketFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export function AssignedTickets() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    assigneeId: 'me', // Scoped to currently authenticated agent
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    isOverdue: '',
  });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.listTickets(filters);
      setTickets(res.tickets || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load assigned tickets:', err);
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
      assigneeId: 'me',
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      isOverdue: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tickets Assigned to Me</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active workload assigned to your support profile ({total} tickets).
          </p>
        </div>
      </div>

      <TicketFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isStaff={false}
      />

      {loading ? (
        <LoadingSpinner text="Loading assigned tickets..." />
      ) : (
        <TicketList
          tickets={tickets}
          baseUrl="/staff/tickets"
          emptyTitle="You currently have no assigned tickets"
        />
      )}
    </div>
  );
}

export default AssignedTickets;
