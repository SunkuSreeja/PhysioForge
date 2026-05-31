import { motion } from 'framer-motion'

// ── Badge ──────────────────────────────────────────
export function Badge({ color = 'teal', children, className = '' }) {
  return <span className={`badge badge-${color} ${className}`}>{children}</span>
}

// ── Button ─────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false, type = 'button', style = {} }) {
  const base = 'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed'
  const vars = {
    primary: 'bg-gradient-to-br from-brand-teal to-brand-blue text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg',
    ghost: 'bg-white/5 border border-white/15 text-[color:var(--text)] hover:bg-white/10 hover:border-brand-teal',
    danger: 'bg-gradient-to-br from-brand-red to-rose-700 text-white hover:opacity-90',
    amber: 'bg-gradient-to-br from-brand-amber to-orange-500 text-white hover:opacity-90',
    outline: 'bg-transparent border border-[color:var(--teal)] text-[color:var(--teal)] hover:bg-[color:var(--teal)] hover:text-white',
  }
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base', xl: 'px-9 py-4 text-lg' }
  return (
    <motion.button
      type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${vars[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: "'DM Sans',sans-serif", ...style }}
      whileHover={{ scale: disabled ? 1 : 1.02 }} whileTap={{ scale: disabled ? 1 : 0.97 }}
    >{children}</motion.button>
  )
}

// ── GlassCard ──────────────────────────────────────
export function GlassCard({ children, className = '', glow = false, onClick, hover = true, style = {} }) {
  return (
    <motion.div
      className={`glass-card ${glow ? 'teal-glow' : ''} p-5 ${className}`}
      onClick={onClick}
      whileHover={hover && onClick ? { y: -4, borderColor: 'rgba(255,255,255,0.2)' } : {}}
      style={style}
    >{children}</motion.div>
  )
}

// ── Progress Ring SVG ──────────────────────────────
export function Ring({ value = 0, color = '#00d4aa', size = 80, stroke = 7, label, sub }) {
  const safeSize = Number(size) || 80
  const safeStroke = Number(stroke) || 7

  const r = (safeSize - safeStroke) / 2

  if (r <= 0 || Number.isNaN(r)) {
    return null
  }
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <div style={{ position: 'relative', width: safeSize, height: safeSize, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={safeSize} height={safeSize}>
        <circle cx={safeSize/2} cy={safeSize/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={safeStroke} />
        <motion.circle cx={safeSize/2} cy={safeSize/2} r={r} fill="none" stroke={color} strokeWidth={safeStroke}
          strokeDasharray={c} strokeLinecap="round" transform={`rotate(-90 ${safeSize/2} ${safeSize/2})`}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: 'easeOut' }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1.2 }}>
        {label && <div style={{ fontFamily: "'Syne',sans-serif", fontSize: safeSize > 75 ? 17 : 13, fontWeight: 800, color }}>{label}</div>}
        {sub && <div style={{ fontSize: 10, color: 'var(--text2)' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────
export function StatCard({ value, label, delta, color = '#00d4aa', icon, loading = false }) {
  if (loading) return <div className="glass-card p-5"><div className="skeleton h-8 w-24 mb-2" /><div className="skeleton h-4 w-16" /></div>
  return (
    <GlassCard>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 24 }}>{icon}</div>
        {delta && <span className="badge badge-teal" style={{ fontSize: 11 }}>{delta}</span>}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
    </GlassCard>
  )
}

// ── Skeleton loader ────────────────────────────────
export function Skel({ h = 20, w = '100%', className = '' }) {
  return <div className={`skeleton ${className}`} style={{ height: h, width: w, borderRadius: 8 }} />
}

// ── Bar chart mini ─────────────────────────────────
export function MiniBar({ data, maxVal, getColor, height = 100, showLabel = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((item, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <motion.div
            style={{ width: '100%', borderRadius: '4px 4px 0 0', background: getColor(item), minHeight: 4 }}
            initial={{ height: 0 }} animate={{ height: `${(item.value / maxVal) * (height - 20)}px` }}
            transition={{ duration: 1, delay: i * 0.05, ease: 'easeOut' }}
          />
          {showLabel && <div style={{ fontSize: 9, color: 'var(--text3)', whiteSpace: 'nowrap' }}>{item.label}</div>}
        </div>
      ))}
    </div>
  )
}

// ── Alert item ─────────────────────────────────────
export function AlertItem({ alert }) {
  const color = alert.severity === 'high' ? 'red' : 'amber'
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `var(--${color === 'red' ? 'red' : 'amber'})22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
        {alert.type === 'missed' ? '⏰' : alert.type === 'pain' ? '🔴' : '📐'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{alert.patient}</div>
        <div style={{ fontSize: 12, color: `var(--${color})` }}>{alert.message}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{alert.time}</div>
      </div>
      <Badge color={color}>{alert.severity}</Badge>
    </div>
  )
}

// ── Avatar circle ──────────────────────────────────
export function Avatar({ initials, size = 36, color = '#00d4aa' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg,${color},#4a9eff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

// ── Input ──────────────────────────────────────────
export function Input({ label, type = 'text', value, onChange, placeholder, icon, required = false, autoComplete, min, max, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{label}{required && <span style={{ color: 'var(--red)' }}> *</span>}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text3)' }}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} min={min} max={max} step={step}
          style={{
            width: '100%', padding: icon ? '12px 14px 12px 42px' : '12px 14px',
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12,
            color: 'var(--text)', fontSize: 14, fontFamily: "'DM Sans',sans-serif",
            outline: 'none', transition: 'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--teal)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>
    </div>
  )
}

// ── Loading spinner ────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `3px solid var(--bg3)`, borderTopColor: 'var(--teal)', animation: 'spin 0.8s linear infinite' }} />
  )
}

// ── Page wrapper ───────────────────────────────────
export function PageTitle({ title, subtitle, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--text2)', fontSize: 14 }}>{subtitle}</p>}
      {children}
    </div>
  )
}

// ── Status color helper ────────────────────────────
export const statusColor = s =>
  s === 'On Track' ? 'green' : s === 'At Risk' ? 'red' : s === 'completed' || s === 'confirmed' ? 'teal' : 'amber'
