import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Headphones, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginStaff, staffUser, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Only auto-redirect if already logged in specifically as an AGENT
  useEffect(() => {
    if (staffUser && staffUser.role === 'AGENT') {
      const target = location.state?.from?.pathname || '/staff/dashboard';
      navigate(target, { replace: true });
    }
  }, [staffUser, navigate, location]);

  // Load active agents from DB for quick testing
  useEffect(() => {
    async function fetchAgents() {
      try {
        setLoadingAgents(true);
        const all = await apiClient.listAgents().catch(() => []);
        const agentList = all.filter((u) => u.role === 'AGENT');
        if (agentList.length > 0) {
          setAgents(agentList);
          // Pre-populate with first agent email if available
          if (agentList[0]?.email) {
            setEmail(agentList[0].email);
            setPassword('Staff@123');
          }
        } else {
          setAgents([
            {
              id: 'user_agent_seed',
              name: 'Jane Agent',
              email: 'jane.support@supportdesk.internal',
              role: 'AGENT',
            },
          ]);
          setEmail('jane.support@supportdesk.internal');
          setPassword('Staff@123');
        }
      } catch (err) {
        setAgents([
          {
            id: 'user_agent_seed',
            name: 'Jane Agent',
            email: 'jane.support@supportdesk.internal',
            role: 'AGENT',
          },
        ]);
        setEmail('jane.support@supportdesk.internal');
        setPassword('Staff@123');
      } finally {
        setLoadingAgents(false);
      }
    }
    fetchAgents();
  }, []);

  const handleSelectAgent = (agent) => {
    loginStaff({
      id: agent.id,
      clerkId: agent.clerkId || agent.id,
      name: agent.name,
      email: agent.email,
      role: 'AGENT',
    });
    const target = location.state?.from?.pathname || '/staff/dashboard';
    navigate(target, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your agent email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const authenticatedUser = await apiClient.staffLogin({
        identifier: email.trim(),
        password: password.trim(),
        requiredRole: 'AGENT',
      });

      loginStaff(authenticatedUser);
      const target = location.state?.from?.pathname || '/staff/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm space-y-4">
        {/* Brand / Title Header */}
        <div className="flex items-center justify-center gap-2.5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-neutral-950 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
              D
            </div>
            <span className="font-black text-xl tracking-tight text-neutral-950">DeskFlow</span>
          </Link>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            AGENT PORTAL
          </span>
        </div>

        {/* Existing Admin Session Notice if applicable */}
        {staffUser && staffUser.role === 'ADMIN' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
            <span>
              Signed in as <strong>{staffUser.name}</strong> (Admin).
            </span>
            <button
              onClick={() => logout()}
              className="text-xs font-bold text-amber-950 underline hover:text-amber-800 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}

        {/* shadcn login-01 card replica */}
        <Card className="bg-white border-neutral-200/90 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-neutral-950">
              Login to Agent Portal
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Enter your email below to access your assigned support queue
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-neutral-900">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@deskflow.io"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="rounded-xl border-neutral-300 text-sm focus-visible:ring-neutral-900"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-neutral-900">
                    Password
                  </label>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Default: Staff@123
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="rounded-xl border-neutral-300 text-sm focus-visible:ring-neutral-900"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {submitting ? 'Authenticating...' : 'Login as Agent'}
              </Button>
            </form>

            {/* Quick Test Agent Accounts */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white px-2 text-neutral-400">Or quick select agent</span>
              </div>
            </div>

            <div className="space-y-2">
              {loadingAgents ? (
                <p className="text-center text-xs text-neutral-400 italic py-1">
                  Loading agents from Neon DB...
                </p>
              ) : (
                agents.map((ag) => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => handleSelectAgent(ag)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/90 hover:border-neutral-900 bg-neutral-50/70 hover:bg-white text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {ag.name ? ag.name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-neutral-900 truncate">
                          {ag.name}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono truncate">
                          {ag.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-950 transition-colors flex items-center gap-1 shrink-0">
                      <span>Login</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2 border-t border-neutral-100 text-center text-xs">
            <p className="text-neutral-500">
              Need Administrator access?{' '}
              <Link to="/login/admin" className="font-semibold text-neutral-950 underline underline-offset-2 hover:text-blue-600">
                Admin Console
              </Link>
            </p>
            <p className="text-neutral-400 text-[11px]">
              Customer requesting support?{' '}
              <Link to="/login/customer" className="font-medium text-neutral-600 underline underline-offset-2">
                Customer Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default AgentLoginPage;
