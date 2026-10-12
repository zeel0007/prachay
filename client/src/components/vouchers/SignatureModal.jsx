import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { SignatureUploader } from '../common/SignatureUploader';
import { CheckCircle } from 'lucide-react';

export const SignatureModal = ({
  isOpen,
  onClose,
  onConfirm,
  voucher,
  defaultSignatureUrl,
  isLoading = false,
}) => {
  const [signatureFile, setSignatureFile] = useState(null);
  const [error, setError] = useState('');

  const handleApprove = () => {
    const hasSignature = signatureFile || defaultSignatureUrl || voucher?.directorSignatureUrl;
    if (!hasSignature) {
      setError('A valid Director signature is mandatory before approving a voucher.');
      return;
    }

    setError('');
    onConfirm(signatureFile);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Expense Voucher">
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-1">
          <p className="font-semibold text-sm">
            Voucher #{voucher?.voucherNumber} — {voucher?.expenseTitle}
          </p>
          <p>
            Claimant: <span className="font-medium">{voucher?.employeeName}</span> ({voucher?.department})
          </p>
          <p>
            Amount: <span className="font-bold text-slate-900">₹{voucher?.amount?.toLocaleString('en-IN')}</span>
          </p>
        </div>

        <SignatureUploader
          label="Director Signature Upload *"
          currentSignatureUrl={defaultSignatureUrl || voucher?.directorSignatureUrl}
          onFileSelected={(file) => {
            setSignatureFile(file);
            if (file) setError('');
          }}
        />

        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="success" icon={CheckCircle} isLoading={isLoading} onClick={handleApprove}>
            Confirm Approval
          </Button>
        </div>
      </div>
    </Modal>
  );
};
