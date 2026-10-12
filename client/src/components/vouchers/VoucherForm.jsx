import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { SignatureUploader } from '../common/SignatureUploader';
import { EXPENSE_CATEGORIES, DEPARTMENTS } from '../../utils/constants';

export const VoucherForm = ({ initialData, onSubmit, isLoading = false, defaultSignatureUrl = '' }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      department: initialData?.department || 'Equity Research',
      expenseTitle: initialData?.expenseTitle || '',
      expenseCategory: initialData?.expenseCategory || '',
      expenseDescription: initialData?.expenseDescription || '',
      amount: initialData?.amount || '',
      expenseDate: initialData?.expenseDate
        ? new Date(initialData.expenseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      employeeSignatureUrl: initialData?.employeeSignatureUrl || defaultSignatureUrl || '',
    },
  });

  const [signatureFile, setSignatureFile] = React.useState(null);

  const handleFormSubmit = (data) => {
    onSubmit(data, signatureFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Expense Title */}
        <div className="md:col-span-2">
          <Input
            label="Expense Title *"
            placeholder="e.g., Client Dinner & Advisory Meeting"
            {...register('expenseTitle', {
              required: 'Expense title is required',
              maxLength: { value: 200, message: 'Title cannot exceed 200 characters' },
            })}
            error={errors.expenseTitle?.message}
          />
        </div>

        {/* Expense Category */}
        <Select
          label="Expense Category *"
          options={EXPENSE_CATEGORIES}
          placeholder="Select category"
          {...register('expenseCategory', {
            required: 'Expense category is required',
          })}
          error={errors.expenseCategory?.message}
        />

        {/* Department */}
        <Select
          label="Department *"
          options={DEPARTMENTS}
          placeholder="Select department"
          {...register('department', {
            required: 'Department is required',
          })}
          error={errors.department?.message}
        />

        {/* Amount */}
        <Input
          label="Expense Amount (₹) *"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than zero' },
          })}
          error={errors.amount?.message}
        />

        {/* Expense Date */}
        <Input
          label="Expense Date *"
          type="date"
          {...register('expenseDate', {
            required: 'Expense date is required',
          })}
          error={errors.expenseDate?.message}
        />

        {/* Expense Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Expense Description / Business Justification
          </label>
          <textarea
            rows={4}
            placeholder="Provide relevant details, attendees, project reference, or items purchased..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register('expenseDescription')}
          />
        </div>

        {/* Employee Signature */}
        <div className="md:col-span-2 pt-2 border-t border-slate-100">
          <SignatureUploader
            label="Employee Signature (Required before submission)"
            currentSignatureUrl={initialData?.employeeSignatureUrl || defaultSignatureUrl}
            onFileSelected={(file) => setSignatureFile(file)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" isLoading={isLoading} size="lg">
          {initialData ? 'Update Draft Voucher' : 'Save as Draft'}
        </Button>
      </div>
    </form>
  );
};
