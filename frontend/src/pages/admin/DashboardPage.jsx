import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { StatsCard } from '../../components/ui/StatsCard'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { analyticsService } from '../../services/gymServices'

export const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const data = await analyticsService.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load dashboard metrics from database.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Fetching real-time gym analytics..." />
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center bg-[#17211D] border border-red-500/30 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Error Loading Analytics</h3>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-[#B6F23A] text-black font-semibold rounded-xl text-sm"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#17211D] via-[#1A2621] to-[#17211D] border border-[#21302A] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B6F23A]/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B6F23A] mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Live Operations Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FitTrack Management Command
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time snapshot of active memberships, daily check-ins, and club financials.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin/attendance"
            className="px-4 py-2.5 rounded-xl bg-[#202E29] hover:bg-[#283B34] border border-[#2A3E36] text-white text-xs font-bold transition-all"
          >
            Mark Attendance
          </Link>
          <Link
            to="/admin/members"
            className="px-4 py-2.5 rounded-xl bg-[#B6F23A] hover:bg-[#86C232] text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(182,242,58,0.25)]"
          >
            + Add New Member
          </Link>
        </div>
      </div>

      {/* 6 Key Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Members"
          value={stats.total_members}
          icon={Users}
          trend={12}
        />
        <StatsCard
          title="Active Members"
          value={stats.active_members}
          icon={Users}
          trend={8}
        />
        <StatsCard
          title="Trainers"
          value={stats.total_trainers}
          icon={UserCheck}
        />
        <StatsCard
          title="Memberships"
          value={stats.active_memberships}
          icon={CreditCard}
        />
        <StatsCard
          title="Today's Check-ins"
          value={stats.today_attendance}
          icon={CalendarCheck}
        />
        <StatsCard
          title="Monthly Revenue"
          value={stats.monthly_revenue}
          icon={DollarSign}
          prefix="₹"
          trend={15}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics Chart */}
        <Card title="Monthly Revenue Trend (Last 6 Months)" subtitle="Actual payments recorded in database">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenue_chart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B6F23A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B6F23A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21302A" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17211D',
                    border: '1px solid #21302A',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#B6F23A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 7-Day Attendance Chart */}
        <Card title="Daily Attendance Volume" subtitle="Past 7 days physical check-in flow">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.attendance_chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21302A" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17211D',
                    border: '1px solid #21302A',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(val) => [`${val} Members`, 'Check-ins']}
                />
                <Bar dataKey="count" fill="#B6F23A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tables Row: Recent Registrations, Recent Payments, Expiring Memberships */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Member Registrations */}
        <Card
          title="Recent Registrations"
          subtitle="Newest club signups"
          action={
            <Link to="/admin/members" className="text-xs text-[#B6F23A] hover:underline flex items-center">
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          }
        >
          <div className="divide-y divide-[#21302A]">
            {stats.recent_members && stats.recent_members.length > 0 ? (
              stats.recent_members.map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#202E29] text-[#B6F23A] font-bold text-xs flex items-center justify-center">
                      {m.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400">{m.joined}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">No recent members</p>
            )}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card
          title="Recent Transactions"
          subtitle="Latest billing receipts"
          action={
            <Link to="/admin/payments" className="text-xs text-[#B6F23A] hover:underline flex items-center">
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          }
        >
          <div className="divide-y divide-[#21302A]">
            {stats.recent_payments && stats.recent_payments.length > 0 ? (
              stats.recent_payments.map((p) => (
                <div key={p.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{p.member}</p>
                    <p className="text-xs text-gray-400">
                      {p.method?.toUpperCase()} • {p.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#B6F23A]">₹{p.amount.toLocaleString()}</p>
                    <Badge variant={p.status === 'paid' ? 'success' : 'warning'} size="xs">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">No recent payments</p>
            )}
          </div>
        </Card>

        {/* Expiring Memberships */}
        <Card
          title="Expiring Subscriptions"
          subtitle="Next 7 days renewals needed"
          action={
            <Link to="/admin/memberships" className="text-xs text-[#B6F23A] hover:underline flex items-center">
              Manage <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          }
        >
          <div className="divide-y divide-[#21302A]">
            {stats.expiring_memberships && stats.expiring_memberships.length > 0 ? (
              stats.expiring_memberships.map((exp) => (
                <div key={exp.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{exp.member}</p>
                    <p className="text-xs text-gray-400">{exp.plan} Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {exp.days_left === 0 ? 'Today' : `${exp.days_left}d left`}
                    </p>
                    <p className="text-[10px] text-gray-500">{exp.end_date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Badge variant="success" size="sm">All Active</Badge>
                <p className="text-xs text-gray-400 mt-2">No memberships expiring within 7 days.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
