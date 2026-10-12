import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/UI/Card';
import { Badge } from '../../components/UI/Badge';
import { Button } from '../../components/UI/Button';
import { Spinner } from '../../components/UI/Spinner';
import { SignatureModal } from '../../components/vouchers/SignatureModal';
import { RejectionModal } from '../../components/vouchers/RejectionModal';
import { SignatureUploader } from '../../components/common/SignatureUploader';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Building,
  Tag,
  DollarSign,
  Send,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';

export const VoucherDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getVoucherById(id);
      if (res.success) {
        setVoucher(res.voucher);
      }
    } catch (err) {
      addToast('Voucher not found or access denied.', 'error');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVoucher = async () => {
    if (!voucher.employeeSignatureUrl) {
      addToast('An employee signature is required before submitting.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await voucherService.submitVoucher(id);
      addToast('Voucher submitted successfully for Director approval.', 'success');
      fetchVoucher();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit voucher.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVoucher = async (signatureFile) => {
    try {
      setActionLoading(true);
      let directorSigUrl = voucher.directorSignatureUrl || user.signatureUrl;

      if (signatureFile) {
        const formData = new FormData();
        formData.append('signature', signatureFile);
        const uploadRes = await voucherService.uploadDirectorSignature(id, formData);
        directorSigUrl = uploadRes.signatureUrl;
      }

      await voucherService.approveVoucher(id, { directorSignatureUrl: directorSigUrl });
      addToast('Voucher approved successfully!', 'success');
      setIsApproveOpen(false);
      fetchVoucher();
    } catch (err) {
      addToast(err.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVoucher = async (reason) => {
    try {
      setActionLoading(true);
      await voucherService.rejectVoucher(id, { rejectionReason: reason });
      addToast('Voucher rejected.', 'success');
      setIsRejectOpen(false);
      fetchVoucher();
    } catch (err) {
      addToast(err.response?.data?.message || 'Rejection failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this draft voucher?')) return;
    try {
      await voucherService.deleteVoucher(id);
      addToast('Voucher deleted.', 'success');
      navigate('/employee/vouchers');
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 mt-2 font-medium">Loading voucher details...</p>
      </div>
    );
  }

  if (!voucher) return null;

  const isEmployeeOwner = user?.role === 'Employee' && voucher.employee?._id === user?._id;
  const isDirector = user?.role === 'Director';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <Badge status={voucher.status} />
      </div>

      {/* Main Card */}
      <Card>
        <div className="space-y-6">
          {/* Header Title Block */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 tracking-wider">
                {voucher.voucherNumber}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{voucher.expenseTitle}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Created on {formatDateTime(voucher.createdAt)}
              </p>
            </div>

            <div className="text-right sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Total Amount
              </span>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(voucher.amount)}
              </span>
            </div>
          </div>

          {/* Rejection Alert Banner */}
          {voucher.status === 'Rejected' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Voucher Rejection Notice</h4>
                <p className="text-xs text-rose-800 mt-0.5 font-medium">
                  {voucher.rejectionReason}
                </p>
                {voucher.rejectedBy && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    Rejected by {voucher.rejectedBy.name} on {formatDateTime(voucher.rejectedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Approval Info Banner */}
          {voucher.status === 'Approved' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-900">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Voucher Approved</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Approved by {voucher.approvedBy?.name || 'Director'} on{' '}
                  {formatDateTime(voucher.approvedAt)}. Eligible for Accounts reimbursement.
                </p>
              </div>
            </div>
          )}

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Employee & Department Information
              </h3>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Employee:</span>
                <span className="font-semibold text-slate-800">{voucher.employeeName}</span>
                {voucher.employeeId && (
                  <span className="text-xs text-slate-400 font-mono">({voucher.employeeId})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{voucher.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{voucher.expenseCategory}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Expense Dates & Status
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Expense Date:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(voucher.expenseDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Voucher Date:</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(voucher.voucherDate)}
                </span>
              </div>
              {voucher.submittedAt && (
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDateTime(voucher.submittedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {voucher.expenseDescription && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Description / Justification
              </h3>
              <p className="text-sm text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                {voucher.expenseDescription}
              </p>
            </div>
          )}

          {/* Signatures Section */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Signature */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Employee Signature
              </p>
              {voucher.employeeSignatureUrl ? (
                <img
                  src={voucher.employeeSignatureUrl}
                  alt="Employee Signature"
                  className="max-h-20 object-contain mx-auto bg-white p-2 rounded-lg border border-slate-200"
                />
              ) : (
                <p className="text-xs text-amber-600 font-medium py-4">No signature uploaded yet</p>
              )}
              <p className="text-[11px] text-slate-400 mt-2">{voucher.employeeName}</p>
            </div>

            {/* Director Signature */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/30 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Director Approval Signature
              </p>
              {voucher.directorSignatureUrl ? (
                <img
                  src={voucher.directorSignatureUrl}
                  alt="Director Signature"
                  className="max-h-20 object-contain mx-auto bg-white p-2 rounded-lg border border-slate-200"
                />
              ) : (
                <p className="text-xs text-slate-400 py-4">
                  {voucher.status === 'Pending Approval'
                    ? 'Awaiting Director review & signature'
                    : 'Not approved'}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-2">
                {voucher.approvedBy?.name || 'Authorized Director'}
              </p>
            </div>
          </div>

          {/* Workflow Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              {voucher.status === 'Draft' && (
                <span className="text-xs text-amber-600 font-medium">
                  Draft vouchers can be edited or deleted before submission.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Employee Actions */}
              {isEmployeeOwner && voucher.status === 'Draft' && (
                <>
                  <Button
                    variant="outline"
                    icon={Edit3}
                    onClick={() => navigate(`/employee/vouchers/${id}/edit`)}
                  >
                    Edit Draft
                  </Button>
                  <Button
                    variant="primary"
                    icon={Send}
                    isLoading={actionLoading}
                    onClick={handleSubmitVoucher}
                  >
                    Submit for Approval
                  </Button>
                  <Button
                    variant="ghost"
                    icon={Trash2}
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={handleDelete}
                  />
                </>
              )}

              {/* Director Actions */}
              {isDirector && voucher.status === 'Pending Approval' && (
                <>
                  <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={() => setIsRejectOpen(true)}
                  >
                    Reject Voucher
                  </Button>
                  <Button
                    variant="success"
                    icon={CheckCircle}
                    onClick={() => setIsApproveOpen(true)}
                  >
                    Approve Voucher
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Approval Signature Modal */}
      <SignatureModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApproveVoucher}
        voucher={voucher}
        defaultSignatureUrl={user?.signatureUrl}
        isLoading={actionLoading}
      />

      {/* Rejection Reason Modal */}
      <RejectionModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleRejectVoucher}
        voucher={voucher}
        isLoading={actionLoading}
      />
    </div>
  );
};
