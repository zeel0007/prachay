import React from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'blue' }) => {
  return (
    <div className="bg-[#FCFBFA] rounded-3xl border border-[#E2DFDC] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between hover:border-[#141413]/30 transition-all group">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{title}</p>
        </div>
        <p className="text-3xl font-semibold text-[#141413] tracking-tight mt-1 font-mono">{value}</p>
        {subtext && <p className="text-xs text-stone-500 mt-1.5 font-medium">{subtext}</p>}
      </div>

      {Icon && (
        <div className="w-12 h-12 rounded-full bg-white border border-[#E2DFDC] text-[#141413] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          <Icon className="w-5 h-5 text-[#141413]" />
        </div>
      )}
    </div>
  );
};
