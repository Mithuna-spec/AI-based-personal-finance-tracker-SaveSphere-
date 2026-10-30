import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import EMIModal from '../components/EMIModal';
import {
  getEMIsApi,
  createEMIApi,
  updateEMIApi,
  deleteEMIApi,
} from '../services/emiService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiCreditCard,
  FiPlus,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiCalendar,
  FiDollarSign,
  FiPercent,
  FiBriefcase,
  FiShield,
} from 'react-icons/fi';

const EMIs = () => {
  const [emis, setEmis] = useState([]);
  const [summary, setSummary] = useState({
    count: 0,
    activeLoansCount: 0,
    totalLoanAmount: 0,
    totalRemainingDebt: 0,
    totalMonthlyEMI: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal States
  const [isEMIModalOpen, setIsEMIModalOpen] = useState(false);
  const [editingEMI, setEditingEMI] = useState(null);

  const [deletingEMIId, setDeletingEMIId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch EMI list from API
  const fetchEMIs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};
      if (selectedStatus !== 'ALL') filters.status = selectedStatus;

      const res = await getEMIsApi(filters);
      setEmis(res.data.emis || []);
      setSummary(
        res.data.summary || {
          count: 0,
          activeLoansCount: 0,
          totalLoanAmount: 0,
          totalRemainingDebt: 0,
          totalMonthlyEMI: 0,
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to fetch loan / EMI records');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchEMIs();
  }, [fetchEMIs]);

  // Handle Add / Edit EMI submission
  const handleEMISubmit = async (formData) => {
    if (editingEMI) {
      await updateEMIApi(editingEMI.id, formData);
    } else {
      await createEMIApi(formData);
    }
    fetchEMIs();
  };

  // Handle Delete EMI confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingEMIId) return;
    setIsDeleting(true);

    try {
      await deleteEMIApi(deletingEMIId);
      setDeletingEMIId(null);
      fetchEMIs();
    } catch (err) {
      alert(err.message || 'Failed to delete loan / EMI record');
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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">EMIs & Loan Liabilities</h1>
          <p className="text-sm text-slate-400">Track outstanding loan balances, monthly EMI obligations, interest rates, and payoff progress.</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setEditingEMI(null);
            setIsEMIModalOpen(true);
          }}
        >
          Add Loan / EMI
        </Button>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Remaining Debt</p>
              <h3 className="text-xl font-bold text-rose-400 mt-1">
                {formatCurrency(summary.totalRemainingDebt)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <FiCreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Monthly EMI Commitment</p>
              <h3 className="text-xl font-bold text-purple-300 mt-1">
                {formatCurrency(summary.totalMonthlyEMI)}/mo
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Active Loans</p>
              <h3 className="text-xl font-bold text-slate-100 mt-1">{summary.activeLoansCount}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <FiShield className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-500 w-4 h-4" />
            <span className="text-xs text-slate-400 font-medium">Loan Status:</span>
            {['ALL', 'ACTIVE', 'FULLY_PAID'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedStatus === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline-block">
            Monthly commitments automatically deducted from Available Money
          </span>
        </div>
      </Card>

      {/* Main EMI Cards Grid */}
      {loading ? (
        <Card>
          <LoadingSpinner size="md" label="Calculating loan payoff progress & EMI commitments..." />
        </Card>
      ) : error ? (
        <ErrorMessage
          title="Error Loading Loans"
          message={error}
          onRetry={fetchEMIs}
        />
      ) : emis.length === 0 ? (
        <Card>
          <EmptyState
            title="No Loan / EMI Commitments Registered"
            description="Register your active loans (e.g. Car Loan, Mortgage, Student Loan) to factor monthly obligations into goal planner capacity."
            icon={FiCreditCard}
            actionText="Add First Loan"
            onAction={() => {
              setEditingEMI(null);
              setIsEMIModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emis.map((item) => {
            const c = item.computed || {};

            return (
              <Card
                key={item.id}
                className="space-y-4 border border-slate-800/80 bg-slate-900 hover:border-slate-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {item.lender && (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          <FiBriefcase className="w-3 h-3 text-slate-400" />
                          {item.lender}
                        </span>
                      )}
                      {item.interestRate !== null && item.interestRate !== undefined && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/50">
                          <FiPercent className="w-3 h-3" />
                          {item.interestRate}% p.a.
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          c.isFullyPaid
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-purple-950 text-purple-300 border-purple-800'
                        }`}
                      >
                        {c.loanStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">{item.loanName}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingEMI(item);
                        setIsEMIModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Edit Loan"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingEMIId(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Loan"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Monthly Commitment Banner */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Monthly EMI Obligation</span>
                    <p className="text-sm font-bold text-purple-300">
                      {formatCurrency(item.monthlyAmount)} / month
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-medium">Remaining Principal</span>
                    <p className="text-sm font-bold text-rose-400">
                      {formatCurrency(item.remainingAmount)}
                    </p>
                  </div>
                </div>

                {/* Loan Payoff Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">
                      Repaid: <strong className="text-emerald-400">{formatCurrency(c.paidAmount)}</strong> of{' '}
                      <strong className="text-slate-100">{formatCurrency(item.totalAmount)}</strong>
                    </span>
                    <span className="font-bold text-emerald-400">{c.progressPercentage}% Repaid</span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(c.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Date range footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      Term: {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    </span>
                  </div>

                  {c.isFullyPaid ? (
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Fully Repaid
                    </span>
                  ) : (
                    <span className="text-slate-400">Active EMI</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* EMI Form Modal */}
      <EMIModal
        isOpen={isEMIModalOpen}
        onClose={() => {
          setIsEMIModalOpen(false);
          setEditingEMI(null);
        }}
        onSubmit={handleEMISubmit}
        initialData={editingEMI}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingEMIId}
        onClose={() => setDeletingEMIId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this loan / EMI commitment record?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeletingEMIId(null)}
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
              Delete Loan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EMIs;
