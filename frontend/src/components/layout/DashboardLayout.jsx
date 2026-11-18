import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  const getPageTitle = (pathname) => {
    if (pathname.includes('/dashboard')) return 'Dashboard Overview'
    if (pathname.includes('/members')) return 'Member Directory'
    if (pathname.includes('/trainers')) return 'Trainer Management'
    if (pathname.includes('/memberships')) return 'Membership Plans & Subscriptions'
    if (pathname.includes('/attendance')) return 'Daily Attendance Registry'
    if (pathname.includes('/workouts')) return 'Workout Plans & Exercises'
    if (pathname.includes('/payments')) return 'Financial Transactions & Billing'
    if (pathname.includes('/fitness')) return 'Member Fitness Tracking'
    return 'Dashboard'
  }

  const title = getPageTitle(location.pathname)

  return (
    <div className="min-h-screen bg-[#0B0F0E] text-white flex">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Navbar onMenuClick={() => setIsMobileOpen(true)} title={title} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
