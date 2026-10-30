import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import ExpenseModal from '../components/ExpenseModal';
import {
  getExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from '../services/expenseService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiTrendingDown,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiRepeat,
} from 'react-icons/fi';

const CATEGORIES = [
  'ALL',
  'Housing',
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Subscriptions',
  'Other',
];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalAmount: 0, recurringAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch expense list from API
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};
      if (selectedCategory !== 'ALL') filters.category = selectedCategory;
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const res = await getExpensesApi(filters);
      setExpenses(res.data.expenses || []);
      setSummary(res.data.summary || { count: 0, totalAmount: 0, recurringAmount: 0 });
    } catch (err) {
      setError(err.message || 'Failed to fetch expense records');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Handle Add / Edit Expense submission
  const handleExpenseSubmit = async (formData) => {
    if (editingExpense) {
      await updateExpenseApi(editingExpense.id, formData);
    } else {
      await createExpenseApi(formData);
    }
    fetchExpenses();
  };

  // Handle Delete Expense confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingExpenseId) return;
    setIsDeleting(true);

    try {
      await deleteExpenseApi(deletingExpenseId);
      setDeletingExpenseId(null);
      fetchExpenses();
    } catch (err) {
      alert(err.message || 'Failed to delete expense record');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Expense Tracking</h1>
          <p className="text-sm text-slate-400">Monitor daily spending, fixed bills, and recurring commitments.</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
        >
          Add Expense
        </Button>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Expenses</p>
              <h3 className="text-xl font-bold text-rose-400 mt-1">
                {formatCurrency(summary.totalAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Recurring Monthly</p>
              <h3 className="text-xl font-bold text-purple-300 mt-1">
                {formatCurrency(summary.recurringAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <FiRepeat className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Logged Transactions</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">{summary.count}</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
              <FiTrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expense title or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <FiCalendar className="w-3.5 h-3.5 text-slate-500" /> Date Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-slate-500 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-400 hover:underline px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1">
          <FiFilter className="text-slate-500 w-3.5 h-3.5 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Expense Content */}
      {loading ? (
        <Card>
          <LoadingSpinner size="md" label="Loading expense records..." />
        </Card>
      ) : error ? (
        <ErrorMessage
          title="Error Loading Expenses"
          message={error}
          onRetry={fetchExpenses}
        />
      ) : expenses.length === 0 ? (
        <Card>
          <EmptyState
            title="No Expense Records Found"
            description={
              searchQuery || selectedCategory !== 'ALL' || startDate || endDate
                ? 'No expense transactions match your filter criteria.'
                : 'Start tracking your spending by logging your first expense.'
            }
            icon={FiTrendingDown}
            actionText="Add First Expense"
            onAction={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Expense Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Recurring</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-100">
                      <div>{exp.title}</div>
                      {exp.notes && (
                        <div className="text-xs text-slate-500 font-normal mt-0.5 max-w-xs truncate">
                          {exp.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950/80 text-rose-300 border border-rose-800/40">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {exp.isRecurring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <FiRepeat className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-rose-400">
                      -{formatCurrency(exp.amount)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingExpense(exp);
                            setIsExpenseModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          title="Edit Expense"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingExpenseId(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Expense"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expense Form Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleExpenseSubmit}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingExpenseId}
        onClose={() => setDeletingExpenseId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this expense entry? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeletingExpenseId(null)}
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
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
