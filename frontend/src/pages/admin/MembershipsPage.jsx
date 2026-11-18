import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Sparkles,
  Users,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { membershipsService, membersService } from '../../services/gymServices'

export const MembershipsPage = () => {
  const [activeTab, setActiveTab] = useState('subscriptions') // 'subscriptions' or 'plans'
  const [plans, setPlans] = useState([])
  const [memberships, setMemberships] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Modals
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Add Plan form
  const [planForm, setPlanForm] = useState({
    name: '',
    duration_months: 1,
    price: '',
    features: '',
  })

  // Assign Subscription form
  const [assignForm, setAssignForm] = useState({
    member: '',
    plan: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  })

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [plansData, membershipsData, membersData] = await Promise.all([
        membershipsService.getPlans(),
        membershipsService.getMemberships(),
        membersService.getMembers(),
      ])
      setPlans(Array.isArray(plansData) ? plansData : plansData.results || [])
      setMemberships(Array.isArray(membershipsData) ? membershipsData : membershipsData.results || [])
      setMembers(Array.isArray(membersData) ? membersData : membersData.results || [])
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load membership records.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await membershipsService.createPlan({
        ...planForm,
        duration_months: Number(planForm.duration_months),
        price: Number(planForm.price),
      })
      setIsAddPlanModalOpen(false)
      setToast({ type: 'success', message: 'Membership plan created.' })
      loadAllData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to create plan.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignPlan = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Calculate end date based on plan duration if not manually provided
      let endDate = assignForm.end_date
      if (!endDate && assignForm.plan) {
        const selectedPlan = plans.find((p) => p.id === Number(assignForm.plan))
        if (selectedPlan) {
          const d = new Date(assignForm.start_date)
          d.setMonth(d.getMonth() + selectedPlan.duration_months)
          endDate = d.toISOString().split('T')[0]
        }
      }

      await membershipsService.createMembership({
        member: assignForm.member,
        plan: assignForm.plan,
        start_date: assignForm.start_date,
        end_date: endDate,
        status: 'active',
        notes: assignForm.notes,
      })

      setIsAssignModalOpen(false)
      setToast({ type: 'success', message: 'Membership assigned successfully.' })
      loadAllData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to assign membership.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRenew = async (id, memberName) => {
    try {
      await membershipsService.renewMembership(id)
      setToast({ type: 'success', message: `Membership renewed for ${memberName}.` })
      loadAllData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to renew membership.' })
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
            Memberships & Subscriptions
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage pricing tiers, assign client packages, and process renewals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Plus} onClick={() => setIsAddPlanModalOpen(true)}>
            New Plan Tier
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAssignModalOpen(true)}>
            Assign Membership
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#21302A] pb-3">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-[#B6F23A] text-black shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#17211D]'
          }`}
        >
          Active Subscriptions ({memberships.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'plans'
              ? 'bg-[#B6F23A] text-black shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-[#17211D]'
          }`}
        >
          Pricing Plans ({plans.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading membership records..." />
      ) : activeTab === 'subscriptions' ? (
        /* Subscriptions Table */
        <Card className="p-0 overflow-hidden">
          {memberships.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CreditCard className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">No member subscriptions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#111715] border-b border-[#21302A] text-xs uppercase font-bold text-gray-400 tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Member</th>
                    <th className="py-4 px-6">Plan Tier</th>
                    <th className="py-4 px-6">Duration</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Valid Until</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21302A]">
                  {memberships.map((sub) => {
                    const isExp = sub.status === 'expired' || sub.is_expired
                    return (
                      <tr key={sub.id} className="hover:bg-[#1A2621]/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          {sub.member_detail?.full_name || `Member #${sub.member}`}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-[#B6F23A]">
                            {sub.plan_detail?.name || 'Custom Plan'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-300">
                          {sub.plan_detail?.duration_label || 'Standard'}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={isExp ? 'danger' : 'success'}>
                            {isExp ? 'Expired' : 'Active'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-300">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span>{sub.end_date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleRenew(sub.id, sub.member_detail?.full_name)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Renew
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        /* Plans Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} hover className="flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <Badge variant="success" size="xs">
                    {plan.duration_label}
                  </Badge>
                </div>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">₹{plan.price}</span>
                  <span className="text-xs text-gray-400 ml-1.5">/ {plan.duration_months} mo</span>
                </div>

                <div className="space-y-2 border-t border-[#21302A] pt-4">
                  {plan.features?.split('\n').map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#B6F23A] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#21302A]">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setAssignForm({ ...assignForm, plan: plan.id })
                    setIsAssignModalOpen(true)
                  }}
                >
                  Assign to Member
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Plan Modal */}
      <Modal isOpen={isAddPlanModalOpen} onClose={() => setIsAddPlanModalOpen(false)} title="Create Pricing Plan">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="e.g. VIP Gold Elite"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Duration (Months) *</label>
              <select
                value={planForm.duration_months}
                onChange={(e) => setPlanForm({ ...planForm, duration_months: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                <option value="1">1 Month (Monthly)</option>
                <option value="3">3 Months (Quarterly)</option>
                <option value="6">6 Months (Half-Yearly)</option>
                <option value="12">12 Months (Yearly)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                placeholder="2999"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Included Features (One per line)</label>
            <textarea
              rows={4}
              value={planForm.features}
              onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
              placeholder="Full Gym Floor Access&#10;Locker & Sauna&#10;Free Protein Shake / week&#10;2 PT Sessions"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddPlanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Membership Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Membership Subscription">
        <form onSubmit={handleAssignPlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Select Member *</label>
            <select
              required
              value={assignForm.member}
              onChange={(e) => setAssignForm({ ...assignForm, member: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Membership Plan *</label>
            <select
              required
              value={assignForm.plan}
              onChange={(e) => setAssignForm({ ...assignForm, plan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            >
              <option value="">-- Choose Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.price} ({p.duration_months} mo)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={assignForm.start_date}
                onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Expiry Date (Optional override)</label>
              <input
                type="date"
                value={assignForm.end_date}
                onChange={(e) => setAssignForm({ ...assignForm, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Activate Subscription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
