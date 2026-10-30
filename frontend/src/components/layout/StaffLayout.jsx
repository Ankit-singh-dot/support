import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  LayoutDashboard,
  Inbox,
  UserCheck,
  Users,
  Search,
  Headphones,
  GitBranch,
  BarChart3,
  ExternalLink,
  Plus,
  Mail,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import QuickCreateModal from '../dashboard/QuickCreateModal';

export function StaffLayout() {
  const { user, role, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const adminNavItems = [
    { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Lifecycle', path: '/staff/dashboard#lifecycle', icon: GitBranch },
    { label: 'Analytics', path: '/staff/dashboard#analytics', icon: BarChart3 },
    { label: 'All Tickets', path: '/staff/tickets', icon: Inbox },
    { label: 'Agent Workspace', path: '/staff/agent', icon: Headphones },
    { label: 'Team & Agents', path: '/staff/agents', icon: Users },
  ];

  const agentNavItems = [
    { label: 'My Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'My Assigned Tickets', path: '/staff/assigned', icon: UserCheck },
    { label: 'Active Workspace', path: '/staff/agent', icon: Headphones },
    { label: 'Lifecycle', path: '/staff/dashboard#lifecycle', icon: GitBranch },
  ];

  const navItems = isAdmin ? adminNavItems : agentNavItems;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-neutral-50/50 text-neutral-900 font-sans antialiased">
      {/* Quick Create Dialog */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onSuccess={() => {
          if (location.pathname === '/staff/dashboard' || location.pathname === '/staff/tickets') {
            window.location.reload();
          }
        }}
      />

      {/* Permanently Fixed Left Sidebar */}
      <aside className="w-60 shrink-0 h-screen border-r border-neutral-200/90 bg-white flex flex-col justify-between shadow-2xs z-30 select-none overflow-y-auto">
        <div>
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center px-5 border-b border-neutral-100">
            <Link to="/staff/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                D
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight text-neutral-950 leading-tight">DeskFlow</span>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase font-semibold">Support Admin</span>
              </div>
            </Link>
          </div>

          {/* Quick Create Button Row matching dashboard-01 architecture */}
          <div className="p-3 pb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickCreateOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 transition-all text-xs font-bold shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Create</span>
            </button>

            <Link
              to="/staff/tickets"
              title="View All Tickets Queue"
              className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors flex items-center justify-center active:scale-95"
            >
              <Mail className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation Tab Links */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map(({ label, path, icon: Icon }) => {
              const isHash = path.includes('#');
              const isActive = isHash
                ? location.pathname + location.hash === path
                : location.pathname === path && !location.hash;

              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all font-semibold',
                    isActive
                      ? 'bg-neutral-100 text-neutral-950 shadow-2xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-neutral-950' : 'text-neutral-500')} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Documents & System Section */}
          <div className="px-3 pt-4 border-t border-neutral-100 mt-2">
            <span className="px-3 text-[10px] font-bold tracking-wider uppercase text-neutral-400 block mb-2">
              System &amp; Tools
            </span>
            <div className="space-y-0.5">
              <Link
                to="/staff/agent"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors font-medium"
              >
                <Headphones className="w-4 h-4 text-neutral-400" />
                <span>Agent Console</span>
              </Link>
              <Link
                to="/portal/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 transition-colors font-medium"
              >
                <span className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-neutral-400" />
                  <span>Customer Portal</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">LIVE</span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-neutral-100 bg-white">
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-8 h-8 rounded-full border border-neutral-200 shrink-0">
                <AvatarFallback className="bg-neutral-200 text-neutral-800 text-xs font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-950 truncate leading-tight">
                  {user?.name || 'Staff User'}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono capitalize font-medium">
                  {role?.toLowerCase() || 'admin'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Sign out of staff desk"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Scrollable Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-neutral-50/50">
        {/* Top Header */}
        <header className="h-16 border-b border-neutral-200/90 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4 px-6 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets, customers, or subjects..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/staff/tickets?search=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-normal shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-700 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Neon DB Live</span>
            </div>

            <Link
              to="/portal/dashboard"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StaffLayout;
