import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Toggle({ on, setOn, color = 'var(--teal)' }) {
  return (
    <button onClick={() => setOn(v => !v)}
      style={{ width:48, height:26, borderRadius:13, background:on?color:'var(--bg4)', border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:4, left:on?26:4, transition:'left .2s' }} />
    </button>
  )
}

function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [specialization, setSpecialization] = useState(user?.specialization || 'Physiotherapist')
  const [license, setLicense] = useState(user?.license || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const updated = { ...user, name: name.trim(), email: email.trim(), specialization, license }
    localStorage.setItem('pf_cached_user', JSON.stringify(updated))
    setSaving(false); setSaved(true)
    onSave(updated)
    setTimeout(onClose, 900)
  }

  const inputStyle = { width:'100%', boxSizing:'border-box', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', color:'var(--text)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none' }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:24, padding:28, maxWidth:440, width:'100%' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:20 }}>✏️ Edit Doctor Profile</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:16 }}>
          {[
            { label:'Full Name *', value:name, onChange:setName, placeholder:'Dr. Full Name' },
            { label:'Email', value:email, onChange:setEmail, placeholder:'doctor@clinic.com', type:'email' },
            { label:'Specialization', value:specialization, onChange:setSpecialization, placeholder:'Physiotherapist' },
            { label:'License Number', value:license, onChange:setLicense, placeholder:'MCI-XXXXX' },
          ].map((f,i) => (
            <div key={i}>
              <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>{f.label}</label>
              <input style={inputStyle} type={f.type||'text'} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} />
            </div>
          ))}
        </div>
        {saved && <div style={{ color:'var(--teal)', fontSize:13, marginBottom:12, textAlign:'center' }}>✓ Profile updated!</div>}
        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="primary" onClick={handleSave} disabled={saving||saved} style={{ flex:1, justifyContent:'center' }}>
            {saving ? '⟳ Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </Btn>
          <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        </div>
      </motion.div>
    </motion.div>
  )
}

