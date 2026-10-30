import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RoleBadge } from '../../components/common/Badge';
import {
  Users,
  Search,
  Shield,
  Headphones,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  X,
  Mail,
  User,
  Phone,
  Building,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Key,
} from 'lucide-react';

export function AgentManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Create Agent Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentEmail, setNewAgentEmail] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('AGENT');
  const [newAgentPassword, setNewAgentPassword] = useState('Agent@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentCompany, setNewAgentCompany] = useState('DeskFlow Support');
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [modalError, setModalError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateRandomPassword = () => {
    const words = ['Secure', 'Swift', 'Support', 'Agent', 'Active', 'Desk'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setNewAgentPassword(`${word}@${num}`);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.listUsers({ search, role: roleFilter });
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    setFeedback(null);
    try {
      const updated = await apiClient.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
      setFeedback({ type: 'success', message: `Updated ${updated.name}'s role to ${newRole}` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update user role' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateAgentSubmit = async (e) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentEmail.trim()) {
      setModalError('Please enter both name and email.');
      return;
    }
    if (!newAgentPassword.trim() || newAgentPassword.length < 4) {
      setModalError('Please provide a password of at least 4 characters.');
      return;
    }

    setCreatingAgent(true);
    setModalError('');

    try {
      const created = await apiClient.createAgent({
        name: newAgentName.trim(),
        email: newAgentEmail.trim().toLowerCase(),
        role: newAgentRole,
        password: newAgentPassword.trim(),
        phone: newAgentPhone.trim() || null,
        company: newAgentCompany.trim() || 'DeskFlow Support',
      });

      // Insert new agent at the top of directory
      setUsers((prev) => [created, ...prev]);
      setCreatedCredentials({
        name: created.name,
        email: created.email,
        role: created.role,
        password: newAgentPassword.trim(),
      });
      setFeedback({
        type: 'success',
        message: `Successfully created ${created.name} (${created.email}) with login password.`,
      });

      // Reset and close modal
      setNewAgentName('');
      setNewAgentEmail('');
      setNewAgentRole('AGENT');
      setNewAgentPassword('Agent@2026');
      setNewAgentPhone('');
      setNewAgentCompany('DeskFlow Support');
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err.message || 'Failed to create agent.');
    } finally {
      setCreatingAgent(false);
    }
  };

  // Staff summary counts
  const totalStaff = users.filter((u) => u.role === 'AGENT' || u.role === 'ADMIN').length;
  const totalAgents = users.filter((u) => u.role === 'AGENT').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">User &amp; Agent Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer support agents, provision new staff identities, and oversee team privileges.
          </p>
        </div>

        <button
          onClick={() => {
            setModalError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New Agent</span>
        </button>
      </div>

      {/* Staff KPI Summary */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-muted-foreground">Total Staff</div>
          <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{totalStaff}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-muted-foreground">Support Agents</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">{totalAgents}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-medium text-muted-foreground">Administrators</div>
          <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">{totalAdmins}</div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border shadow-2xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {createdCredentials && (
        <div className="p-4 rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
                New Agent Account Created
              </span>
            </div>
            <button
              onClick={() => {
                const text = `Support Desk Credentials:\nName: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nLogin URL: ${window.location.origin}/admin/agent`;
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/10 font-mono">
            <div>
              <span className="text-neutral-400 text-[10px] block uppercase font-sans">Agent Name</span>
              <span className="font-semibold text-white">{createdCredentials.name}</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[10px] block uppercase font-sans">Work Email</span>
              <span className="text-neutral-200">{createdCredentials.email}</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[10px] block uppercase font-sans">Login Password</span>
              <span className="text-emerald-300 font-bold">{createdCredentials.password}</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-2.5 font-sans">
            The agent can now sign in immediately at <strong className="text-white">/admin/agent</strong> using their email and this password.
          </p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team members by name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring text-foreground font-medium"
        >
          <option value="">All Roles</option>
          <option value="AGENT">Support Agents</option>
          <option value="ADMIN">Administrators</option>
          <option value="CUSTOMER">Customers</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading system team and directory..." />
      ) : users.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-xl border border-border shadow-2xs text-muted-foreground text-xs">
          No users match the search criteria.
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Ticket Workload</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Modify Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.role === 'ADMIN' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                            ADMIN
                          </span>
                        )}
                        {u.role === 'AGENT' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                            AGENT
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground text-[11px] font-mono">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div>Assigned: <strong className="text-foreground">{u._count?.assignedTickets || 0}</strong> tickets</div>
                      <div>Submitted: {u._count?.customerTickets || 0} tickets</div>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        disabled={updatingId === u.id}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 text-xs border border-input rounded-md bg-background font-medium focus:ring-1 focus:ring-ring disabled:opacity-50 text-foreground cursor-pointer"
                      >
                        <option value="AGENT">Support Agent</option>
                        <option value="ADMIN">Administrator</option>
                        <option value="CUSTOMER">Customer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create New Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-neutral-200/90 p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider mb-2">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Team Provisioning</span>
              </div>
              <h2 className="text-xl font-black text-neutral-950 tracking-tight">
                Add New Support Agent
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Create a new support staff account. The agent will immediately appear in the ticket assignment picker and agent login directory.
              </p>
            </div>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAgentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g. Liam Martinez"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newAgentEmail}
                    onChange={(e) => setNewAgentEmail(e.target.value)}
                    placeholder="liam.support@supportdesk.internal"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Login Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-neutral-600 hover:text-neutral-950 font-medium underline cursor-pointer"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newAgentPassword}
                    onChange={(e) => setNewAgentPassword(e.target.value)}
                    placeholder="Enter password (min 4 characters)"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Staff Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewAgentRole('AGENT')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newAgentRole === 'AGENT'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Support Agent</div>
                    <div className={`text-[10px] mt-0.5 ${newAgentRole === 'AGENT' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Triage &amp; Resolve
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAgentRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      newAgentRole === 'ADMIN'
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-bold text-xs">Administrator</div>
                    <div className={`text-[10px] mt-0.5 ${newAgentRole === 'ADMIN' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Full System Admin
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newAgentPhone}
                    onChange={(e) => setNewAgentPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Department / Team
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={newAgentCompany}
                    onChange={(e) => setNewAgentCompany(e.target.value)}
                    placeholder="Customer Operations"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAgent}
                  className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{creatingAgent ? 'Creating...' : 'Confirm & Save Agent'}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentManagement;
