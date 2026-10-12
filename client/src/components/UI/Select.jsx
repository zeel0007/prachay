import React, { forwardRef } from 'react';

export const Select = forwardRef(
  ({ label, error, options = [], placeholder = 'Select an option', className = '', containerClassName = '', ...props }, ref) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-2xl border bg-white px-4 py-2.5 text-sm text-[#141413] transition-all focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-[#D5D1CC] focus:border-[#141413] focus:ring-stone-200'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const labelText = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {labelText}
              </option>
            );
          })}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
