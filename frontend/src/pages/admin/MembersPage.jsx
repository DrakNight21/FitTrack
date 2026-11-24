import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  UserCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { membersService, trainersService } from '../../services/gymServices'

export const MembersPage = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('all')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberToDelete, setMemberToDelete] = useState(null)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact: '',
    is_active: true,
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const data = await membersService.getMembers()
      setMembers(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load member records.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.first_name} ${m.last_name}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone && m.phone.includes(search))

    if (filterActive === 'active') return matchesSearch && m.is_active
    if (filterActive === 'inactive') return matchesSearch && !m.is_active
    return matchesSearch
  })

  const openAddModal = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      address: '',
      emergency_contact: '',
      is_active: true,
    })
    setIsAddModalOpen(true)
  }

  const openEditModal = (member) => {
    setSelectedMember(member)
    setFormData({
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      email: member.email || '',
      phone: member.phone || '',
      date_of_birth: member.date_of_birth || '',
      address: member.address || '',
      emergency_contact: member.emergency_contact || '',
      is_active: member.is_active,
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (member) => {
    setSelectedMember(member)
    setIsViewModalOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        date_of_birth: formData.date_of_birth || null,
      }
      await membersService.createMember(payload)
      setIsAddModalOpen(false)
      setToast({ type: 'success', message: 'Member enrolled successfully.' })
      fetchMembers()
    } catch (err) {
      console.error(err)
      const errorData = err.response?.data
      let errorMsg = 'Failed to create member.'
      if (typeof errorData === 'object' && errorData !== null) {
        const firstKey = Object.keys(errorData)[0]
        if (firstKey) {
          const val = errorData[firstKey]
          errorMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`
        }
      }
      setToast({ type: 'error', message: errorMsg })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        is_active: formData.is_active,
        date_of_birth: formData.date_of_birth || null,
      }
      await membersService.updateMember(selectedMember.id, payload)
      setIsEditModalOpen(false)
      setToast({ type: 'success', message: 'Member record updated successfully.' })
      fetchMembers()
    } catch (err) {
      console.error(err)
      const errorData = err.response?.data
      let errorMsg = 'Failed to update member.'
      if (typeof errorData === 'object' && errorData !== null) {
        const firstKey = Object.keys(errorData)[0]
        if (firstKey) {
          const val = errorData[firstKey]
          errorMsg = Array.isArray(val) ? `${firstKey}: ${val[0]}` : `${firstKey}: ${val}`
        }
      }
      setToast({ type: 'error', message: errorMsg })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (member) => {
    const newStatus = !member.is_active
    const actionText = newStatus ? 'activated' : 'deactivated'
    try {
      await membersService.updateMember(member.id, { is_active: newStatus })
      setToast({
        type: 'success',
        message: `Member ${member.full_name || member.username} has been ${actionText}.`,
      })
      fetchMembers()
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: `Failed to ${newStatus ? 'activate' : 'deactivate'} member.`,
      })
    }
  }

  const openDeleteModal = (member) => {
    setMemberToDelete(member)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteMember = async () => {
    if (!memberToDelete) return
    setSubmitting(true)
    try {
      await membersService.deleteMember(memberToDelete.id)
      setIsDeleteModalOpen(false)
      setToast({
        type: 'success',
        message: `Member ${memberToDelete.full_name || memberToDelete.username} deleted successfully.`,
      })
      setMemberToDelete(null)
      fetchMembers()
    } catch (err) {
      console.error(err)
      setToast({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete member.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Member Management
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Enrolled gym members directory, personal records and assigned trainers.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add New Member
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-[#111715] border border-[#21302A] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-gray-400 font-semibold uppercase">Status:</span>
            <button
              onClick={() => setFilterActive('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterActive === 'all'
                  ? 'bg-[#B6F23A] text-black'
                  : 'bg-[#111715] text-gray-400 hover:text-white'
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterActive === 'active'
                  ? 'bg-[#B6F23A] text-black'
                  : 'bg-[#111715] text-gray-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterActive === 'inactive'
                  ? 'bg-[#B6F23A] text-black'
                  : 'bg-[#111715] text-gray-400 hover:text-white'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading member directory..." />
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No members match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111715] border-b border-[#21302A] text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Member Name</th>
                  <th className="py-4 px-6">Contact Details</th>
                  <th className="py-4 px-6">Assigned Trainer</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6">Enrollment Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21302A]">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#1A2621]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#202E29] border border-[#B6F23A]/30 text-[#B6F23A] font-bold text-xs flex items-center justify-center shrink-0">
                          {member.first_name ? member.first_name[0].toUpperCase() : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {member.full_name || `${member.first_name} ${member.last_name}`}
                          </p>
                          <p className="text-xs text-gray-400">@{member.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 text-xs text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-500" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {member.assigned_trainer ? (
                        <div className="flex items-center gap-1.5 text-xs text-[#B6F23A] font-medium">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{member.assigned_trainer.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleActive(member)}
                        title={member.is_active ? 'Click to deactivate' : 'Click to activate'}
                        className="cursor-pointer transition-transform active:scale-95 text-left focus:outline-none"
                      >
                        <Badge variant={member.is_active ? 'success' : 'danger'}>
                          {member.is_active ? 'Active' : 'Deactivated'}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(member)}
                          title={member.is_active ? 'Deactivate Member' : 'Activate Member'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            member.is_active
                              ? 'bg-[#202E29] text-amber-400 hover:bg-amber-500/20'
                              : 'bg-[#202E29] text-[#B6F23A] hover:bg-[#B6F23A]/20'
                          }`}
                        >
                          {member.is_active ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openViewModal(member)}
                          title="View Profile"
                          className="p-1.5 rounded-lg bg-[#202E29] text-gray-300 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg bg-[#202E29] text-[#B6F23A] hover:bg-[#B6F23A]/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(member)}
                          title="Delete Member"
                          className="p-1.5 rounded-lg bg-[#202E29] text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Enroll New Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Rahul"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Sharma"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rahul@example.com"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              placeholder="Spouse / Parent (9876543210)"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Residential Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Apartment, Street, City"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Enroll Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Member Record">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Status</label>
              <select
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                <option value="true">Active</option>
                <option value="false">Deactivated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Address</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Profile Modal */}
      {selectedMember && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Member Profile"
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#111715] border border-[#21302A]">
              <div className="w-16 h-16 rounded-2xl bg-[#202E29] border border-[#B6F23A]/40 text-[#B6F23A] font-black text-2xl flex items-center justify-center">
                {selectedMember.first_name ? selectedMember.first_name[0].toUpperCase() : 'M'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedMember.full_name}</h3>
                <p className="text-xs text-gray-400">{selectedMember.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant={selectedMember.is_active ? 'success' : 'danger'}>
                    {selectedMember.is_active ? 'Active' : 'Deactivated'}
                  </Badge>
                  <Badge variant="default">Gym Member</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#111715] rounded-xl border border-[#21302A]">
                <span className="text-gray-500 uppercase font-semibold">Phone</span>
                <p className="font-bold text-white mt-1">{selectedMember.phone || 'Not recorded'}</p>
              </div>
              <div className="p-3 bg-[#111715] rounded-xl border border-[#21302A]">
                <span className="text-gray-500 uppercase font-semibold">Date of Birth</span>
                <p className="font-bold text-white mt-1">{selectedMember.date_of_birth || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-[#111715] rounded-xl border border-[#21302A]">
                <span className="text-gray-500 uppercase font-semibold">Assigned Trainer</span>
                <p className="font-bold text-[#B6F23A] mt-1">
                  {selectedMember.assigned_trainer?.name || 'None Assigned'}
                </p>
              </div>
              <div className="p-3 bg-[#111715] rounded-xl border border-[#21302A]">
                <span className="text-gray-500 uppercase font-semibold">Joined</span>
                <p className="font-bold text-white mt-1">
                  {new Date(selectedMember.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#111715] rounded-xl border border-[#21302A] text-xs">
              <span className="text-gray-500 uppercase font-semibold">Emergency Contact</span>
              <p className="font-bold text-white mt-1">{selectedMember.emergency_contact || 'None'}</p>
            </div>

            <div className="p-3 bg-[#111715] rounded-xl border border-[#21302A] text-xs">
              <span className="text-gray-500 uppercase font-semibold">Residential Address</span>
              <p className="font-bold text-white mt-1">{selectedMember.address || 'None'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setMemberToDelete(null)
          }}
          title="Delete Member"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                This will permanently remove this member along with their memberships, attendance, and fitness history.
              </span>
            </div>
            <p className="text-sm text-gray-300">
              Are you sure you want to permanently delete member{' '}
              <strong className="text-white">
                {memberToDelete.full_name || memberToDelete.username}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#21302A]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setMemberToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={submitting}
                onClick={handleDeleteMember}
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
