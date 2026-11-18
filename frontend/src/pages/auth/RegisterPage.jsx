import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'member',
    password: '',
    confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      const user = await register(formData)
      if (user.role === 'trainer') {
        navigate('/trainer/dashboard')
      } else {
        navigate('/member/dashboard')
      }
    } catch (err) {
      console.error(err)
      const data = err.response?.data
      let message = 'Registration failed. Please check your information.'
      if (data) {
        if (typeof data === 'string') message = data
        else if (data.email) message = data.email[0]
        else if (data.confirm_password) message = data.confirm_password[0]
        else if (data.role) message = data.role[0]
        else if (data.non_field_errors) message = data.non_field_errors[0]
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#17211D] border border-[#B6F23A]/40 flex items-center justify-center shadow-[0_0_20px_rgba(182,242,58,0.25)]">
            <span className="text-[#B6F23A] font-black text-2xl tracking-tighter">F</span>
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-white">
            FIT<span className="text-[#B6F23A]">TRACK</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create FitTrack Account
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Join the modern gym management & fitness community
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-[#17211D] py-8 px-6 sm:px-10 border border-[#21302A] rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full px-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Account Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
              >
                <option value="member">Gym Member (Client Portal)</option>
                <option value="trainer">Fitness Trainer (Staff Portal)</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Note: Administrator accounts are strictly provisioned by gym management.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" loading={loading} className="w-full py-3">
                Complete Registration
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#B6F23A] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
