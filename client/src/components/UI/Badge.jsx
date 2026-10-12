import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

export const Badge = ({ status, className = '' }) => {
  const style = STATUS_COLORS[status] || STATUS_COLORS['Draft'];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};
