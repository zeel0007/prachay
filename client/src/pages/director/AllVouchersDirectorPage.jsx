import React, { useEffect, useState } from 'react';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VoucherFilterBar } from '../../components/vouchers/VoucherFilterBar';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { Pagination } from '../../components/common/Pagination';
import { SignatureModal } from '../../components/vouchers/SignatureModal';
import { RejectionModal } from '../../components/vouchers/RejectionModal';

export const AllVouchersDirectorPage = () => {
  const { user } = useAuth();
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

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      console.error('Failed to load all vouchers:', error);
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

  const handleApproveClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsApproveOpen(true);
  };

  const handleRejectClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsRejectOpen(true);
  };

  const handleApproveConfirm = async (signatureFile) => {
    try {
      setActionLoading(true);
      let directorSigUrl = selectedVoucher.directorSignatureUrl || user.signatureUrl;

      if (signatureFile) {
        const formData = new FormData();
        formData.append('signature', signatureFile);
        const uploadRes = await voucherService.uploadDirectorSignature(
          selectedVoucher._id,
          formData
        );
        directorSigUrl = uploadRes.signatureUrl;
      }

      await voucherService.approveVoucher(selectedVoucher._id, {
        directorSignatureUrl: directorSigUrl,
      });

      addToast(`Voucher #${selectedVoucher.voucherNumber} approved.`, 'success');
      setIsApproveOpen(false);
      fetchVouchers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      setActionLoading(true);
      await voucherService.rejectVoucher(selectedVoucher._id, { rejectionReason: reason });
      addToast(`Voucher #${selectedVoucher.voucherNumber} rejected.`, 'success');
      setIsRejectOpen(false);
      fetchVouchers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Rejection failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Organizational Vouchers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search, filter, and audit expense vouchers across all company departments and employees.
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
          role="Director"
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          detailPathPrefix="/director/vouchers"
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          limit={pagination.limit}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
        />
      </div>

      <SignatureModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApproveConfirm}
        voucher={selectedVoucher}
        defaultSignatureUrl={user?.signatureUrl}
        isLoading={actionLoading}
      />

      <RejectionModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleRejectConfirm}
        voucher={selectedVoucher}
        isLoading={actionLoading}
      />
    </div>
  );
};
