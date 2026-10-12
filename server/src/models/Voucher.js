import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    expenseTitle: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Expense title cannot exceed 200 characters'],
    },
    expenseCategory: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: {
        values: [
          'Travel & Conveyance',
          'Meals & Refreshments',
          'Office Supplies',
          'Software & Tools',
          'Utilities & Communication',
          'Client Entertainment',
          'Training & Development',
          'Others',
        ],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    expenseDescription: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense date is required'],
      index: true,
    },
    voucherDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Draft',
      index: true,
    },
    employeeSignatureUrl: {
      type: String,
      default: '',
    },
    directorSignatureUrl: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying and reporting
voucherSchema.index({ createdAt: -1 });
voucherSchema.index({ status: 1, createdAt: -1 });
voucherSchema.index({ employee: 1, status: 1 });

export const Voucher = mongoose.model('Voucher', voucherSchema);
