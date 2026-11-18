import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Dumbbell, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login({ email, password })
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'trainer') {
        navigate('/trainer/dashboard')
      } else {
        navigate('/member/dashboard')
      }
    } catch (err) {
      console.error(err)
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Quick fill helper for convenience
  const fillCredentials = (roleEmail, rolePass) => {
    setEmail(roleEmail)
    setPassword(rolePass)
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#17211D] border border-[#B6F23A]/40 flex items-center justify-center shadow-[0_0_20px_rgba(182,242,58,0.25)]">
            <span className="text-[#B6F23A] font-black text-2xl tracking-tighter">F</span>
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-white">
            FIT<span className="text-[#B6F23A]">TRACK</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Sign in to access your gym operations dashboard
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#17211D] py-8 px-6 sm:px-10 border border-[#21302A] rounded-3xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fittrack.com"
                  className="block w-full pl-10 pr-4 py-3 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#B6F23A] focus:ring-1 focus:ring-[#B6F23A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-[#111715] border border-[#2A3E36] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#B6F23A] focus:ring-1 focus:ring-[#B6F23A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#111715] border-gray-700 text-[#B6F23A] focus:ring-0"
                />
                Remember me
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact gym administration to reset credentials.') }} className="text-[#B6F23A] hover:underline font-semibold">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full py-3 text-sm">
              Sign In to FitTrack
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#21302A]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 text-center mb-3">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@fittrack.com', 'admin123')}
                className="py-1.5 px-2 text-[11px] font-bold rounded-lg bg-[#202E29] text-[#B6F23A] border border-[#B6F23A]/30 hover:bg-[#B6F23A]/10 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('alex@fittrack.com', 'trainer123')}
                className="py-1.5 px-2 text-[11px] font-bold rounded-lg bg-[#202E29] text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                Trainer
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('rahul@example.com', 'member123')}
                className="py-1.5 px-2 text-[11px] font-bold rounded-lg bg-[#202E29] text-gray-300 border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                Member
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#B6F23A] hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
