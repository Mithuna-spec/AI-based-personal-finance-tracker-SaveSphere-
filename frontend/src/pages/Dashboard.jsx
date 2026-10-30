import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { getDashboardSummaryApi } from '../services/dashboardService';
import AITrackerSection from '../components/AITrackerSection';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShield,
  FiPlus,
  FiArrowRight,
  FiCalendar,
  FiActivity,
  FiLayers,
} from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardSummaryApi();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard summary metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" label="Calculating financial summary & cash flow metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Dashboard Error"
        message={error}
        onRetry={fetchSummary}
      />
    );
  }

  const metrics = data?.metrics || {
    totalIncome: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    availableMoney: 0,
    incomeThisMonth: 0,
    expensesThisMonth: 0,
    netThisMonth: 0,
  };
  const counts = data?.counts || { totalTransactions: 0 };
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, {user?.fullName || 'User'}! 👋
          </h1>
          <p className="text-sm text-slate-400">
            Real-time financial summary, liquidity pools, and cash flow overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/income">
            <Button variant="outline" size="sm" icon={FiPlus}>
              Add Income
            </Button>
          </Link>
          <Link to="/expenses">
            <Button variant="primary" size="sm" icon={FiPlus}>
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Income</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(metrics.totalIncome)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {data?.counts?.incomesCount || 0} recorded source(s)
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <FiTrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">
                {formatCurrency(metrics.totalExpenses)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {data?.counts?.expensesCount || 0} transaction(s) logged
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <FiTrendingDown className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Net Cash Flow / Savings */}
        <Card
          className={`border-l-4 ${
            metrics.netCashFlow >= 0 ? 'border-l-blue-500' : 'border-l-amber-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Net Cash Flow / Savings</p>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  metrics.netCashFlow >= 0 ? 'text-blue-400' : 'text-amber-400'
                }`}
              >
                {formatCurrency(metrics.netCashFlow)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Income minus expenses
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Available Capital */}
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Available Money</p>
              <h3 className="text-2xl font-bold text-purple-300 mt-1">
                {formatCurrency(metrics.availableMoney)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                After recurring commitments ({formatCurrency(metrics.recurringExpenses)})
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <FiShield className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* AI-Based Financial Tracker & Behavioral Insights */}
      <AITrackerSection />

      {/* Monthly Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Panel */}
        <Card title="Current Month Performance" className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">This Month Income</span>
              <span className="text-sm font-semibold text-emerald-400">
                {formatCurrency(metrics.incomeThisMonth)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">This Month Expenses</span>
              <span className="text-sm font-semibold text-rose-400">
                -{formatCurrency(metrics.expensesThisMonth)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200">Net Monthly Margin</span>
              <span
                className={`text-sm font-bold ${
                  metrics.netThisMonth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(metrics.netThisMonth)}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FiLayers className="text-emerald-400" /> Capital Allocation Readiness
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              With {formatCurrency(metrics.availableMoney)} in available funds, you are ready to configure financial goals, budgets, and emergency reserves.
            </p>
          </div>
        </Card>

        {/* Recent Transactions Feed */}
        <Card
          title="Recent Financial Activity"
          subtitle="Latest income and expense entries"
          action={
            <div className="flex items-center gap-2">
              <Link to="/income" className="text-xs text-emerald-400 hover:underline">
                Incomes
              </Link>
              <span className="text-slate-600">•</span>
              <Link to="/expenses" className="text-xs text-rose-400 hover:underline">
                Expenses
              </Link>
            </div>
          }
          className="lg:col-span-2"
        >
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="No Recent Transactions"
              description="Log income or expense records to start viewing live cash flow activity."
              icon={FiActivity}
              actionText="Add Transaction"
              onAction={() => navigate('/expenses')}
            />
          ) : (
            <div className="space-y-2.5">
              {recentTransactions.map((tx) => (
                <div
                  key={`${tx.type}-${tx.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800/70 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        tx.type === 'INCOME'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {tx.type === 'INCOME' ? (
                        <FiTrendingUp className="w-4 h-4" />
                      ) : (
                        <FiTrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">{tx.title}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
