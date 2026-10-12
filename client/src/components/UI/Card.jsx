import React from 'react';

export const Card = ({ children, className = '', title, subtitle, action, footer }) => {
  return (
    <div className={`bg-[#FCFBFA] rounded-3xl border border-[#E2DFDC] shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#EDE9E5]">
          <div>
            {title && <h3 className="text-lg font-semibold text-[#141413] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-7">{children}</div>
      {footer && <div className="px-7 py-4 bg-[#F5F2EF] border-t border-[#EDE9E5] rounded-b-3xl">{footer}</div>}
    </div>
  );
};
