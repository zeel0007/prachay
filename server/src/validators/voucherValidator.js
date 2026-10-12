import { body } from 'express-validator';

export const createVoucherValidation = [
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('expenseTitle').trim().notEmpty().withMessage('Expense title is required'),
  body('expenseCategory').trim().notEmpty().withMessage('Expense category is required'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a number greater than zero'),
  body('expenseDate')
    .notEmpty()
    .withMessage('Expense date is required')
    .isISO8601()
    .withMessage('Expense date must be a valid date format'),
  body('expenseDescription').optional().trim(),
];

export const updateVoucherValidation = [
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('expenseTitle').optional().trim().notEmpty().withMessage('Expense title cannot be empty'),
  body('expenseCategory').optional().trim().notEmpty().withMessage('Expense category cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a number greater than zero'),
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Expense date must be a valid date format'),
  body('expenseDescription').optional().trim(),
];

export const rejectionValidation = [
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('A valid rejection reason is mandatory when rejecting a voucher')
    .isLength({ min: 3 })
    .withMessage('Rejection reason must be at least 3 characters long'),
];
