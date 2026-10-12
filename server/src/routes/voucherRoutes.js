import express from 'express';
import {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  uploadEmployeeSig,
  uploadDirectorSig,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
} from '../controllers/voucherController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { uploadSignature } from '../middleware/upload.js';
import { validate } from '../validators/authValidator.js';
import {
  createVoucherValidation,
  updateVoucherValidation,
  rejectionValidation,
} from '../validators/voucherValidator.js';

const router = express.Router();

// All voucher routes require authentication
router.use(protect);

router
  .route('/')
  .post(authorize('Employee'), validate(createVoucherValidation), createVoucher)
  .get(getVouchers);

router
  .route('/:id')
  .get(getVoucherById)
  .patch(authorize('Employee'), validate(updateVoucherValidation), updateVoucher)
  .delete(authorize('Employee'), deleteVoucher);

// Signature uploads
router.post(
  '/:id/employee-signature',
  authorize('Employee'),
  uploadSignature.single('signature'),
  uploadEmployeeSig
);

router.post(
  '/:id/director-signature',
  authorize('Director'),
  uploadSignature.single('signature'),
  uploadDirectorSig
);

// Workflow state transition routes
router.post('/:id/submit', authorize('Employee'), submitVoucher);
router.post('/:id/approve', authorize('Director'), approveVoucher);
router.post('/:id/reject', authorize('Director'), validate(rejectionValidation), rejectVoucher);

export default router;
