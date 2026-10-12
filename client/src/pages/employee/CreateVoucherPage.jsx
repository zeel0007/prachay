import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { voucherService } from '../../services/voucherService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VoucherForm } from '../../components/vouchers/VoucherForm';
import { Card } from '../../components/UI/Card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CreateVoucherPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData, signatureFile) => {
    setIsLoading(true);
    try {
      // Step 1: Create draft voucher
      const res = await voucherService.createVoucher(formData);
      const voucherId = res.voucher._id;

      // Step 2: Upload signature image if a new file was picked
      if (signatureFile) {
        const uploadData = new FormData();
        uploadData.append('signature', signatureFile);
        await voucherService.uploadEmployeeSignature(voucherId, uploadData);
      }

      addToast(`Voucher ${res.voucher.voucherNumber} saved as Draft.`, 'success');
      navigate(`/employee/vouchers/${voucherId}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create voucher.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          to="/employee/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Expense Voucher</h1>
        <p className="text-xs text-slate-500 mt-1">
          Fill in expense details. All vouchers start as Drafts and can be signed before submission.
        </p>
      </div>

      <Card>
        <VoucherForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          defaultSignatureUrl={user?.signatureUrl}
        />
      </Card>
    </div>
  );
};
