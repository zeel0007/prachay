import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { XCircle } from 'lucide-react';

export const RejectionModal = ({ isOpen, onClose, onConfirm, voucher, isLoading = false }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleReject = () => {
    if (!reason.trim()) {
      setError('A mandatory rejection reason must be provided.');
      return;
    }

    if (reason.trim().length < 3) {
      setError('Rejection reason must be at least 3 characters long.');
      return;
    }

    setError('');
    onConfirm(reason.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Expense Voucher">
      <div className="space-y-4">
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs text-rose-900 space-y-1">
          <p className="font-semibold text-sm">
            Voucher #{voucher?.voucherNumber} — {voucher?.expenseTitle}
          </p>
          <p>
            Submitted by <span className="font-medium">{voucher?.employeeName}</span> ({voucher?.department})
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Rejection Reason *
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            placeholder="State explicit clear business reason for rejecting this voucher (e.g. missing itemized receipt, amount exceeds policy limit)..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          {error && <p className="mt-1 text-xs text-rose-600 font-semibold">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" icon={XCircle} isLoading={isLoading} onClick={handleReject}>
            Reject Voucher
          </Button>
        </div>
      </div>
    </Modal>
  );
};
