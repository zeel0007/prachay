import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Spinner } from '../../components/UI/Spinner';
import { formatCurrency } from '../../utils/formatters';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Receipt,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AccountsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAccountsDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      console.error('Failed to load accounts dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-stone-500 mt-2 font-medium">Loading accounts dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  const deptChartData = (data?.departmentBreakdown || []).map((item) => ({
    name: item._id,
    total: item.totalAmount,
    count: item.count,
  }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500]" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Financial Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#141413] tracking-tight">
            Accounts & Finance Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Monitor organizational approved expenses, audit voucher signatures, and process disbursements.
          </p>
        </div>
        <Link to="/accounts/vouchers">
          <Button icon={Receipt} variant="primary">
            Explore All Vouchers
          </Button>
        </Link>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Vouchers"
          value={stats.totalVouchers || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingCount || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Vouchers"
          value={stats.approvedCount || 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Rejected Vouchers"
          value={stats.rejectedCount || 0}
          icon={XCircle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Total Approved Expense"
          value={formatCurrency(stats.totalApprovedExpenseAmount || 0)}
          subtext="Ready for Accounts disbursement processing"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Pending Claims"
          value={formatCurrency(stats.totalPendingAmount || 0)}
          subtext="Under Director review"
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* Department Breakdown Chart */}
      {deptChartData.length > 0 && (
        <Card title="Approved Expense Distribution by Department">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE9E5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="total" name="Approved Expense" fill="#CF4500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Recent Approved Vouchers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#141413]">
            Recent Approved Vouchers (Disbursement Queue)
          </h2>
          <Link
            to="/accounts/vouchers"
            className="text-xs font-semibold text-[#141413] hover:underline"
          >
            View All Vouchers →
          </Link>
        </div>

        <VoucherTable
          vouchers={data?.recentApprovedVouchers || []}
          role="Accounts"
          detailPathPrefix="/accounts/vouchers"
        />
      </div>
    </div>
  );
};
