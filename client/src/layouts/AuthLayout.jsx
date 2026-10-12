import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#141413] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-[#F3F0EE]">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#CF4500]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#CF4500] text-white font-bold text-2xl shadow-xl mb-4">
          P
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Prachay Securities</h2>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
            Expense Voucher Management System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#FCFBFA] py-8 px-6 shadow-2xl rounded-3xl border border-[#E2DFDC] sm:px-10 text-[#141413]">
          <Outlet />
        </div>

        <div className="mt-6 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#CF4500]" />
          <span>Protected Enterprise System • Role-Based Access Enforced</span>
        </div>
      </div>
    </div>
  );
};
