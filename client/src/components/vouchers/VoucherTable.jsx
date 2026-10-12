import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, CheckCircle, XCircle, Send, FileText } from 'lucide-react';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Spinner } from '../UI/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const VoucherTable = ({
  vouchers = [],
  isLoading = false,
  role = 'Employee',
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  detailPathPrefix = '/employee/vouchers',
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#FCFBFA] rounded-3xl border border-[#E2DFDC] p-12 flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-stone-500 mt-3">Loading vouchers...</p>
      </div>
    );
  }

  if (!vouchers.length) {
    return (
      <div className="bg-[#FCFBFA] rounded-3xl border border-[#E2DFDC] p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-white border border-[#E2DFDC] flex items-center justify-center text-stone-400 mx-auto mb-3 shadow-xs">
          <FileText className="w-6 h-6 text-[#141413]" />
        </div>
        <h4 className="text-base font-semibold text-[#141413]">No Vouchers Found</h4>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          There are no expense vouchers matching your criteria or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFBFA] rounded-3xl border border-[#E2DFDC] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F5F2EF] border-b border-[#EDE9E5] text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              <th className="px-6 py-4">Voucher #</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Employee / Dept</th>
              <th className="px-6 py-4">Title & Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE9E5] text-[#141413]">
            {vouchers.map((voucher) => (
              <tr key={voucher._id} className="hover:bg-white/80 transition-colors">
                <td className="px-6 py-4 font-semibold text-[#141413] font-mono text-xs">
                  <Link to={`${detailPathPrefix}/${voucher._id}`} className="hover:underline">
                    {voucher.voucherNumber}
                  </Link>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-600">
                  {formatDate(voucher.expenseDate)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="font-semibold text-[#141413] text-xs">{voucher.employeeName}</p>
                  <p className="text-[11px] text-stone-500">{voucher.department}</p>
                </td>

                <td className="px-6 py-4 max-w-xs">
                  <p className="font-medium text-[#141413] truncate text-xs">{voucher.expenseTitle}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-stone-200/60 text-[10px] font-medium text-stone-700">
                    {voucher.expenseCategory}
                  </span>
                </td>

                <td className="px-6 py-4 text-right font-bold text-[#141413] whitespace-nowrap font-mono">
                  {formatCurrency(voucher.amount)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge status={voucher.status} />
                </td>

                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`${detailPathPrefix}/${voucher._id}`}>
                      <Button variant="ghost" size="sm" icon={Eye}>
                        View
                      </Button>
                    </Link>

                    {role === 'Employee' && voucher.status === 'Draft' && (
                      <>
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Edit3}
                            onClick={() => onEdit(voucher._id)}
                          >
                            Edit
                          </Button>
                        )}

                        {onSubmit && (
                          <Button
                            variant="signal"
                            size="sm"
                            icon={Send}
                            onClick={() => onSubmit(voucher)}
                          >
                            Submit
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => onDelete(voucher._id)}
                          />
                        )}
                      </>
                    )}

                    {role === 'Director' && voucher.status === 'Pending Approval' && (
                      <>
                        {onApprove && (
                          <Button
                            variant="success"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => onApprove(voucher)}
                          >
                            Approve
                          </Button>
                        )}

                        {onReject && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => onReject(voucher)}
                          >
                            Reject
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
