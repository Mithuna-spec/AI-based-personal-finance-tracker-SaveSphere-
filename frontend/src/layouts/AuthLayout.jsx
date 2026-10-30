import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FiShield } from 'react-icons/fi';
import BackendStatusBadge from '../components/BackendStatusBadge';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4">
      <header className="w-full max-w-5xl py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <FiShield className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            SaveSphere
          </span>
        </Link>
        <BackendStatusBadge />
      </header>

      <main className="w-full max-w-md my-auto py-8">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} SaveSphere. AI-Driven Personal Finance & Goal Planner.
      </footer>
    </div>
  );
};

export default AuthLayout;
