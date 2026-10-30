import React, { useEffect, useState } from 'react';
import { checkBackendHealth } from '../services/healthService';
import { FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const BackendStatusBadge = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await checkBackendHealth();
      setHealth(res);
    } catch (err) {
      setError(err.message || 'Backend unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-slate-900 border-slate-800">
      <span className="text-slate-400">Backend Status:</span>
      {loading ? (
        <span className="flex items-center gap-1 text-amber-400">
          <FiRefreshCw className="w-3 h-3 animate-spin" /> Checking...
        </span>
      ) : health?.success ? (
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>{health.message}</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-rose-400">
          <FiXCircle className="w-3.5 h-3.5" />
          <span>{error || 'Offline'}</span>
          <button
            onClick={fetchHealth}
            className="ml-1 hover:underline text-xs text-rose-300"
            title="Retry API"
          >
            Retry
          </button>
        </span>
      )}
    </div>
  );
};

export default BackendStatusBadge;
