import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Plus,
  Edit2,
  Users,
  Award,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  X,
  AlertCircle,
  Trash2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { trainersService, membersService } from '../../services/gymServices'

export const TrainersPage = () => {
  const [trainers, setTrainers] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [trainerToDelete, setTrainerToDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Add Trainer form
  const [trainerForm, setTrainerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: 'trainer123',
    specializations: '',
    experience_years: 2,
    bio: '',
  })

  // Edit Trainer Profile form
  const [profileForm, setProfileForm] = useState({
    specializations: '',
    experience_years: 0,
    bio: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (activeTrainerId = null) => {
    try {
      setLoading(true)
      const [trainersData, membersData] = await Promise.all([
        trainersService.getTrainers(),
        membersService.getMembers(),
      ])
      const tList = Array.isArray(trainersData) ? trainersData : trainersData.results || []
      const mList = Array.isArray(membersData) ? membersData : membersData.results || []
      setTrainers(tList)
      setMembers(mList)

      const targetId = activeTrainerId || selectedTrainer?.id
      if (targetId) {
        const refreshed = tList.find((t) => t.id === targetId)
        if (refreshed) {
          setSelectedTrainer(refreshed)
        }
      }
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load trainer records.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTrainer = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newTrainer = await trainersService.createTrainer({
        first_name: trainerForm.first_name,
        last_name: trainerForm.last_name,
        email: trainerForm.email,
        phone: trainerForm.phone,
        password: trainerForm.password,
      })

      // Update their profile details
      if (newTrainer.id) {
        await trainersService.updateProfile(newTrainer.id, {
          specializations: trainerForm.specializations,
          experience_years: Number(trainerForm.experience_years),
          bio: trainerForm.bio,
        })
      }

      setIsAddModalOpen(false)
      setToast({ type: 'success', message: 'Trainer added successfully.' })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to create trainer.' })
    } finally {
      setSubmitting(false)
    }
  }

  const openAssignModal = (trainer) => {
    setSelectedTrainer(trainer)
    setIsAssignModalOpen(true)
  }

  const openEditProfileModal = (trainer) => {
    setSelectedTrainer(trainer)
    setProfileForm({
      specializations: trainer.trainer_profile?.specializations || '',
      experience_years: trainer.trainer_profile?.experience_years || 0,
      bio: trainer.trainer_profile?.bio || '',
    })
    setIsEditProfileModalOpen(true)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await trainersService.updateProfile(selectedTrainer.id, profileForm)
      setIsEditProfileModalOpen(false)
      setToast({ type: 'success', message: 'Trainer qualifications updated.' })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to update qualifications.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAssignMember = async (memberId, isCurrentlyAssigned) => {
    try {
      await trainersService.assignMember(
        selectedTrainer.id,
        memberId,
        isCurrentlyAssigned ? 'unassign' : 'assign'
      )
      setToast({
        type: 'success',
        message: isCurrentlyAssigned ? 'Member unassigned.' : 'Member assigned to trainer.',
      })
      await loadData(selectedTrainer.id)
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to update member assignment.' })
    }
  }

  const openDeleteModal = (trainer) => {
    setTrainerToDelete(trainer)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteTrainer = async () => {
    if (!trainerToDelete) return
    setSubmitting(true)
    try {
      await trainersService.deleteTrainer(trainerToDelete.id)
      setIsDeleteModalOpen(false)
      setToast({
        type: 'success',
        message: `Trainer ${trainerToDelete.full_name || trainerToDelete.username} deleted successfully.`,
      })
      setTrainerToDelete(null)
      loadData()
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete trainer.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActiveTrainer = async (trainer) => {
    const newStatus = !trainer.is_active
    const actionText = newStatus ? 'activated' : 'deactivated'
    try {
      await trainersService.updateTrainer(trainer.id, { is_active: newStatus })
      setToast({
        type: 'success',
        message: `Trainer ${trainer.full_name || trainer.username} has been ${actionText}.`,
      })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: `Failed to ${newStatus ? 'activate' : 'deactivate'} trainer.`,
      })
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Trainer Staff</h2>
          <p className="text-xs text-gray-400 mt-1">
            Certified fitness instructors, member assignments, and specialized coaching domains.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add New Trainer
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading trainer roster..." />
      ) : trainers.length === 0 ? (
        <Card className="p-12 text-center text-gray-400">
          <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-base font-bold text-white">No trainers registered yet.</p>
          <p className="text-xs text-gray-500 mt-1">Add fitness coaches to begin assigning workout plans.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Card key={trainer.id} hover className="flex flex-col justify-between">
              <div>
                {/* Header Profile Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#202E29] border border-[#B6F23A]/40 text-[#B6F23A] font-black text-lg flex items-center justify-center">
                      {trainer.first_name ? trainer.first_name[0].toUpperCase() : 'T'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{trainer.full_name}</h3>
                      <p className="text-xs text-gray-400">@{trainer.username}</p>
                    </div>
                  </div>
                  <Badge variant={trainer.is_active ? 'success' : 'danger'} size="xs">
                    {trainer.is_active ? 'Active Coach' : 'Deactivated'}
                  </Badge>
                </div>

                {/* Specializations & Bio */}
                <div className="mt-5 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      Specializations
                    </span>
                    <p className="text-xs font-semibold text-[#B6F23A] mt-0.5">
                      {trainer.trainer_profile?.specializations || 'General Fitness, Strength & Conditioning'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{trainer.trainer_profile?.experience_years || 2}+ Years Exp.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        {trainer.trainer_profile?.assigned_members?.length ??
                          members.filter((m) => m.assigned_trainer?.id === trainer.id).length}{' '}
                        Assigned Members
                      </span>
                    </div>
                  </div>

                  {trainer.trainer_profile?.bio && (
                    <p className="text-xs text-gray-400 italic line-clamp-2">
                      "{trainer.trainer_profile.bio}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#21302A] flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => openAssignModal(trainer)}
                >
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Assign Members
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditProfileModal(trainer)}
                  title="Edit Qualifications"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    trainer.is_active
                      ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                      : 'text-[#B6F23A] border-[#B6F23A]/40 hover:bg-[#B6F23A]/10'
                  }
                  onClick={() => handleToggleActiveTrainer(trainer)}
                  title={trainer.is_active ? 'Deactivate Trainer' : 'Activate Trainer'}
                >
                  {trainer.is_active ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => openDeleteModal(trainer)}
                  title="Delete Trainer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Trainer Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Trainer">
        <form onSubmit={handleCreateTrainer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={trainerForm.first_name}
                onChange={(e) => setTrainerForm({ ...trainerForm, first_name: e.target.value })}
                placeholder="Marcus"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={trainerForm.last_name}
                onChange={(e) => setTrainerForm({ ...trainerForm, last_name: e.target.value })}
                placeholder="Vance"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={trainerForm.email}
              onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
              placeholder="marcus@fittrack.com"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={trainerForm.phone}
                onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={trainerForm.experience_years}
                onChange={(e) => setTrainerForm({ ...trainerForm, experience_years: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Specializations</label>
            <input
              type="text"
              value={trainerForm.specializations}
              onChange={(e) => setTrainerForm({ ...trainerForm, specializations: e.target.value })}
              placeholder="Crossfit, HIIT, Bodybuilding, Mobility"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Bio / Certification Summary</label>
            <textarea
              rows={2}
              value={trainerForm.bio}
              onChange={(e) => setTrainerForm({ ...trainerForm, bio: e.target.value })}
              placeholder="Certified NASM Personal Trainer specializing in strength and hypertrophy."
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Add Trainer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Members Modal */}
      {selectedTrainer && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Clients to ${selectedTrainer.full_name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              Toggle member assignments. Assigned members receive workout plans and tracking from this trainer.
            </p>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#21302A] border border-[#21302A] rounded-xl">
              {members.map((member) => {
                const isAssigned =
                  selectedTrainer.trainer_profile?.assigned_members?.includes(member.id) ||
                  member.assigned_trainer?.id === selectedTrainer.id
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
                      onClick={() => handleToggleAssignMember(member.id, isAssigned)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        isAssigned
                          ? 'bg-[#B6F23A] text-black shadow-sm'
                          : 'bg-[#202E29] text-gray-400 hover:text-white'
                      }`}
                    >
                      {isAssigned ? 'Assigned ✓' : '+ Assign'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Trainer Profile Modal */}
      {selectedTrainer && (
        <Modal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          title={`Edit Qualifications: ${selectedTrainer.full_name}`}
        >
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Specializations</label>
              <input
                type="text"
                value={profileForm.specializations}
                onChange={(e) => setProfileForm({ ...profileForm, specializations: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={profileForm.experience_years}
                onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Trainer Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
              <Button type="button" variant="ghost" onClick={() => setIsEditProfileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Save Qualifications
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Trainer Confirmation Modal */}
      {trainerToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setTrainerToDelete(null)
          }}
          title="Delete Trainer"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                This will permanently delete this trainer account and remove their member coaching assignments.
              </span>
            </div>
            <p className="text-sm text-gray-300">
              Are you sure you want to permanently delete trainer{' '}
              <strong className="text-white">
                {trainerToDelete.full_name || trainerToDelete.username}
              </strong>
              ? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21302A]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setTrainerToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={submitting}
                onClick={handleDeleteTrainer}
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
