import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { MembersPage } from './pages/admin/MembersPage'
import { TrainersPage } from './pages/admin/TrainersPage'
import { MembershipsPage } from './pages/admin/MembershipsPage'
import { AttendancePage } from './pages/admin/AttendancePage'
import { WorkoutsPage } from './pages/admin/WorkoutsPage'
import { PaymentsPage } from './pages/admin/PaymentsPage'
import { FitnessPage } from './pages/admin/FitnessPage'
import { TrainerDashboard } from './pages/trainer/TrainerDashboard'
import { MemberDashboard } from './pages/member/MemberDashboard'

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center">
        <LoadingSpinner text="Authenticating user session..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />
    if (user.role === 'member') return <Navigate to="/member/dashboard" replace />
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

// Smart Dashboard Redirector
const DashboardRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center">
        <LoadingSpinner text="Redirecting to dashboard..." />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'trainer') return <Navigate to="/trainer/dashboard" replace />
  return <Navigate to="/member/dashboard" replace />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Authenticated Dashboard Pages */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Admin Exclusive Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/members"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/trainers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TrainersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/memberships"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MembershipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />

            {/* Shared Operational Routes (Admin & Trainer) */}
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workouts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                  <WorkoutsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fitness"
              element={
                <ProtectedRoute allowedRoles={['admin', 'trainer']}>
                  <FitnessPage />
                </ProtectedRoute>
              }
            />

            {/* Trainer Portal */}
            <Route
              path="/trainer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Member Portal */}
            <Route
              path="/member/dashboard"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
  )
}
