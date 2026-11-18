import React from 'react'
import { Menu, Bell, Shield, Dumbbell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Navbar = ({ onMenuClick, title = 'Dashboard' }) => {
  const { user } = useAuth()

  return (
    <header className="h-20 bg-[#111715]/80 backdrop-blur-md border-b border-[#21302A] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-[#17211D] border border-gray-800 text-gray-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            FitTrack Gym Operations & Management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Gym Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#17211D] border border-[#2A3E36]">
          <span className="w-2 h-2 rounded-full bg-[#B6F23A] animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-300">Gym Status: Active</span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#21302A]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user?.full_name || user?.username}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#B6F23A]">
              {user?.role}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#17211D] border border-[#B6F23A]/40 flex items-center justify-center font-black text-sm text-[#B6F23A]">
            {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
