/**
 * AnalyticsCharts.jsx
 * Reusable chart wrappers for PhysioForge analytics — all themed to CSS vars.
 */
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ── Shared tooltip style ──────────────────────────────────────────────────────
export const TT = {
  contentStyle: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,.4)',
  },
  cursor: { stroke: 'var(--border2)' },
}

// ── Animated number ───────────────────────────────────────────────────────────
export function AnimNum({ value, suffix = '', prefix = '', color, style = {} }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .4 }}
      style={{ color, fontFamily: "'Syne',sans-serif", fontWeight: 800, ...style }}
    >
      {prefix}{value}{suffix}
    </motion.span>
  )
}

// ── Delta badge (shows +12% / -5%) ────────────────────────────────────────────
export function DeltaBadge({ delta, invertColors = false }) {
  if (delta === null || delta === undefined) return null
  const up = delta >= 0
  const good = invertColors ? !up : up   // for pain: down is good
  const color = good ? 'var(--teal)' : 'var(--red)'
  const bg    = good ? 'rgba(0,212,170,.1)' : 'rgba(255,107,122,.1)'
  const border= good ? 'rgba(0,212,170,.2)' : 'rgba(255,107,122,.2)'
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
      background: bg, border: `1px solid ${border}`, color, flexShrink: 0,
    }}>
      {up ? '↑' : '↓'} {Math.abs(delta)}%
    </span>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────
export function ChartCard({ title, subtitle, children, badge, style = {} }) {
  return (
    <div style={{
      background: 'var(--glass)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '18px 20px', ...style,
    }}>
      {(title || badge) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          {badge}
        </div>
      )}
      {children}
    </div>
  )
}

// ── KPI stat tile ─────────────────────────────────────────────────────────────
export function KpiTile({ icon, value, label, color, delta, invertDelta = false, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--glass)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '16px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        {delta !== undefined && delta !== null && (
          <DeltaBadge delta={delta} invertColors={invertDelta} />
        )}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </motion.div>
  )
}

// ── Horizontal mini bar (for simple % bars) ───────────────────────────────────
export function MiniBar({ label, value, max = 100, color = '#00d4aa', suffix = '' }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  )
}

// ── Score ring (animated SVG) ─────────────────────────────────────────────────
export function ScoreRing({ value = 0, color = '#00d4aa', size = 80, stroke = 7, label, sub, glow = false }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.min(100, value) / 100) * c
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ filter: glow ? `drop-shadow(0 0 6px ${color}60)` : 'none' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1.2 }}>
        {label && <div style={{ fontFamily: "'Syne',sans-serif", fontSize: size > 75 ? 17 : 13, fontWeight: 800, color }}>{label}</div>}
        {sub   && <div style={{ fontSize: 10, color: 'var(--text2)' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ── Gradient area chart ───────────────────────────────────────────────────────
export function GradientAreaChart({ data, dataKey, color, height = 140, name, yDomain }) {
  const gradId = `grad_${dataKey}_${color.replace('#','')}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
        {yDomain && <YAxis domain={yDomain} hide />}
        <Tooltip {...TT} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
          fill={`url(#${gradId})`} dot={false} name={name} connectNulls />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Bar chart with rounded tops ───────────────────────────────────────────────
export function RoundedBarChart({ data, dataKey, color, height = 140, name, secondKey, secondColor }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TT} />
        <Bar dataKey={dataKey} fill={color} radius={[4,4,0,0]} name={name} maxBarSize={28} />
        {secondKey && (
          <Bar dataKey={secondKey} fill={secondColor} radius={[4,4,0,0]} name={secondKey} maxBarSize={28} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Thin trend line ───────────────────────────────────────────────────────────
export function TrendLine({ data, dataKey, color, height = 120, name, referenceValue }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
        <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TT} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
          dot={{ fill: color, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, stroke: color, strokeWidth: 2, fill: 'var(--bg)' }}
          name={name} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── Donut chart ───────────────────────────────────────────────────────────────
export function DonutChart({ data, colors, height = 140, innerLabel, innerSub }) {
  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
            dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip {...TT} />
        </PieChart>
      </ResponsiveContainer>
      {innerLabel && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)', textAlign: 'center', lineHeight: 1.2,
        }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: colors[0] }}>{innerLabel}</div>
          {innerSub && <div style={{ fontSize: 10, color: 'var(--text3)' }}>{innerSub}</div>}
        </div>
      )}
    </div>
  )
}

// ── Stacked month bar ─────────────────────────────────────────────────────────
export function MonthlyStackBar({ data, height = 140 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...TT} />
        <Bar dataKey="exercises" fill="#00d4aa" radius={[4,4,0,0]} name="Exercises" maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Heatmap row ───────────────────────────────────────────────────────────────
export function ActivityHeatmap({ data, cols = 7 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 3 }}>
      {data.map((cell, i) => {
        const level = cell.count === 0 ? 0 : cell.count < 2 ? 1 : cell.count < 5 ? 2 : 3
        const bg = level === 0 ? 'var(--bg4)' : level === 1 ? 'rgba(0,212,170,.2)' : level === 2 ? 'rgba(0,212,170,.5)' : 'var(--teal)'
        const isFuture = new Date(cell.date) > new Date()
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: .6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * .007 }}
            title={`${cell.date}: ${cell.count} events`}
            style={{ aspectRatio: 1, borderRadius: 3, background: isFuture ? 'var(--bg3)' : bg, cursor: 'default' }}
          />
        )
      })}
    </div>
  )
}

// ── Pain mood chip ────────────────────────────────────────────────────────────
const MOOD_COLORS = { comfortable: '#34d399', mildPain: '#a3e635', moderate: '#fbbf24', severe: '#ff6b7a' }
const MOOD_LABELS = { comfortable: 'Comfortable', mildPain: 'Mild Pain', moderate: 'Moderate', severe: 'Severe' }

export function MoodChip({ mood }) {
  const c = MOOD_COLORS[mood] || 'var(--text2)'
  return (
    <span style={{ padding: '3px 10px', borderRadius: 100, background: c + '20', color: c, border: `1px solid ${c}40`, fontSize: 12, fontWeight: 600 }}>
      {MOOD_LABELS[mood] || mood}
    </span>
  )
}

// ── Trend arrow ───────────────────────────────────────────────────────────────
export function TrendArrow({ trend, labels = { improving: '↓ Improving', worsening: '↑ Worsening', stable: '→ Stable' } }) {
  const colors = { improving: 'var(--teal)', worsening: 'var(--red)', stable: 'var(--text2)' }
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: colors[trend] || 'var(--text2)' }}>
      {labels[trend] || trend}
    </span>
  )
}

// ── Consistency grade badge ───────────────────────────────────────────────────
export function GradeBadge({ grade }) {
  const colors = { A: '#00d4aa', B: '#4a9eff', C: '#fbbf24', D: '#fb923c', F: '#ff6b7a' }
  const c = colors[grade] || 'var(--text2)'
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 12, background: c + '20',
      border: `2px solid ${c}`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: "'Syne',sans-serif",
      fontWeight: 900, fontSize: 22, color: c, flexShrink: 0,
    }}>
      {grade}
    </div>
  )
}
