import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { EXPENSE_CATEGORIES, DEPARTMENTS, VOUCHER_STATUS } from '../../utils/constants';

export const VoucherFilterBar = ({ filters, onFilterChange, onResetFilters, showStatusFilter = true }) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const statusOptions = Object.values(VOUCHER_STATUS).map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <div className="bg-[#FCFBFA] rounded-3xl border border-[#E2DFDC] p-5 mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search by Voucher #, Employee, Title..."
            icon={Search}
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="w-48">
          <Select
            placeholder="All Categories"
            options={EXPENSE_CATEGORIES}
            value={filters.expenseCategory || ''}
            onChange={(e) => handleInputChange('expenseCategory', e.target.value)}
          />
        </div>

        {/* Department Filter */}
        <div className="w-48">
          <Select
            placeholder="All Departments"
            options={DEPARTMENTS}
            value={filters.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
          />
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="w-44">
            <Select
              placeholder="All Statuses"
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => handleInputChange('status', e.target.value)}
            />
          </div>
        )}

        {/* Reset */}
        <Button variant="outline" icon={RotateCcw} onClick={onResetFilters} className="shrink-0">
          Reset
        </Button>
      </div>

      {/* Date & Amount Range Filters */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EDE9E5] text-xs">
        <span className="font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
          Date & Amount Range:
        </span>

        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          className="rounded-xl border border-[#D5D1CC] bg-white px-3 py-1.5 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />
        <span className="text-stone-400">to</span>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          className="rounded-xl border border-[#D5D1CC] bg-white px-3 py-1.5 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />

        <div className="h-4 w-px bg-stone-300 mx-1" />

        <input
          type="number"
          placeholder="Min ₹"
          value={filters.minAmount || ''}
          onChange={(e) => handleInputChange('minAmount', e.target.value)}
          className="w-24 rounded-xl border border-[#D5D1CC] bg-white px-3 py-1.5 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />
        <span className="text-stone-400">to</span>
        <input
          type="number"
          placeholder="Max ₹"
          value={filters.maxAmount || ''}
          onChange={(e) => handleInputChange('maxAmount', e.target.value)}
          className="w-24 rounded-xl border border-[#D5D1CC] bg-white px-3 py-1.5 text-xs text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#141413]"
        />
      </div>
    </div>
  );
};
