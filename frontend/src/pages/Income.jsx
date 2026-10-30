import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import IncomeModal from '../components/IncomeModal';
import {
  getIncomesApi,
  createIncomeApi,
  updateIncomeApi,
  deleteIncomeApi,
} from '../services/incomeService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiTrendingUp,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiDollarSign,
  FiRepeat,
} from 'react-icons/fi';

const CATEGORIES = ['ALL', 'Salary', 'Freelance', 'Investments', 'Dividends', 'Rental', 'Business', 'Other'];

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState({ count: 0, totalAmount: 0, monthlyRecurring: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const [deletingIncomeId, setDeletingIncomeId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch income list from API
  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};
      if (selectedCategory !== 'ALL') filters.category = selectedCategory;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const res = await getIncomesApi(filters);
      setIncomes(res.data.incomes || []);
      setSummary(res.data.summary || { count: 0, totalAmount: 0, monthlyRecurring: 0 });
    } catch (err) {
      setError(err.message || 'Failed to fetch income records');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  // Handle Add / Edit Income submission
  const handleIncomeSubmit = async (formData) => {
    if (editingIncome) {
      await updateIncomeApi(editingIncome.id, formData);
    } else {
      await createIncomeApi(formData);
    }
    fetchIncomes();
  };

  // Handle Delete Income confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingIncomeId) return;
    setIsDeleting(true);

    try {
      await deleteIncomeApi(deletingIncomeId);
      setDeletingIncomeId(null);
      fetchIncomes();
    } catch (err) {
      alert(err.message || 'Failed to delete income record');
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
          <h1 className="text-2xl font-bold text-slate-100">Income Management</h1>
          <p className="text-sm text-slate-400">Track salary, side income, investments and recurring cash inflows.</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setEditingIncome(null);
            setIsIncomeModalOpen(true);
          }}
        >
          Add Income
        </Button>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Income</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">
                {formatCurrency(summary.totalAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Monthly Recurring</p>
              <h3 className="text-xl font-bold text-teal-300 mt-1">
                {formatCurrency(summary.monthlyRecurring)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-400">
              <FiRepeat className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Recorded Sources</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">{summary.count}</h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <FiTrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search source or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <FiFilter className="text-slate-500 w-4 h-4 shrink-0" />
            <span className="text-xs text-slate-400 font-medium shrink-0">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Income Content */}
      {loading ? (
        <Card>
          <LoadingSpinner size="md" label="Loading income records..." />
        </Card>
      ) : error ? (
        <ErrorMessage
          title="Error Loading Incomes"
          message={error}
          onRetry={fetchIncomes}
        />
      ) : incomes.length === 0 ? (
        <Card>
          <EmptyState
            title="No Income Records Found"
            description={
              searchQuery || selectedCategory !== 'ALL'
                ? 'No income entries match your filter criteria.'
                : 'Start tracking your finances by adding your first income source.'
            }
            icon={FiTrendingUp}
            actionText="Add First Income"
            onAction={() => {
              setEditingIncome(null);
              setIsIncomeModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Frequency</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                {incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-100">
                      <div>{inc.source}</div>
                      {inc.notes && (
                        <div className="text-xs text-slate-500 font-normal mt-0.5 max-w-xs truncate">
                          {inc.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        {inc.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {inc.frequency}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(inc.date)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-emerald-400">
                      {formatCurrency(inc.amount)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingIncome(inc);
                            setIsIncomeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          title="Edit Income"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingIncomeId(inc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Income"
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

      {/* Income Form Modal */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => {
          setIsIncomeModalOpen(false);
          setEditingIncome(null);
        }}
        onSubmit={handleIncomeSubmit}
        initialData={editingIncome}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingIncomeId}
        onClose={() => setDeletingIncomeId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this income record? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeletingIncomeId(null)}
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

export default Income;
