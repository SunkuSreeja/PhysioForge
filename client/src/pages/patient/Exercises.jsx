import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useLang } from '../../i18n'
import { mockExercises } from '../../data/mockData'
import { useAnalytics } from '../../context/AnalyticsContext'

const filters = ['All', 'mobility', 'strength', 'flexibility', 'balance']

export default function ExercisesPage() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [completed, setCompleted] = useState(new Set())
  const [startTimes, setStartTimes] = useState({})
  const navigate = useNavigate()
  const { logExerciseStarted, logExerciseCompleted, stats } = useAnalytics()
  const { t } = useLang()

  const todayStats = stats?.exercises

  const shown = useMemo(() =>
    filter === 'All' ? mockExercises : mockExercises.filter(e => e.category === filter),
    [filter]
  )

  const handleStart = useCallback((e, ex) => {
    e.stopPropagation()
    logExerciseStarted(ex.id, ex.name, ex.category)
    setStartTimes(t => ({ ...t, [ex.id]: Date.now() }))
    // Navigate to posture page with exercise context
    navigate('/patient/posture', {
      state: {
        exercise: ex.name,
        painArea: ex.bodyPart?.[0] || null,
        exerciseId: ex.id,
        category: ex.category,
      }
    })
  }, [navigate, logExerciseStarted])

  const handleMarkDone = useCallback((e, ex) => {
    e.stopPropagation()
    const elapsed = startTimes[ex.id] ? Math.round((Date.now() - startTimes[ex.id]) / 1000) : ex.duration || 300
    logExerciseCompleted(ex.id, ex.name, elapsed, ex.postureScore || null)
    setCompleted(s => new Set([...s, ex.id]))
  }, [startTimes, logExerciseCompleted])

  const completedCount = completed.size
  const totalToday = 4

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t('exerciseLibrary')}</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {completedCount} of {totalToday} completed today
            {todayStats?.totalMinutes > 0 && ` · ${todayStats.totalMinutes} min total`}
          </p>
        </div>
        <Btn variant="primary" onClick={() => navigate('/patient/posture', { state: { exercise: null } })}>{t('startAiSession')}</Btn>
      </div>

      {/* Today plan summary */}
      <GlassCard style={{ marginBottom: 24, background: 'linear-gradient(135deg,rgba(0,212,170,.07),rgba(74,158,255,.04))', borderColor: 'rgba(0,212,170,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>📋 Today's Prescription</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>From Dr. Arjun Sharma · ACL Rehab Week 3</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { v: totalToday, l: 'Exercises' },
              { v: completedCount, l: 'Completed' },
              { v: todayStats?.totalMinutes ? `${todayStats.totalMinutes}m` : '—', l: 'Duration' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(completedCount / totalToday) * 100}%` }}
            transition={{ duration: .7 }}
            style={{ height: '100%', background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 3 }} />
        </div>
        {completedCount === totalToday && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 10, color: 'var(--teal)', fontWeight: 600, fontSize: 13 }}>
            🎉 All exercises completed today! Great work!
          </motion.div>
        )}
      </GlassCard>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              whiteSpace: 'nowrap', padding: '7px 16px', borderRadius: 100,
              border: `1px solid ${filter === f ? 'var(--teal)' : 'var(--border)'}`,
              background: filter === f ? 'rgba(0,212,170,.12)' : 'var(--bg3)',
              color: filter === f ? 'var(--teal)' : 'var(--text2)',
              fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textTransform: 'capitalize',
              transition: 'all .15s',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        <AnimatePresence mode="popLayout">
          {shown.map((ex, i) => {
            const isDone = completed.has(ex.id) || ex.completed
            const isInProgress = startTimes[ex.id] && !isDone
            return (
              <motion.div key={ex.id} layout
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }}
                transition={{ delay: i * .05 }}
                onClick={() => setSelected(selected === ex.id ? null : ex.id)}
                whileHover={{ y: -3 }}
                style={{
                  background: 'var(--glass)',
                  border: `1px solid ${isDone ? 'rgba(0,212,170,.4)' : isInProgress ? 'rgba(74,158,255,.4)' : 'var(--border)'}`,
                  borderRadius: 20, padding: 20, cursor: 'pointer',
                  transition: 'border-color .2s, box-shadow .2s',
                  boxShadow: isDone ? '0 0 0 1px rgba(0,212,170,.1)' : 'none',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: isDone
                        ? 'linear-gradient(135deg,var(--teal),var(--blue))'
                        : isInProgress ? 'linear-gradient(135deg,#4a9eff40,#4a9eff20)' : 'var(--bg3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      border: isInProgress ? '1px solid rgba(74,158,255,.4)' : 'none',
                      transition: 'all .3s',
                    }}>
                      {isDone ? '✓' : isInProgress ? '▶' : ex.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{ex.category}</div>
                    </div>
                  </div>
                  <Badge
                    color={ex.difficulty === 'easy' ? 'green' : ex.difficulty === 'medium' ? 'amber' : 'red'}
                    style={{ fontSize: 10 }}>
                    {ex.difficulty}
                  </Badge>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>{ex.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <Badge color="blue" style={{ fontSize: 10 }}>⏱ {ex.duration / 60}min</Badge>
                  <Badge color="teal" style={{ fontSize: 10 }}>{ex.sets}×{ex.reps}</Badge>
                  {ex.bodyPart.map(p => <Badge key={p} color="purple" style={{ fontSize: 10 }}>{p}</Badge>)}
                </div>

                {/* Expanded instructions */}
                <AnimatePresence>
                  {selected === ex.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Instructions:</div>
                        {ex.instructions.map((step, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
                            <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>{idx + 1}.</span> {step}
                          </div>
                        ))}
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: 'var(--amber)' }}>⚠ Key Points:</div>
                          {ex.keyPoints.map((kp, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>• {kp}</div>
                          ))}
                        </div>
                        {ex.postureScore && (
                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Last posture score:</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{ex.postureScore}%</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          {!isDone && (
                            <Btn variant="primary" size="sm"
                              onClick={(e) => handleMarkDone(e, ex)}
                              style={{ flex: 1, justifyContent: 'center' }}>
                              ✓ Mark Done
                            </Btn>
                          )}
                          <Btn variant={isDone ? 'primary' : 'outline'} size="sm"
                            onClick={(e) => handleStart(e, ex)}
                            style={{ flex: 1, justifyContent: 'center' }}>
                            🎯 AI Guidance
                          </Btn>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick mark done button */}
                {!isDone && selected !== ex.id && (
                  <motion.button
                    onClick={(e) => handleMarkDone(e, ex)}
                    whileHover={{ background: 'rgba(0,212,170,.15)' }}
                    style={{
                      width: '100%', padding: '7px', borderRadius: 10,
                      border: '1px dashed rgba(0,212,170,.3)', background: 'transparent',
                      color: 'var(--teal)', fontSize: 12, cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif", transition: 'all .15s',
                    }}>
                    ✓ Mark Complete
                  </motion.button>
                )}
                {isDone && (
                  <div style={{ padding: '7px', textAlign: 'center', borderRadius: 10,
                    background: 'rgba(0,212,170,.1)', color: 'var(--teal)', fontSize: 12, fontWeight: 600 }}>
                    ✅ Completed
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
