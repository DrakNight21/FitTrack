import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  DollarSign,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, isAdmin, isTrainer, isMember } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const allNavItems = [
    {
      title: 'Dashboard',
      path: isAdmin ? '/admin/dashboard' : isTrainer ? '/trainer/dashboard' : '/member/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'trainer', 'member'],
    },
    {
      title: 'Members',
      path: '/admin/members',
      icon: Users,
      roles: ['admin'],
    },
    {
      title: 'Trainers',
      path: '/admin/trainers',
      icon: UserCheck,
      roles: ['admin'],
    },
    {
      title: 'Memberships',
      path: '/admin/memberships',
      icon: CreditCard,
      roles: ['admin'],
    },
    {
      title: 'Attendance',
      path: '/admin/attendance',
      icon: CalendarCheck,
      roles: ['admin', 'trainer'],
    },
    {
      title: 'Workout Plans',
      path: '/admin/workouts',
      icon: Dumbbell,
      roles: ['admin', 'trainer'],
    },
    {
      title: 'Payments',
      path: '/admin/payments',
      icon: DollarSign,
      roles: ['admin'],
    },
    {
      title: 'Fitness Progress',
      path: '/admin/fitness',
      icon: TrendingUp,
      roles: ['admin', 'trainer'],
    },
  ]

  const navItems = allNavItems.filter((item) => item.roles.includes(user?.role))

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#111715] border-r border-[#21302A] flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-[#21302A]">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-[#17211D] border border-[#B6F23A]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(182,242,58,0.2)]">
              <span className="text-[#B6F23A] font-black text-xl tracking-tighter">F</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  FIT<span className="text-[#B6F23A]">TRACK</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-gray-400 font-semibold">
                  Gym SaaS Pro
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-[#17211D] hover:bg-[#202E29] border border-[#2A3E36] items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Menu
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#17211D] text-[#B6F23A] border-l-4 border-[#B6F23A] shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-[#17211D]/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {!collapsed && <span className="truncate">{item.title}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#17211D] text-white text-xs font-semibold rounded-lg shadow-xl border border-gray-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.title}
                  </div>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-[#21302A] bg-[#0E1412]">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#17211D] border border-gray-700 flex items-center justify-center font-bold text-sm text-[#B6F23A] shrink-0">
                  {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#B6F23A]">
                    {user?.role}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#17211D] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-[#17211D] rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
