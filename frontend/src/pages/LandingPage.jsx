import React from 'react'
import { Link } from 'react-router-dom'
import {
  Dumbbell,
  Users,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  DollarSign,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export const LandingPage = () => {
  const { user } = useAuth()

  const dashboardRoute =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'trainer'
      ? '/trainer/dashboard'
      : '/member/dashboard'

  return (
    <div className="min-h-screen bg-[#0B0F0E] text-white selection:bg-[#B6F23A] selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F0E]/80 backdrop-blur-lg border-b border-[#21302A]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17211D] border border-[#B6F23A]/40 flex items-center justify-center shadow-[0_0_20px_rgba(182,242,58,0.25)]">
              <span className="text-[#B6F23A] font-black text-2xl tracking-tighter">F</span>
            </div>
            <span className="font-extrabold text-xl tracking-wider text-white">
              FIT<span className="text-[#B6F23A]">TRACK</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-[#B6F23A] transition-colors">Features</a>
            <a href="#about" className="hover:text-[#B6F23A] transition-colors">About</a>
            <a href="#stats" className="hover:text-[#B6F23A] transition-colors">Impact</a>
            <a href="#contact" className="hover:text-[#B6F23A] transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to={dashboardRoute}>
                <Button variant="primary" size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B6F23A]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#86C232]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#17211D] border border-[#B6F23A]/30 text-xs font-semibold text-[#B6F23A] mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin text-[#B6F23A]" />
            Enterprise Gym Management SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Manage Your Fitness. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B6F23A] via-[#86C232] to-[#B6F23A]">
              Transform Your Gym.
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            FitTrack is the all-in-one gym operations platform engineered for modern fitness clubs. Real-time member tracking, automated renewals, workout scheduling, and financial analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? dashboardRoute : '/register'}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-base">
                {user ? 'Enter Your Dashboard' : 'Start 14-Day Free Trial'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-[#17211D]/80 border border-[#21302A] rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-black text-[#B6F23A]">99.8%</p>
              <p className="text-xs text-gray-400 mt-1">Platform Uptime</p>
            </div>
            <div className="bg-[#17211D]/80 border border-[#21302A] rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">10,000+</p>
              <p className="text-xs text-gray-400 mt-1">Active Gym Members</p>
            </div>
            <div className="bg-[#17211D]/80 border border-[#21302A] rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-black text-[#B6F23A]">3.5x</p>
              <p className="text-xs text-gray-400 mt-1">Faster Check-Ins</p>
            </div>
            <div className="bg-[#17211D]/80 border border-[#21302A] rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">500+</p>
              <p className="text-xs text-gray-400 mt-1">Gym Locations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#111715]/50 border-y border-[#21302A] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B6F23A]">
              Powerhouse Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Everything Your Gym Needs to Scale
            </h2>
            <p className="text-gray-400 mt-4 text-sm sm:text-base">
              Say goodbye to scattered spreadsheets and clunky interfaces. FitTrack consolidates every gym workflow into one seamless dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/40 rounded-2xl p-8 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Member Lifecycle</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Add, manage, update, and track members. Maintain complete contact, medical, and membership status records in one place.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/40 rounded-2xl p-8 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Attendance</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                One-tap check-ins with duplicate prevention. Track member attendance trends, peak gym hours, and active participation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/40 rounded-2xl p-8 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Flexible Memberships</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Configure monthly, quarterly, and annual subscription packages. Automated expiration alerts and single-click renewals.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/40 rounded-2xl p-8 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Workout Programming</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Design custom workout routines organized by weekdays. Assign sets, target reps, and rest intervals directly to members.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/40 rounded-2xl p-8 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Payment Receipts</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Log cash, card, and UPI transactions. Generate instant printable receipts, track pending dues, and review monthly revenue.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#17211D] border border-[#21302A] hover:border-[#B6F23A]/40 rounded-2xl p-8 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fitness Progression</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Record weight, body fat %, and circumference measurements. Visualize member transformation with dynamic charting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About FitTrack Section */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#B6F23A]">
              About the Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
              Built Specifically for Fitness Studios, Crossfit Boxes & Commercial Gyms
            </h2>
            <p className="text-gray-400 mt-6 leading-relaxed">
              FitTrack was engineered from the ground up to solve the operational bottlenecks gym owners face daily. From seamless check-ins to automated billing and client workout schedules, our platform provides complete oversight without the complexity.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-[#B6F23A]/10 text-[#B6F23A] mt-1 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Role-Based Portals</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Dedicated dashboards for Administrators, Personal Trainers, and Gym Members.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-[#B6F23A]/10 text-[#B6F23A] mt-1 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Real-time Analytics</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Live database metrics for attendance counts, monthly revenue, and renewal rates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-[#B6F23A]/10 text-[#B6F23A] mt-1 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Bank-Grade Security</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Secure JWT authentication, password hashing, and encrypted data transfers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="relative">
            <div className="bg-[#17211D] border border-[#21302A] rounded-3xl p-8 shadow-2xl relative z-10">
              <div className="flex items-center justify-between pb-6 border-b border-[#21302A]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202E29] text-[#B6F23A] flex items-center justify-center font-bold">
                    FT
                  </div>
                  <div>
                    <h4 className="font-bold text-white">FitTrack Enterprise</h4>
                    <p className="text-xs text-gray-400">Live Gym Snapshot</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#B6F23A]/10 text-[#B6F23A] text-xs font-bold rounded-full border border-[#B6F23A]/30">
                  Synced
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-[#111715] p-4 rounded-xl border border-[#21302A] flex justify-between items-center">
                  <span className="text-sm text-gray-300">Active Membership Plans</span>
                  <span className="text-sm font-bold text-[#B6F23A]">4 Tiers</span>
                </div>
                <div className="bg-[#111715] p-4 rounded-xl border border-[#21302A] flex justify-between items-center">
                  <span className="text-sm text-gray-300">Trainer Specializations</span>
                  <span className="text-sm font-bold text-white">Strength & Yoga</span>
                </div>
                <div className="bg-[#111715] p-4 rounded-xl border border-[#21302A] flex justify-between items-center">
                  <span className="text-sm text-gray-300">Automated Daily Report</span>
                  <span className="text-sm font-bold text-[#B6F23A]">Enabled</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#21302A] text-center">
                <Link to="/register">
                  <Button variant="primary" className="w-full">
                    Experience FitTrack Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact / Stats Section */}
      <section id="stats" className="py-20 bg-[#111715] border-y border-[#21302A]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#B6F23A]">
            Demonstrated Results
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Trusted by Modern Gym Owners</h2>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#17211D] border border-[#21302A]">
              <p className="text-5xl font-black text-[#B6F23A]">40%</p>
              <h4 className="text-lg font-bold text-white mt-3">Reduction in Admin Hours</h4>
              <p className="text-xs text-gray-400 mt-2">
                Automated check-ins and renewals save managers up to 15 hours every week.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#17211D] border border-[#21302A]">
              <p className="text-5xl font-black text-white">2.8x</p>
              <h4 className="text-lg font-bold text-white mt-3">Higher Member Retention</h4>
              <p className="text-xs text-gray-400 mt-2">
                Personalized workout plans and measurement tracking keep members committed.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#17211D] border border-[#21302A]">
              <p className="text-5xl font-black text-[#B6F23A]">100%</p>
              <h4 className="text-lg font-bold text-white mt-3">Billing Accuracy</h4>
              <p className="text-xs text-gray-400 mt-2">
                Clear transaction audit trails ensure zero missed subscription renewals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-[#17211D] border border-[#21302A] rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B6F23A]">
                Get In Touch
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-2">
                Ready to Upgrade Your Gym?
              </h2>
              <p className="text-gray-400 mt-4 text-sm leading-relaxed">
                Have questions or need a custom multi-location enterprise setup? Our team is available 24/7 to assist.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Mail className="w-5 h-5 text-[#B6F23A]" />
                  <span>support@fittrack.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Phone className="w-5 h-5 text-[#B6F23A]" />
                  <span>+1 (800) 555-FITT</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MapPin className="w-5 h-5 text-[#B6F23A]" />
                  <span>Silicon Valley, CA & Worldwide</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111715] p-6 rounded-2xl border border-[#21302A]">
              <h4 className="font-bold text-white text-base mb-4">Send an Inquiry</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-[#17211D] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@gym.com"
                    className="w-full bg-[#17211D] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Message</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your gym facility..."
                    className="w-full bg-[#17211D] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B6F23A]"
                  ></textarea>
                </div>
                <Button variant="primary" className="w-full">
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-[#21302A] py-12 bg-[#0E1412]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#17211D] border border-[#B6F23A]/40 flex items-center justify-center font-black text-sm text-[#B6F23A]">
              F
            </div>
            <span className="font-extrabold text-base tracking-wider text-white">
              FIT<span className="text-[#B6F23A]">TRACK</span>
            </span>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} FitTrack SaaS. All rights reserved. Powered by React & Django REST Framework.
          </p>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
