import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { getAITrackerInsightsApi } from '../services/aiTrackerService';
import {
  FiCpu,
  FiAlertTriangle,
  FiAlertCircle,
  FiTrendingUp,
  FiInfo,
  FiCheckCircle,
  FiRefreshCw,
  FiArrowRight,
  FiZap,
} from 'react-icons/fi';

const AITrackerSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAITrackerInsightsApi();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load AI financial tracker insights');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <Card title="AI Financial Insights & Behavioral Tracker">
        <div className="py-8">
          <LoadingSpinner size="md" label="Analyzing transaction patterns & spending changes..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="AI Financial Insights & Behavioral Tracker">
        <ErrorMessage
          title="AI Insights Error"
          message={error}
          onRetry={fetchInsights}
        />
      </Card>
    );
  }

  const insights = data?.insights || [];
  const provider = data?.provider || 'SaveSphere AI Engine';

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'ALERT':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: <FiAlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
        };
      case 'WARNING':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <FiAlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
        };
      case 'POSITIVE':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <FiTrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />,
        };
      default:
        return {
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: <FiInfo className="w-4 h-4 text-cyan-400 shrink-0" />,
        };
    }
  };

  return (
    <Card
      title="AI Financial Insights & Behavioral Tracker"
      subtitle="Real-time detection of spending spikes, budget stress, and goal risks"
      action={
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <FiZap className="w-3 h-3" /> {provider}
          </span>
          <button
            onClick={fetchInsights}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh AI Analysis"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      }
    >
      {insights.length === 0 ? (
        <EmptyState
          title="No Behavioral Anomaly Detected"
          description="Your transactions show steady, balanced behavior without high spending spikes."
          icon={FiCpu}
        />
      ) : (
        <div className="space-y-3 pt-2">
          {insights.map((insight) => {
            const style = getSeverityBadge(insight.severity);
            return (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {style.icon}
                    <h4 className="text-sm font-bold text-slate-100">{insight.title}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase border ${style.badge}`}
                  >
                    {insight.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-6.5">
                  {insight.message}
                </p>

                {insight.action && (
                  <div className="pt-1 pl-6.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <FiArrowRight className="w-3.5 h-3.5" />
                    <span>Recommended Action: {insight.action}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default AITrackerSection;
