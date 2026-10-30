import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiTarget,
  FiCreditCard,
  FiShield,
  FiBarChart2,
  FiCpu,
  FiUser,
} from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/income', label: 'Income', icon: FiTrendingUp },
  { path: '/expenses', label: 'Expenses', icon: FiTrendingDown },
  { path: '/budgets', label: 'Budgets', icon: FiPieChart },
  { path: '/goals', label: 'Goals', icon: FiTarget },
  { path: '/emis', label: 'EMIs & Loans', icon: FiCreditCard },
  { path: '/emergency-fund', label: 'Emergency Fund', icon: FiShield },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/recommendations', label: 'AI Allocator', icon: FiCpu },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800/80 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Finance Manager
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 m-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            SaveSphere v1.0
          </div>
          <p className="text-[11px] text-slate-400">
            Foundation architecture ready. Connect your MySQL DB to synchronize transactions.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
