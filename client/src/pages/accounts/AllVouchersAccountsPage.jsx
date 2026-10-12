import React, { useEffect, useState } from 'react';
import { voucherService } from '../../services/voucherService';
import { useToast } from '../../context/ToastContext';
import { VoucherFilterBar } from '../../components/vouchers/VoucherFilterBar';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { Pagination } from '../../components/common/Pagination';

export const AllVouchersAccountsPage = () => {
  const { addToast } = useToast();

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    expenseCategory: '',
    department: '',
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
  });

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getVouchers(filters);
      if (res.success) {
        setVouchers(res.vouchers);
        setPagination({
          page: res.currentPage,
          limit: 10,
          totalPages: res.totalPages,
          totalCount: res.totalCount,
        });
      }
    } catch (error) {
      console.error('Failed to load accounts vouchers:', error);
      addToast('Failed to load organizational vouchers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      expenseCategory: '',
      department: '',
      status: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      page: 1,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accounts Voucher Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete read-only record of all company expense vouchers, signatures, and approval statuses.
        </p>
      </div>

      <VoucherFilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onResetFilters={handleResetFilters}
      />

      <div className="space-y-3">
        <VoucherTable
          vouchers={vouchers}
          isLoading={loading}
          role="Accounts"
          detailPathPrefix="/accounts/vouchers"
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          limit={pagination.limit}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
        />
      </div>
    </div>
  );
};