function VerificationModal({ isVerified, onClose, onUpdate }) {
  const [step, setStep] = useState(isVerified ? 'verified' : 'start')
  const [licenseNo, setLicenseNo] = useState('')
  const [councilId, setCouncilId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!licenseNo.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setStep('success')
    const verified = { verified: true, licenseNo, councilId, verifiedAt: new Date().toISOString() }
    localStorage.setItem('pf_doctor_verification', JSON.stringify(verified))
    onUpdate(true)
    setTimeout(onClose, 2000)
  }

  const inputStyle = { width:'100%', boxSizing:'border-box', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', color:'var(--text)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none' }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:24, padding:28, maxWidth:440, width:'100%' }}>
        
        {step === 'verified' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:8 }}>Already Verified</div>
            <div style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Your doctor badge is active and visible to patients.</div>
            <Badge color="teal" style={{ fontSize:14, padding:'8px 20px' }}>🏅 Verified Physiotherapist</Badge>
            <div style={{ marginTop:20 }}>
              <Btn variant="ghost" onClick={onClose} style={{ width:'100%', justifyContent:'center' }}>Close</Btn>
            </div>
          </div>
        )}

        {step === 'start' && (
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:8 }}>🏅 Verification Badge</div>
            <div style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Verify your credentials to display a trust badge to patients.</div>
            <div style={{ background:'rgba(0,212,170,.08)', border:'1px solid rgba(0,212,170,.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'var(--teal)' }}>
              ✓ Verified doctors get 3× more consultation bookings
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:16 }}>
              <div>
                <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Medical Council License No. *</label>
                <input style={inputStyle} value={licenseNo} onChange={e => setLicenseNo(e.target.value)} placeholder="e.g. MCI-2024-XXXXX" />
              </div>
              <div>
                <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>State Council ID (optional)</label>
                <input style={inputStyle} value={councilId} onChange={e => setCouncilId(e.target.value)} placeholder="e.g. MAH-XXXXX" />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="primary" onClick={handleSubmit} disabled={submitting||!licenseNo.trim()} style={{ flex:1, justifyContent:'center' }}>
                {submitting ? '⟳ Verifying…' : 'Submit for Verification'}
              </Btn>
              <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign:'center' }}>
            <motion.div animate={{ scale:[1,1.2,1] }} transition={{ duration:.6 }} style={{ fontSize:56, marginBottom:12 }}>🎉</motion.div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:8 }}>Verification Submitted!</div>
            <div style={{ color:'var(--text2)', fontSize:14 }}>Your badge will appear after our team reviews your credentials (1-2 business days).</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function DoctorSettings() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [saved, setSaved] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [localUser, setLocalUser] = useState(user)

  const verificationData = (() => {
    try { return JSON.parse(localStorage.getItem('pf_doctor_verification') || 'null') } catch { return null }
  })()
  const [isVerified, setIsVerified] = useState(!!verificationData?.verified)

  const displayUser = localUser || user

  const notifRows = [
    { l: 'Patient missed session', d: 'Notify when adherence drops', on: true },
    { l: 'Pain spike alerts', d: 'Pain > 7/10 immediate alert', on: true },
    { l: 'New appointment requests', d: 'Patients booking online', on: true },
    { l: 'Weekly practice summary', d: 'Every Monday morning', on: false },
  ]

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Manage your doctor profile and preferences.</p>
      </div>

      <GlassCard style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>👨‍⚕️ Doctor Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--blue),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
            {displayUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{displayUser?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>{displayUser?.email}</div>
            <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
              <Badge color="blue" style={{ marginTop: 4 }}>{displayUser?.specialization || 'Physiotherapist'}</Badge>
              {isVerified && <Badge color="teal" style={{ marginTop:4 }}>✅ Verified</Badge>}
              {!isVerified && <Badge color="amber" style={{ marginTop:4 }}>⏳ Unverified</Badge>}
              {displayUser?.license && <Badge color="purple" style={{ marginTop:4 }}>🪪 {displayUser.license}</Badge>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap:'wrap' }}>
          <Btn variant="ghost" size="sm" onClick={() => setShowEditProfile(true)}>✏️ Edit Profile</Btn>
          <Btn variant={isVerified ? 'outline' : 'primary'} size="sm" onClick={() => setShowVerification(true)}>
            {isVerified ? '✅ Verified Badge' : '🏅 Get Verified'}
          </Btn>
        </div>
      </GlassCard>

      <GlassCard style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🔔 Alert Preferences</div>
        {notifRows.map((n, i) => {
          const [on, setOn] = useState(n.on)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < notifRows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div><div style={{ fontWeight: 500, fontSize: 14 }}>{n.l}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{n.d}</div></div>
              <Toggle on={on} setOn={setOn} />
            </div>
          )
        })}
      </GlassCard>

      <GlassCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{dark ? '🌙 Dark Mode' : '☀️ Light Mode'}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>Toggle interface theme</div>
          </div>
          <button onClick={toggle} style={{ width: 48, height: 26, borderRadius: 13, background: dark ? 'var(--purple)' : 'var(--bg4)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 4, left: dark ? 26 : 4, transition: 'left .2s' }} />
          </button>
        </div>
      </GlassCard>

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} style={{ flex: 1, justifyContent: 'center' }}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </Btn>
        <Btn variant="danger" onClick={logout} style={{ flex: 1, justifyContent: 'center' }}>🚪 Sign Out</Btn>
      </div>

      <AnimatePresence>
        {showEditProfile && <EditProfileModal user={displayUser} onClose={() => setShowEditProfile(false)} onSave={setLocalUser} />}
        {showVerification && <VerificationModal isVerified={isVerified} onClose={() => setShowVerification(false)} onUpdate={setIsVerified} />}
      </AnimatePresence>
    </div>
  )
}
