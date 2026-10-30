import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { getAnalyticsApi } from '../services/analyticsService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiShield,
  FiDollarSign,
  FiPercent,
  FiPieChart,
  FiActivity,
  FiCalendar,
  FiCreditCard,
  FiTarget,
} from 'react-icons/fi';

const CHART_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getAnalyticsApi(timeframe);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load aggregated analytics');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" label="Aggregating backend financial transaction datasets..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Analytics Error"
        message={error}
        onRetry={fetchAnalytics}
      />
    );
  }

  const monthlyTrends = data?.monthlyTrends || [];
  const categoryExpenses = data?.categoryExpenses || [];
  const budgetUtilization = data?.budgetUtilization || [];
  const goalProgress = data?.goalProgress || [];
  const emiBurden = data?.emiBurden || { totalMonthlyEMI: 0, totalRemainingDebt: 0, emiBurdenPercentage: 0, loans: [] };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financial Analytics Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time aggregated monthly trends, category breakdowns, and loan burden diagnostics.</p>
        </div>

        {/* Timeframe Filter Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-xs font-medium">
          <FiCalendar className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <span className="text-slate-400 mr-1">Timeframe:</span>
          {[
            { label: '3 Months', value: 3 },
            { label: '6 Months', value: 6 },
            { label: '12 Months', value: 12 },
          ].map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeframe === tf.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Trends Area/Bar Chart */}
      <Card
        title="Income vs Expenses vs Net Savings Monthly Trend"
        subtitle={`Aggregated monthly cash flow over the last ${timeframe} months`}
      >
        {monthlyTrends.length === 0 ? (
          <EmptyState
            title="No Monthly Data Available"
            description="Log income and expense transactions to render monthly cash flow trend charts."
            icon={FiBarChart2}
          />
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="income" name="Monthly Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Monthly Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" name="Net Savings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Category Breakdown & Budget Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Expense Pie Chart */}
        <Card title="Category Expense Breakdown" subtitle="Distribution of spending across categories">
          {categoryExpenses.length === 0 ? (
            <EmptyState
              title="No Expense Records"
              description="Log expenses with categories to generate distribution charts."
              icon={FiPieChart}
            />
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Budget Utilization Comparison */}
        <Card title="Category Budget Caps vs Actual Spent" subtitle="Monitoring over-budget & under-cap categories">
          {budgetUtilization.length === 0 ? (
            <EmptyState
              title="No Active Budgets"
              description="Define category budgets to track utilization metrics."
              icon={FiBarChart2}
            />
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetUtilization}>
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Legend />
                  <Bar dataKey="budgeted" name="Budget Limit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Actual Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Goal Progress & EMI Burden Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Progress Comparison */}
        <Card title="Financial Goal Progress" subtitle="Accumulated savings vs target goal capital">
          {goalProgress.length === 0 ? (
            <EmptyState
              title="No Goals Configured"
              description="Create financial goals to track capital accumulation progress."
              icon={FiTarget}
            />
          ) : (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalProgress}>
                  <XAxis dataKey="title" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Legend />
                  <Bar dataKey="targetAmount" name="Target Goal" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="currentAmount" name="Current Saved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* EMI Burden & Debt Overview */}
        <Card title="EMI & Loan Debt Liabilities" subtitle="Monthly EMI commitments and remaining debt">
          {emiBurden.loans.length === 0 ? (
            <EmptyState
              title="No Active Loans"
              description="Log active loan / EMI commitments to monitor debt burden metrics."
              icon={FiCreditCard}
            />
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Monthly EMI Commitment</span>
                  <h4 className="text-xl font-bold text-purple-300">
                    {formatCurrency(emiBurden.totalMonthlyEMI)}/mo
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">EMI Burden Ratio</span>
                  <h4 className="text-xl font-bold text-amber-400">
                    {emiBurden.emiBurdenPercentage}% DTI
                  </h4>
                </div>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emiBurden.loans}>
                    <XAxis dataKey="loanName" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Legend />
                    <Bar dataKey="totalAmount" name="Total Principal" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remainingDebt" name="Remaining Debt" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
