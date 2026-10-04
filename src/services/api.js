import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
export const USE_MOCK = false

const http = axios.create({ baseURL: BASE, timeout: 30000 })

http.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth') || sessionStorage.getItem('auth') || 'null')
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

const real = async (request) => {
  try {
    return (await request()).data
  } catch (e) {
    throw new Error(e.response?.data?.detail || e.message || 'Request failed')
  }
}

export const health = () => real(() => http.get('/health'))
export const login = (email, password) => real(() => http.post('/auth/login', { email, password }))
export const register = (name, email, password) =>
  real(() => http.post('/auth/register', { name, email, password }))
export const predictLoan = (payload) => real(() => http.post('/predict', payload))
export const getPredictionHistory = () => real(() => http.get('/predictions'))
export const getDashboardStats = () => real(() => http.get('/dashboard/stats'))
export const getAnalytics = ({ grade = '', risk = '', days = 0 } = {}) => real(() => http.get('/analytics', { params: { grade, risk, days } }))
export const getModelMonitoring = () => real(() => http.get('/monitoring'))
export const getApplicant = (id) => real(() => http.get(`/applicants/${encodeURIComponent(id)}`))
