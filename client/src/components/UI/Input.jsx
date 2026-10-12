import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm text-[#141413] placeholder-stone-400 transition-all focus:outline-none focus:ring-2 ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                : 'border-[#D5D1CC] focus:border-[#141413] focus:ring-stone-200'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-stone-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
