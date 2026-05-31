import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { mockAppointments } from '../../data/mockData'

export default function CaretakerAppointments() {
  const [booked, setBooked] = useState(false)
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, marginBottom:6 }}>Appointments</h1>
        <p style={{ color:'var(--text2)', fontSize:14 }}>Rajesh's consultations with Dr. Arjun Sharma</p>
      </div>
      <GlassCard style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, marginBottom:14 }}>Upcoming</div>
        {mockAppointments.slice(0,2).map((a,i) => (
          <div key={i} style={{ display:'flex', gap:14, alignItems:'center', padding:'12px 0', borderBottom:i===0?'1px solid var(--border)':'none', flexWrap:'wrap' }}>
            <div style={{ background:'var(--bg3)', borderRadius:10, padding:'8px 12px', textAlign:'center', minWidth:70 }}>
              <div style={{ fontSize:11, color:'var(--text2)' }}>{a.date}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'var(--blue)' }}>{a.time}</div>
            </div>
            <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>{a.topic}</div><div style={{ fontSize:12, color:'var(--text2)' }}>{a.doctor}</div></div>
            <Badge color={a.status==='confirmed'?'teal':'amber'} style={{ fontSize:11 }}>{a.status}</Badge>
          </div>
        ))}
      </GlassCard>
      <GlassCard>
        <div style={{ fontWeight:700, marginBottom:12 }}>Book on Rajesh's Behalf</div>
        {!booked ? (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {['Video Call','In-Person','Quick Check-in','Phone'].map((t,i) => (
                <div key={i} style={{ padding:12, background:'var(--bg3)', borderRadius:10, textAlign:'center', fontSize:13, color:'var(--text2)', cursor:'pointer', border:'1px solid var(--border)' }}>{t}</div>
              ))}
            </div>
            <Btn variant="primary" onClick={() => setBooked(true)} style={{ width:'100%', justifyContent:'center' }}>Request Appointment</Btn>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, marginBottom:6 }}>Requested!</div>
            <div style={{ color:'var(--text2)', fontSize:13 }}>Dr. Sharma will confirm within 2 hours.</div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  )
}
