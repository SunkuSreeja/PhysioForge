import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Btn, Input } from '../../components/ui'
import { useLang } from '../../i18n'

const getErrorMessage = (err) => {
  if (err?.userMessage) return err.userMessage
  if (!err?.response) return 'Cannot reach server. Make sure the backend is running on port 5000.'
  if (err.response?.status === 401) return err.response.data?.message || 'Invalid email or password.'
  if (err.response?.status === 400) return err.response.data?.message || 'Invalid request.'
  return err.response?.data?.message || 'Login failed. Please try again.'
}

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Success message from RegisterPage redirect
  const successMessage = location.state?.successMessage || ''

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email.trim().toLowerCase(), form.password)
      // Determine dashboard route based on role
      const role = data.user.role
      // Elder mode only for patient/elder roles, not doctor/caretaker
      if (role === 'elder' || ((role === 'patient' || !role) && data.user.age >= 55)) {
        navigate('/patient/dashboard')
      } else {
        navigate(`/${role}/dashboard`)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Demo login — only for explicitly demo accounts
  const demoLogin = async (role) => {
    setLoading(true)
    setError('')
    const emails = {
      patient:   'patient@demo.com',
      doctor:    'doctor@demo.com',
      caretaker: 'caretaker@demo.com',
      elder:     'elder@demo.com'
    }
    try {
      const data = await login(emails[role], 'password123')
      const userRole = data.user.role
      // Only reroute to patient dashboard for patient/elder roles, not doctor/caretaker
      if (userRole === 'elder' || ((userRole === 'patient' || !userRole) && data.user.age >= 55)) {
        navigate('/patient/dashboard')
      } else {
        navigate(`/${userRole}/dashboard`)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(ellipse,rgba(0,212,170,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
        style={{ width: '100%', maxWidth: 440, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 28, padding: 40, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>⚕ PhysioForge</Link>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 8 }}>Welcome back — sign in to continue your recovery</p>
        </div>

        {/* Success message after registration */}
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(0,212,170,.08)', border: '1px solid rgba(0,212,170,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--teal)', lineHeight: 1.5, marginBottom: 20 }}>
            ✅ {successMessage}
          </motion.div>
        )}

        {/* Demo quick access */}
        <div style={{ background: 'rgba(0,212,170,.06)', border: '1px solid rgba(0,212,170,.15)', borderRadius: 14, padding: 14, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, fontWeight: 500 }}>⚡ Quick Demo Access</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { role: 'patient',   icon: '🏃' },
              { role: 'doctor',    icon: '👨‍⚕️' },
              { role: 'caretaker', icon: '👨‍👩‍👧' },
              { role: 'elder',     icon: '👴' },
            ].map(({ role, icon }) => (
              <button key={role} onClick={() => demoLogin(role)} disabled={loading}
                style={{ flex: 1, minWidth: 70, padding: '8px 6px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
                {icon} {role}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label={t('email')} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" icon="✉️" required autoComplete="email" />
          <Input label={t('password')} type="password" value={form.password} onChange={set('password')} placeholder="••••••••" icon="🔒" required autoComplete="current-password" />

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: 'rgba(255,107,122,.08)', border: '1px solid rgba(255,107,122,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
              ⚠️ {error}
            </motion.div>
          )}

          <Btn type="submit" variant="primary" size="lg" disabled={loading} className="w-full" style={{ justifyContent: 'center', marginTop: 4 }}>
            {loading ? '⟳ Signing in...' : 'Sign In →'}
          </Btn>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>Create one free</Link>
        </p>
      </motion.div>
    </div>
  )
}
