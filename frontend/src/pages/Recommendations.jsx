import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import {
  getAllocationRecommendationApi,
  getPersonalizedRecommendationsApi,
} from '../services/recommendationService';
import { formatCurrency } from '../utils/formatCurrency';
import {
  FiCpu,
  FiPieChart,
  FiShield,
  FiDollarSign,
  FiTrendingUp,
  FiZap,
  FiCheckCircle,
  FiRefreshCw,
  FiHelpCircle,
  FiTarget,
  FiAlertTriangle,
  FiCreditCard,
  FiAward,
  FiActivity,
} from 'react-icons/fi';

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('personalized'); // 'personalized' | 'allocation'
  const [allocationData, setAllocationData] = useState(null);
  const [personalizedData, setPersonalizedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allocRes, persRes] = await Promise.all([
        getAllocationRecommendationApi(),
        getPersonalizedRecommendationsApi(),
      ]);
      setAllocationData(allocRes.data);
      setPersonalizedData(persRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load AI financial recommendations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRecommendations();
  }, [fetchAllRecommendations]);

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" label="Generating personalized AI financial recommendations..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Recommendations Error"
        message={error}
        onRetry={fetchAllRecommendations}
      />
    );
  }

  const recommendations = personalizedData?.recommendations || [];
  const answers = personalizedData?.answers || {};
  const allocations = allocationData?.allocations || [];
  const availableAmount = allocationData?.availableAmount || 0;
  const summary = allocationData?.summary || {};
  const provider = personalizedData?.provider || 'SaveSphere AI Engine';

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'GOAL':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'SAVING':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'BUDGET':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SPENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'EMERGENCY_FUND':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'EMI':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const coreQuestions = [
    {
      q: 'What should I do with my available money?',
      a: answers.availableMoneyStrategy,
      icon: <FiDollarSign className="w-4 h-4 text-emerald-400" />,
    },
    {
      q: 'Which goal should I prioritize?',
      a: answers.goalPriorityRecommendation,
      icon: <FiTarget className="w-4 h-4 text-purple-400" />,
    },
    {
      q: 'Where am I overspending?',
      a: answers.overspendingDiagnostic,
      icon: <FiAlertTriangle className="w-4 h-4 text-rose-400" />,
    },
    {
      q: 'How can I improve my savings?',
      a: answers.savingsImprovementPlan,
      icon: <FiTrendingUp className="w-4 h-4 text-cyan-400" />,
    },
    {
      q: 'Am I on track for my goals?',
      a: answers.goalTrackStatus,
      icon: <FiAward className="w-4 h-4 text-amber-400" />,
    },
    {
      q: 'What should I change this month?',
      a: answers.monthlyChangeRecommendation,
      icon: <FiActivity className="w-4 h-4 text-blue-400" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Personalized AI Recommendations</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <FiZap className="w-3 h-3" /> {provider}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Tailored action plans grounded in your deterministic calculations and money allocation pool.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'personalized'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Advisor Plan
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'allocation'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Money Allocation Pool
          </button>
          <button
            onClick={fetchAllRecommendations}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors ml-1"
            title="Refresh AI Analysis"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Capacity Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <span className="text-xs font-medium text-slate-400">Available Capital</span>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{formatCurrency(availableAmount)}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Uncommitted cash pool for deployment</p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <span className="text-xs font-medium text-slate-400">Protected Obligations</span>
          <h3 className="text-2xl font-bold text-purple-300 mt-1">
            {formatCurrency(summary.protectedObligations)}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Fixed bills + monthly loan EMIs</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <span className="text-xs font-medium text-slate-400">Financial Health Rating</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-amber-300">{summary.healthScore || 0}</h3>
            <span className="text-xs text-slate-400 font-semibold">/ 100 ({summary.healthStatus})</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Backend deterministic health score</p>
        </Card>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'personalized' ? (
        <div className="space-y-6">
          {/* Core Advisor Q&A Grid */}
          <Card
            title="AI Financial Advisor Q&A"
            subtitle="Direct answers to your most pressing financial questions"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {coreQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <h4 className="text-xs font-bold text-slate-200">{item.q}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    {item.a || 'Analysis pending based on transaction activity.'}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Actionable Recommendation Cards */}
          <Card
            title="Personalized Action Recommendations"
            subtitle="Prioritized step-by-step guidance calculated from your real financial numbers"
          >
            {recommendations.length === 0 ? (
              <EmptyState
                title="No Action Items Required"
                description="Your income and budget limits are balanced cleanly."
                icon={FiCpu}
              />
            ) : (
              <div className="space-y-4 pt-2">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-300">
                          #{rec.priority}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${getTypeBadgeStyle(
                                rec.type
                              )}`}
                            >
                              {rec.type}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Target: {rec.relatedGoal || 'General Financial Health'}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-100 mt-1">{rec.action}</h4>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xl font-extrabold text-emerald-400">
                          {formatCurrency(rec.amount)}
                        </span>
                        <div className="text-[11px] text-slate-500">Recommended Allocation</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="font-semibold text-slate-300 block mb-1">
                          Deterministic Rationale:
                        </span>
                        <p className="text-slate-400">{rec.reason}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="font-semibold text-emerald-400 block mb-1">
                          Expected Effect:
                        </span>
                        <p className="text-slate-300">{rec.expectedEffect}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Allocation Pool Breakdown Tab */
        <Card
          title="Deterministic Money Allocation Engine"
          subtitle="Sequential distribution pool matching active goals and emergency reserves"
        >
          {allocations.length === 0 ? (
            <EmptyState
              title="No Capital Available to Allocate"
              description="Log income or decrease expenses to generate allocatable capital."
              icon={FiCpu}
            />
          ) : (
            <div className="space-y-4 pt-2">
              {allocations.map((alloc) => (
                <div
                  key={alloc.category}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center">
                        #{alloc.priority}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">{alloc.name}</h4>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">
                      {formatCurrency(alloc.amount)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 pl-8">{alloc.reason}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default Recommendations;
