import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { Shield, ArrowRight, Lock, Mail, CheckCircle2, AlertCircle, Headphones, Users } from 'lucide-react';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginStaff, staffUser } = useAuth();

  const [tab, setTab] = useState('quick'); // 'quick' | 'credentials'
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect to staff dashboard
  useEffect(() => {
    if (staffUser && staffUser.role === 'ADMIN') {
      const target = location.state?.from?.pathname || '/staff/dashboard';
      navigate(target, { replace: true });
    }
  }, [staffUser, navigate, location]);

  // Load existing admin users from DB
  useEffect(() => {
    async function fetchAdmins() {
      try {
        setLoadingAdmins(true);
        const allAgents = await apiClient.listAgents().catch(() => []);
        const filtered = allAgents.filter((u) => u.role === 'ADMIN');
        if (filtered.length > 0) {
          setAdmins(filtered);
        } else {
          setAdmins([
            {
              id: 'user_admin_seed',
              name: 'System Admin',
              email: 'admin@supportdesk.internal',
              role: 'ADMIN',
            },
          ]);
        }
      } catch (err) {
        setAdmins([
          {
            id: 'user_admin_seed',
            name: 'System Admin',
            email: 'admin@supportdesk.internal',
            role: 'ADMIN',
          },
        ]);
      } finally {
        setLoadingAdmins(false);
      }
    }
    fetchAdmins();
  }, []);

  const handleSelectAdmin = (admin) => {
    loginStaff({
      id: admin.id,
      clerkId: admin.clerkId || admin.id,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN',
    });
    const target = location.state?.from?.pathname || '/staff/dashboard';
    navigate(target, { replace: true });
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUser.trim()) {
      setError('Please provide your administrator email or username.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const authenticatedUser = await apiClient.staffLogin({
        identifier: emailOrUser.trim(),
        password: password.trim(),
        requiredRole: 'ADMIN',
      });

      loginStaff(authenticatedUser);
      const target = location.state?.from?.pathname || '/staff/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#fafafc] text-neutral-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-neutral-900 selection:text-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.045) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }}
    >
      {/* Brand Header */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
            D
          </div>
          <span className="font-bold text-lg tracking-tight text-neutral-950">DeskFlow</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-blue-700" />
          <span>Admin Access</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/90 shadow-xl p-6 sm:p-8 relative">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-neutral-950">
            Administrator Portal
          </h1>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Full control desk access. Manage support agents, configure queues, and view operational metrics. No Clerk account required.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('quick')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'quick' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Quick Select
          </button>
          <button
            type="button"
            onClick={() => setTab('credentials')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'credentials' ? 'bg-white text-neutral-950 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Email &amp; Password
          </button>
        </div>

        {tab === 'quick' ? (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Select verified admin identity
            </p>
            {loadingAdmins ? (
              <div className="p-6 text-center text-xs text-neutral-400 animate-pulse">
                Querying database administrators...
              </div>
            ) : (
              admins.map((adm) => (
                <button
                  key={adm.id}
                  onClick={() => handleSelectAdmin(adm)}
                  className="w-full text-left group flex items-center justify-between p-4 rounded-2xl border border-neutral-200 hover:border-neutral-950 bg-neutral-50/50 hover:bg-white transition-all cursor-pointer shadow-2xs hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-neutral-950 flex items-center gap-2">
                        <span>{adm.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          ADMIN
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 font-mono truncate">{adm.email}</div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-neutral-950 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Admin Work Email or Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="admin@supportdesk.internal"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="System Administrator"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Links to Other Roles */}
        <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <Link to="/admin/agent" className="hover:text-neutral-950 font-medium inline-flex items-center gap-1">
            <Headphones className="w-3.5 h-3.5" />
            <span>Agent Login</span>
          </Link>
          <Link to="/login/customer" className="hover:text-neutral-950 font-medium inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;

