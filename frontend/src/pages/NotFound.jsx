import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { LifeBuoy } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-freshdesk-100 text-freshdesk-700 flex items-center justify-center mb-4">
        <LifeBuoy className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The requested support desk URL does not exist or has been moved.
      </p>
      <Link to="/portal/dashboard">
        <Button>Return to Support Portal</Button>
      </Link>
    </div>
  );
}

export default NotFound;
