import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { paymentsService, membersService } from '../../services/gymServices'

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([])
  const [members, setMembers] = useState([])
  const [summary, setSummary] = useState({ total_paid: 0, total_pending: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [paymentForm, setPaymentForm] = useState({
    member: '',
    amount: '',
    payment_method: 'upi',
    status: 'paid',
    transaction_id: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter

      const [paymentsData, summaryData, membersData] = await Promise.all([
        paymentsService.getPayments(params),
        paymentsService.getSummary(),
        membersService.getMembers(),
      ])
      setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.results || [])
      setSummary(summaryData)
      setMembers(Array.isArray(membersData) ? membersData : membersData.results || [])
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to load billing history.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await paymentsService.recordPayment({
        ...paymentForm,
        amount: Number(paymentForm.amount),
        transaction_id: paymentForm.transaction_id || `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      })
      setIsRecordModalOpen(false)
      setPaymentForm({
        member: '',
        amount: '',
        payment_method: 'upi',
        status: 'paid',
        transaction_id: '',
        notes: '',
      })
      setToast({ type: 'success', message: 'Payment transaction logged.' })
      loadData()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Failed to record payment.' })
    } finally {
      setSubmitting(false)
    }
  }

  const openReceipt = (payment) => {
    setSelectedPayment(payment)
    setIsReceiptModalOpen(true)
  }

  const filteredPayments = payments.filter((p) => {
    if (!search) return true
    const memberName = p.member_detail?.full_name?.toLowerCase() || ''
    const txn = p.transaction_id?.toLowerCase() || ''
    return memberName.includes(search.toLowerCase()) || txn.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Payments & Receipts</h2>
          <p className="text-xs text-gray-400 mt-1">
            Membership dues, transaction histories, invoices, and payment method records.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsRecordModalOpen(true)}>
          Record Payment
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Total Collected</span>
            <p className="text-2xl font-extrabold text-[#B6F23A] mt-1">
              ₹{(summary.total_paid || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Pending Dues</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              ₹{(summary.total_pending || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-gray-400">Total Transactions</span>
            <p className="text-2xl font-extrabold text-white mt-1">{payments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#202E29] text-gray-300 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by member or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111715] border border-[#21302A] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-gray-400 font-semibold uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#111715] border border-[#21302A] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#B6F23A]"
            >
              <option value="">All Transactions</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching transaction records..." />
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <DollarSign className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">No transactions match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111715] border-b border-[#21302A] text-xs uppercase font-bold text-gray-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Mode</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21302A]">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1A2621]/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      {p.member_detail?.full_name || `Member #${p.member}`}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-gray-400">
                      {p.transaction_id || `TXN-${p.id}`}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#B6F23A]">
                      ₹{Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-300 uppercase font-semibold">
                      {p.payment_method}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400">{p.payment_date}</td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          p.status === 'paid'
                            ? 'success'
                            : p.status === 'pending'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202E29] hover:bg-[#283B34] text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#B6F23A]" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Record Payment Receipt">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Select Member *</label>
            <select
              required
              value={paymentForm.member}
              onChange={(e) => setPaymentForm({ ...paymentForm, member: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="2499"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Payment Method</label>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                <option value="upi">UPI / GPay / PhonePe</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Payment Status</label>
              <select
                value={paymentForm.status}
                onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                <option value="paid">Paid (Confirmed)</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Transaction Ref #</label>
              <input
                type="text"
                value={paymentForm.transaction_id}
                onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                placeholder="Auto-generated if empty"
                className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Transaction Notes</label>
            <input
              type="text"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="e.g. 3-Month Standard Membership Renewal"
              className="w-full px-3.5 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
            <Button type="button" variant="ghost" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Record Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {selectedPayment && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Payment Invoice Receipt"
          maxWidth="max-w-lg"
        >
          <div className="space-y-6 text-sm" id="printable-receipt">
            {/* Header branding */}
            <div className="flex items-center justify-between pb-4 border-b border-[#21302A]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#202E29] border border-[#B6F23A]/40 flex items-center justify-center font-black text-sm text-[#B6F23A]">
                  F
                </div>
                <span className="font-extrabold text-base tracking-wider text-white">
                  FIT<span className="text-[#B6F23A]">TRACK</span>
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white">OFFICIAL RECEIPT</p>
                <p className="text-[10px] text-gray-500 font-mono">
                  {selectedPayment.transaction_id || `TXN-${selectedPayment.id}`}
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 uppercase font-semibold">Billed To</span>
                <p className="font-bold text-white mt-0.5">
                  {selectedPayment.member_detail?.full_name}
                </p>
                <p className="text-gray-400">{selectedPayment.member_detail?.email}</p>
                {selectedPayment.member_detail?.phone && (
                  <p className="text-gray-400">{selectedPayment.member_detail?.phone}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-gray-500 uppercase font-semibold">Receipt Details</span>
                <p className="text-white mt-0.5">Date: {selectedPayment.payment_date}</p>
                <p className="text-white uppercase font-bold">
                  Mode: {selectedPayment.payment_method}
                </p>
              </div>
            </div>

            {/* Amount Table */}
            <div className="bg-[#111715] p-4 rounded-xl border border-[#21302A]">
              <div className="flex justify-between pb-2 border-b border-[#21302A] text-xs font-bold text-gray-400 uppercase">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between py-3 text-sm font-semibold text-white">
                <span>{selectedPayment.notes || 'Gym Membership Subscription Fee'}</span>
                <span>₹{Number(selectedPayment.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#21302A] text-base font-extrabold text-[#B6F23A]">
                <span>Total Paid</span>
                <span>₹{Number(selectedPayment.amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
              <Badge variant={selectedPayment.status === 'paid' ? 'success' : 'warning'}>
                Payment Status: {selectedPayment.status.toUpperCase()}
              </Badge>
              <p className="italic">Authorized FitTrack Gym Operations</p>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[#21302A]">
              <Button type="button" variant="ghost" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
