import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

// API base URL: use Vite env var if set, else relative (uses Vite proxy in dev, same-origin in prod)
const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf_token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Response interceptor — normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      err.userMessage = 'Cannot reach server. Make sure it is running on port 5000.'
    } else if (err.response.status === 401) {
      err.userMessage = err.response.data?.message || 'Invalid credentials.'
    } else if (err.response.status === 400) {
      err.userMessage = err.response.data?.message || 'Bad request — check your input.'
    } else if (err.response.status >= 500) {
      err.userMessage = 'Server error. Please try again.'
    } else {
      err.userMessage = err.response.data?.message || 'Something went wrong.'
    }
    return Promise.reject(err)
  }
)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('pf_token'))
  const [loading, setLoading] = useState(true)

  // Sync token to axios header whenever it changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  // On mount: validate stored token
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const { data } = await api.get('/api/auth/me')
          setUser(data.user)
          localStorage.setItem('pf_cached_user', JSON.stringify(data.user))
        } catch (err) {
          const isOffline = !navigator.onLine || err?.code === 'ECONNABORTED' || !err.response
          if (isOffline) {
            // Restore from cache so dashboard opens offline
            const cached = localStorage.getItem('pf_cached_user')
            if (cached) {
              try { setUser(JSON.parse(cached)) } catch {}
            } else {
              setToken(null)
              localStorage.removeItem('pf_token')
            }
          } else {
            // Online but token invalid — clear session
            setToken(null)
            localStorage.removeItem('pf_token')
            localStorage.removeItem('pf_cached_user')
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    const t = data.token
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(data.user)
    localStorage.setItem('pf_token', t)
    localStorage.setItem('pf_cached_user', JSON.stringify(data.user))
    return data
  }, [])

  // register ONLY creates the account — does NOT log the user in
  // Returns { success, message } — caller should redirect to /login
  const register = useCallback(async (name, email, password, role, age) => {
    const { data } = await api.post('/api/auth/register', {
      name, email, password,
      role: role || 'patient',
      age: Number(age) || 30
    })
    // Do NOT set token or user here — force user to login manually
    return data
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('pf_token')
    localStorage.removeItem('pf_cached_user')
    delete api.defaults.headers.common['Authorization']
  }, [])

  // Elder mode: age >= 55 AND only for patient/elder role (not doctor/caretaker)
  const elderMode = (user?.role === 'elder' || user?.role === 'patient') && user?.age >= 55

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, elderMode, api }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
