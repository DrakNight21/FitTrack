import React from 'react'

export const LoadingSpinner = ({ size = 'md', text = 'Loading data...' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <div
        className={`${sizes[size]} border-t-[#B6F23A] border-r-transparent border-b-[#B6F23A]/30 border-l-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-400 font-medium">{text}</p>}
    </div>
  )
}
