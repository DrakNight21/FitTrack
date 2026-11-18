import React from 'react'

export const Card = ({ children, className = '', title, subtitle, action, hover = false }) => {
  return (
    <div
      className={`bg-[#17211D] border border-[#21302A] rounded-2xl p-6 transition-all duration-200 ${
        hover ? 'hover:border-[#B6F23A]/30 hover:shadow-[0_4px_25px_rgba(0,0,0,0.4)]' : ''
      } ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#21302A]">
          <div>
            {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
