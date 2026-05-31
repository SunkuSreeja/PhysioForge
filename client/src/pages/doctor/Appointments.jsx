// Appointments.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { mockAppointments } from '../../data/mockData'

export function DoctorAppointments() {
  const [joining, setJoining] = useState(null)
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Appointments</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Today: {mockAppointments.filter(a => a.date === 'Today').length} sessions · Tomorrow: {mockAppointments.filter(a => a.date === 'Tomorrow').length} sessions</p>
      </div>

      {/* Video call simulation */}
      {joining && (
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#080820', borderRadius: 20, height: 300, position: 'relative', marginBottom: 20, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🏃</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{joining}</div>
            <motion.div animate={{ opacity: [1, .3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ color: 'var(--teal)', fontSize: 14 }}>● Connected</motion.div>
          </div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 100, height: 68, background: 'var(--bg3)', borderRadius: 10, border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👨‍⚕️</div>
          <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
            {['🎤', '📷'].map((ic, i) => <button key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', fontSize: 18, cursor: 'pointer' }}>{ic}</button>)}
            <button onClick={() => setJoining(null)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
          <div style={{ position: 'absolute', top: 14, left: 14 }}><Badge color="red">● {joining}</Badge></div>
        </motion.div>
      )}

      <GlassCard>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>All Appointments</div>
        {mockAppointments.map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .08 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < mockAppointments.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 72, flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{a.date}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>{a.time}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{a.patient}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{a.topic} · {a.doctor}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge color={a.type === 'video' ? 'blue' : a.type === 'in-person' ? 'green' : 'amber'} style={{ fontSize: 11 }}>
                {a.type === 'video' ? '📹 Video' : a.type === 'in-person' ? '🏥 In-Person' : '💬 Check-in'}
              </Badge>
              <Badge color={a.status === 'confirmed' ? 'teal' : 'amber'} style={{ fontSize: 11 }}>{a.status}</Badge>
              <Btn variant="primary" size="sm" onClick={() => setJoining(a.patient)}>
                {a.type === 'video' ? '📹 Join' : '📋 View'}
              </Btn>
            </div>
          </motion.div>
        ))}
      </GlassCard>
    </div>
  )
}
export default DoctorAppointments
