import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useLang } from '../../i18n'
import { remediesData, painAreas } from '../../data/remedies'
import { lsSet } from '../../context/PWAContext'
import RemedyVideo from '../../components/RemedyVideo'
import { useAnalytics } from '../../context/AnalyticsContext'

const TYPE_ICONS = {
  'Heat Therapy': '🔥',
  'Cold Therapy': '🧊',
  'Ayurvedic Remedy': '🌿',
  'Topical Remedy': '🌿',
  'Gentle Movement': '🧘',
  'Exercise': '💪',
  'Stretch': '🤸',
  'Stretching': '🤸',
  'First Aid': '🚑',
  'Massage Therapy': '💆',
  'Ayurvedic Massage': '💆',
  'Soak Therapy': '🛁',
  'Dietary Remedy': '🥗',
  'Movement Therapy': '🔄',
  'Contrast Therapy': '🌡️',
  'Yoga Movement': '🧘',
  'Posture/Prevention': '🪑',
  'Prevention': '🪑',
  'Gentle Stretch': '🤸',
}

const TYPE_COLORS = {
  'Heat Therapy':     '#ff6b7a',
  'Cold Therapy':     '#60a5fa',
  'Ayurvedic Remedy': '#34d399',
  'Topical Remedy':   '#34d399',
  'Gentle Movement':  '#00d4aa',
  'Exercise':         '#00d4aa',
  'Stretch':          '#a78bfa',
  'Stretching':       '#a78bfa',
  'First Aid':        '#4a9eff',
  'Massage Therapy':  '#fb923c',
  'Ayurvedic Massage':'#fb923c',
  'Soak Therapy':     '#818cf8',
  'Dietary Remedy':   '#34d399',
  'Movement Therapy': '#fbbf24',
  'Contrast Therapy': '#60a5fa',
  'Yoga Movement':    '#a78bfa',
  'Posture/Prevention':'#94a3b8',
  'Prevention':       '#94a3b8',
  'Gentle Stretch':   '#a78bfa',
}

