import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4">
        <FiAlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-300 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
        The requested page does not exist or has been moved. Check the URL or return to the dashboard.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={FiHome}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
