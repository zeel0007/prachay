import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { voucherService } from '../../services/voucherService';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/common/StatCard';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { SignatureModal } from '../../components/vouchers/SignatureModal';
import { RejectionModal } from '../../components/vouchers/RejectionModal';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Spinner } from '../../components/UI/Spinner';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export const DirectorDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getDirectorDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      console.error('Failed to load director dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsApproveOpen(true);
  };

  const handleRejectClick = (voucher) => {
    setSelectedVoucher(voucher);
    setIsRejectOpen(true);
  };

  const handleApproveConfirm = async (signatureFile) => {
    try {
      setActionLoading(true);
      let directorSigUrl = selectedVoucher.directorSignatureUrl || user.signatureUrl;

      if (signatureFile) {
        const formData = new FormData();
        formData.append('signature', signatureFile);
        const uploadRes = await voucherService.uploadDirectorSignature(
          selectedVoucher._id,
          formData
        );
        directorSigUrl = uploadRes.signatureUrl;
      }

      await voucherService.approveVoucher(selectedVoucher._id, {
        directorSignatureUrl: directorSigUrl,
      });

      addToast(`Voucher #${selectedVoucher.voucherNumber} approved.`, 'success');
      setIsApproveOpen(false);
      fetchDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Approval failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      setActionLoading(true);
      await voucherService.rejectVoucher(selectedVoucher._id, { rejectionReason: reason });
      addToast(`Voucher #${selectedVoucher.voucherNumber} rejected.`, 'success');
      setIsRejectOpen(false);
      fetchDashboard();
    } catch (err) {
      addToast(err.response?.data?.message || 'Rejection failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-stone-500 mt-2 font-medium">Loading director dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const PIE_COLORS = ['#CF4500', '#141413', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const categoryPieData = (data?.categoryBreakdown || []).map((item) => ({
    name: item._id,
    value: item.totalAmount,
  }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Executive Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">Director Dashboard</h1>
          <p className="text-xs text-stone-500 mt-1">
            Review pending employee expense vouchers, inspect signatures, and execute approvals.
          </p>
        </div>
        <Link to="/director/approvals">
          <Button icon={Clock} variant="signal">
            Review Pending ({stats.pendingCount || 0})
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Pending Approval"
          value={stats.pendingCount || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Today"
          value={stats.approvedTodayCount || 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Rejected Today"
          value={stats.rejectedTodayCount || 0}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Total Pending Amount"
          value={formatCurrency(stats.totalPendingAmount || 0)}
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {/* Category Breakdown Chart */}
      {categoryPieData.length > 0 && (
        <Card title="Pending Expenses by Category">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Recent Voucher Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#141413]">Recent Voucher Activity</h2>
          <Link
            to="/director/vouchers"
            className="text-xs font-semibold text-[#141413] hover:underline"
          >
            View All Organizational Vouchers →
          </Link>
        </div>

        <VoucherTable
          vouchers={data?.recentActivity || []}
          role="Director"
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          detailPathPrefix="/director/vouchers"
        />
      </div>

      {/* Modals */}
      <SignatureModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApproveConfirm}
        voucher={selectedVoucher}
        defaultSignatureUrl={user?.signatureUrl}
        isLoading={actionLoading}
      />

      <RejectionModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleRejectConfirm}
        voucher={selectedVoucher}
        isLoading={actionLoading}
      />
    </div>
  );
};
