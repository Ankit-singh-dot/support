const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`)
  : '/api';

class ApiClient {
  constructor() {
    this.tokenGetter = null;
    this.devUserId = null;
    this.staffUser = null;
    // Clear any obsolete dev user id that was defaulting to System Admin
    localStorage.removeItem('support_desk_dev_user_id');
  }

  setTokenGetter(getter) {
    this.tokenGetter = getter;
  }

  setStaffUser(user) {
    this.staffUser = user;
    if (user) {
      localStorage.setItem('support_desk_staff_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('support_desk_staff_user');
    }
  }

  getStaffUser() {
    if (!this.staffUser) {
      const storedStaff = localStorage.getItem('support_desk_staff_user');
      if (storedStaff) {
        try {
          this.staffUser = JSON.parse(storedStaff);
        } catch (e) {}
      }
    }
    return this.staffUser;
  }

  setDevUser(userId) {
    this.devUserId = userId;
  }

  getDevUser() {
    return this.devUserId;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // If browsing explicitly on Customer portal routes, do not attach staff headers
    const isCustomerRoute = typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/portal') ||
      window.location.pathname.startsWith('/login/customer') ||
      window.location.pathname.startsWith('/login/costuemer')
    );

    // 1. Staff identity (Admin & Agent - strictly takes precedence over Clerk on staff routes)
    const staff = !isCustomerRoute ? this.getStaffUser() : null;
    if (staff) {
      headers['x-staff-id'] = staff.id;
      headers['x-staff-role'] = staff.role || 'ADMIN';
      headers['x-staff-name'] = staff.name || staff.id;
      headers['x-staff-email'] = staff.email || `${staff.id}@supportdesk.internal`;
    } else {
      // 2. Customer Clerk token (only attached when not operating as staff)
      let clerkToken = null;
      if (this.tokenGetter) {
        try {
          clerkToken = await this.tokenGetter();
          if (clerkToken) {
            headers['Authorization'] = `Bearer ${clerkToken}`;
          }
        } catch (e) {
          console.warn('Failed to retrieve Clerk token:', e);
        }
      }

      if (!clerkToken && this.devUserId) {
        headers['x-dev-user-id'] = this.devUserId;
      }
    }

    const config = {
      ...options,
      headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (err) {
        errorData = { error: res.statusText || 'Network request failed' };
      }
      const error = new Error(errorData.error || 'API request failed');
      error.status = res.status;
      error.details = errorData.details;
      throw error;
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  }

  // Users & Auth
  async staffLogin(credentials) {
    const res = await this.request('/users/staff-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setStaffUser(res);
    return res;
  }

  async getMe() {
    return this.request('/users/me');
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async listUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async updateUserRole(userId, role) {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // Agents
  async listAgents() {
    return this.request('/agents');
  }

  async createAgent(data) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Tickets
  async listTickets(params = {}) {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/tickets${query ? `?${query}` : ''}`);
  }

  async getTicket(id) {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(data) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicket(id, data) {
    return this.request(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Conversation Entries & Notes
  async getTicketEntries(ticketId) {
    return this.request(`/tickets/${ticketId}/entries`);
  }

  async createTicketEntry(ticketId, data) {
    return this.request(`/tickets/${ticketId}/entries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Activity History
  async getTicketHistory(ticketId) {
    return this.request(`/tickets/${ticketId}/history`);
  }

  // Dashboard Metrics
  async getDashboard() {
    return this.request('/dashboard');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
