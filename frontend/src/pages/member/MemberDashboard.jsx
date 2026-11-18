import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  UserCheck,
  CalendarCheck,
  Dumbbell,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  DollarSign,
  Printer,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import {
  membershipsService,
  attendanceService,
  workoutsService,
  paymentsService,
  fitnessService,
} from '../../services/gymServices'

export const MemberDashboard = () => {
  const { user } = useAuth()
  const [membership, setMembership] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [payments, setPayments] = useState([])
  const [fitnessRecords, setFitnessRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemberData()
  }, [])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      const [subsData, attData, plansData, payData, fitData] = await Promise.all([
        membershipsService.getMemberships(),
        attendanceService.getAttendance(),
        workoutsService.getPlans(),
        paymentsService.getPayments(),
        fitnessService.getRecords(),
      ])

      const subs = Array.isArray(subsData) ? subsData : subsData.results || []
      setMembership(subs[0] || null)

      const att = Array.isArray(attData) ? attData : attData.results || []
      setAttendance(att)

      const plans = Array.isArray(plansData) ? plansData : plansData.results || []
      setWorkoutPlans(plans)

      const pays = Array.isArray(payData) ? payData : payData.results || []
      setPayments(pays)

      const fit = Array.isArray(fitData) ? fitData : fitData.results || []
      setFitnessRecords(fit)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading your personal fitness hub..." />
  }

  const latestFitness = fitnessRecords[0] || null
  const chartData = [...fitnessRecords].reverse().map((r) => ({
    date: r.date,
    weight: Number(r.weight_kg),
  }))

  const isExpired = membership ? membership.status === 'expired' || membership.is_expired : true

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#17211D] via-[#1A2621] to-[#17211D] border border-[#21302A] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B6F23A] mb-1">
            <Sparkles className="w-4 h-4" /> Member Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.first_name || user?.username}!
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track your gym attendance, workout schedule, subscription, and physique progress.
          </p>
        </div>

        {membership && (
          <div className="bg-[#111715] p-3.5 px-5 rounded-2xl border border-[#21302A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {membership.plan_detail?.name || 'Active Membership'}
              </p>
              <p className="text-[11px] text-gray-400">
                Expires on <span className="text-[#B6F23A] font-bold">{membership.end_date}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4 Overview Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Membership Status */}
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-gray-400">Membership Tier</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {membership?.plan_detail?.name || 'No Active Plan'}
          </p>
          <div className="mt-2">
            <Badge variant={isExpired ? 'danger' : 'success'}>
              {isExpired ? 'Expired / Inactive' : 'Active Pass'}
            </Badge>
          </div>
        </Card>

        {/* Card 2: Assigned Trainer */}
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-gray-400">Assigned Coach</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {user?.assigned_trainer?.name || 'General Training'}
          </p>
          <p className="text-xs text-[#B6F23A] mt-1">
            {user?.assigned_trainer?.specializations || 'Club Staff Assistance'}
          </p>
        </Card>

        {/* Card 3: Total Workouts Logged */}
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-gray-400">Gym Check-Ins</span>
          <p className="text-2xl font-extrabold text-white mt-1">{attendance.length} Sessions</p>
          <p className="text-xs text-gray-400 mt-1">Total physical gym visits</p>
        </Card>

        {/* Card 4: Current Weight */}
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-gray-400">Current Weight</span>
          <p className="text-2xl font-extrabold text-[#B6F23A] mt-1">
            {latestFitness?.weight_kg ? `${latestFitness.weight_kg} kg` : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Body Fat: {latestFitness?.body_fat_percentage ? `${latestFitness.body_fat_percentage}%` : 'Not tested'}
          </p>
        </Card>
      </div>

      {/* Assigned Workout Schedule */}
      <Card title="My Assigned Workout Schedule" subtitle="Weekly routine programmed by your fitness coach">
        {workoutPlans.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No customized workout plan currently assigned. Your trainer will publish your routine soon.
          </div>
        ) : (
          <div className="space-y-6">
            {workoutPlans.map((plan) => (
              <div key={plan.id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#21302A]">
                  <div>
                    <h4 className="font-extrabold text-white text-base">{plan.name}</h4>
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                  <Badge variant="success">Program Active</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.days?.map((day) => (
                    <div
                      key={day.id}
                      className="bg-[#111715] p-4 rounded-2xl border border-[#21302A]"
                    >
                      <span className="font-extrabold text-sm text-[#B6F23A] uppercase tracking-wider block mb-3">
                        {day.day}
                      </span>
                      <div className="space-y-2">
                        {day.exercises?.length > 0 ? (
                          day.exercises.map((ex) => (
                            <div
                              key={ex.id}
                              className="p-2.5 rounded-xl bg-[#17211D] border border-[#2A3E36] text-xs flex justify-between items-center"
                            >
                              <span className="font-semibold text-white">{ex.name}</span>
                              <span className="text-gray-400 font-mono">
                                {ex.sets} × {ex.reps}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic">Active Recovery / Rest Day</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weight Progress & Recent Attendance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitness Progress Chart */}
        <Card title="My Weight Progress" subtitle="Your weight change history over time">
          {chartData.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21302A" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={11}
                    tickLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(val) => `${val}kg`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17211D',
                      border: '1px solid #21302A',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(val) => [`${val} kg`, 'Weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#B6F23A"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#B6F23A', stroke: '#111715', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 text-sm">
              No weight measurements recorded yet. Ask a trainer to record your stats.
            </div>
          )}
        </Card>

        {/* Recent Attendance */}
        <Card title="Recent Check-ins" subtitle="Your past physical gym check-ins">
          {attendance.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No attendance logs found for your account.
            </div>
          ) : (
            <div className="divide-y divide-[#21302A]">
              {attendance.slice(0, 6).map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#202E29] text-[#B6F23A]">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{att.date}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(att.check_in_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" size="xs">
                    Verified
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Payment History */}
      <Card title="Billing History & Receipts" subtitle="Your personal payment records">
        {payments.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No payment transactions recorded for your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111715] border-b border-[#21302A] text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21302A]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 text-xs font-mono text-gray-300">
                      {p.transaction_id || `TXN-${p.id}`}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">{p.payment_date}</td>
                    <td className="py-3 px-4 text-xs uppercase font-bold text-gray-300">
                      {p.payment_method}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#B6F23A]">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
