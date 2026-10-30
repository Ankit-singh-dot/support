import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, ArrowRight, Shield, Headphones, Sparkles, UserPlus } from 'lucide-react';

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSignIn, openSignUp, isCustomerSignedIn } = useAuth();
  const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  // If already logged in as customer, redirect to customer portal
  useEffect(() => {
    if (isCustomerSignedIn) {
      const target = location.state?.from?.pathname || '/portal/dashboard';
      navigate(target, { replace: true });
    }
  }, [isCustomerSignedIn, navigate, location]);

  const handleClerkSignIn = () => {
    if (openSignIn) {
      openSignIn({
        fallbackRedirectUrl: '/portal/dashboard',
        signUpFallbackRedirectUrl: '/portal/dashboard',
      });
    }
  };

  const handleClerkSignUp = () => {
    if (openSignUp) {
      openSignUp({
        fallbackRedirectUrl: '/portal/dashboard',
        signInFallbackRedirectUrl: '/portal/dashboard',
      });
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200/80 text-xs font-semibold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5 text-neutral-800" />
          <span>Customer Portal</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/90 shadow-xl p-6 sm:p-8 relative">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-neutral-950">
            Customer Sign In
          </h1>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Submit support tickets, view live resolution status, and talk with our support team.
          </p>
        </div>

        {/* Live Clerk Auth Section */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2">
            <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-neutral-900" />
              Live Clerk Authentication
            </p>
            <p>
              Sign in securely with email verification, magic link, or social login powered by Clerk.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClerkSignIn}
            className="w-full py-3.5 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue with Clerk</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleClerkSignUp}
              className="text-xs text-neutral-600 hover:text-neutral-950 font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Don't have an account? Sign up with Clerk</span>
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <Link
            to="/login/admin"
            className="hover:text-neutral-950 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </Link>
          <Link
            to="/admin/agent"
            className="hover:text-neutral-950 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Agent Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CustomerLoginPage;
