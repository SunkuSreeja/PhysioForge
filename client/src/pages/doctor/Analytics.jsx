import { motion } from 'framer-motion'
import { GlassCard, Badge, Ring } from '../../components/ui'
import { mockPatients } from '../../data/mockData'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

const weekData = [
  { day: 'Mon', adherence: 74, sessions: 18 }, { day: 'Tue', adherence: 78, sessions: 20 },
  { day: 'Wed', adherence: 72, sessions: 16 }, { day: 'Thu', adherence: 80, sessions: 22 },
  { day: 'Fri', adherence: 78, sessions: 19 }, { day: 'Sat', adherence: 82, sessions: 14 }, { day: 'Sun', adherence: 75, sessions: 10 },
]

const pieData = [
  { name: 'On Track', value: 2, color: '#34d399' },
  { name: 'Monitor', value: 2, color: '#fbbf24' },
  { name: 'At Risk', value: 1, color: '#ff6b7a' },
]

const Tip = { contentStyle: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 } }

export default function DoctorAnalytics() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Practice Analytics</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Overview of all patient outcomes · May 2025</p>
      </div>

      {/* Summary rings */}
      <GlassCard style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 20 }}>Practice Health Overview</div>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-around' }}>
          {[
            { v: 78, c: '#00d4aa', l: 'Avg Adherence', sub: 'rate' },
            { v: 72, c: '#4a9eff', l: 'Avg Posture', sub: 'accuracy' },
            { v: 58, c: '#34d399', l: 'Avg Pain', sub: 'reduction' },
            { v: 40, c: '#a78bfa', l: 'On Track', sub: 'patients' },
          ].map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .1 }}
              style={{ textAlign: 'center' }}>
              <Ring value={r.v} color={r.c} size={88} stroke={7} label={`${r.v}%`} sub={r.sub} />
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{r.l}</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <GlassCard>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 16 }}>📊 Adherence This Week</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...Tip} />
              <Bar dataKey="adherence" fill="#4a9eff" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 16 }}>🎯 Patient Status Distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text2)' }}>{d.name}:</span>
                  <strong style={{ color: d.color }}>{d.value} patients</strong>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Individual patient table */}
      <GlassCard>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 16 }}>📋 Individual Patient Analytics</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Patient', 'Recovery Score', 'Pain Trend', 'Sessions/Week', 'Posture Avg', 'Streak'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text2)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p.recoveryScore}%` }} transition={{ duration: 1, delay: i * .08 }}
                          style={{ height: '100%', background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 3 }} />
                      </div>
                      <span style={{ color: 'var(--teal)' }}>{p.recoveryScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px', color: p.painLevel <= 3 ? 'var(--green)' : p.painLevel <= 6 ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                    {p.painLevel}/10 {p.painLevel <= 3 ? '↓' : '↑'}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text2)' }}>
                    {Math.round(p.adherence / 14)}–{Math.round(p.adherence / 10)}/week
                  </td>
                  <td style={{ padding: '12px', color: p.postureAccuracy > 75 ? 'var(--teal)' : p.postureAccuracy > 60 ? 'var(--amber)' : 'var(--red)' }}>{p.postureAccuracy}%</td>
                  <td style={{ padding: '12px', color: 'var(--amber)' }}>🔥 {p.streak}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
