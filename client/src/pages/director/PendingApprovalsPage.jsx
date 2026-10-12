import React, { useEffect, useState } from 'react';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VoucherFilterBar } from '../../components/vouchers/VoucherFilterBar';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { Pagination } from '../../components/common/Pagination';
import { SignatureModal } from '../../components/vouchers/SignatureModal';
import { RejectionModal } from '../../components/vouchers/RejectionModal';

export const PendingApprovalsPage = () => {
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
    status: 'Pending Approval', // Default locked to Pending Approval
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    page: 1,
  });

  // Modal State
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
      const res = await voucherService.getVouchers({
        ...filters,
        status: 'Pending Approval',
      });
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
      console.error('Failed to load pending approvals:', error);
      addToast('Failed to load pending approvals.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      expenseCategory: '',
      department: '',
      status: 'Pending Approval',
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

      addToast(`Voucher #${selectedVoucher.voucherNumber} approved successfully.`, 'success');
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Approval Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review employee expense claims requiring Director signature approval or rejection reason.
        </p>
      </div>

      <VoucherFilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters({ ...newFilters, status: 'Pending Approval' })}
        onResetFilters={handleResetFilters}
        showStatusFilter={false}
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

      {/* Modals */}
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
