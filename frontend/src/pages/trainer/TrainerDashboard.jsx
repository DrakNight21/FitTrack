import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Dumbbell,
  CalendarCheck,
  TrendingUp,
  UserCheck,
  Award,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { trainersService, workoutsService } from '../../services/gymServices'

export const TrainerDashboard = () => {
  const { user } = useAuth()
  const [assignedMembers, setAssignedMembers] = useState([])
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrainerData()
  }, [])

  const loadTrainerData = async () => {
    try {
      setLoading(true)
      const [membersRes, plansRes] = await Promise.allSettled([
        trainersService.getMyMembers(),
        workoutsService.getPlans(),
      ])
      const mList =
        membersRes.status === 'fulfilled'
          ? Array.isArray(membersRes.value)
            ? membersRes.value
            : membersRes.value.results || []
          : []
      const pList =
        plansRes.status === 'fulfilled'
          ? Array.isArray(plansRes.value)
            ? plansRes.value
            : plansRes.value.results || []
          : []
      setAssignedMembers(mList)
      setWorkoutPlans(pList)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading trainer portal..." />
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#17211D] via-[#1A2621] to-[#17211D] border border-[#21302A] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B6F23A] mb-1">
            <UserCheck className="w-4 h-4" /> Personal Trainer Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, Coach {user?.first_name || user?.username}!
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Specialization: {user?.trainer_profile?.specializations || 'Strength & Conditioning'} •{' '}
            {assignedMembers.length} Active Athletes Assigned
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/workouts">
            <Button variant="primary" icon={Dumbbell} size="sm">
              Design Workout Plan
            </Button>
          </Link>
          <Link to="/admin/attendance">
            <Button variant="secondary" icon={CalendarCheck} size="sm">
              Take Attendance
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Assigned Clients</span>
            <p className="text-3xl font-extrabold text-white mt-1">{assignedMembers.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Coached Programs</span>
            <p className="text-3xl font-extrabold text-[#B6F23A] mt-1">{workoutPlans.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center font-bold">
            <Dumbbell className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Experience Level</span>
            <p className="text-3xl font-extrabold text-white mt-1">
              {user?.trainer_profile?.experience_years || 3}+ Yrs
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#202E29] text-gray-300 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Assigned Members Grid */}
      <Card
        title="My Assigned Athletes"
        subtitle="Gym members receiving your direct fitness programming"
        action={
          <Link to="/admin/attendance" className="text-xs text-[#B6F23A] hover:underline">
            Check Attendance →
          </Link>
        }
      >
        {assignedMembers.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No athletes currently assigned to your roster. Gym admin can assign members to you.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedMembers.map((m) => (
              <div
                key={m.id}
                className="bg-[#111715] p-4 rounded-2xl border border-[#21302A] flex items-center justify-between hover:border-[#B6F23A]/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202E29] text-[#B6F23A] font-bold flex items-center justify-center">
                    {m.first_name ? m.first_name[0] : 'M'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{m.full_name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>

                <Link
                  to={`/admin/fitness?member_id=${m.id}`}
                  className="p-2 rounded-lg bg-[#17211D] text-gray-400 hover:text-[#B6F23A] transition-colors"
                  title={`View Fitness Progression — ${m.full_name}`}
                >
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Workout Routines Summary */}
      <Card title="Active Workout Programs" subtitle="Daily routines assigned to your athletes">
        {workoutPlans.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            No workout programs created yet. Click "Design Workout Plan" above to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {workoutPlans.map((wp) => (
              <div
                key={wp.id}
                className="bg-[#111715] p-4 rounded-xl border border-[#21302A] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{wp.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {wp.assigned_member_count || 0} Members enrolled • {wp.days?.length || 0} Workout
                    days configured
                  </p>
                </div>
                <Link to="/admin/workouts">
                  <Button variant="outline" size="sm" className="text-xs">
                    Manage Exercises
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
