import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { X, ArrowRight, AlertCircle, Building2, Phone, Mail, User } from 'lucide-react';

export function OnboardingModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, clerkUser, refreshUser } = useAuth();

  // Populate from verified Clerk account
  const verifiedEmail = clerkUser?.primaryEmailAddress?.emailAddress || user?.email || '';
  const initialName = user?.name && user.name !== 'Customer' ? user.name : clerkUser?.fullName || clerkUser?.firstName || '';
  const initialPhone = user?.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || '';
  const initialCompany = user?.company || '';

  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [company, setCompany] = useState(initialCompany);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialName && !fullName) setFullName(initialName);
    if (initialPhone && !phone) setPhone(initialPhone);
    if (initialCompany && !company) setCompany(initialCompany);
  }, [initialName, initialPhone, initialCompany]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Please provide your full name (at least 2 characters).';
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required so our team can reach you regarding tickets.';
    } else {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        errors.phone = 'Please enter a valid phone number (e.g. +91 9557904746 or +1 555-0199).';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      name: fullName.trim(),
      phone: phone.trim(),
      company: company.trim() || null,
    };

    try {
      // Persist profile to backend and PostgreSQL
      await apiClient.updateProfile(payload);

      // Save locally so frontend has instant access
      localStorage.setItem('support_desk_onboarded', 'true');
      localStorage.setItem(
        'support_desk_user_profile',
        JSON.stringify({
          ...user,
          ...payload,
          email: verifiedEmail,
          onboarded: true,
        })
      );

      if (refreshUser) {
        await refreshUser();
      }

      if (onClose) {
        onClose();
      }

      navigate('/portal/dashboard');
    } catch (err) {
      console.error('[OnboardingModal] Failed to update profile:', err);
      // Fallback local save so user is never stuck
      localStorage.setItem('support_desk_onboarded', 'true');
      localStorage.setItem(
        'support_desk_user_profile',
        JSON.stringify({
          ...user,
          ...payload,
          email: verifiedEmail,
          onboarded: true,
        })
      );
      if (refreshUser) {
        await refreshUser();
      }
      if (onClose) onClose();
      navigate('/portal/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Centered Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200/90 overflow-hidden p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-xs">
            <User className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
            Complete your profile
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Tell us a little about yourself so we can personalize your support experience.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Full Name (Required) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="e.g. Jane Doe"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.name
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-neutral-300 focus:ring-neutral-900 focus:border-transparent'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* 2. Email Address (Read-only, populated from Clerk) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified by Clerk
              </span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                readOnly
                value={verifiedEmail}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 text-sm cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Your email is authenticated securely through your Clerk account.
            </p>
          </div>

          {/* 3. Phone Number (Required for support communication) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Phone / WhatsApp Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: null }));
                }}
                placeholder="e.g. +91 9557904746 or +1 555-0199"
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  fieldErrors.phone
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-neutral-300 focus:ring-neutral-900 focus:border-transparent'
                }`}
              />
            </div>
            {fieldErrors.phone ? (
              <p className="text-[11px] text-rose-600 font-medium mt-1">{fieldErrors.phone}</p>
            ) : (
              <p className="text-[11px] text-neutral-400 mt-1">
                Used to notify you when support engineers respond to your tickets.
              </p>
            )}
          </div>

          {/* 4. Company / Organization (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Company or Organization <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp or Freelance"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Saving Profile...' : 'Save Profile & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingModal;