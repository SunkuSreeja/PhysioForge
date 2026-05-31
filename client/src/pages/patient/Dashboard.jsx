import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../i18n'
import { GlassCard, Ring, Badge, Btn, Skel } from '../../components/ui'
import { weeklyData, mockExercises, recoveryJourney } from '../../data/mockData'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { useAnalytics } from '../../context/AnalyticsContext'
import ReminderWidget from '../../components/ReminderWidget'
import { processMessage } from '../../components/ai/physioAI'

const painMoods = [
  { emoji:'😊', key:'comfortable', color:'#34d399' },
  { emoji:'🙂', key:'mildPain',    color:'#a3e635' },
  { emoji:'😐', key:'moderate',    color:'#fbbf24' },
  { emoji:'😟', key:'severe',      color:'#ff6b7a' },
]

const aiReplies = {
  "Why is my knee sore?": "Your left knee shows 12° of valgus during squats — tight IT band likely. I recommend adding clamshell exercises today.",
  "Am I recovering fast enough?": "You are 3 days ahead of your predicted timeline! Pain dropped from 8→3 in 18 days — excellent progress.",
  "What should I skip today?": "Based on pain 3/10, I suggest skipping Quadriceps Strengthening and doing Ankle Circles instead.",
  "Adjust intensity": "Done! Reduced today's session by 20%. Quality over quantity — proper form builds lasting recovery.",
}

export default function PatientDashboard() {
  const { user, elderMode } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const { logCheckIn, todayCheckIn, stats } = useAnalytics()
  const [loading, setLoading] = useState(true)
  const [painSelected, setPainSelected] = useState(null)
  const [checkedIn, setCheckedIn] = useState(false)
  const [aiMsg, setAiMsg] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t) }, [])

  // Sync check-in from analytics
  useEffect(() => {
    if (todayCheckIn) { setPainSelected(todayCheckIn.painMood); setCheckedIn(true) }
  }, [todayCheckIn])

  const handlePain = (p) => {
    setPainSelected(p)
    setTimeout(() => { setCheckedIn(true); logCheckIn(p.key) }, 350)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const q = chatInput; setChatInput('')
    setChatHistory(h => [...h, { role:'user', text:q }])
    setTimeout(() => {
      // Use the real AI engine, falling back to quick replies
      let resp
      if (aiReplies[q]) {
        resp = aiReplies[q]
      } else {
        try {
          const result = processMessage(q, lang, user?.name?.split(' ')[0] || '')
          resp = result.text
        } catch {
          resp = `I understand you asked: "${q}". Based on your recovery data, I recommend checking the Relief Remedies section and today's exercise plan. Your pain has been trending downward — keep going! 💪`
        }
      }
      setChatHistory(h => [...h, { role:'ai', text:resp }])
    }, 400)
  }

  // Real analytics data
  const streak = stats?.streak?.currentStreak || 0
  const totalSessions = stats?.exercises?.total || 0
  const postureAvg = stats?.posture?.avgScore || 0

  /* ── ELDER MODE layout ───────────────────────────────────────────────────── */
  if (elderMode) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:28, fontWeight:700, fontFamily:"'Syne',sans-serif", marginBottom:6 }}>
              {t('goodMorning')}, {user?.name?.split(' ')[0]} 🙏
            </div>
            <div style={{ color:'var(--text2)', fontSize:16 }}>{t('dayOf').replace('%d', '18')}</div>
          </div>

          {/* Big start button */}
          <motion.button animate={{ scale:[1,1.02,1] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
            onClick={() => navigate('/patient/posture')} whileTap={{ scale:.97 }}
            style={{ width:'100%', background:'linear-gradient(135deg,var(--teal),var(--blue))', border:'none', borderRadius:24, padding:'36px 24px', color:'#fff', cursor:'pointer', textAlign:'center', marginBottom:18 }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🏃</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, marginBottom:6 }}>{t('startExercises')}</div>
            <div style={{ fontSize:16, opacity:.85 }}>Start Today's Exercise</div>
            <div style={{ marginTop:10, fontSize:14, opacity:.7 }}>4 exercises · ~28 minutes</div>
          </motion.button>

          {/* Elder quick grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
            {[
              { icon:'🌿', label:t('remedies'), sub:'Home Remedies', to:'/patient/remedies', color:'#34d399' },
              { icon:'🆘', label:t('emergency'), sub:'Emergency', to:'/patient/emergency', color:'#ff6b7a' },
              { icon:'🎙️', label:t('voiceTherapist'), sub:'Voice Guide', action:()=>document.querySelector('button[aria-label="voice"]')?.click(), color:'#4a9eff' },
              { icon:'👨‍⚕️', label:t('teleconsult'), sub:'My Doctor', to:'/patient/teleconsult', color:'#a78bfa' },
            ].map((b, i) => (
              <motion.button key={i} onClick={() => b.to ? navigate(b.to) : b.action?.()}
                whileHover={{ borderColor:b.color, y:-2 }} whileTap={{ scale:.97 }}
                style={{ background:'var(--glass)', border:'2px solid var(--border)', borderRadius:20, padding:'24px 12px', cursor:'pointer', textAlign:'center', transition:'all .2s' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>{b.icon}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:b.color, marginBottom:4 }}>{b.label}</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>{b.sub}</div>
              </motion.button>
            ))}
          </div>

          {/* Pain level */}
          <GlassCard style={{ marginBottom:16 }}>
            <div style={{ fontWeight:700, fontSize:17, marginBottom:14 }}>{t('howFeelingToday')}</div>
            <div style={{ display:'flex', gap:10 }}>
              {painMoods.map(p => (
                <motion.button key={p.key} onClick={() => handlePain(p)} whileTap={{ scale:.94 }}
                  style={{ flex:1, padding:'16px 8px', borderRadius:14, border:`2px solid ${painSelected?.key===p.key ? p.color : 'var(--border)'}`, background:painSelected?.key===p.key ? `${p.color}18` : 'var(--bg3)', cursor:'pointer', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:6 }}>{p.emoji}</div>
                  <div style={{ fontSize:12, color:painSelected?.key===p.key ? p.color : 'var(--text2)', fontWeight:500 }}>{t(p.key)}</div>
                </motion.button>
              ))}
            </div>
            {checkedIn && painSelected && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginTop:10, fontSize:14, color:painSelected.color, fontWeight:500 }}>
                ✓ {t(painSelected.key)} logged for today
              </motion.div>
            )}
          </GlassCard>

          {/* Offline banner */}
          <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.25)', borderRadius:14, padding:'12px 18px', display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:22 }}>📲</span>
            <div>
              <div style={{ fontWeight:600, color:'var(--amber)', fontSize:15 }}>{t('offlineReady')}</div>
              <div style={{ fontSize:13, color:'var(--text2)' }}>{t('offlineDesc')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── SMART MODE (normal) ─────────────────────────────────────────────────── */
  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, marginBottom:4 }}>
            {t('goodMorning')}, {user?.name?.split(' ')[0]} 🌅
          </h1>
          <p style={{ color:'var(--text2)', fontSize:14 }}>{t('dayOf').replace('%d','18')} · {t('keepGoing')}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Badge color="teal">🔥 {streak > 0 ? `${streak}-day streak` : 'Start your streak!'}</Badge>
          <Badge color="green">👨‍⚕️ Dr. Sharma online</Badge>
        </div>
      </motion.div>

      {/* Pain check-in */}
      <AnimatePresence>
        {!checkedIn && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
            style={{ background:'linear-gradient(135deg,rgba(0,212,170,.07),rgba(74,158,255,.04))', border:'1px solid rgba(0,212,170,.2)', borderRadius:20, padding:22, marginBottom:22 }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, marginBottom:5 }}>🌡 {t('howFeelingToday')}</h3>
            <p style={{ color:'var(--text2)', fontSize:13, marginBottom:14 }}>{t('painAdaptsSession') || "Your answer adapts today's session intensity."}</p>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {painMoods.map(p => (
                <motion.button key={p.key} onClick={() => handlePain(p)} whileTap={{ scale:.96 }}
                  whileHover={{ y:-2, borderColor:p.color }}
                  style={{ flex:'1 1 90px', padding:'14px 8px', borderRadius:14, border:`2px solid ${painSelected?.key===p.key ? p.color : 'var(--border)'}`, background:painSelected?.key===p.key ? `${p.color}18` : 'var(--bg3)', cursor:'pointer', textAlign:'center', transition:'all .2s' }}>
                  <div style={{ fontSize:28, marginBottom:5 }}>{p.emoji}</div>
                  <div style={{ fontSize:12, fontWeight:500, color:painSelected?.key===p.key ? p.color : 'var(--text2)' }}>{t(p.key)}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery rings */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:14, marginBottom:22 }}>
        {loading ? Array(4).fill(0).map((_,i) => <Skel key={i} h={110} />) :
          [
            { v: Math.min(100, totalSessions * 4 + 20), c:'#00d4aa', l:t('recoveryScore'), sub:'score', delta: totalSessions > 0 ? `↑ ${totalSessions} sessions` : '↑ Getting started' },
            { v: postureAvg || 75,                       c:'#4a9eff', l:t('consistency'),   sub:'rate',  delta: postureAvg > 0 ? `${postureAvg}% posture` : '+3%' },
            { v:70, c:'#34d399', l:t('painLevel'), sub:'improved', delta:'↓ better', invert:true },
            { v: Math.min(100, totalSessions * 5 + 5),  c:'#a78bfa', l:t('sessions'), sub:'done', delta: `${totalSessions} total` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.08 }}>
              <GlassCard style={{ textAlign:'center', padding:'22px 14px' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
                  <Ring value={s.v} color={s.c} size={76} stroke={6} label={`${s.v}%`} sub={s.sub} />
                </div>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:4 }}>{s.l}</div>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:`${s.c}18`, color:s.c, border:`1px solid ${s.c}30` }}>{s.delta}</span>
              </GlassCard>
            </motion.div>
          ))
        }
      </div>

      {/* Reminder widget */}
      <div style={{ marginBottom: 20 }}>
        <ReminderWidget />
      </div>

      {/* Two-col: exercises + chart */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <GlassCard>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700 }}>{t('todayExercises')}</h3>
            <Btn variant="primary" size="sm" onClick={() => navigate('/patient/exercises')}>{t('viewAll')}</Btn>
          </div>
          {mockExercises.slice(0,4).map((ex, i) => (
            <motion.div key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.07 }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:i<3?'1px solid var(--border)':'none' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:ex.completed?'linear-gradient(135deg,var(--teal),var(--blue))':'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>
                {ex.completed ? '✓' : ex.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:3 }}>{ex.name}</div>
                <div style={{ display:'flex', gap:5 }}>
                  <span style={{ fontSize:10, padding:'1px 7px', borderRadius:100, background:'rgba(0,212,170,.1)', color:'var(--teal)', border:'1px solid rgba(0,212,170,.2)' }}>{ex.difficulty}</span>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>{ex.sets}×{ex.reps}</span>
                </div>
              </div>
              {ex.postureScore && <span style={{ fontSize:12, color:'var(--teal)', fontWeight:600 }}>{ex.postureScore}%</span>}
            </motion.div>
          ))}
          <Btn variant="outline" size="sm" onClick={() => navigate('/patient/posture')} style={{ width:'100%', justifyContent:'center', marginTop:12 }}>
            🎯 Start AI Posture Session
          </Btn>
        </GlassCard>

        <GlassCard>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, marginBottom:14 }}>{t('weeklyTrend')}</h3>
          <ResponsiveContainer width="100%" height={145}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={.25}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, fontSize:12 }}/>
              <Area type="monotone" dataKey="score" stroke="#00d4aa" strokeWidth={2.5} fill="url(#sg)" dot={{ fill:'#00d4aa', r:3 }}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            <div style={{ background:'var(--bg3)', borderRadius:10, padding:10, textAlign:'center' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'var(--teal)' }}>5/7</div>
              <div style={{ fontSize:11, color:'var(--text2)' }}>{t('sessionsThisWeek')}</div>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:10, padding:10, textAlign:'center' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'var(--blue)' }}>62%</div>
              <div style={{ fontSize:11, color:'var(--text2)' }}>{t('painReduction')}</div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* PhysioAI Chat */}
      <GlassCard style={{ marginBottom:20, background:'linear-gradient(135deg,rgba(0,212,170,.06),rgba(74,158,255,.04))' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:'linear-gradient(135deg,var(--teal),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>{t('chatTitle')}</div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>{t('chatTitle') === 'PhysioAI Chat' ? 'Ask about pain, exercises, progress' : t('chatTitle')}</div>
          </div>
          <Badge color="teal" style={{ marginLeft:'auto' }}>Online</Badge>
        </div>

        {/* Chat messages */}
        <div style={{ background:'var(--bg2)', borderRadius:12, padding:'12px', marginBottom:12, minHeight:64, maxHeight:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          {chatHistory.length === 0 ? (
            <div style={{ fontSize:13, color:'var(--text3)', fontStyle:'italic' }}>
              PhysioAI: {aiMsg || t('chatWelcome') || "Great progress today! Ask me anything — type your question or use quick prompts below. 💪"}
            </div>
          ) : chatHistory.map((m, i) => (
            <motion.div key={i} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
              style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'80%', padding:'8px 12px', borderRadius:m.role==='user'?'12px 12px 4px 12px':'12px 12px 12px 4px', background:m.role==='user'?'linear-gradient(135deg,var(--teal),var(--blue))':'var(--bg3)', color:m.role==='user'?'#fff':'var(--text2)', fontSize:13, lineHeight:1.55 }}>
                {m.role==='ai' && <span style={{ color:'var(--teal)' }}>PhysioAI: </span>}{m.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick prompts */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          {Object.keys(aiReplies).map(q => (
            <motion.button key={q} onClick={() => { setChatHistory(h => [...h,{role:'user',text:q},{role:'ai',text:aiReplies[q]}]) }}
              whileHover={{ borderColor:'var(--teal)', color:'var(--teal)' }}
              style={{ padding:'5px 12px', borderRadius:100, border:'1px solid var(--border)', background:'var(--bg3)', color:'var(--text2)', fontSize:11, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .15s' }}>
              {q}
            </motion.button>
          ))}
        </div>

        {/* Text input */}
        <div style={{ display:'flex', gap:8 }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat() } }}
            placeholder={t('chatPlaceholder')}
            style={{ flex:1, padding:'10px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
            onFocus={e => e.target.style.borderColor='var(--teal)'}
            onBlur={e => e.target.style.borderColor='var(--border)'} />
          <motion.button
            type="button"
            onClick={sendChat}
            whileTap={{ scale:.94 }}
            disabled={!chatInput.trim()}
            style={{ padding:'10px 16px', background: chatInput.trim() ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'var(--bg3)', border: chatInput.trim() ? 'none' : '1px solid var(--border)', borderRadius:12, color: chatInput.trim() ? '#fff' : 'var(--text3)', fontSize:14, cursor: chatInput.trim() ? 'pointer' : 'default', transition:'all .2s' }}>
            {t('send')}
          </motion.button>
        </div>
      </GlassCard>

      {/* Badges */}
      <GlassCard>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700 }}>🏅 {t('badges')}</h3>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/patient/analytics')}>Full Report →</Btn>
        </div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { icon:'🔥', name:'Consistent Performer', desc:'8-day streak', c:'#fbbf24' },
            { icon:'🏆', name:'Recovery Champion', desc:'50% pain reduction', c:'#34d399' },
            { icon:'💪', name:'7-Day Warrior', desc:'Full week done', c:'#4a9eff' },
          ].map((b, i) => (
            <motion.div key={i} whileHover={{ y:-3 }}
              style={{ background:'var(--bg3)', border:`1px solid ${b.c}28`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, flex:1, minWidth:150 }}>
              <div style={{ fontSize:26 }}>{b.icon}</div>
              <div><div style={{ fontSize:13, fontWeight:600, color:b.c }}>{b.name}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{b.desc}</div></div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
