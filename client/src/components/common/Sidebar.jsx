import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  CheckSquare,
  Building2,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'Employee';

  const employeeNav = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'New Expense Voucher', path: '/employee/vouchers/new', icon: FilePlus },
    { name: 'My Vouchers', path: '/employee/vouchers', icon: FileText },
  ];

  const directorNav = [
    { name: 'Dashboard', path: '/director/dashboard', icon: LayoutDashboard },
    { name: 'Pending Approvals', path: '/director/approvals', icon: CheckSquare },
    { name: 'All Vouchers', path: '/director/vouchers', icon: FileSpreadsheet },
  ];

  const accountsNav = [
    { name: 'Dashboard', path: '/accounts/dashboard', icon: LayoutDashboard },
    { name: 'All Vouchers', path: '/accounts/vouchers', icon: Receipt },
  ];

  const navItems =
    role === 'Director'
      ? directorNav
      : role === 'Accounts'
      ? accountsNav
      : employeeNav;

  return (
    <aside className="w-64 bg-[#141413] text-stone-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-stone-800">
        <div className="w-10 h-10 rounded-full bg-[#CF4500] flex items-center justify-center text-white font-bold text-lg shadow-md">
          P
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide leading-none">PRACHAY</h1>
          <span className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
            Expense System
          </span>
        </div>
      </div>

      {/* Nav Section */}
      <div className="px-4 py-8 flex-1">
        <div className="flex items-center gap-1.5 px-3 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
            MAIN MENU
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#141413] font-semibold shadow-md'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-4 rounded-3xl bg-stone-900 border border-stone-800 text-xs">
        <div className="flex items-center gap-2 text-stone-300 font-medium">
          <Building2 className="w-4 h-4 text-[#CF4500]" />
          <span>Prachay Securities</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-1">Enterprise Voucher Portal v1.0</p>
      </div>
    </aside>
  );
};
