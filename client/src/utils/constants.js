export const EXPENSE_CATEGORIES = [
  'Travel & Conveyance',
  'Meals & Refreshments',
  'Office Supplies',
  'Software & Tools',
  'Utilities & Communication',
  'Client Entertainment',
  'Training & Development',
  'Others',
];

export const DEPARTMENTS = [
  'Equity Research',
  'IT & Infrastructure',
  'Finance & Accounts',
  'Executive Management',
  'Compliance & Legal',
  'Sales & Marketing',
  'Operations & Admin',
  'Human Resources',
];

export const VOUCHER_STATUS = {
  DRAFT: 'Draft',
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const STATUS_COLORS = {
  [VOUCHER_STATUS.DRAFT]: {
    bg: 'bg-stone-200/60',
    text: 'text-stone-800',
    border: 'border-stone-300',
    dot: 'bg-stone-600',
  },
  [VOUCHER_STATUS.PENDING]: {
    bg: 'bg-amber-100/70',
    text: 'text-amber-900',
    border: 'border-amber-300',
    dot: 'bg-[#CF4500]', // Signal Orange dot
  },
  [VOUCHER_STATUS.APPROVED]: {
    bg: 'bg-emerald-100/70',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    dot: 'bg-emerald-600',
  },
  [VOUCHER_STATUS.REJECTED]: {
    bg: 'bg-rose-100/70',
    text: 'text-rose-900',
    border: 'border-rose-300',
    dot: 'bg-rose-600',
  },
};
