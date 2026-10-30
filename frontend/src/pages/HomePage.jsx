import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import HeroMotionGraphic from '../components/home/HeroMotionGraphic';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Play, Inbox, Lock, Clock } from 'lucide-react';

const FEATURES = [
  {
    icon: Inbox,
    title: 'One shared inbox',
    text: 'Every customer request in one place with a clear owner and real-time state.',
  },
  {
    icon: Lock,
    title: 'Private team notes',
    text: 'Collaborate with your team directly inside the ticket without customers seeing it.',
  },
  {
    icon: Clock,
    title: 'SLA & nothing slips',
    text: 'Intelligent triage flags overdue requests and escalates blocked tickets.',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { isSignedIn, staffUser } = useAuth();

  const handleCustomerClick = () => {
    if (isSignedIn && !staffUser) {
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
    <div
      className="min-h-screen bg-[#fafafc] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.045) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.045) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }}
    >
      <PublicNavbar />

      <main className="flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[520px]">
            {/* Left Content Column */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
              {/* Engine Badge / Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300/80 bg-white/95 text-xs font-semibold tracking-wider text-neutral-800 shadow-xs mb-8">
                <span className="w-2 h-2 rounded-full bg-neutral-900 animate-pulse" />
                <span className="uppercase tracking-widest text-[11px]">SUPPORT ENGINE V2.0</span>
              </div>

              {/* Bold Primary Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] font-black tracking-tight text-neutral-950 leading-[1.08] mb-6">
                Your support<br />
                runs on<br />
                autopilot.
              </h1>

              {/* Subheading / Description */}
              <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed mb-8">
                Capture leads across WhatsApp, web, and email. Qualify instantly, follow-up autonomously, and resolve tickets—
                <strong className="font-semibold text-neutral-900"> zero human touch required.</strong>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-10">
                <button
                  onClick={handleAgentClick}
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-sm transition-all shadow-sm active:scale-95 group cursor-pointer"
                >
                  <span>Open Agent Portal</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={handleCustomerClick}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-900 font-medium text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-neutral-800" />
                  <span>Customer portal</span>
                </button>
                <button
                  onClick={handleAdminClick}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 font-medium text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>Admin desk</span>
                </button>
              </div>

              {/* Social Proof Stack & Ratings */}
              <div className="flex items-center gap-3.5">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Customer"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Customer"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Customer"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Customer"
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div className="flex text-amber-500 text-xs tracking-widest">
                    ★★★★★
                  </div>
                  <span className="text-xs text-neutral-500 font-medium">
                    5.0 from 500+ teams
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Column (Interactive Hero Motion Graphic) */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center pt-6 lg:pt-0">
              <HeroMotionGraphic />
            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="border-t border-neutral-200/80 bg-white/80 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid gap-10 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-3 border border-neutral-200/60">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-neutral-900 text-base">{title}</h3>
                <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200/80 py-6 text-sm text-neutral-500 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <span className="font-medium text-neutral-800">DeskFlow</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

