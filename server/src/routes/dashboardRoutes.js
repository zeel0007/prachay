import express from 'express';
import {
  getEmployeeDashboard,
  getDirectorDashboard,
  getAccountsDashboard,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);

router.get('/employee', authorize('Employee'), getEmployeeDashboard);
router.get('/director', authorize('Director'), getDirectorDashboard);
router.get('/accounts', authorize('Accounts'), getAccountsDashboard);

export default router;
