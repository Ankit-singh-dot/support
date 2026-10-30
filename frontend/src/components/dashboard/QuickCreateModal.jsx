import React, { useState } from 'react';
import apiClient from '../../api/client';
import { X, Ticket, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickCreateModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab] = useState('ticket'); // 'ticket' | 'agent'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ticket Form State
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  // Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [agentRole, setAgentRole] = useState('AGENT');
  const [agentPhone, setAgentPhone] = useState('');

  if (!isOpen) return null;

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.createTicket({
        subject: subject.trim(),
        priority,
        description: description.trim(),
      });
      setSuccessMsg('Ticket created successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setSubject('');
        setDescription('');
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!agentName.trim() || !agentEmail.trim() || !agentPassword.trim()) {
      setError('Name, email, and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.createAgent({
        name: agentName.trim(),
        email: agentEmail.trim(),
        password: agentPassword.trim(),
        role: agentRole,
        phone: agentPhone.trim() || undefined,
      });
      setSuccessMsg('Staff account created successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setAgentName('');
        setAgentEmail('');
        setAgentPassword('');
        setAgentPhone('');
        onClose();
        if (onSuccess) onSuccess();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to create agent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans animate-in fade-in">
      <div className="bg-white border border-neutral-200 text-neutral-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-base text-neutral-950 tracking-tight">Quick Create</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 m-5 mb-0 bg-neutral-100 rounded-xl border border-neutral-200/80">
          <button
            type="button"
            onClick={() => {
              setTab('ticket');
              setError('');
            }}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              tab === 'ticket'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Ticket className="w-3.5 h-3.5 text-blue-600" />
            <span>New Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('agent');
              setError('');
            }}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
              tab === 'agent'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>New Staff Agent</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Create Ticket */}
        {tab === 'ticket' ? (
          <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
              >
                <option value="LOW">Low (General inquiry)</option>
                <option value="MEDIUM">Medium (Standard issue)</option>
                <option value="HIGH">High (Urgent customer impact)</option>
                <option value="URGENT">Urgent (Immediate resolution)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of the issue or support request..."
                required
                className="w-full p-3.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 leading-relaxed resize-none font-normal"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Create Agent */
          <form onSubmit={handleCreateAgent} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-normal"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  placeholder="alex@deskflow.io"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={agentPassword}
                  onChange={(e) => setAgentPassword(e.target.value)}
                  placeholder="Secret password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Role
                </label>
                <select
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                >
                  <option value="AGENT">Support Agent</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={agentPhone}
                  onChange={(e) => setAgentPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-normal"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Agent Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuickCreateModal;
