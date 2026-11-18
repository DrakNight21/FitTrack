import React from 'react'
import { Loader2 } from 'lucide-react'

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-[#B6F23A] text-black hover:bg-[#86C232] shadow-[0_0_20px_rgba(182,242,58,0.25)] hover:shadow-[0_0_25px_rgba(182,242,58,0.4)] active:scale-[0.98]',
    secondary: 'bg-[#17211D] text-white hover:bg-[#202E29] border border-gray-800 hover:border-gray-700',
    outline: 'border border-[#B6F23A]/40 text-[#B6F23A] hover:bg-[#B6F23A]/10 hover:border-[#B6F23A]',
    ghost: 'text-gray-300 hover:text-white hover:bg-[#17211D]',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  )
}
