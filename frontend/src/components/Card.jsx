import React from 'react';

const Card = ({ children, title, subtitle, action, className = '', headerClassName = '' }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg shadow-black/20 ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between mb-4 ${headerClassName}`}>
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
