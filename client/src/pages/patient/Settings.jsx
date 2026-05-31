import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../i18n'

function Toggle({ on, setOn, color = 'var(--teal)' }) {
  return (
    <button onClick={() => setOn(v => !v)}
      style={{ width:48, height:26, borderRadius:13, background:on?color:'var(--bg4)', border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <motion.div animate={{ left: on ? 26 : 4 }} transition={{ duration:.18 }}
        style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:4 }}/>
    </button>
  )
}

function NotifRow({ label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
      <div><div style={{ fontWeight:500, fontSize:14 }}>{label}</div><div style={{ fontSize:12, color:'var(--text2)' }}>{desc}</div></div>
      <Toggle on={on} setOn={setOn}/>
    </div>
  )
}

function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [age, setAge] = useState(user?.age || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const updated = { ...user, name: name.trim(), email: email.trim(), age: Number(age) || user?.age, phone }
    localStorage.setItem('pf_cached_user', JSON.stringify(updated))
    setSaving(false)
    setSaved(true)
    onSave(updated)
    setTimeout(onClose, 900)
  }

  const inputStyle = { width:'100%', boxSizing:'border-box', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', color:'var(--text)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none' }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.92, opacity:0 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:24, padding:28, maxWidth:440, width:'100%' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:20 }}>✏️ Edit Profile</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:20 }}>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Full Name *</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Email *</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Age</label>
            <input style={inputStyle} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" min="1" max="120" />
          </div>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Phone</label>
            <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
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

function ChangePasswordModal({ onClose }) {
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const DEMO_PASSWORD = 'password123'

  const handleChange = async () => {
    setError('')
    if (!oldPw || !newPw || !confirmPw) return setError('All fields are required.')
    if (oldPw !== DEMO_PASSWORD) return setError('Current password is incorrect. (Demo: password123)')
    if (newPw.length < 6) return setError('New password must be at least 6 characters.')
    if (newPw !== confirmPw) return setError('Passwords do not match.')
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    localStorage.setItem('pf_password_changed', '1')
    setSuccess(true)
    setTimeout(onClose, 1500)
  }

  const inputStyle = { width:'100%', boxSizing:'border-box', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', color:'var(--text)', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none' }

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.92, opacity:0 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:24, padding:28, maxWidth:420, width:'100%' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:20 }}>🔐 Change Password</div>
        <div style={{ background:'rgba(74,158,255,.08)', border:'1px solid rgba(74,158,255,.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'var(--blue)', marginBottom:16 }}>
          Demo mode: current password is <strong>password123</strong>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:16 }}>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Current Password</label>
            <input style={inputStyle} type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Current password" />
          </div>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>New Password</label>
            <input style={inputStyle} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div>
            <label style={{ fontSize:13, color:'var(--text2)', marginBottom:6, display:'block' }}>Confirm New Password</label>
            <input style={inputStyle} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
          </div>
        </div>
        {error && <div style={{ color:'var(--red)', fontSize:13, marginBottom:12 }}>⚠️ {error}</div>}
        {success && <div style={{ color:'var(--teal)', fontSize:13, marginBottom:12, textAlign:'center' }}>✓ Password changed successfully!</div>}
        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="primary" onClick={handleChange} disabled={loading||success} style={{ flex:1, justifyContent:'center' }}>
            {loading ? '⟳ Updating…' : success ? '✓ Updated!' : 'Change Password'}
          </Btn>
          <Btn variant="ghost" onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SettingsPage() {
  const { user, logout, elderMode } = useAuth()
  const { dark, toggle } = useTheme()
  const { lang, setLanguage, t, languageNames } = useLang()
  const [offlineMode, setOfflineMode] = useState(false)
  const [saved, setSaved] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [localUser, setLocalUser] = useState(user)

  const downloadPacks = () => {
    setDownloading(true)
    setTimeout(() => { setDownloading(false); setDownloaded(true) }, 2200)
  }

  const themeLabel = dark ? t('darkMode') : t('lightMode')
  const themeIcon = dark ? '🌙' : '☀️'
  const displayUser = localUser || user

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, marginBottom:6 }}>{t('settings')}</h1>
        <p style={{ color:'var(--text2)', fontSize:14 }}>Personalise your PhysioForge experience.</p>
      </div>

      {/* Profile */}
      <GlassCard style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:14 }}>Profile</div>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#fff' }}>
            {displayUser?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:16 }}>{displayUser?.name}</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>{displayUser?.email}</div>
            <div style={{ display:'flex', gap:6, marginTop:6 }}>
              <Badge color="teal">Patient</Badge>
              {elderMode && <Badge color="amber">Elder Mode</Badge>}
              {displayUser?.age && <Badge color="blue">Age {displayUser.age}</Badge>}
              {displayUser?.phone && <Badge color="purple">📞 {displayUser.phone}</Badge>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="ghost" size="sm" onClick={() => setShowEditProfile(true)}>✏️ Edit Profile</Btn>
          <Btn variant="ghost" size="sm" onClick={() => setShowChangePassword(true)}>🔐 Change Password</Btn>
        </div>
      </GlassCard>

      {/* Elder mode info */}
      {elderMode && (
        <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.28)', borderRadius:18, padding:20, marginBottom:14, display:'flex', gap:12 }}>
          <span style={{ fontSize:28, flexShrink:0 }}>👴</span>
          <div>
            <div style={{ fontWeight:700, color:'var(--amber)', marginBottom:6 }}>{t('elderModeLabel')} — Active</div>
            <div style={{ color:'var(--text2)', fontSize:13, lineHeight:1.6 }}>
              {t('elderModeDesc')} ({displayUser?.age >= 55 ? displayUser.age : '55+'})
            </div>
          </div>
        </div>
      )}

      {/* Language */}
      <GlassCard style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:14 }}>🌐 {t('language')}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {['en','hi','te'].map(code => (
            <button key={code} onClick={() => setLanguage(code)}
              style={{ padding:'14px 8px', borderRadius:14, border:`2px solid ${lang===code?'var(--teal)':'var(--border)'}`, background:lang===code?'rgba(0,212,170,.09)':'var(--bg3)', cursor:'pointer', textAlign:'center', transition:'all .2s', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{code==='en'?'🇬🇧':code==='hi'?'🇮🇳':'🔤'}</div>
              <div style={{ fontSize:14, fontWeight:600, color:lang===code?'var(--teal)':'var(--text)' }}>{languageNames[code]}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Offline Mode */}
      <GlassCard style={{ marginBottom:14, borderColor:offlineMode?'rgba(74,158,255,.3)':'var(--border)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:offlineMode?14:0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>📡 Offline / Village Mode</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>Download exercise plans. Works on 2G networks.</div>
          </div>
          <Toggle on={offlineMode} setOn={setOfflineMode} color="var(--blue)"/>
        </div>
        <AnimatePresence>
          {offlineMode && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
              <div style={{ borderTop:'1px solid rgba(74,158,255,.2)', paddingTop:14 }}>
                {['Week 3 Exercise Pack — 12.4 MB','Emergency Guidance — 2.1 MB','Posture Reference Cards — 8.7 MB'].map((p, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:i<2?'1px solid var(--border)':'none', fontSize:13, color:'var(--text2)' }}>
                    <span>{p.split(' — ')[0]}</span>
                    <span style={{ color:downloaded?'var(--green)':'var(--blue)' }}>{downloaded?'✓ Done':p.split(' — ')[1]}</span>
                  </div>
                ))}
                <Btn variant="primary" size="sm" onClick={downloadPacks} disabled={downloading||downloaded} style={{ marginTop:12, width:'100%', justifyContent:'center' }}>
                  {downloading?'⟳ Downloading...':downloaded?'✓ All Downloaded':'Download All Packs'}
                </Btn>
                {downloading && (
                  <div style={{ marginTop:8, height:4, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
                    <motion.div initial={{ width:'0%' }} animate={{ width:'100%' }} transition={{ duration:2.2 }}
                      style={{ height:'100%', background:'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius:2 }}/>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Dark mode */}
      <GlassCard style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{themeIcon} {themeLabel}</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>Toggle interface theme</div>
          </div>
          <Toggle on={dark} setOn={() => toggle()} color="var(--purple)"/>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard style={{ marginBottom:20 }}>
        <div style={{ fontWeight:700, marginBottom:4 }}>🔔 Notifications & Reminders</div>
        <p style={{ fontSize:12, color:'var(--text2)', marginBottom:14 }}>Manage medicine, exercise, and hydration reminders.</p>
        <NotifRow label="Doctor messages" desc="Immediate push notification" defaultOn={true}/>
        <NotifRow label="Missed session alert" desc="If no session logged by 6 PM" defaultOn={true}/>
        <div style={{ marginTop:12 }}>
          <button onClick={() => window.location.href = '/patient/reminders'}
            style={{ width:'100%', padding:'11px', borderRadius:12, background:'rgba(0,212,170,.08)', border:'1px solid rgba(0,212,170,.25)', color:'var(--teal)', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            🔔 Manage All Reminders →
          </button>
        </div>
      </GlassCard>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2000) }} style={{ flex:1, justifyContent:'center' }}>
          {saved ? t('saved') : t('saveSettings')}
        </Btn>
        <Btn variant="danger" onClick={logout} style={{ flex:1, justifyContent:'center' }}>🚪 {t('signOut')}</Btn>
      </div>

      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal user={displayUser} onClose={() => setShowEditProfile(false)} onSave={setLocalUser} />
        )}
        {showChangePassword && (
          <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
