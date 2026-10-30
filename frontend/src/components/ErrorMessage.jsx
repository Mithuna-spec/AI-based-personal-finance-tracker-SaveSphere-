import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import Button from './Button';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'Failed to load content. Please verify connection and try again.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-200 my-3">
      <div className="flex items-center gap-3">
        <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        <div>
          <h5 className="text-xs font-semibold text-rose-300">{title}</h5>
          <p className="text-xs text-rose-300/80 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" icon={FiRefreshCw} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
