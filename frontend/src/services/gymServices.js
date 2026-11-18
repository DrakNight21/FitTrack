import api from './api'

export const analyticsService = {
  getDashboardStats: async () => {
    const res = await api.get('/analytics/dashboard/')
    return res.data
  },
}

export const membersService = {
  getMembers: async (params = {}) => {
    const res = await api.get('/users/', { params: { role: 'member', ...params } })
    return res.data
  },
  getMember: async (id) => {
    const res = await api.get(`/users/${id}/`)
    return res.data
  },
  createMember: async (data) => {
    const res = await api.post('/users/', { ...data, role: 'member' })
    return res.data
  },
  updateMember: async (id, data) => {
    const res = await api.put(`/users/${id}/`, data)
    return res.data
  },
  deleteMember: async (id) => {
    const res = await api.delete(`/users/${id}/`)
    return res.data
  },
}

export const trainersService = {
  getTrainers: async () => {
    const res = await api.get('/trainers/')
    return res.data
  },
  createTrainer: async (data) => {
    const res = await api.post('/users/', { ...data, role: 'trainer' })
    return res.data
  },
  updateTrainer: async (id, data) => {
    const res = await api.put(`/users/${id}/`, data)
    return res.data
  },
  updateProfile: async (id, data) => {
    const res = await api.put(`/trainers/${id}/profile/`, data)
    return res.data
  },
  assignMember: async (trainerId, memberId, action = 'assign') => {
    const res = await api.post(`/trainers/${trainerId}/assign-member/`, { member_id: memberId, action })
    return res.data
  },
  getMyMembers: async () => {
    const res = await api.get('/users/my-members/')
    return res.data
  },
}

export const membershipsService = {
  getPlans: async () => {
    const res = await api.get('/membership-plans/')
    return res.data
  },
  createPlan: async (data) => {
    const res = await api.post('/membership-plans/', data)
    return res.data
  },
  updatePlan: async (id, data) => {
    const res = await api.put(`/membership-plans/${id}/`, data)
    return res.data
  },
  deletePlan: async (id) => {
    const res = await api.delete(`/membership-plans/${id}/`)
    return res.data
  },
  getMemberships: async (params = {}) => {
    const res = await api.get('/memberships/', { params })
    return res.data
  },
  createMembership: async (data) => {
    const res = await api.post('/memberships/', data)
    return res.data
  },
  renewMembership: async (id) => {
    const res = await api.post(`/memberships/${id}/renew/`)
    return res.data
  },
  getExpiring: async () => {
    const res = await api.get('/memberships/expiring/')
    return res.data
  },
}

export const attendanceService = {
  getAttendance: async (params = {}) => {
    const res = await api.get('/attendance/', { params })
    return res.data
  },
  markAttendance: async (data) => {
    const res = await api.post('/attendance/', data)
    return res.data
  },
  getDailyStats: async () => {
    const res = await api.get('/attendance/daily-stats/')
    return res.data
  },
}

export const workoutsService = {
  getPlans: async () => {
    const res = await api.get('/workouts/')
    return res.data
  },
  getPlan: async (id) => {
    const res = await api.get(`/workouts/${id}/`)
    return res.data
  },
  createPlan: async (data) => {
    const res = await api.post('/workouts/', data)
    return res.data
  },
  updatePlan: async (id, data) => {
    const res = await api.put(`/workouts/${id}/`, data)
    return res.data
  },
  deletePlan: async (id) => {
    const res = await api.delete(`/workouts/${id}/`)
    return res.data
  },
  assignPlan: async (id, memberId, action = 'assign') => {
    const res = await api.post(`/workouts/${id}/assign/`, { member_id: memberId, action })
    return res.data
  },
  addDay: async (planId, day) => {
    const res = await api.post(`/workouts/${planId}/days/`, { plan: planId, day })
    return res.data
  },
  addExercise: async (dayId, data) => {
    const res = await api.post(`/workout-days/${dayId}/exercises/`, { ...data, workout_day: dayId })
    return res.data
  },
  deleteExercise: async (exerciseId) => {
    const res = await api.delete(`/exercises/${exerciseId}/`)
    return res.data
  },
}

export const paymentsService = {
  getPayments: async (params = {}) => {
    const res = await api.get('/payments/', { params })
    return res.data
  },
  recordPayment: async (data) => {
    const res = await api.post('/payments/', data)
    return res.data
  },
  getSummary: async () => {
    const res = await api.get('/payments/summary/')
    return res.data
  },
}

export const fitnessService = {
  getRecords: async (params = {}) => {
    const res = await api.get('/fitness/', { params })
    return res.data
  },
  recordProgress: async (data) => {
    const res = await api.post('/fitness/', data)
    return res.data
  },
}
