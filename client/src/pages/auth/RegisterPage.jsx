import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../i18n'
import { Btn, Input } from '../../components/ui'

const roles = [
  { value: 'patient',   icon: '🏃',    title: 'Patient',   desc: 'Track my recovery' },
  { value: 'doctor',    icon: '👨‍⚕️', title: 'Doctor',    desc: 'Monitor patients' },
  { value: 'caretaker', icon: '👨‍👩‍👧', title: 'Caretaker', desc: 'Support my family' },
  { value: 'elder',     icon: '👴',    title: 'Elder',     desc: 'Simplified interface' },
]

const getErrorMessage = (err) => {
  if (err?.userMessage) return err.userMessage
  if (!err?.response) return 'Cannot reach server. Make sure the backend is running on port 5000.'
  if (err.response?.status === 400) return err.response.data?.message || 'Invalid input — check your details.'
  if (err.response?.status === 409) return err.response.data?.message || 'Email already registered. Please login.'
  if (err.response?.status >= 500) return 'Server error. Please try again.'
  return err.response?.data?.message || 'Registration failed. Please try again.'
}

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', age: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Client-side validation
    if (!form.name.trim()) return setError('Please enter your full name.')
    if (!form.email.trim()) return setError('Please enter a valid email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (!form.age || isNaN(form.age) || Number(form.age) < 1 || Number(form.age) > 120)
      return setError('Please enter a valid age (1–120).')

    setError('')
    setLoading(true)
    try {
  const result = await register(
    form.name.trim(),
    form.email.trim().toLowerCase(),
    form.password,
    form.role,
    form.age
  )

  console.log('REGISTER SUCCESS:', result)

  navigate('/login', {
    state: {
      successMessage: 'Account created successfully. Please login.'
    }
  })
      
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const elderPreview = form.age && Number(form.age) >= 55

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(ellipse,rgba(74,158,255,.08) 0%,transparent 65%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
        style={{ width: '100%', maxWidth: 500, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 28, padding: 40, position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>⚕ PhysioForge</Link>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 8 }}>Create your free account</p>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 10 }}>{t('iAmA')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {roles.map(r => (
              <motion.div key={r.value} onClick={() => setForm(f => ({ ...f, role: r.value }))} whileTap={{ scale: .97 }}
                style={{ border: `2px solid ${form.role === r.value ? 'var(--teal)' : 'var(--border)'}`, background: form.role === r.value ? 'rgba(0,212,170,.08)' : 'var(--bg3)', borderRadius: 14, padding: '12px 6px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: form.role === r.value ? 'var(--teal)' : 'var(--text)' }}>{r.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{r.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Priya Singh" icon="👤" required />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" icon="✉️" required autoComplete="email" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" icon="🔒" required autoComplete="new-password" />

          {/* Age — needed for Elder Mode detection */}
          <div>
            <Input label={t('age')} type="number" value={form.age} onChange={set('age')} placeholder={t('agePlaceholder')} icon="🎂" required min="1" max="120" />
            {elderPreview && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 8, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: 'var(--amber)' }}>
                👴 Elder Mode will be enabled — bigger buttons, simplified interface, easier navigation.
              </motion.div>
            )}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: 'rgba(255,107,122,.08)', border: '1px solid rgba(255,107,122,.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
              ⚠️ {error}
            </motion.div>
          )}

          <Btn type="submit" variant="primary" size="lg" disabled={loading} style={{ justifyContent: 'center', marginTop: 4, width: '100%' }}>
            {loading ? `⟳ ${t('creatingAccount')}` : `${t('createAccount')} →`}
          </Btn>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
