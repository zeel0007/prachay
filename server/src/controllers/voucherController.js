import { Voucher } from '../models/Voucher.js';
import { User } from '../models/User.js';
import { getNextVoucherNumber } from '../services/voucherNumberService.js';

// @desc    Create new draft expense voucher
// @route   POST /api/vouchers
// @access  Private (Employee)
export const createVoucher = async (req, res, next) => {
  try {
    const {
      department,
      expenseTitle,
      expenseCategory,
      expenseDescription,
      amount,
      expenseDate,
      employeeSignatureUrl,
    } = req.body;

    const voucherNumber = await getNextVoucherNumber();

    const voucher = await Voucher.create({
      voucherNumber,
      employee: req.user._id,
      employeeName: req.user.name,
      employeeId: req.user.employeeId || '',
      department: department || req.user.department || 'General',
      expenseTitle,
      expenseCategory,
      expenseDescription: expenseDescription || '',
      amount,
      expenseDate,
      employeeSignatureUrl: employeeSignatureUrl || req.user.signatureUrl || '',
      status: 'Draft',
    });

    res.status(201).json({
      success: true,
      message: 'Draft voucher created successfully.',
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of vouchers with search, filter, sort, pagination
// @route   GET /api/vouchers
// @access  Private (Employee: own vouchers, Director/Accounts: all vouchers)
export const getVouchers = async (req, res, next) => {
  try {
    const {
      search,
      department,
      expenseCategory,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Scope control per role
    if (req.user.role === 'Employee') {
      query.employee = req.user._id;
    }

    // Search filter (Voucher #, Employee Name, Title, Description)
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { voucherNumber: searchRegex },
        { employeeName: searchRegex },
        { expenseTitle: searchRegex },
        { expenseDescription: searchRegex },
      ];
    }

    // Exact filters
    if (department) query.department = department;
    if (expenseCategory) query.expenseCategory = expenseCategory;
    if (status) query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.expenseDate.$lte = end;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const vouchers = await Voucher.find(query)
      .populate('employee', 'name email department employeeId')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Voucher.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: vouchers.length,
      totalCount,
      totalPages,
      currentPage: pageNum,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single voucher by ID
// @route   GET /api/vouchers/:id
// @access  Private
export const getVoucherById = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate('employee', 'name email department employeeId')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email');

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.',
      });
    }

    // Enforce ownership check for Employees
    if (req.user.role === 'Employee' && voucher.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own vouchers.',
      });
    }

    res.status(200).json({
      success: true,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update draft voucher
// @route   PATCH /api/vouchers/:id
// @access  Private (Employee - Draft only)
export const updateVoucher = async (req, res, next) => {
  try {
    let voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.',
      });
    }

    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own vouchers.',
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit voucher in '${voucher.status}' status. Only Draft vouchers can be edited.`,
      });
    }

    // Protected fields whitelist filtering
    const allowedFields = [
      'department',
      'expenseTitle',
      'expenseCategory',
      'expenseDescription',
      'amount',
      'expenseDate',
      'employeeSignatureUrl',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        voucher[field] = req.body[field];
      }
    });

    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Draft voucher updated successfully.',
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete draft voucher
// @route   DELETE /api/vouchers/:id
// @access  Private (Employee - Draft only)
export const deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.',
      });
    }

    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own vouchers.',
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete voucher in '${voucher.status}' status. Only Draft vouchers can be deleted.`,
      });
    }

    await voucher.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Draft voucher deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Employee Signature Image
// @route   POST /api/vouchers/:id/employee-signature
// @access  Private (Employee)
export const uploadEmployeeSig = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file for the signature.',
      });
    }

    const signatureUrl = `/uploads/signatures/${req.file.filename}`;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Signature can only be updated for Draft vouchers.',
      });
    }

    voucher.employeeSignatureUrl = signatureUrl;
    await voucher.save();

    // Also update user profile default signatureUrl
    await User.findByIdAndUpdate(req.user._id, { signatureUrl });

    res.status(200).json({
      success: true,
      message: 'Employee signature uploaded successfully.',
      signatureUrl,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Director Signature Image
// @route   POST /api/vouchers/:id/director-signature
// @access  Private (Director)
export const uploadDirectorSig = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file for the Director signature.',
      });
    }

    const signatureUrl = `/uploads/signatures/${req.file.filename}`;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found.' });
    }

    voucher.directorSignatureUrl = signatureUrl;
    await voucher.save();

    // Also update director user profile signatureUrl
    await User.findByIdAndUpdate(req.user._id, { signatureUrl });

    res.status(200).json({
      success: true,
      message: 'Director signature uploaded successfully.',
      signatureUrl,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit voucher for approval
// @route   POST /api/vouchers/:id/submit
// @access  Private (Employee - Draft status only)
export const submitVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.',
      });
    }

    if (voucher.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only submit your own vouchers.',
      });
    }

    if (voucher.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Voucher is already in '${voucher.status}' status and cannot be submitted again.`,
      });
    }

    const finalSignature =
      req.body.employeeSignatureUrl || voucher.employeeSignatureUrl || req.user.signatureUrl;

    if (!finalSignature) {
      return res.status(400).json({
        success: false,
        message: 'An employee signature is mandatory before submitting a voucher for approval.',
      });
    }

    voucher.employeeSignatureUrl = finalSignature;
    voucher.status = 'Pending Approval';
    voucher.submittedAt = new Date();
    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher submitted successfully for Director approval.',
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve voucher
// @route   POST /api/vouchers/:id/approve
// @access  Private (Director only)
export const approveVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.',
      });
    }

    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve voucher in '${voucher.status}' status. Only Pending Approval vouchers can be approved.`,
      });
    }

    const directorSignature =
      req.body.directorSignatureUrl || voucher.directorSignatureUrl || req.user.signatureUrl;

    if (!directorSignature) {
      return res.status(400).json({
        success: false,
        message: 'Director signature is mandatory before approving a voucher.',
      });
    }

    voucher.status = 'Approved';
    voucher.directorSignatureUrl = directorSignature;
    voucher.approvedBy = req.user._id;
    voucher.approvedAt = new Date();
    voucher.rejectionReason = '';
    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher approved successfully.',
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject voucher
// @route   POST /api/vouchers/:id/reject
// @access  Private (Director only)
export const rejectVoucher = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory when rejecting a voucher.',
      });
    }

    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found.',
      });
    }

    if (voucher.status !== 'Pending Approval') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject voucher in '${voucher.status}' status. Only Pending Approval vouchers can be rejected.`,
      });
    }

    voucher.status = 'Rejected';
    voucher.rejectedBy = req.user._id;
    voucher.rejectedAt = new Date();
    voucher.rejectionReason = rejectionReason.trim();
    await voucher.save();

    res.status(200).json({
      success: true,
      message: 'Voucher rejected.',
      voucher,
    });
  } catch (error) {
    next(error);
  }
};
