import React from 'react';

const LoadingSpinner = ({ size = 'md', label = 'Loading...' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`${sizes[size]} border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin`}
      />
      {label && <p className="text-xs text-slate-400 font-medium">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
