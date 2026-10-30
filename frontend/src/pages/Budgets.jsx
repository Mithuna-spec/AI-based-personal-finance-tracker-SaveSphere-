import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import BudgetModal from '../components/BudgetModal';
import {
  getBudgetsApi,
  createBudgetApi,
  updateBudgetApi,
  deleteBudgetApi,
} from '../services/budgetService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiPieChart,
  FiPlus,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiDollarSign,
  FiCalendar,
} from 'react-icons/fi';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalBudgeted: 0, totalSpent: 0, totalOverBudgetCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPeriod, setSelectedPeriod] = useState('ALL');

  // Modal States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [deletingBudgetId, setDeletingBudgetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch budgets from API
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};
      if (selectedPeriod !== 'ALL') filters.period = selectedPeriod;

      const res = await getBudgetsApi(filters);
      setBudgets(res.data.budgets || []);
      setSummary(res.data.summary || { count: 0, totalBudgeted: 0, totalSpent: 0, totalOverBudgetCount: 0 });
    } catch (err) {
      setError(err.message || 'Failed to fetch category budgets');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Handle Add / Edit Budget submission
  const handleBudgetSubmit = async (formData) => {
    if (editingBudget) {
      await updateBudgetApi(editingBudget.id, formData);
    } else {
      await createBudgetApi(formData);
    }
    fetchBudgets();
  };

  // Handle Delete Budget confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingBudgetId) return;
    setIsDeleting(true);

    try {
      await deleteBudgetApi(deletingBudgetId);
      setDeletingBudgetId(null);
      fetchBudgets();
    } catch (err) {
      alert(err.message || 'Failed to delete budget cap');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getProgressBarColor = (pct) => {
    if (pct > 100) return 'bg-rose-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Budget Limits & Utilization</h1>
          <p className="text-sm text-slate-400">Set spending caps per category and track real-time utilization against actual expenses.</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setEditingBudget(null);
            setIsBudgetModalOpen(true);
          }}
        >
          Create Budget
        </Button>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Budgeted</p>
              <h3 className="text-xl font-bold text-blue-400 mt-1">
                {formatCurrency(summary.totalBudgeted)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Category Spent</p>
              <h3 className="text-xl font-bold text-purple-300 mt-1">
                {formatCurrency(summary.totalSpent)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <FiPieChart className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Over-Budget Caps</p>
              <h3 className="text-xl font-bold text-rose-400 mt-1">
                {summary.totalOverBudgetCount}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Period Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-500 w-4 h-4" />
            <span className="text-xs text-slate-400 font-medium">Filter Period:</span>
            {['ALL', 'MONTHLY', 'YEARLY'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedPeriod === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline-block">
            Calculated against real recorded expenses
          </span>
        </div>
      </Card>

      {/* Main Budget Content */}
      {loading ? (
        <Card>
          <LoadingSpinner size="md" label="Calculating category budget utilization..." />
        </Card>
      ) : error ? (
        <ErrorMessage
          title="Error Loading Budgets"
          message={error}
          onRetry={fetchBudgets}
        />
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState
            title="No Category Budgets Defined"
            description="Create category spending caps (e.g. Food, Rent, Entertainment) to track monthly utilization limits."
            icon={FiPieChart}
            actionText="Create First Budget"
            onAction={() => {
              setEditingBudget(null);
              setIsBudgetModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const u = b.utilization || { spentAmount: 0, remainingAmount: b.amount, percentage: 0, isOverBudget: false };
            const progressPct = Math.min(u.percentage, 100);

            return (
              <Card
                key={b.id}
                className={`space-y-4 border ${
                  u.isOverBudget
                    ? 'border-rose-800/80 bg-rose-950/20'
                    : 'border-slate-800/80 bg-slate-900'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 mb-1">
                      {b.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      Cap: {formatCurrency(b.amount)}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {b.period}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingBudget(b);
                        setIsBudgetModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Edit Budget"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBudgetId(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Budget"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">
                      Spent: <strong className="text-slate-200">{formatCurrency(u.spentAmount)}</strong>
                    </span>
                    <span
                      className={`font-semibold ${
                        u.isOverBudget ? 'text-rose-400' : u.percentage >= 80 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {u.percentage}% Utilized
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${getProgressBarColor(u.percentage)} transition-all duration-500`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </span>
                  </div>

                  {u.isOverBudget ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                      <FiAlertTriangle className="w-3.5 h-3.5" />
                      Over by {formatCurrency(Math.abs(u.remainingAmount))}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      {formatCurrency(u.remainingAmount)} Left
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Budget Form Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={handleBudgetSubmit}
        initialData={editingBudget}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this category budget cap?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeletingBudgetId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={FiTrash2}
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
            >
              Delete Budget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets;
