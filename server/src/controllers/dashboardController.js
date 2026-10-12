import { Voucher } from '../models/Voucher.js';

// @desc    Get Employee Dashboard Statistics
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employeeId = req.user._id;

    const [stats] = await Voucher.aggregate([
      { $match: { employee: employeeId } },
      {
        $group: {
          _id: null,
          totalVouchers: { $sum: 1 },
          draftVouchers: {
            $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] },
          },
          pendingApproval: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending Approval'] }, 1, 0] },
          },
          approvedVouchers: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] },
          },
          rejectedVouchers: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
          },
          totalClaimedAmount: { $sum: '$amount' },
          totalApprovedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0] },
          },
        },
      },
    ]);

    const recentVouchers = await Voucher.find({ employee: employeeId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly expenditure breakdown for chart
    const monthlyStats = await Voucher.aggregate([
      { $match: { employee: employeeId } },
      {
        $group: {
          _id: {
            month: { $month: '$expenseDate' },
            year: { $year: '$expenseDate' },
          },
          totalAmount: { $sum: '$amount' },
          approvedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: stats || {
        totalVouchers: 0,
        draftVouchers: 0,
        pendingApproval: 0,
        approvedVouchers: 0,
        rejectedVouchers: 0,
        totalClaimedAmount: 0,
        totalApprovedAmount: 0,
      },
      recentVouchers,
      monthlyStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Director Dashboard Statistics
// @route   GET /api/dashboard/director
// @access  Private (Director)
export const getDirectorDashboard = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const pendingCount = await Voucher.countDocuments({ status: 'Pending Approval' });

    const approvedTodayCount = await Voucher.countDocuments({
      status: 'Approved',
      approvedAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const rejectedTodayCount = await Voucher.countDocuments({
      status: 'Rejected',
      rejectedAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const [pendingAmountResult] = await Voucher.aggregate([
      { $match: { status: 'Pending Approval' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalPendingAmount = pendingAmountResult ? pendingAmountResult.total : 0;

    const recentActivity = await Voucher.find({ status: { $ne: 'Draft' } })
      .populate('employee', 'name email department employeeId')
      .sort({ updatedAt: -1 })
      .limit(8);

    // Category breakdown of pending vouchers
    const categoryBreakdown = await Voucher.aggregate([
      { $match: { status: 'Pending Approval' } },
      {
        $group: {
          _id: '$expenseCategory',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        pendingCount,
        approvedTodayCount,
        rejectedTodayCount,
        totalPendingAmount,
      },
      recentActivity,
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Accounts Dashboard Statistics
// @route   GET /api/dashboard/accounts
// @access  Private (Accounts)
export const getAccountsDashboard = async (req, res, next) => {
  try {
    const [counts] = await Voucher.aggregate([
      {
        $group: {
          _id: null,
          totalVouchers: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending Approval'] }, 1, 0] },
          },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
          },
          totalApprovedExpenseAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, '$amount', 0] },
          },
          totalPendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending Approval'] }, '$amount', 0] },
          },
        },
      },
    ]);

    const recentApprovedVouchers = await Voucher.find({ status: 'Approved' })
      .populate('employee', 'name email department employeeId')
      .populate('approvedBy', 'name email')
      .sort({ approvedAt: -1 })
      .limit(8);

    // Department-wise expense breakdown
    const departmentBreakdown = await Voucher.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: '$department',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: counts || {
        totalVouchers: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalApprovedExpenseAmount: 0,
        totalPendingAmount: 0,
      },
      recentApprovedVouchers,
      departmentBreakdown,
    });
  } catch (error) {
    next(error);
  }
};
