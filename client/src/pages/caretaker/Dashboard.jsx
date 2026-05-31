import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useLang } from '../../i18n'
import { weeklyData } from '../../data/mockData'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function CaretakerDashboard() {
  const { t } = useLang()
  const [sentReminder, setSentReminder] = useState(false)

  return (
    <div>
      <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28, textAlign:'center' }}>
        <motion.div animate={{ scale:[1,1.08,1] }} transition={{ duration:2.5, repeat:Infinity }} style={{ fontSize:52, marginBottom:10 }}>❤️</motion.div>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, marginBottom:6 }}>Caring for Rajesh</h1>
        <p style={{ color:'var(--text2)', fontSize:14 }}>Your support is a vital part of his recovery journey.</p>
      </motion.div>

      <GlassCard style={{ marginBottom:20, background:'linear-gradient(135deg,rgba(0,212,170,.08),rgba(74,158,255,.04))', textAlign:'center', padding:32 }}>
        <div style={{ fontSize:15, color:'var(--text2)', marginBottom:8 }}>Today's Recovery Status</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:52, fontWeight:800, marginBottom:12 }}>
          <span style={{ color:'var(--teal)' }}>2</span><span style={{ color:'var(--text2)', fontSize:28 }}> / 4</span>
        </div>
        <div style={{ fontSize:14, color:'var(--text2)', marginBottom:20 }}>Exercises completed today</div>
        <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
          {['Shoulder Pendulum','Hip Flexor','Quad Strength','Ankle Circles'].map((ex,i) => (
            <motion.div key={i} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:i*.1+.3 }} style={{ textAlign:'center' }}>
              <div style={{ width:46, height:46, borderRadius:13, background:i<2?'linear-gradient(135deg,var(--teal),var(--blue))':'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:6 }}>
                {i<2?'✓':'⏳'}
              </div>
              <div style={{ fontSize:10, color:'var(--text3)', maxWidth:68 }}>{ex}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:14, marginBottom:18 }}>
        <GlassCard><div style={{ fontSize:22, marginBottom:8 }}>😊</div><div style={{ fontWeight:700, marginBottom:6 }}>Mood Today</div><div style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6 }}>Rajesh reported <span style={{ color:'var(--green)', fontWeight:600 }}>feeling good</span>. Pain: 3/10 — down from 7 last week.</div></GlassCard>
        <GlassCard><div style={{ fontSize:22, marginBottom:8 }}>💊</div><div style={{ fontWeight:700, marginBottom:6 }}>Medication</div><div style={{ color:'var(--text2)', fontSize:14, lineHeight:1.6 }}>Morning dose ✅ at 8:12 AM. Evening reminder: <span style={{ color:'var(--blue)', fontWeight:600 }}>8:00 PM</span>.</div></GlassCard>
        <GlassCard><div style={{ fontSize:22, marginBottom:8 }}>🔥</div><div style={{ fontWeight:700, marginBottom:6 }}>Streak</div><div style={{ display:'flex', alignItems:'center', gap:10 }}><div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:'var(--amber)' }}>1</div><div style={{ color:'var(--text2)', fontSize:13 }}>day streak<br/><span style={{ color:'var(--text3)' }}>Best: 4 days</span></div></div></GlassCard>
      </div>

      <GlassCard style={{ marginBottom:18, borderColor:'rgba(74,158,255,.2)' }}>
        <div style={{ fontWeight:700, marginBottom:10 }}>📢 Send a Reminder</div>
        <p style={{ color:'var(--text2)', fontSize:14, marginBottom:14, lineHeight:1.6 }}>Exercise 3 not done yet. A gentle nudge improves adherence by <span style={{ color:'var(--teal)', fontWeight:600 }}>40%</span>.</p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {['Send Reminder 🔔','Call Rajesh 📞','Message Dr. Sharma'].map((btn,i) => (
            <motion.button key={i} onClick={() => i===0 && setSentReminder(true)} whileTap={{ scale:.97 }}
              style={{ padding:'9px 16px', borderRadius:100, border:`1px solid ${i===0&&sentReminder?'var(--teal)':'var(--border2)'}`, background:'var(--glass2)', color:i===0&&sentReminder?'var(--teal)':'var(--text)', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              {i===0&&sentReminder?'Sent ✓':btn}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      <GlassCard style={{ marginBottom:18 }}>
        <div style={{ fontWeight:700, marginBottom:14 }}>📊 This Week</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" tick={{ fill:'var(--text3)', fontSize:11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, fontSize:12 }}/>
            <Bar dataKey="score" radius={[4,4,0,0]} fill="#00d4aa"/>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div style={{ background:'rgba(255,107,122,.06)', border:'1px solid rgba(255,107,122,.2)', borderRadius:14, padding:14, marginBottom:18, display:'flex', gap:10 }}>
        <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
        <div><div style={{ fontWeight:600, color:'var(--red)', marginBottom:4 }}>Wednesday session was missed</div><div style={{ color:'var(--text2)', fontSize:13 }}>Consecutive misses can delay recovery by up to 3 weeks.</div></div>
      </div>

      <motion.button animate={{ scale:[1,1.015,1] }} transition={{ duration:3, repeat:Infinity }}
        whileTap={{ scale:.97 }}
        onClick={() => window.location.href='/caretaker/alerts'}
        style={{ width:'100%', background:'linear-gradient(135deg,var(--red),#c0392b)', border:'none', borderRadius:20, padding:'22px 32px', color:'#fff', fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:12, boxShadow:'0 6px 24px rgba(255,107,122,.28)' }}>
        🆘 Emergency Alert — Connect Now
      </motion.button>
    </div>
  )
}
