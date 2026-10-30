import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export function CustomerAuthGuard({ children }) {
  const { isCustomerSignedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isCustomerSignedIn) {
      navigate('/login/customer', { replace: true });
    }
  }, [loading, isCustomerSignedIn, navigate]);

  if (loading || !isCustomerSignedIn) {
    return <LoadingSpinner fullPage text="Verifying customer session..." />;
  }

  return children;
}

export default CustomerAuthGuard;
