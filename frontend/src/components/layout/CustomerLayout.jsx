import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserButton } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CustomerLayout() {
  const { user, isCustomerSignedIn, logout } = useAuth();
  const location = useLocation();
  const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  const navItems = [
    { label: 'Home', path: '/portal/dashboard' },
    { label: 'My tickets', path: '/portal/tickets' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/portal/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center text-sm font-semibold">
                D
              </div>
              <span className="font-semibold tracking-tight">DeskFlow</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'transition-colors',
                    location.pathname === item.path
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/portal/tickets/new">
              <Button size="sm" className="gap-1.5 rounded-full px-4">
                <Plus className="w-4 h-4" />
                <span>New ticket</span>
              </Button>
            </Link>

            {isClerkConfigured && (
              <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 rounded-full ring-2 ring-neutral-200',
                    },
                  }}
                />
                <span className="text-xs font-semibold text-neutral-800 hidden sm:inline truncate max-w-[120px]">
                  {user?.name || 'Customer'}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
