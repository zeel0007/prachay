import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { VoucherTable } from '../../components/vouchers/VoucherTable';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { Spinner } from '../../components/UI/Spinner';
import { formatCurrency } from '../../utils/formatters';
import {
  FilePlus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
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

export const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getEmployeeDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (error) {
      console.error('Failed to load employee dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 mt-2 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = (data?.monthlyStats || []).map((item) => ({
    name: `${monthNames[item._id.month]} ${item._id.year}`,
    total: item.totalAmount,
    approved: item.approvedAmount,
  }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of your expense vouchers, claim status, and monthly activity.
          </p>
        </div>
        <Link to="/employee/vouchers/new">
          <Button icon={FilePlus} size="lg">
            Create Expense Voucher
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
          title="Draft Vouchers"
          value={stats.draftVouchers || 0}
          icon={Clock}
          color="slate"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Vouchers"
          value={stats.approvedVouchers || 0}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Rejected Vouchers"
          value={stats.rejectedVouchers || 0}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Total Amount Claimed"
          value={formatCurrency(stats.totalClaimedAmount || 0)}
          subtext={`Approved: ${formatCurrency(stats.totalApprovedAmount || 0)}`}
          icon={DollarSign}
          color="indigo"
        />
      </div>

      {/* Monthly Chart */}
      {chartData.length > 0 && (
        <Card title="Expense History (Claimed vs Approved)">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '8px', borderColor: '#cbd5e1' }}
                />
                <Bar dataKey="total" name="Total Claimed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Recent Vouchers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Your Recent Vouchers</h2>
          <Link to="/employee/vouchers" className="text-xs font-semibold text-blue-600 hover:underline">
            View All My Vouchers →
          </Link>
        </div>

        <VoucherTable vouchers={data?.recentVouchers || []} role="Employee" />
      </div>
    </div>
  );
};
