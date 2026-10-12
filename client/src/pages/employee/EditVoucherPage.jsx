import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VoucherForm } from '../../components/vouchers/VoucherForm';
import { Card } from '../../components/UI/Card';
import { Spinner } from '../../components/UI/Spinner';
import { ArrowLeft } from 'lucide-react';

export const EditVoucherPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const fetchVoucher = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getVoucherById(id);
      if (res.success) {
        if (res.voucher.status !== 'Draft') {
          addToast(`Vouchers in '${res.voucher.status}' status cannot be edited.`, 'error');
          navigate(`/employee/vouchers/${id}`);
          return;
        }
        setVoucher(res.voucher);
      }
    } catch (err) {
      addToast('Failed to fetch voucher details.', 'error');
      navigate('/employee/vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData, signatureFile) => {
    setIsSaving(true);
    try {
      await voucherService.updateVoucher(id, formData);

      if (signatureFile) {
        const uploadData = new FormData();
        uploadData.append('signature', signatureFile);
        await voucherService.uploadEmployeeSignature(id, uploadData);
      }

      addToast(`Voucher #${voucher.voucherNumber} updated successfully.`, 'success');
      navigate(`/employee/vouchers/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update voucher.';
      addToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 mt-2 font-medium">Loading draft voucher...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to={`/employee/vouchers/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Edit Draft Voucher #{voucher?.voucherNumber}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modify your draft details before submitting for approval.
        </p>
      </div>

      <Card>
        <VoucherForm
          initialData={voucher}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          defaultSignatureUrl={user?.signatureUrl}
        />
      </Card>
    </div>
  );
};
