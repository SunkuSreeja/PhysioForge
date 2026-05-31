import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge, GlassCard } from '../../components/ui'
import { feedCards } from '../../data/mockData'

const filterTabs = ['All', 'Posture Tips', 'Common Mistakes', 'Recovery Science', 'Pain Management', 'Success Stories']

export default function FeedPage() {
  const [active, setActive] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [saved, setSaved] = useState([])

  const shown = active === 'All' ? feedCards : feedCards.filter(c => c.tag === active)

  const colorMap = { teal: '#00d4aa', red: '#ff6b7a', blue: '#4a9eff', amber: '#fbbf24', green: '#34d399', purple: '#a78bfa' }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Recovery Feed</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Expert-curated micro-guidance. Scroll through posture tips, recovery science, and patient stories.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {filterTabs.map(t => (
          <button key={t} onClick={() => setActive(t)}
            style={{ whiteSpace: 'nowrap', padding: '7px 16px', borderRadius: 100, border: `1px solid ${active === t ? 'var(--teal)' : 'var(--border)'}`, background: active === t ? 'rgba(0,212,170,.12)' : 'var(--bg3)', color: active === t ? 'var(--teal)' : 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            {t}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {shown.map((card, i) => {
          const c = colorMap[card.color] || 'var(--teal)'
          const isSaved = saved.includes(card.id)
          return (
            <motion.div key={card.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}
              whileHover={{ y: -5, boxShadow: `0 12px 40px ${c}20` }}
              style={{ background: 'linear-gradient(135deg,var(--bg3),var(--bg2))', border: `1px solid ${expanded === card.id ? c : 'var(--border)'}`, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s' }}
              onClick={() => setExpanded(expanded === card.id ? null : card.id)}>
              <div style={{ padding: '22px 22px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <Badge color={card.color} style={{ fontSize: 11 }}>{card.tag}</Badge>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={e => { e.stopPropagation(); setSaved(s => isSaved ? s.filter(id => id !== card.id) : [...s, card.id]) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: isSaved ? '#fbbf24' : 'var(--text3)' }}>
                      {isSaved ? '★' : '☆'}
                    </button>
                    <span style={{ fontSize: 24 }}>{card.icon}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>{card.title}</h3>
                <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7 }}>{card.body}</p>

                <AnimatePresence>
                  {expanded === card.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                        <strong style={{ color: 'var(--text)' }}>Key takeaway: </strong>
                        Apply this consistently for 3–4 weeks to see measurable improvement. Your PhysioAI coach has been notified to integrate this guidance into your next session.
                        <br /><br />
                        <strong style={{ color: c }}>PhysioAI tip: </strong>
                        Ask your AI voice coach about this topic during your next exercise session for real-time application.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', padding: '10px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>⏱ {card.readTime}</span>
                <span style={{ fontSize: 12, color: c }}>{expanded === card.id ? 'Show less ↑' : 'Read more →'}</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {shown.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No cards in this category</div>
          <div>Try a different filter above.</div>
        </div>
      )}
    </div>
  )
}
