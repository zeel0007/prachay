import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { useToast } from '../../context/ToastContext';
import { VoucherFilterBar } from '../../components/vouchers/VoucherFilterBar';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/UI/Button';
import { FilePlus } from 'lucide-react';

export const MyVouchersPage = () => {
  const navigate = useNavigate();
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
      console.error('Failed to load vouchers:', error);
      addToast('Failed to load your vouchers.', 'error');
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

  const handleEdit = (id) => {
    navigate(`/employee/vouchers/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft voucher?')) return;
    try {
      await voucherService.deleteVoucher(id);
      addToast('Draft voucher deleted.', 'success');
      fetchVouchers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete voucher.', 'error');
    }
  };

  const handleSubmitVoucher = async (voucher) => {
    if (!voucher.employeeSignatureUrl) {
      addToast('Please edit the voucher to attach a signature before submission.', 'error');
      navigate(`/employee/vouchers/${voucher._id}/edit`);
      return;
    }

    try {
      await voucherService.submitVoucher(voucher._id);
      addToast(`Voucher #${voucher.voucherNumber} submitted for approval.`, 'success');
      fetchVouchers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit voucher.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Expense Vouchers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and track status of all vouchers submitted by you.
          </p>
        </div>
        <Link to="/employee/vouchers/new">
          <Button icon={FilePlus}>New Voucher</Button>
        </Link>
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
          role="Employee"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSubmit={handleSubmitVoucher}
          detailPathPrefix="/employee/vouchers"
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