function RemedyCard({ remedy, index, painColor, onView, onComplete }) {
  const [expanded, setExpanded] = useState(false)
  const [completed, setCompleted] = useState(false)
  const typeColor = TYPE_COLORS[remedy.type] || painColor || '#00d4aa'
  const typeIcon = TYPE_ICONS[remedy.type] || '💊'

  const handleToggle = () => {
    const next = !expanded
    setExpanded(next)
    if (next) onView?.(remedy)
  }

  const handleComplete = (e) => {
    e.stopPropagation()
    setCompleted(true)
    onComplete?.(remedy)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4, boxShadow: `0 16px 40px ${typeColor}25` }}
      onClick={handleToggle}
      style={{
        background: 'var(--glass)',
        border: `1.5px solid ${completed ? 'rgba(0,212,170,.5)' : expanded ? typeColor : 'var(--border)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color .2s, box-shadow .2s',
      }}
    >
      {/* Animated instructional video */}
      <div style={{
        position: 'relative',
        borderBottom: `1px solid ${typeColor}25`,
        overflow: 'hidden',
        borderRadius: '18px 18px 0 0',
        background: '#0a0f1e',
      }}>
        <RemedyVideo
          title={remedy.title}
          type={remedy.type}
          color={typeColor}
          width={560}
          height={180}
        />
        <div style={{
          position: 'absolute', top: 8, left: 10,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(0,0,0,0.55)', borderRadius: 20,
          padding: '3px 9px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: typeColor,
            boxShadow: `0 0 6px ${typeColor}`,
            animation: 'ra-pulse 1.4s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: typeColor, letterSpacing: 1 }}>DEMO</span>
        </div>
      </div>

      {/* Card header */}
      <div style={{ padding: '14px 20px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            {/* Type badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 100, fontSize: 11,
              background: `${typeColor}18`, color: typeColor,
              border: `1px solid ${typeColor}30`, marginBottom: 8,
            }}>
              {typeIcon} {remedy.type}
            </span>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>
              {remedy.title}
            </h3>
          </div>
          <span style={{ fontSize: 28, flexShrink: 0 }}>{remedy.icon}</span>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.65 }}>{remedy.benefit}</p>
      </div>

      {/* Expandable steps */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ paddingTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: typeColor }}>
                  Step-by-step:
                </div>
                {remedy.steps.map((step, si) => (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: si * 0.06 }}
                    style={{
                      display: 'flex', gap: 10, fontSize: 13, color: 'var(--text2)',
                      marginBottom: 8, lineHeight: 1.6, alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: `${typeColor}22`, color: typeColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    }}>{si + 1}</div>
                    {step}
                  </motion.div>
                ))}
                <div style={{
                  marginTop: 12, padding: '10px 14px',
                  background: 'rgba(255,107,122,.07)', border: '1px solid rgba(255,107,122,.2)',
                  borderRadius: 10, fontSize: 12, color: 'var(--text2)',
                }}>
                  <span style={{ color: 'var(--red)', fontWeight: 600 }}>⚠ Caution: </span>
                  {remedy.caution}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer toggle */}
      <div style={{
        padding: '10px 20px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          Tap to {expanded ? 'collapse' : 'see steps'}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {expanded && !completed && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={handleComplete}
              style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(0,212,170,.4)',
                background: 'rgba(0,212,170,.1)', color: 'var(--teal)', fontSize: 11,
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              ✓ Done
            </motion.button>
          )}
          {completed && <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600 }}>✅ Completed</span>}
          <span style={{ fontSize: 13, color: typeColor, fontWeight: 600 }}>
            {expanded ? '↑ Less' : '↓ Steps'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function RemediesPage() {
  const { t, lang } = useLang()
  const { logRemedyViewed, logRemedyCompleted } = useAnalytics()

  // Cache remedies data for offline access on first load
  useEffect(() => {
    lsSet('remedies_data', { remediesData: Object.keys(remediesData), painAreas })
  }, [])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')

  const handleRemedyView = useCallback((remedy, areaName) => {
    logRemedyViewed(
      remedy.title.replace(/\s/g, '_').toLowerCase(),
      remedy.title,
      areaName || selected,
      remedy.type
    )
  }, [logRemedyViewed, selected])

  const handleRemedyComplete = useCallback((remedy, areaName) => {
    logRemedyCompleted(
      remedy.title.replace(/\s/g, '_').toLowerCase(),
      remedy.title,
      areaName || selected
    )
  }, [logRemedyCompleted, selected])

  const area = selected ? remediesData[selected] : null
  const painArea = selected ? painAreas.find(p => p.key === selected) : null

  // Collect all unique remedy types for filter tabs
  const allTypes = useMemo(() => {
    if (!area) return []
    const types = [...new Set(area.remedies.map(r => r.type))]
    return ['All', ...types]
  }, [area])

  // Filter remedies by search + type
  const filteredRemedies = useMemo(() => {
    if (!area) return []
    return area.remedies.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.benefit.toLowerCase().includes(q) ||
        r.steps.some(s => s.toLowerCase().includes(q))
      const matchType = filterType === 'All' || r.type === filterType
      return matchSearch && matchType
    })
  }, [area, search, filterType])

  // When pain area changes, reset filters
  const handleSelectPain = (key) => {
    setSelected(prev => prev === key ? null : key)
    setSearch('')
    setFilterType('All')
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: 'linear-gradient(135deg,#34d399,#00d4aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            boxShadow: '0 8px 24px rgba(0,212,170,.3)',
          }}>🌿</div>
          <div>
            <h1 style={{
              fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 2,
              background: 'linear-gradient(135deg,#34d399,#00d4aa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{t('remediesTitle')}</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>{t('remediesSubtitle')}</p>
          </div>
        </div>

        {/* Disclaimer banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(251,191,36,.07)',
            border: '1px solid rgba(251,191,36,.3)',
            borderRadius: 14, padding: '14px 18px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>⚕️</span>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--amber)', fontSize: 14 }}>
              Temporary relief only. Consult doctor if pain persists.
            </strong>
            <br />
            These suggestions complement but do not replace prescribed physiotherapy or medical treatment.
          </div>
        </motion.div>
      </motion.div>

      {/* ── Pain area selector ─────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14, color: 'var(--text)' }}>
          {t('selectPainArea')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {painAreas.map((pa, i) => {
            const data = remediesData[pa.key]
            const label = data.label[lang] || data.label.en
            const isSelected = selected === pa.key
            return (
              <motion.div
                key={pa.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleSelectPain(pa.key)}
                whileHover={{ y: -5, borderColor: pa.color }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: isSelected ? `${pa.color}15` : 'var(--glass)',
                  border: `2px solid ${isSelected ? pa.color : 'var(--border)'}`,
                  borderRadius: 18, padding: '20px 12px', textAlign: 'center',
                  cursor: 'pointer', transition: 'border-color .2s, background .2s',
                  boxShadow: isSelected ? `0 8px 24px ${pa.color}25` : 'none',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>{pa.icon}</div>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700,
                  color: isSelected ? pa.color : 'var(--text)', lineHeight: 1.3,
                }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
                  {data.remedies.length} remedies
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Remedies section ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {area && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Section heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28 }}>{painArea?.icon}</span>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>
                {t('remediesFor')} {area.label[lang] || area.label.en}
              </h2>
              <Badge color="green" style={{ marginLeft: 'auto' }}>
                {filteredRemedies.length}/{area.remedies.length} remedies
              </Badge>
            </div>

            {/* ── Search bar ──────────────────────────────────────── */}
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                fontSize: 16, pointerEvents: 'none', color: 'var(--text3)',
              }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search ${area.label.en} remedies… (e.g. turmeric, ice, stretch)`}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 16px 12px 44px',
                  background: 'var(--glass)', border: '1.5px solid var(--border)',
                  borderRadius: 14, fontSize: 14, color: 'var(--text)',
                  fontFamily: "'DM Sans',sans-serif",
                  outline: 'none', transition: 'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor = painArea?.color || 'var(--teal)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                    color: 'var(--text3)', padding: '4px 6px',
                  }}
                >✕</button>
              )}
            </div>

            {/* ── Type filter chips ───────────────────────────────── */}
            {allTypes.length > 2 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {allTypes.map(type => {
                  const isActive = filterType === type
                  const tc = type === 'All' ? (painArea?.color || '#00d4aa') : (TYPE_COLORS[type] || '#00d4aa')
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      style={{
                        padding: '6px 14px', borderRadius: 100, fontSize: 12,
                        border: `1.5px solid ${isActive ? tc : 'var(--border)'}`,
                        background: isActive ? `${tc}18` : 'var(--glass)',
                        color: isActive ? tc : 'var(--text2)',
                        cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                        fontWeight: isActive ? 700 : 400,
                        transition: 'all .15s',
                      }}
                    >
                      {type === 'All' ? '✦ All' : `${TYPE_ICONS[type] || ''} ${type}`}
                    </button>
                  )
                })}
              </div>
            )}

            {/* ── Cards grid ─────────────────────────────────────── */}
            {filteredRemedies.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
                {filteredRemedies.map((remedy, i) => (
                  <RemedyCard key={`${selected}-${remedy.title}`} remedy={remedy} index={i} painColor={painArea?.color} onView={(r) => handleRemedyView(r, selected)} onComplete={(r) => handleRemedyComplete(r, selected)} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text2)' }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  No remedies found
                </div>
                <div style={{ fontSize: 13 }}>Try a different search term or clear the filter</div>
                <button
                  onClick={() => { setSearch(''); setFilterType('All') }}
                  style={{
                    marginTop: 14, padding: '8px 20px', borderRadius: 10,
                    background: `${painArea?.color}18`, border: `1px solid ${painArea?.color}40`,
                    color: painArea?.color, cursor: 'pointer', fontSize: 13,
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >Clear filters</button>
              </motion.div>
            )}

            {/* ── CTA strip ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 28,
                background: 'linear-gradient(135deg,rgba(74,158,255,.08),rgba(74,158,255,.04))',
                border: '1px solid rgba(74,158,255,.2)', borderRadius: 18, padding: '20px 24px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>📋 Prescribed exercises are more effective</div>
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                  Home remedies provide temporary relief. Your PhysioForge exercise plan addresses the root cause.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="primary" size="sm" onClick={() => window.location.href = '/patient/exercises'}>
                  View Exercises →
                </Btn>
                <Btn variant="ghost" size="sm" onClick={() => window.location.href = '/patient/teleconsult'}>
                  Book Consult
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty / landing state ─────────────────────────────────── */}
      {!selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 64, marginBottom: 18 }}
          >🌿</motion.div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800,
            color: 'var(--text)', marginBottom: 10,
          }}>
            Select a pain area above
          </div>
          <div style={{ fontSize: 14, maxWidth: 380, margin: '0 auto', lineHeight: 1.75 }}>
            PhysioForge will show you safe, evidence-based home remedies, Ayurvedic treatments,
            hot/cold therapy tips, and step-by-step stretching guidance for temporary pain relief.
          </div>

          {/* Quick preview chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
            {['🌿 Turmeric paste', '🧊 Ice compression', '🔥 Warm cloth', '🍃 Neem leaf wrap', '🛁 Epsom salt soak'].map(tag => (
              <span key={tag} style={{
                padding: '5px 14px', borderRadius: 100, fontSize: 12,
                background: 'rgba(0,212,170,.08)', border: '1px solid rgba(0,212,170,.2)',
                color: 'var(--teal)',
              }}>{tag}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
