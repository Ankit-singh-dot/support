import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Headphones, UserCheck, ArrowRight, X, Sparkles } from 'lucide-react';

export const PRESET_STAFF = [
  {
    id: 'user_admin_seed',
    name: 'System Admin',
    email: 'admin@supportdesk.internal',
    role: 'ADMIN',
    badge: 'Full Access',
    desc: 'Assign tickets, configure SLA, manage agents, view metrics',
    icon: Shield,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'user_agent_seed',
    name: 'Jane Agent',
    email: 'jane.support@supportdesk.internal',
    role: 'AGENT',
    badge: 'Triage & Resolution',
    desc: 'Inspect tickets, respond to customers, add internal notes',
    icon: Headphones,
    color: 'from-emerald-600 to-teal-600',
  },
];

export function StaffAuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { loginStaff } = useAuth();
  const [tab, setTab] = useState('quick'); // 'quick' | 'custom'
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (staff) => {
    loginStaff(staff);
    if (onClose) onClose();
    navigate('/staff/dashboard');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setError('Please provide your staff email or username.');
      return;
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const isEmail = cleanInput.includes('@');
    const staffId = `staff_${cleanInput.replace(/[^a-z0-9_]/g, '_')}`;
    const staffEmail = isEmail ? cleanInput : `${cleanInput}@supportdesk.internal`;
    const name = fullName.trim() || cleanInput.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const staffProfile = {
      id: staffId,
      name,
      email: staffEmail,
      role: selectedRole,
    };

    loginStaff(staffProfile);
    if (onClose) onClose();
    navigate('/staff/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-neutral-200/80 p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5 text-neutral-900" />
            <span>Staff Portal Access</span>
          </div>
          <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
            Staff Desk Login
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Direct mail &amp; password staff credentials. No Clerk authentication required.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('quick')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'quick'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Quick Select
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`py-2 rounded-lg transition-all ${
              tab === 'custom'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Mail &amp; Password
          </button>
        </div>

        {tab === 'quick' ? (
          <div className="space-y-3">
            {PRESET_STAFF.map((staff) => {
              const Icon = staff.icon;
              return (
                <div
                  key={staff.id}
                  onClick={() => handleSelectPreset(staff)}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-neutral-200 hover:border-neutral-950 bg-neutral-50/50 hover:bg-white transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${staff.color} text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">
                        {staff.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-700 uppercase">
                        {staff.role}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5 truncate">
                      {staff.email}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1 leading-snug">
                      {staff.desc}
                    </p>
                  </div>
                  <div className="self-center">
                    <span className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Staff Email or Username <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  setError('');
                }}
                placeholder="e.g. admin@supportdesk.internal or jane.agent"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Shivam Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Staff Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-bold text-xs">Admin</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      selectedRole === 'ADMIN' ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    Full desk control
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('AGENT')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedRole === 'AGENT'
                      ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-bold text-xs">Support Agent</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      selectedRole === 'AGENT' ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    Ticket triage &amp; chat
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Login to Staff Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
          <span>Clerk authentication is kept for Customers</span>
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Direct DB Sync
          </span>
        </div>
      </div>
    </div>
  );
}

export default StaffAuthModal;