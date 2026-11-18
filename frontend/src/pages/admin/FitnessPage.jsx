import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Plus,
  Calendar,
  Scale,
  Activity,
  ArrowRight,
  TrendingDown,
  User,
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
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { fitnessService, membersService } from '../../services/gymServices'

export const FitnessPage = () => {
  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [metricForm, setMetricForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    height_cm: '',
    body_fat_percentage: '',
    chest_cm: '',
    waist_cm: '',
    hips_cm: '',
    bicep_cm: '',
    notes: '',
  })

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    if (selectedMemberId) {
      loadRecords(selectedMemberId)
    }
  }, [selectedMemberId])

  const loadMembers = async () => {
    try {
      const data = await membersService.getMembers()
      const memberList = Array.isArray(data) ? data : data.results || []
      setMembers(memberList)
      if (memberList.length > 0) {
        setSelectedMemberId(memberList[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecords = async (memberId) => {
    try {
      setLoading(true)
      const data = await fitnessService.getRecords({ member_id: memberId })
      setRecords(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to fetch fitness records.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRecordProgress = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fitnessService.recordProgress({
        member: selectedMemberId,
        date: metricForm.date,
        weight_kg: metricForm.weight_kg ? Number(metricForm.weight_kg) : null,
        height_cm: metricForm.height_cm ? Number(metricForm.height_cm) : null,
        body_fat_percentage: metricForm.body_fat_percentage
          ? Number(metricForm.body_fat_percentage)
          : null,
        chest_cm: metricForm.chest_cm ? Number(metricForm.chest_cm) : null,
        waist_cm: metricForm.waist_cm ? Number(metricForm.waist_cm) : null,
        hips_cm: metricForm.hips_cm ? Number(metricForm.hips_cm) : null,
        bicep_cm: metricForm.bicep_cm ? Number(metricForm.bicep_cm) : null,
        notes: metricForm.notes,
      })
      setIsAddModalOpen(false)
      setToast({ type: 'success', message: 'Body measurement recorded.' })
      loadRecords(selectedMemberId)
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to log measurement.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate comparison between latest 2 records
  const latestRecord = records[0] || null
  const previousRecord = records[1] || null

  const chartData = [...records].reverse().map((r) => ({
    date: r.date,
    weight: Number(r.weight_kg),
    bodyFat: Number(r.body_fat_percentage),
  }))

  const selectedMember = members.find((m) => m.id === Number(selectedMemberId))

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Fitness Progression</h2>
          <p className="text-xs text-gray-400 mt-1">
            Body composition logs, weight progression curves, and anthropometric tracking.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Log New Measurement
        </Button>
      </div>

      {/* Member Selector Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <User className="w-5 h-5 text-[#B6F23A] shrink-0" />
            <div className="w-full sm:w-80">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                Active Member Profile
              </span>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-[#111715] border border-[#21302A] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {latestRecord && (
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <div>
                <span>Latest Weight:</span>
                <span className="font-extrabold text-white text-base ml-2">
                  {latestRecord.weight_kg} kg
                </span>
              </div>
              <div>
                <span>Body Fat:</span>
                <span className="font-extrabold text-[#B6F23A] text-base ml-2">
                  {latestRecord.body_fat_percentage || '—'}%
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Weight Progression Chart */}
      <Card
        title={`Weight Progression History: ${selectedMember?.full_name || 'Member'}`}
        subtitle="Historical trend line from database measurements"
      >
        {chartData.length > 0 ? (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21302A" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(val) => `${val} kg`}
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
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 text-sm">
            No measurement records found for this member yet.
          </div>
        )}
      </Card>

      {/* Previous vs Current Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] uppercase font-bold text-gray-400">Chest</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {latestRecord?.chest_cm ? `${latestRecord.chest_cm} cm` : '—'}
          </p>
          {previousRecord?.chest_cm && (
            <p className="text-xs text-gray-400 mt-1">
              Prev: {previousRecord.chest_cm} cm
            </p>
          )}
        </Card>

        <Card className="p-4">
          <span className="text-[10px] uppercase font-bold text-gray-400">Waist</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {latestRecord?.waist_cm ? `${latestRecord.waist_cm} cm` : '—'}
          </p>
          {previousRecord?.waist_cm && (
            <p className="text-xs text-gray-400 mt-1">
              Prev: {previousRecord.waist_cm} cm
            </p>
          )}
        </Card>

        <Card className="p-4">
          <span className="text-[10px] uppercase font-bold text-gray-400">Hips</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {latestRecord?.hips_cm ? `${latestRecord.hips_cm} cm` : '—'}
          </p>
          {previousRecord?.hips_cm && (
            <p className="text-xs text-gray-400 mt-1">
              Prev: {previousRecord.hips_cm} cm
            </p>
          )}
        </Card>

        <Card className="p-4">
          <span className="text-[10px] uppercase font-bold text-gray-400">Bicep Arms</span>
          <p className="text-xl font-extrabold text-white mt-1">
            {latestRecord?.bicep_cm ? `${latestRecord.bicep_cm} cm` : '—'}
          </p>
          {previousRecord?.bicep_cm && (
            <p className="text-xs text-gray-400 mt-1">
              Prev: {previousRecord.bicep_cm} cm
            </p>
          )}
        </Card>
      </div>

      {/* History Log Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#21302A]">
          <h3 className="font-bold text-base text-white">Full Anthropometric History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111715] border-b border-[#21302A] text-xs uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="py-4 px-6">Measurement Date</th>
                <th className="py-4 px-6">Weight</th>
                <th className="py-4 px-6">Body Fat</th>
                <th className="py-4 px-6">Chest</th>
                <th className="py-4 px-6">Waist</th>
                <th className="py-4 px-6">Hips</th>
                <th className="py-4 px-6">Bicep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21302A]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#1A2621]/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">{r.date}</td>
                  <td className="py-4 px-6 font-bold text-[#B6F23A]">{r.weight_kg} kg</td>
                  <td className="py-4 px-6 text-gray-300">
                    {r.body_fat_percentage ? `${r.body_fat_percentage}%` : '—'}
                  </td>
                  <td className="py-4 px-6 text-gray-400">{r.chest_cm ? `${r.chest_cm} cm` : '—'}</td>
                  <td className="py-4 px-6 text-gray-400">{r.waist_cm ? `${r.waist_cm} cm` : '—'}</td>
                  <td className="py-4 px-6 text-gray-400">{r.hips_cm ? `${r.hips_cm} cm` : '—'}</td>
                  <td className="py-4 px-6 text-gray-400">{r.bicep_cm ? `${r.bicep_cm} cm` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Measurement Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Log Physical Assessment">
        <form onSubmit={handleRecordProgress} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Assessment Date *</label>
              <input
                type="date"
                required
                value={metricForm.date}
                onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={metricForm.weight_kg}
                onChange={(e) => setMetricForm({ ...metricForm, weight_kg: e.target.value })}
                placeholder="74.5"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                value={metricForm.height_cm}
                onChange={(e) => setMetricForm({ ...metricForm, height_cm: e.target.value })}
                placeholder="178"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                value={metricForm.body_fat_percentage}
                onChange={(e) => setMetricForm({ ...metricForm, body_fat_percentage: e.target.value })}
                placeholder="16.5"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                value={metricForm.chest_cm}
                onChange={(e) => setMetricForm({ ...metricForm, chest_cm: e.target.value })}
                className="w-full px-2.5 py-2 bg-[#111715] border border-[#2A3E36] rounded-xl text-xs text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                value={metricForm.waist_cm}
                onChange={(e) => setMetricForm({ ...metricForm, waist_cm: e.target.value })}
                className="w-full px-2.5 py-2 bg-[#111715] border border-[#2A3E36] rounded-xl text-xs text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Hips (cm)</label>
              <input
                type="number"
                step="0.5"
                value={metricForm.hips_cm}
                onChange={(e) => setMetricForm({ ...metricForm, hips_cm: e.target.value })}
                className="w-full px-2.5 py-2 bg-[#111715] border border-[#2A3E36] rounded-xl text-xs text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Bicep (cm)</label>
              <input
                type="number"
                step="0.5"
                value={metricForm.bicep_cm}
                onChange={(e) => setMetricForm({ ...metricForm, bicep_cm: e.target.value })}
                className="w-full px-2.5 py-2 bg-[#111715] border border-[#2A3E36] rounded-xl text-xs text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Coach Notes</label>
            <input
              type="text"
              value={metricForm.notes}
              onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
              placeholder="e.g. Excellent shoulder definition improvement"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Measurements
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
