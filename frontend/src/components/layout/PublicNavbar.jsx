import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Headphones, Shield, Users } from 'lucide-react';

export function PublicNavbar() {
  const navigate = useNavigate();
  const { user, staffUser, role, isSignedIn, isStaff, isCustomer } = useAuth();
  const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  const handleCustomerPortalClick = () => {
    if (isSignedIn && isCustomer) {
      navigate('/portal/dashboard');
    } else {
      navigate('/login/customer');
    }
  };

  const handleAgentClick = () => {
    if (staffUser && staffUser.role === 'AGENT') {
      navigate('/staff/dashboard');
    } else {
      navigate('/login/agent');
    }
  };

  const handleAdminClick = () => {
    if (staffUser && staffUser.role === 'ADMIN') {
      navigate('/staff/dashboard');
    } else {
      navigate('/login/admin');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-[72px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm transition-transform group-hover:scale-105">
            D
          </div>
          <span className="font-bold text-xl tracking-tight text-neutral-950">
            DeskFlow
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={handleCustomerPortalClick}
            className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-neutral-400" />
            <span>Customer Portal</span>
          </button>
          <button
            onClick={handleAgentClick}
            className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Headphones className="w-4 h-4 text-emerald-600" />
            <span>Agent Portal</span>
          </button>
          <button
            onClick={handleAdminClick}
            className="hover:text-neutral-950 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Admin Desk</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAgentClick}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span>Agent Login</span>
          </button>

          <button
            onClick={handleAdminClick}
            className="h-9 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Access</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>

          {/* If Signed In: Show Clerk UserButton & Role Badge */}
          {isClerkConfigured && isSignedIn && (
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                {role}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
