import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const PRESET_USERS = [
  { id: 'user_admin_seed', name: 'System Admin', email: 'admin@supportdesk.internal', role: 'ADMIN' },
  { id: 'user_agent_seed', name: 'Jane Agent', email: 'jane.support@supportdesk.internal', role: 'AGENT' },
  { id: 'user_alice_seed', name: 'Alice Cooper', email: 'alice@example.com', role: 'CUSTOMER' },
  { id: 'user_bob_seed', name: 'Bob Vance', email: 'bob@example.com', role: 'CUSTOMER' },
];

export function AuthProvider({ children }) {
  const isClerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  if (isClerkConfigured) {
    return <ClerkAuthProviderWrapper>{children}</ClerkAuthProviderWrapper>;
  }

  return <LocalAuthProviderWrapper>{children}</LocalAuthProviderWrapper>;
}

function ClerkAuthProviderWrapper({ children }) {
  const { isSignedIn, isLoaded, getToken, userId } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { openSignIn, openSignUp, signOut } = useClerk();

  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manual Staff User State (Admin & Support Agent - No Clerk required!)
  const [staffUser, setStaffUserState] = useState(() => {
    const saved = localStorage.getItem('support_desk_staff_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [directCustomerUser, setDirectCustomerUserState] = useState(() => {
    const saved = localStorage.getItem('support_desk_direct_customer');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const loginCustomerDirect = useCallback((cust) => {
    setDirectCustomerUserState(cust);
    localStorage.setItem('support_desk_direct_customer', JSON.stringify(cust));
    apiClient.setDevUser(cust.id || cust.email);
  }, []);

  const logoutCustomerDirect = useCallback(() => {
    setDirectCustomerUserState(null);
    localStorage.removeItem('support_desk_direct_customer');
    apiClient.setDevUser(null);
  }, []);

  const loginStaff = useCallback((staff) => {
    setStaffUserState(staff);
    apiClient.setStaffUser(staff);
  }, []);

  const logoutStaff = useCallback(() => {
    setStaffUserState(null);
    apiClient.setStaffUser(null);
  }, []);

  // Bind token getter to apiClient (only for customer authentication)
  useEffect(() => {
    if (isSignedIn && getToken) {
      apiClient.setTokenGetter(getToken);
    } else {
      apiClient.setTokenGetter(null);
    }
  }, [isSignedIn, getToken]);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setDbUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMe();
      setDbUser(data);
    } catch (err) {
      console.warn('[AuthContext] Backend sync fallback to Clerk profile:', err);
      // Fallback local profile from Clerk user object
      const fallbackRole = clerkUser?.publicMetadata?.role || 'CUSTOMER';
      setDbUser({
        id: userId,
        clerkId: userId,
        name: clerkUser?.fullName || clerkUser?.firstName || 'User',
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser?.primaryPhoneNumber?.phoneNumber || '',
        role: fallbackRole,
      });
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, userId, clerkUser]);

  useEffect(() => {
    if (isLoaded) {
      fetchProfile();
    }
  }, [isLoaded, isSignedIn, fetchProfile]);

  const switchUser = async (newUserId) => {
    apiClient.setDevUser(newUserId);
    await fetchProfile();
  };

  const logout = async () => {
    if (staffUser) {
      logoutStaff();
    }
    if (directCustomerUser) {
      logoutCustomerDirect();
    }
    if (signOut) {
      try {
        await signOut();
      } catch (e) {}
    }
    setDbUser(null);
    apiClient.setDevUser('');
  };

  const savedProfile = (() => {
    try {
      const p = localStorage.getItem('support_desk_user_profile');
      return p ? JSON.parse(p) : null;
    } catch (e) {
      return null;
    }
  })();

  const customerUser = isSignedIn ? {
    id: dbUser?.id || userId,
    clerkId: userId,
    name: savedProfile?.name || dbUser?.name || clerkUser?.fullName || clerkUser?.firstName || 'Customer',
    email: clerkUser?.primaryEmailAddress?.emailAddress || dbUser?.email || '',
    phone: savedProfile?.phone || dbUser?.phone || clerkUser?.primaryPhoneNumber?.phoneNumber || '',
    company: savedProfile?.company || dbUser?.company || '',
    role: 'CUSTOMER',
    onboarded: Boolean(savedProfile?.onboarded || dbUser?.onboarded || (savedProfile?.phone && savedProfile?.name)),
  } : null;

  // Staff user takes precedence when actively logged into Staff/Agent Workspace!
  const effectiveUser = staffUser || customerUser;

  const role = effectiveUser?.role || 'CUSTOMER';
  const isCustomer = role === 'CUSTOMER';
  const isStaff = role === 'AGENT' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'AGENT';

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        customerUser,
        staffUser,
        clerkUser,
        role,
        isCustomer,
        isStaff,
        isAdmin,
        isAgent,
        loading: !isLoaded || loading,
        error,
        isSignedIn: Boolean(isSignedIn || staffUser),
        isCustomerSignedIn: Boolean(isSignedIn),
        isStaffSignedIn: Boolean(staffUser),
        loginStaff,
        logoutStaff,
        loginCustomerDirect,
        logoutCustomerDirect,
        openSignIn,
        openSignUp,
        logout,
        switchUser,
        refreshUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function LocalAuthProviderWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getMe();
      setUser(data);
    } catch (err) {
      console.error('[AuthContext] Failed to load user profile:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const switchUser = async (userId) => {
    apiClient.setDevUser(userId);
    await fetchProfile();
  };

  const loginCustomerDirect = (cust) => {
    setUser(cust);
    apiClient.setDevUser(cust.id || cust.email);
  };

  const logoutCustomerDirect = () => {
    apiClient.setDevUser('');
    setUser(null);
  };

  const loginStaff = (staff) => {
    setUser(staff);
    apiClient.setStaffUser(staff);
  };

  const logoutStaff = () => {
    apiClient.setStaffUser(null);
    setUser(null);
  };

  const logout = () => {
    apiClient.setDevUser('');
    apiClient.setStaffUser(null);
    setUser(null);
  };

  const role = user?.role || 'CUSTOMER';
  const isCustomer = role === 'CUSTOMER';
  const isStaff = role === 'AGENT' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const isAgent = role === 'AGENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        staffUser: isStaff ? user : null,
        role,
        isCustomer,
        isStaff,
        isAdmin,
        isAgent,
        loading,
        error,
        isSignedIn: Boolean(user),
        isCustomerSignedIn: isCustomer && Boolean(user),
        isStaffSignedIn: isStaff,
        loginStaff,
        logoutStaff,
        loginCustomerDirect,
        logoutCustomerDirect,
        refreshUser: fetchProfile,
        switchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
