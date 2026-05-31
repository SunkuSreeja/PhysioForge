import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'

const contacts = [
  { name: 'Dr. Arjun Sharma', role: 'Primary Physiotherapist', icon: '👨‍⚕️', color: '#4a9eff', phone: '+919876543210' },
  { name: 'Ramesh Singh', role: 'Caretaker · Son', icon: '👨‍👩‍👧', color: '#a78bfa', phone: '+919876543211' },
  { name: 'Apollo Hospital', role: 'Emergency Ward · Gurugram', icon: '🏥', color: '#ff6b7a', phone: '108' },
]

const autoActions = [
  'Location shared with Dr. Sharma',
  'Caretaker notified via SMS',
  'Current session saved & flagged',
  'Emergency contacts alerted',
]

function CallModal({ contact, onClose }) {
  const [callState, setCallState] = useState('ringing') // ringing | connected | ended
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    const connectTimer = setTimeout(() => setCallState('connected'), 3000)
    return () => clearTimeout(connectTimer)
  }, [])

  useEffect(() => {
    if (callState !== 'connected') return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [callState])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handleEnd = () => {
    setCallState('ended')
    setTimeout(onClose, 1200)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:28, padding:36, maxWidth:340, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:12 }}>{contact.icon}</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:6 }}>{contact.name}</div>
        <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>{contact.role}</div>
        <div style={{ fontSize:13, color:contact.color, marginBottom:24 }}>{contact.phone}</div>

        {callState === 'ringing' && (
          <motion.div animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.2, repeat:Infinity }}>
            <div style={{ fontSize:16, color:'var(--amber)', marginBottom:24 }}>📞 Calling…</div>
          </motion.div>
        )}
        {callState === 'connected' && (
          <div>
            <motion.div animate={{ scale:[1,1.12,1] }} transition={{ duration:1.5, repeat:Infinity }}>
              <span style={{ fontSize:14, color:'var(--green)', display:'block', marginBottom:6 }}>🟢 Connected</span>
            </motion.div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:32, fontWeight:800, color:'var(--text)', marginBottom:24 }}>
              {formatTime(timer)}
            </div>
          </div>
        )}
        {callState === 'ended' && (
          <div style={{ fontSize:14, color:'var(--text2)', marginBottom:24 }}>Call ended ({formatTime(timer)})</div>
        )}

        {callState !== 'ended' && (
          <button onClick={handleEnd}
            style={{ background:'linear-gradient(135deg,#ff6b7a,#c0392b)', border:'none', borderRadius:50, width:64, height:64, fontSize:24, cursor:'pointer', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
            📵
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function DirectionsModal({ onClose }) {
  const [locating, setLocating] = useState(true)
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not available — using fallback location.')
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Could not access location — using default Gurugram.')
        setLocating(false)
      },
      { timeout: 6000 }
    )
  }, [])

  const openMaps = () => {
    const dest = '28.4595,77.0266' // Apollo Spectra Saket
    const origin = coords ? `${coords.lat},${coords.lng}` : ''
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/Apollo+Spectra+Hospital+Gurugram`
    window.open(url, '_blank')
  }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ scale:0.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.92, opacity:0 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:24, padding:28, maxWidth:380, width:'100%' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:16 }}>📍 Get Directions</div>

        {locating ? (
          <div style={{ textAlign:'center', padding:'24px 0' }}>
            <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
              style={{ fontSize:32, display:'inline-block', marginBottom:12 }}>📡</motion.div>
            <div style={{ fontSize:14, color:'var(--text2)' }}>Getting your location…</div>
          </div>
        ) : (
          <div>
            {error && <div style={{ background:'rgba(251,191,36,.1)', border:'1px solid rgba(251,191,36,.3)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--amber)', marginBottom:16 }}>{error}</div>}
            {coords && (
              <div style={{ background:'rgba(0,212,170,.08)', border:'1px solid rgba(0,212,170,.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--teal)', marginBottom:16 }}>
                📍 Location found: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </div>
            )}
            <div style={{ background:'var(--bg3)', borderRadius:12, padding:14, marginBottom:20 }}>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Apollo Spectra Hospital</div>
              <div style={{ fontSize:13, color:'var(--text2)' }}>Saket, New Delhi · 2.4 km · Open 24hrs</div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="primary" onClick={openMaps} style={{ flex:1, justifyContent:'center' }}>
                🗺️ Open in Google Maps
              </Btn>
              <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function EmergencyPage() {
  const [sosState, setSosState] = useState('idle')
  const [activeCall, setActiveCall] = useState(null)
  const [showDirections, setShowDirections] = useState(false)
  const [sosTimer, setSosTimer] = useState(0)

  useEffect(() => {
    if (sosState !== 'connected') return
    const interval = setInterval(() => setSosTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [sosState])

  const triggerSOS = () => {
    setSosState('connecting')
    setTimeout(() => setSosState('connected'), 2200)
  }

  const callContact = (contact) => {
    // Try real tel: link first (works on mobile), fallback to modal on desktop
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    if (isMobile) {
      window.location.href = `tel:${contact.phone}`
    } else {
      setActiveCall(contact)
    }
  }

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const sosBg = {
    idle: 'linear-gradient(135deg,#ff6b7a,#c0392b)',
    connecting: 'linear-gradient(135deg,#fbbf24,#b8860b)',
    connected: 'linear-gradient(135deg,#34d399,#1a8a5f)',
  }
  const sosLabel = {
    idle: '📞 One-Tap Emergency SOS',
    connecting: '⟳ Connecting to Dr. Sharma...',
    connected: `✅ Dr. Sharma Connected — ${formatTime(sosTimer)}`,
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Badge color="red" style={{ marginBottom: 10 }}>🆘 Emergency Support</Badge>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6, color: 'var(--red)' }}>
          Emergency Connect
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>One tap. Immediate connection to your care team.</p>
      </div>

      {/* SOS button */}
      <motion.div style={{ maxWidth: 500, margin: '0 auto 24px' }}>
        <motion.button
          onClick={triggerSOS}
          animate={sosState === 'idle' ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', background: sosBg[sosState], border: 'none', borderRadius: 24,
            padding: '28px 32px', color: '#fff', fontFamily: "'Syne',sans-serif",
            fontSize: 22, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            transition: 'background .5s', boxShadow: '0 8px 32px rgba(255,107,122,.3)',
          }}
        >
          {sosState === 'connecting' && (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block' }}>⟳</motion.span>
          )}
          {sosLabel[sosState]}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {sosState === 'connected' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ maxWidth: 500, margin: '0 auto 24px', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.3)', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🟢</motion.span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--green)' }}>Dr. Sharma is on the line</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Location shared ✓ · Session flagged ✓</div>
              </div>
              <button onClick={() => { setSosState('idle'); setSosTimer(0) }}
                style={{ marginLeft:'auto', background:'rgba(255,107,122,.15)', border:'1px solid rgba(255,107,122,.3)', borderRadius:8, padding:'6px 12px', color:'var(--red)', fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                End Call
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
        {/* Quick contacts */}
        <GlassCard>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>📞 Quick Connect</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map((c, i) => (
              <motion.button key={i} onClick={() => callContact(c)}
                whileHover={{ borderColor: c.color, background: 'rgba(255,255,255,.05)' }}
                whileTap={{ scale: 0.98 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all .2s', fontFamily: "'DM Sans',sans-serif" }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.role}</div>
                </div>
                <span style={{ color: c.color, fontSize: 12, whiteSpace: 'nowrap' }}>
                  📞 Call
                </span>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Auto actions + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GlassCard style={{ background: 'rgba(255,107,122,.05)', borderColor: 'rgba(255,107,122,.2)' }}>
            <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 12 }}>When SOS is triggered:</div>
            {autoActions.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .1 }}
                style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text2)', marginBottom: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--red)', flexShrink: 0 }}>•</span>{a}
              </motion.div>
            ))}
          </GlassCard>

          <GlassCard>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>🏥 Nearby Clinic</div>
            <div style={{ fontSize: 14, marginBottom: 4, fontWeight: 600 }}>Apollo Spectra Hospital</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Saket, New Delhi · 2.4 km away · Open 24hrs</div>
            <div style={{ display: 'flex', gap: 8, flexWrap:'wrap', marginBottom:12 }}>
              <Badge color="green">24/7 Emergency</Badge>
              <Badge color="blue">Physiotherapy Dept.</Badge>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn variant="outline" size="sm" onClick={() => setShowDirections(true)} style={{ flex:1, justifyContent: 'center' }}>
                📍 Get Directions
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => callContact({ name:'Apollo Hospital', icon:'🏥', color:'#ff6b7a', phone:'108' })} style={{ flex:1, justifyContent:'center' }}>
                📞 Call 108
              </Btn>
            </div>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              National Emergency: <strong style={{ color: 'var(--text)' }}>112</strong>&nbsp;&nbsp;
              Ambulance: <strong style={{ color: 'var(--text)' }}>
                <a href="tel:108" style={{ color:'var(--red)', textDecoration:'none' }}>108</a>
              </strong>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeCall && <CallModal contact={activeCall} onClose={() => setActiveCall(null)} />}
        {showDirections && <DirectionsModal onClose={() => setShowDirections(false)} />}
      </AnimatePresence>
    </div>
  )
}
