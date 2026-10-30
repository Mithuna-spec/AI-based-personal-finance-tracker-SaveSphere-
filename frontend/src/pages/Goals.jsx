import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import GoalModal from '../components/GoalModal';
import {
  getGoalsApi,
  createGoalApi,
  updateGoalApi,
  deleteGoalApi,
} from '../services/goalService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiTarget,
  FiPlus,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiInfo,
} from 'react-icons/fi';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({
    count: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    totalRequiredMonthly: 0,
    availableMonthlyCapacity: 0,
    achievedCount: 0,
    atRiskCount: 0,
    unfeasibleCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [deletingGoalId, setDeletingGoalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch goals from API
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};
      if (selectedPriority !== 'ALL') filters.priority = selectedPriority;
      if (selectedStatus !== 'ALL') filters.status = selectedStatus;

      const res = await getGoalsApi(filters);
      setGoals(res.data.goals || []);
      setSummary(
        res.data.summary || {
          count: 0,
          totalTargetAmount: 0,
          totalCurrentAmount: 0,
          totalRequiredMonthly: 0,
          availableMonthlyCapacity: 0,
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to fetch financial goals');
    } finally {
      setLoading(false);
    }
  }, [selectedPriority, selectedStatus]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Handle Add / Edit Goal submission
  const handleGoalSubmit = async (formData) => {
    if (editingGoal) {
      await updateGoalApi(editingGoal.id, formData);
    } else {
      await createGoalApi(formData);
    }
    fetchGoals();
  };

  // Handle Delete Goal confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingGoalId) return;
    setIsDeleting(true);

    try {
      await deleteGoalApi(deletingGoalId);
      setDeletingGoalId(null);
      fetchGoals();
    } catch (err) {
      alert(err.message || 'Failed to delete financial goal');
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/60';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'LOW':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getFeasibilityBadge = (status) => {
    switch (status) {
      case 'ACHIEVED':
        return { color: 'bg-emerald-950 text-emerald-400 border-emerald-800', label: 'Achieved' };
      case 'ACHIEVABLE':
        return { color: 'bg-teal-950 text-teal-300 border-teal-800', label: 'Achievable' };
      case 'AT_RISK':
        return { color: 'bg-amber-950 text-amber-300 border-amber-800', label: 'At Risk' };
      case 'NOT_CURRENTLY_FEASIBLE':
        return { color: 'bg-rose-950 text-rose-300 border-rose-800', label: 'Unfeasible' };
      case 'OVERDUE':
        return { color: 'bg-red-950 text-red-400 border-red-800', label: 'Overdue' };
      default:
        return { color: 'bg-slate-800 text-slate-300 border-slate-700', label: status };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Financial Goal Planner</h1>
          <p className="text-sm text-slate-400">Set targeted savings milestones, calculate required monthly savings, and evaluate feasibility.</p>
        </div>
        <Button
          variant="primary"
          icon={FiPlus}
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
        >
          New Goal
        </Button>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Target Capital</p>
              <h3 className="text-xl font-bold text-blue-400 mt-1">
                {formatCurrency(summary.totalTargetAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400">
              <FiTarget className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Accumulated Savings</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">
                {formatCurrency(summary.totalCurrentAmount)}
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Required Monthly</p>
              <h3 className="text-xl font-bold text-purple-300 mt-1">
                {formatCurrency(summary.totalRequiredMonthly)}/mo
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-400">
              <FiTrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Available Net Capacity</p>
              <h3 className="text-xl font-bold text-teal-300 mt-1">
                {formatCurrency(summary.availableMonthlyCapacity)}/mo
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-teal-950/60 border border-teal-800/40 text-teal-400">
              <FiShield className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <FiFilter className="text-slate-500 w-4 h-4 shrink-0" />
            <span className="text-xs text-slate-400 font-medium shrink-0">Priority:</span>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedPriority === p
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-medium shrink-0">Status:</span>
            {['ALL', 'IN_PROGRESS', 'ACHIEVED', 'PAUSED'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedStatus === s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Goal Planner Grid */}
      {loading ? (
        <Card>
          <LoadingSpinner size="md" label="Calculating goal metrics & feasibility status..." />
        </Card>
      ) : error ? (
        <ErrorMessage
          title="Error Loading Goals"
          message={error}
          onRetry={fetchGoals}
        />
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            title="No Financial Goals Set"
            description="Create your first financial goal (e.g. Vacation, House Deposit, Retirement) to unlock deterministic feasibility tracking."
            icon={FiTarget}
            actionText="Create First Goal"
            onAction={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const c = g.calculations || {};
            const feasibility = getFeasibilityBadge(c.feasibilityStatus);

            return (
              <Card
                key={g.id}
                className="space-y-4 border border-slate-800/80 bg-slate-900 hover:border-slate-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/40">
                        {g.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(
                          g.priority
                        )}`}
                      >
                        {g.priority} Priority
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${feasibility.color}`}
                      >
                        {feasibility.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">{g.title}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingGoal(g);
                        setIsGoalModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Edit Goal"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingGoalId(g.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Goal"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Accumulated vs Target Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-400">
                      Saved: <strong className="text-emerald-400">{formatCurrency(g.currentAmount)}</strong> of{' '}
                      <strong className="text-slate-100">{formatCurrency(g.targetAmount)}</strong>
                    </span>
                    <span className="font-bold text-emerald-400">{c.progressPercentage}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(c.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Deterministic Calculations Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500">Remaining Gap</span>
                    <p className="font-bold text-slate-200">{formatCurrency(c.remainingAmount)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Required Monthly</span>
                    <p className="font-bold text-purple-300">
                      {c.requiredMonthlySavings > 0 ? `${formatCurrency(c.requiredMonthlySavings)}/mo` : 'Done'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Deadline</span>
                    <p className="font-semibold text-slate-300">{formatDate(g.targetDate)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">Time Left</span>
                    <p className="font-semibold text-slate-300">
                      {c.remainingMonths > 0 ? `${c.remainingMonths} month(s)` : 'Current/Overdue'}
                    </p>
                  </div>
                </div>

                {/* Feasibility Assessment Explanation */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs flex items-start gap-2">
                  <FiInfo className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {c.feasibilityReason}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleGoalSubmit}
        initialData={editingGoal}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete this financial goal?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeletingGoalId(null)}
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
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Goals;
