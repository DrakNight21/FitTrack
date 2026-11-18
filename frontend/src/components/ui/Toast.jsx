import React, { useEffect } from 'react'
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react'

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#B6F23A]" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
  }

  const borders = {
    success: 'border-[#B6F23A]/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#17211D] border ${borders[type]} text-white rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4`}
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
