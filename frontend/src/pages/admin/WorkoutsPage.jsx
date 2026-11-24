import React, { useState, useEffect } from 'react'
import {
  Dumbbell,
  Plus,
  Calendar,
  Users,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { workoutsService, membersService, trainersService } from '../../services/gymServices'
import { useAuth } from '../../context/AuthContext'

export const WorkoutsPage = () => {
  const { user, isTrainer } = useAuth()
  const [plans, setPlans] = useState([])
  const [members, setMembers] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedPlanId, setExpandedPlanId] = useState(null)
  const [toast, setToast] = useState(null)

  // Modals
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false)
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [planToDelete, setPlanToDelete] = useState(null)
  const [selectedDayId, setSelectedDayId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Forms
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    trainer: '',
  })

  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    sets: 3,
    reps: 10,
    rest_seconds: 60,
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [user?.role])

  const loadData = async (activePlanId = null) => {
    try {
      setLoading(true)
      const isCoach = user?.role === 'trainer' || isTrainer
      const [plansRes, membersRes, trainersRes] = await Promise.allSettled([
        workoutsService.getPlans(),
        isCoach ? trainersService.getMyMembers() : membersService.getMembers(),
        trainersService.getTrainers(),
      ])

      const planList =
        plansRes.status === 'fulfilled'
          ? Array.isArray(plansRes.value)
            ? plansRes.value
            : plansRes.value.results || []
          : []
      setPlans(planList)
      if (planList.length > 0 && !expandedPlanId) {
        setExpandedPlanId(planList[0].id)
      }

      const currentPlanId = activePlanId || selectedPlan?.id
      if (currentPlanId) {
        const refreshed = planList.find((p) => p.id === currentPlanId)
        if (refreshed) {
          setSelectedPlan(refreshed)
        }
      }

      setMembers(
        membersRes.status === 'fulfilled'
          ? Array.isArray(membersRes.value)
            ? membersRes.value
            : membersRes.value.results || []
          : []
      )
      setTrainers(
        trainersRes.status === 'fulfilled'
          ? Array.isArray(trainersRes.value)
            ? trainersRes.value
            : trainersRes.value.results || []
          : []
      )

      if (plansRes.status === 'rejected') {
        console.error('Failed to load plans:', plansRes.reason)
        setToast({ type: 'error', message: 'Failed to load workout plans.' })
      }
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load workout plans.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await workoutsService.createPlan({
        name: planForm.name,
        description: planForm.description,
        trainer: isTrainer ? user?.id : planForm.trainer || null,
      })

      // Add default weekday splits for the plan
      const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      for (const day of defaultDays) {
        await workoutsService.addDay(created.id, day)
      }

      setIsAddPlanModalOpen(false)
      setToast({ type: 'success', message: 'Workout plan created with weekday splits.' })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to create workout plan.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddExercise = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await workoutsService.addExercise(selectedDayId, {
        name: exerciseForm.name,
        sets: Number(exerciseForm.sets),
        reps: Number(exerciseForm.reps),
        rest_seconds: Number(exerciseForm.rest_seconds),
        notes: exerciseForm.notes,
      })
      setIsAddExerciseModalOpen(false)
      setExerciseForm({ name: '', sets: 3, reps: 10, rest_seconds: 60, notes: '' })
      setToast({ type: 'success', message: 'Exercise added to workout day.' })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to add exercise.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAssignMember = async (planId, memberId, isCurrentlyAssigned) => {
    // 1. Optimistic update: flip state immediately for instant feedback
    setSelectedPlan((prev) => {
      if (!prev || prev.id !== planId) return prev
      const prevMembers = prev.assigned_members || []
      const updatedMembers = isCurrentlyAssigned
        ? prevMembers.filter((id) => id !== memberId)
        : [...prevMembers, memberId]
      return {
        ...prev,
        assigned_members: updatedMembers,
        assigned_member_count: updatedMembers.length,
      }
    })

    setPlans((prevPlans) =>
      prevPlans.map((p) => {
        if (p.id !== planId) return p
        const prevMembers = p.assigned_members || []
        const updatedMembers = isCurrentlyAssigned
          ? prevMembers.filter((id) => id !== memberId)
          : [...prevMembers, memberId]
        return {
          ...p,
          assigned_members: updatedMembers,
          assigned_member_count: updatedMembers.length,
        }
      })
    )

    try {
      const res = await workoutsService.assignPlan(
        planId,
        memberId,
        isCurrentlyAssigned ? 'unassign' : 'assign'
      )
      setToast({
        type: 'success',
        message: isCurrentlyAssigned
          ? 'Workout plan unassigned.'
          : 'Workout plan assigned to member.',
      })
      if (res?.assigned_members) {
        setSelectedPlan((prev) =>
          prev ? { ...prev, assigned_members: res.assigned_members } : prev
        )
      }
      await loadData(planId)
    } catch (err) {
      console.error(err)
      // Rollback on error
      setSelectedPlan((prev) => {
        if (!prev || prev.id !== planId) return prev
        const prevMembers = prev.assigned_members || []
        const rolledBack = isCurrentlyAssigned
          ? [...prevMembers, memberId]
          : prevMembers.filter((id) => id !== memberId)
        return {
          ...prev,
          assigned_members: rolledBack,
          assigned_member_count: rolledBack.length,
        }
      })
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to update plan assignment.',
      })
    }
  }

  const openDeletePlanModal = (plan) => {
    setPlanToDelete(plan)
    setIsDeletePlanModalOpen(true)
  }

  const handleDeletePlan = async () => {
    if (!planToDelete) return
    setSubmitting(true)
    try {
      await workoutsService.deletePlan(planToDelete.id)
      setIsDeletePlanModalOpen(false)
      setToast({
        type: 'success',
        message: `Workout plan "${planToDelete.name}" deleted successfully.`,
      })
      setPlanToDelete(null)
      loadData()
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete workout plan.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await workoutsService.deleteExercise(exerciseId)
      setToast({ type: 'success', message: 'Exercise removed from routine.' })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to remove exercise.' })
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isTrainer ? 'My Workout Programs' : 'Workout Programs'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isTrainer
              ? 'Your assigned workout routines and personalized training programs for coaching your athletes.'
              : 'Build structured exercise routines, customize sets and reps, and assign to members.'}
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddPlanModalOpen(true)}>
          Create Workout Plan
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading workout programs..." />
      ) : plans.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">
            {isTrainer
              ? 'No workout programs assigned to you yet.'
              : 'No workout programs created yet.'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isTrainer
              ? 'Click "Create Workout Plan" above to design your first routine for your athletes.'
              : 'Design your first routine for members.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id
            return (
              <Card key={plan.id} className="p-6 transition-all duration-300">
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#21302A]">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center font-bold">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                        <p className="text-xs text-gray-400">
                          Trainer: {plan.trainer_name || 'FitTrack Coaching'} •{' '}
                          {plan.assigned_member_count || 0} Members Enrolled
                        </p>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="text-xs text-gray-400 mt-2">{plan.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan)
                        setIsAssignModalOpen(true)
                      }}
                    >
                      <Users className="w-3.5 h-3.5 mr-1" />
                      Assign ({plan.assigned_member_count || 0})
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeletePlanModal(plan)}
                      title="Delete Workout Program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>

                    <button
                      onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                      className="p-2 rounded-lg bg-[#202E29] text-gray-300 hover:text-white transition-colors"
                      title={isExpanded ? "Collapse Routine" : "Expand Routine"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Day-by-Day Exercises Routine (Expanded) */}
                {isExpanded && (
                  <div className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plan.days?.map((day) => (
                        <div
                          key={day.id}
                          className="bg-[#111715] border border-[#21302A] rounded-2xl p-4 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between pb-3 border-b border-[#21302A]">
                              <span className="font-bold text-sm text-[#B6F23A] uppercase tracking-wider">
                                {day.day}
                              </span>
                              <Badge variant="default" size="xs">
                                {day.exercises?.length || 0} Exercises
                              </Badge>
                            </div>

                            {/* Exercises List */}
                            <div className="mt-3 space-y-2.5">
                              {day.exercises?.length > 0 ? (
                                day.exercises.map((ex) => (
                                  <div
                                    key={ex.id}
                                    className="p-2.5 rounded-xl bg-[#17211D] border border-[#2A3E36] flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <p className="font-semibold text-white">{ex.name}</p>
                                      <p className="text-[11px] text-gray-400">
                                        {ex.sets} sets × {ex.reps} reps • Rest: {ex.rest_seconds}s
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteExercise(ex.id)}
                                      title="Remove Exercise"
                                      className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-gray-500 py-3 text-center">Rest day / No exercises</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#21302A]">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => {
                                setSelectedDayId(day.id)
                                setIsAddExerciseModalOpen(true)
                              }}
                            >
                              + Add Exercise
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal isOpen={isAddPlanModalOpen} onClose={() => setIsAddPlanModalOpen(false)} title="Create Workout Program">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Plan Title *</label>
            <input
              type="text"
              required
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="e.g. 5-Day Hypertrophy Split"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Supervising Trainer</label>
            {isTrainer ? (
              <div className="w-full px-3.5 py-2.5 bg-[#17211D] border border-[#2A3E36] rounded-xl text-sm text-[#B6F23A] font-semibold flex items-center justify-between">
                <span>{user?.full_name || user?.username}</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">(Assigned to You)</span>
              </div>
            ) : (
              <select
                value={planForm.trainer}
                onChange={(e) => setPlanForm({ ...planForm, trainer: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                <option value="">-- Optional: Assign Trainer --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Description / Target Goal</label>
            <textarea
              rows={3}
              value={planForm.description}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              placeholder="Targeted muscle building program designed for intermediate lifters."
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Program
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal isOpen={isAddExerciseModalOpen} onClose={() => setIsAddExerciseModalOpen(false)} title="Add Exercise">
        <form onSubmit={handleAddExercise} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Exercise Name *</label>
            <input
              type="text"
              required
              value={exerciseForm.name}
              onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
              placeholder="e.g. Barbell Incline Bench Press"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Sets</label>
              <input
                type="number"
                min="1"
                required
                value={exerciseForm.sets}
                onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Reps</label>
              <input
                type="number"
                min="1"
                required
                value={exerciseForm.reps}
                onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Rest (sec)</label>
              <input
                type="number"
                step="10"
                min="0"
                value={exerciseForm.rest_seconds}
                onChange={(e) => setExerciseForm({ ...exerciseForm, rest_seconds: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Notes / Cue</label>
            <input
              type="text"
              value={exerciseForm.notes}
              onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
              placeholder="Keep elbows at 45 degree angle"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddExerciseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Add to Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Members to Plan Modal */}
      {selectedPlan && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Plan: ${selectedPlan.name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              {isTrainer
                ? 'Select which of your assigned athletes should follow this workout routine.'
                : 'Select which gym members should follow this workout routine.'}
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#21302A] border border-[#21302A] rounded-xl">
              {members.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  {isTrainer
                    ? 'You do not have any assigned athletes yet. An admin must assign members to your coaching roster first.'
                    : 'No members registered in the system.'}
                </div>
              ) : (
                members.map((member) => {
                  const isAssigned = selectedPlan.assigned_members?.includes(member.id)
                  return (
                    <div
                      key={member.id}
                      className="p-3 flex items-center justify-between hover:bg-[#111715] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{member.full_name}</p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>

                      <button
                        onClick={() => handleToggleAssignMember(selectedPlan.id, member.id, isAssigned)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isAssigned
                            ? 'bg-[#B6F23A] text-black'
                            : 'bg-[#202E29] text-gray-400 hover:text-white'
                        }`}
                      >
                        {isAssigned ? 'Assigned ✓' : '+ Assign'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Workout Plan Modal */}
      {planToDelete && (
        <Modal
          isOpen={isDeletePlanModalOpen}
          onClose={() => {
            setIsDeletePlanModalOpen(false)
            setPlanToDelete(null)
          }}
          title="Delete Workout Program"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                This will permanently delete this workout plan and all its configured daily routines and exercises.
              </span>
            </div>
            <p className="text-sm text-gray-300">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">{planToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21302A]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDeletePlanModalOpen(false)
                  setPlanToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={submitting}
                onClick={handleDeletePlan}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
