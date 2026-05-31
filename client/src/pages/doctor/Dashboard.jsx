import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, Badge, Btn, StatCard, AlertItem, Avatar } from '../../components/ui'
import { mockPatients, mockAlerts, mockAppointments } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const weekTrend = [
  { day: 'Mon', adherence: 74 }, { day: 'Tue', adherence: 78 }, { day: 'Wed', adherence: 72 },
  { day: 'Thu', adherence: 80 }, { day: 'Fri', adherence: 78 }, { day: 'Sat', adherence: 82 }, { day: 'Sun', adherence: 75 },
]

const statusColor = s => s === 'On Track' ? 'green' : s === 'At Risk' ? 'red' : 'amber'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [replayPatient, setReplayPatient] = useState(null)

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            Good morning, {user?.name} 👨‍⚕️
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {mockPatients.length} active patients · {mockAlerts.length} alerts need attention · Tuesday, 14 May 2025
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge color="red">🔔 {mockAlerts.length} Urgent</Badge>
          <Badge color="teal">● Online</Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { value: '12', label: 'Active Patients', color: '#00d4aa', icon: '👥', delta: '+2 this week' },
          { value: '78%', label: 'Avg Adherence', color: '#4a9eff', icon: '📊', delta: '↑ 5%' },
          { value: '3', label: 'Urgent Alerts', color: '#ff6b7a', icon: '🔔', delta: 'Needs action' },
          { value: '4', label: 'Consultations', color: '#a78bfa', icon: '📅', delta: 'Today' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }}>
            <StatCard value={s.value} label={s.label} delta={s.delta} color={s.color} icon={s.icon} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Alerts */}
        <GlassCard style={{ background: 'rgba(255,107,122,.03)', borderColor: 'rgba(255,107,122,.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>🔔 Active Alerts</div>
            <Badge color="red">{mockAlerts.length} Urgent</Badge>
          </div>
          {mockAlerts.map((a, i) => <AlertItem key={i} alert={a} />)}
        </GlassCard>

        {/* Weekly adherence trend */}
        <GlassCard>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📈 Adherence Trend (This Week)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weekTrend}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="adherence" stroke="#4a9eff" strokeWidth={2.5} dot={{ fill: '#4a9eff', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--text2)' }}>
            <span>Avg: <strong style={{ color: 'var(--blue)' }}>78%</strong></span>
            <span>Best: <strong style={{ color: 'var(--teal)' }}>82% (Sat)</strong></span>
            <span>Low: <strong style={{ color: 'var(--amber)' }}>72% (Wed)</strong></span>
          </div>
        </GlassCard>
      </div>

      {/* Patient table */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>👥 Patient Overview</div>
          <Btn variant="primary" size="sm" onClick={() => window.location.href = '/doctor/patients'}>View All →</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Patient', 'Diagnosis', 'Adherence', 'Pain', 'Posture', 'Last Session', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text2)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((p, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .06 }}
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar initials={p.avatar} size={30} />
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text2)' }}>{p.diagnosis}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 56, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p.adherence}%` }} transition={{ duration: 1, delay: i * .08 }}
                          style={{ height: '100%', borderRadius: 3, background: p.adherence > 70 ? 'var(--teal)' : p.adherence > 50 ? 'var(--amber)' : 'var(--red)' }} />
                      </div>
                      <span style={{ color: p.adherence > 70 ? 'var(--teal)' : p.adherence > 50 ? 'var(--amber)' : 'var(--red)' }}>{p.adherence}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: p.painLevel <= 3 ? 'var(--green)' : p.painLevel <= 6 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>{p.painLevel}/10</td>
                  <td style={{ padding: '12px', color: p.postureAccuracy > 75 ? 'var(--teal)' : p.postureAccuracy > 60 ? 'var(--amber)' : 'var(--red)' }}>{p.postureAccuracy}%</td>
                  <td style={{ padding: '12px', color: 'var(--text2)' }}>{p.lastSession}</td>
                  <td style={{ padding: '12px' }}><Badge color={statusColor(p.status)} style={{ fontSize: 11 }}>{p.status}</Badge></td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => setReplayPatient(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 12, fontFamily: "'DM Sans',sans-serif" }}>
                      Replay →
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Replay modal */}
      {replayPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setReplayPatient(null)}>
          <motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 24, padding: 32, maxWidth: 480, width: '100%' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              📽 Session Replay — {replayPatient.name}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[{ l: 'Last Session', v: replayPatient.lastSession }, { l: 'Posture Accuracy', v: `${replayPatient.postureAccuracy}%` }, { l: 'Pain Reported', v: `${replayPatient.painLevel}/10` }, { l: 'Adherence', v: `${replayPatient.adherence}%` }].map((s, i) => (
                <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{s.l}</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
              🤖 <strong>AI Session Summary:</strong> Patient showed improvement in range of motion (+12°) but posture accuracy dipped during fatigue phase (exercises 7–10). Recommend reducing set count by 1 next session and focusing on slow, controlled movements.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="primary" size="sm" style={{ flex: 1, justifyContent: 'center' }}>Send Note to Patient</Btn>
              <Btn variant="ghost" size="sm" onClick={() => setReplayPatient(null)} style={{ flex: 1, justifyContent: 'center' }}>Close</Btn>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upcoming consultations */}
      <GlassCard>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📅 Upcoming Consultations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mockAppointments.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--bg3)', borderRadius: 14, flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 72, flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{a.date}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{a.time}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.patient}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.topic}</div>
              </div>
              <Badge color={a.type === 'video' ? 'blue' : a.type === 'in-person' ? 'green' : 'amber'} style={{ fontSize: 11 }}>
                {a.type === 'video' ? '📹 Video' : a.type === 'in-person' ? '🏥 In-Person' : '💬 Check-in'}
              </Badge>
              <Badge color={a.status === 'confirmed' ? 'teal' : 'amber'} style={{ fontSize: 11 }}>{a.status}</Badge>
              <Btn variant="primary" size="sm">Join</Btn>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
