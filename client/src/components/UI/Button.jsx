import React from 'react';
import { Spinner } from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-tight';

  const variants = {
    primary:
      'bg-[#141413] text-[#F3F0EE] hover:bg-black active:scale-[0.98] focus:ring-[#141413] shadow-xs',
    secondary:
      'bg-white text-[#141413] border-1.5 border-[#141413] hover:bg-[#F3F0EE] active:scale-[0.98] focus:ring-[#141413]',
    outline:
      'bg-white/80 text-[#141413] border border-[#D5D1CC] hover:bg-white hover:border-[#141413] focus:ring-stone-400',
    signal:
      'bg-[#CF4500] text-white hover:bg-[#b53c00] active:scale-[0.98] focus:ring-[#CF4500] shadow-xs',
    success:
      'bg-emerald-700 text-white hover:bg-emerald-800 active:scale-[0.98] focus:ring-emerald-600 shadow-xs',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 active:scale-[0.98] focus:ring-rose-600 shadow-xs',
    ghost: 'bg-transparent text-[#141413] hover:bg-[#E8E4E0] hover:text-black',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="mr-1" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
    </button>
  );
};
