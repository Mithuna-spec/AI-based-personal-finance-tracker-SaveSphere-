import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import EmergencyFundModal from '../components/EmergencyFundModal';
import {
  getEmergencyFundApi,
  saveEmergencyFundApi,
  deleteEmergencyFundApi,
} from '../services/emergencyFundService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiShield,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiDollarSign,
  FiCalendar,
  FiInfo,
  FiHeart,
  FiClock,
} from 'react-icons/fi';

const EmergencyFund = () => {
  const [fundData, setFundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Fetch emergency fund details from API
  const fetchFund = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getEmergencyFundApi();
      setFundData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch emergency fund configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFund();
  }, [fetchFund]);

  // Handle Form Submission
  const handleSaveFund = async (formData) => {
    await saveEmergencyFundApi(formData);
    fetchFund();
  };

  // Handle Reset / Delete Confirmation
  const handleResetConfirm = async () => {
    if (!fundData?.fund?.id) return;
    setIsDeleting(true);

    try {
      await deleteEmergencyFundApi(fundData.fund.id);
      setIsResetConfirmOpen(false);
      fetchFund();
    } catch (err) {
      alert(err.message || 'Failed to reset emergency fund configuration');
    } finally {
      setIsDeleting(false);
    }
  };

  const c = fundData?.calculations || {
    essentialMonthlyExpenses: 0,
    targetMonths: 6,
    targetAmount: 0,
    currentAmount: 0,
    remainingAmount: 0,
    progressPercentage: 0,
    coveredMonths: 0,
    status: 'CRITICAL',
    statusLabel: 'Unconfigured',
    statusReason: 'Set your essential monthly expenses and target months to build a safety reserve.',
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'ON_TRACK':
        return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'BELOW_TARGET':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-400 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500';
      case 'ON_TRACK':
        return 'bg-teal-500';
      case 'BELOW_TARGET':
        return 'bg-amber-500';
      case 'CRITICAL':
        return 'bg-rose-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Emergency Fund Reserve</h1>
          <p className="text-sm text-slate-400">Build a liquid safety net covering 3–12 months of essential living expenses.</p>
        </div>
        <Button
          variant="primary"
          icon={fundData?.isConfigured ? FiEdit2 : FiPlus}
          onClick={() => setIsModalOpen(true)}
        >
          {fundData?.isConfigured ? 'Configure Reserve' : 'Setup Reserve'}
        </Button>
      </div>

      {loading ? (
        <Card>
          <LoadingSpinner size="md" label="Calculating safety reserve coverage..." />
        </Card>
      ) : error ? (
        <ErrorMessage
          title="Error Loading Emergency Fund"
          message={error}
          onRetry={fetchFund}
        />
      ) : (
        <>
          {/* Summary Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Target Reserve Goal</p>
                  <h3 className="text-xl font-bold text-purple-300 mt-1">
                    {formatCurrency(c.targetAmount)}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {c.targetMonths} months of essential expenses
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
                  <FiShield className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Current Reserve Saved</p>
                  <h3 className="text-xl font-bold text-emerald-400 mt-1">
                    {formatCurrency(c.currentAmount)}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {c.progressPercentage}% of target
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                  <FiDollarSign className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Essential Monthly Expenses</p>
                  <h3 className="text-xl font-bold text-blue-400 mt-1">
                    {formatCurrency(c.essentialMonthlyExpenses)}/mo
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Housing, food & EMIs
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
                  <FiHeart className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Time Covered</p>
                  <h3 className="text-xl font-bold text-teal-300 mt-1">
                    {c.coveredMonths} months
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Survival buffer duration
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-400">
                  <FiClock className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Reserve Progress Panel */}
          <Card className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-2 ${getStatusBadgeStyle(
                    c.status
                  )}`}
                >
                  Status: {c.statusLabel}
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  Emergency Reserve Cushion: {c.coveredMonths} / {c.targetMonths} Months Covered
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiEdit2}
                  onClick={() => setIsModalOpen(true)}
                >
                  Edit Configuration
                </Button>
                {fundData?.isConfigured && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={FiTrash2}
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar Visualizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">
                  Accumulated:{' '}
                  <strong className="text-emerald-400">{formatCurrency(c.currentAmount)}</strong> of{' '}
                  <strong className="text-slate-200">{formatCurrency(c.targetAmount)}</strong>
                </span>
                <span className="text-emerald-400">{c.progressPercentage}% Funded</span>
              </div>

              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full ${getProgressBarColor(
                    c.status
                  )} transition-all duration-500`}
                  style={{ width: `${Math.min(c.currentAmount > 0 ? c.progressPercentage : 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Sub Details & Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300">Coverage Breakdown</span>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Target Coverage Goal:</span>
                    <span className="font-semibold text-slate-200">{c.targetMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Months Funded:</span>
                    <span className="font-semibold text-emerald-400">{c.coveredMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Reserve Gap:</span>
                    <span className="font-semibold text-rose-400">{formatCurrency(c.remainingAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                {c.status === 'COMPLETED' ? (
                  <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : c.status === 'CRITICAL' ? (
                  <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <FiInfo className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Assessment & Guidance</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.statusReason}</p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Emergency Fund Modal */}
      <EmergencyFundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveFund}
        initialData={
          fundData?.isConfigured
            ? {
                essentialMonthlyExpenses: c.essentialMonthlyExpenses,
                targetMonths: c.targetMonths,
                currentAmount: c.currentAmount,
              }
            : null
        }
      />

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Emergency Reserve"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to reset your emergency fund configuration?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsResetConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={FiTrash2}
              isLoading={isDeleting}
              onClick={handleResetConfirm}
            >
              Reset Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmergencyFund;
