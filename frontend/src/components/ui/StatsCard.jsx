import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  prefix = '',
  suffix = '',
  loading = false,
}) => {
  return (
    <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/30 rounded-2xl p-5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</span>
        <div className="p-2.5 rounded-xl bg-[#202E29] text-[#B6F23A] border border-[#B6F23A]/20">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-24 bg-gray-800 animate-pulse rounded"></div>
        ) : (
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend >= 0 ? (
            <span className="flex items-center font-semibold text-[#B6F23A]">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{trend}%
            </span>
          ) : (
            <span className="flex items-center font-semibold text-red-400">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{trend}%
            </span>
          )}
          <span className="text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
