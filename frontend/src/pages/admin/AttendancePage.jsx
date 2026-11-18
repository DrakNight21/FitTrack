import React, { useState, useEffect } from 'react'
import {
  CalendarCheck,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { attendanceService, membersService } from '../../services/gymServices'

export const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [toast, setToast] = useState(null)

  // Mark Attendance Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [markMemberId, setMarkMemberId] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadAttendance()
    loadMembers()
  }, [selectedDate])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const data = await attendanceService.getAttendance({ date: selectedDate })
      setAttendanceRecords(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to fetch attendance records.' })
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const data = await membersService.getMembers()
      setMembers(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAttendance = async (e) => {
    e.preventDefault()
    if (!markMemberId) {
      setToast({ type: 'warning', message: 'Please select a member.' })
      return
    }

    setSubmitting(true)
    try {
      await attendanceService.markAttendance({
        member: markMemberId,
        date: selectedDate,
        notes: notes,
      })
      setIsModalOpen(false)
      setMarkMemberId('')
      setNotes('')
      setToast({ type: 'success', message: 'Attendance marked successfully.' })
      loadAttendance()
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.error || 'Attendance already logged for this member today.'
      setToast({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Attendance Registry</h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time daily gym check-ins, timestamps, and physical capacity tracking.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Mark Check-In
        </Button>
      </div>

      {/* Date Filter & Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Calendar className="w-5 h-5 text-[#B6F23A] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Selected Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block mt-0.5 bg-[#111715] border border-[#21302A] rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 rounded-lg bg-[#202E29] hover:bg-[#283B34] text-xs font-bold text-[#B6F23A] transition-colors"
            >
              Today
            </button>
          </div>
        </Card>

        {/* Daily Total Card */}
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Check-ins on this date</span>
            <p className="text-3xl font-extrabold text-white mt-1">{attendanceRecords.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#202E29] border border-[#B6F23A]/30 flex items-center justify-center text-[#B6F23A]">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching attendance records..." />
        ) : attendanceRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CalendarCheck className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No check-ins recorded for {selectedDate}.</p>
            <p className="text-xs text-gray-500 mt-1">Use the "Mark Check-In" button to log member arrival.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111715] border-b border-[#21302A] text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Check-in Timestamp</th>
                  <th className="py-4 px-6">Marked By</th>
                  <th className="py-4 px-6">Notes / Locker</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21302A]">
                {attendanceRecords.map((att) => (
                  <tr key={att.id} className="hover:bg-[#1A2621]/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#202E29] text-[#B6F23A] font-bold text-xs flex items-center justify-center">
                          {att.member_detail?.first_name ? att.member_detail.first_name[0] : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {att.member_detail?.full_name || `Member #${att.member}`}
                          </p>
                          <p className="text-xs text-gray-400">{att.member_detail?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>{new Date(att.check_in_time).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {att.marked_by_detail?.full_name || 'Staff'}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">
                      {att.notes || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant="success" size="xs">
                        Verified Check-in
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Mark Attendance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Member Check-in">
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Select Member *</label>
            <select
              required
              value={markMemberId}
              onChange={(e) => setMarkMemberId(e.target.value)}
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
            <label className="block text-xs font-semibold text-gray-400 mb-1">Check-in Date *</label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Notes / Locker Key #</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Locker #24 issued"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <p className="text-[11px] text-gray-500">
            Note: FitTrack automatically verifies duplicate entries to ensure accurate reporting.
          </p>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Confirm Check-in
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
