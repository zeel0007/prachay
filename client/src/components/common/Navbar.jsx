import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';
import { Button } from '../UI/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Director':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Accounts':
        return 'bg-stone-200 text-stone-900 border-stone-300';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-300';
    }
  };

  return (
    <header className="sticky top-4 z-30 px-6 my-2">
      <div className="bg-white/90 backdrop-blur-md rounded-full border border-[#E2DFDC] shadow-[0_4px_24px_rgba(0,0,0,0.04)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#CF4500]" />
          <span className="text-xs font-bold text-[#141413] uppercase tracking-widest">
            Prachay Securities
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#141413] leading-tight">{user.name}</p>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>

              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getRoleBadgeStyle(
                  user.role
                )}`}
              >
                {user.role}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                icon={LogOut}
                className="text-stone-500 hover:text-rose-600 hover:bg-rose-50"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
