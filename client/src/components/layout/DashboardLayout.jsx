import ErrorBoundary from '../ErrorBoundary'
import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../i18n'
import VoiceAssistant from '../VoiceAssistant'
import BadgeToast from '../BadgeToast'
import { OnlineStatusDot } from '../PWAShell'

function buildNav(role, t) {
  const patient = [
    { to:'/patient/dashboard', icon:'🏠', key:'dashboard' },
    { to:'/patient/journey',   icon:'🗺️', key:'journey' },
    { to:'/patient/exercises', icon:'🏋️', key:'exercises' },
    { to:'/patient/posture',   icon:'🎯', key:'posture' },
    { to:'/patient/feed',      icon:'📚', key:'feed' },
    { to:'/patient/analytics', icon:'📊', key:'analytics' },
    { to:'/patient/remedies',  icon:'🌿', key:'remedies' },
    { to:'/patient/reminders', icon:'🔔', key:'reminders' },
    { to:'/patient/family',    icon:'👨‍👩‍👧', key:'family' },
    { to:'/patient/teleconsult',icon:'📹',key:'teleconsult' },
    { to:'/patient/emergency', icon:'🆘', key:'emergency' },
    { to:'/patient/settings',  icon:'⚙️', key:'settings' },
  ]
  const doctor = [
    { to:'/doctor/dashboard',    icon:'📊', key:'dashboard' },
    { to:'/doctor/patients',     icon:'👥', key:'patients' },
    { to:'/doctor/appointments', icon:'📅', key:'teleconsult' },
    { to:'/doctor/analytics',    icon:'📈', key:'analytics' },
    { to:'/doctor/settings',     icon:'⚙️', key:'settings' },
  ]
  const caretaker = [
    { to:'/caretaker/dashboard',    icon:'❤️', key:'dashboard' },
    { to:'/caretaker/alerts',       icon:'🔔', key:'alerts' },
    { to:'/caretaker/appointments', icon:'📅', key:'teleconsult' },
    { to:'/caretaker/settings',     icon:'⚙️', key:'settings' },
  ]
  const list = role==='doctor' ? doctor : role==='caretaker' ? caretaker : patient
  return list.map(item => ({ ...item, label: item.label || t(item.key) }))
}

/* ── Elder sidebar item (bigger) ─────────────────────────────────────────────── */
function ElderNavItem({ item, onClick }) {
  return (
    <NavLink to={item.to} onClick={onClick}
      style={({ isActive }) => ({
        display:'flex', alignItems:'center', gap:14, padding:'16px 24px',
        color: isActive ? 'var(--teal)' : 'var(--text2)',
        background: isActive ? 'rgba(0,212,170,.08)' : 'transparent',
        borderLeft:`4px solid ${isActive?'var(--teal)':'transparent'}`,
        textDecoration:'none', transition:'all .15s', fontSize:17, fontWeight:600,
      })}>
      <span style={{ fontSize:24 }}>{item.icon}</span>
      {item.label}
    </NavLink>
  )
}

function NormalNavItem({ item, onClick }) {
  return (
    <NavLink to={item.to} onClick={onClick}
      style={({ isActive }) => ({
        display:'flex', alignItems:'center', gap:10, padding:'10px 24px',
        color: isActive ? 'var(--teal)' : 'var(--text2)',
        background: isActive ? 'rgba(0,212,170,.06)' : 'transparent',
        borderLeft:`3px solid ${isActive?'var(--teal)':'transparent'}`,
        textDecoration:'none', transition:'all .15s', fontSize:13, fontWeight:500,
      })}>
      <span style={{ fontSize:15 }}>{item.icon}</span>
      {item.label}
    </NavLink>
  )
}

export default function DashboardLayout() {
  const { user, logout, elderMode } = useAuth()
  const { dark, toggle } = useTheme()
  const { lang, setLanguage, t, languageNames } = useLang()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = buildNav(user?.role, t)
  const roleLabel = user?.role==='doctor' ? '👨‍⚕️ Doctor' : user?.role==='caretaker' ? '👨‍👩‍👧 Caretaker' : elderMode ? '👴 Patient (Simple)' : '🏃 Patient'
  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || 'U'

  const handleLogout = () => { logout(); navigate('/') }
  const closeMobile = () => setMobileOpen(false)

  /* ── Sidebar content ──────────────────────────────────────────────────────── */
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: elderMode?'22px 24px 16px':'18px 24px 14px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:elderMode?22:20, fontWeight:800, background:'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          ⚕ PhysioForge
        </div>
        <div style={{ fontSize:elderMode?13:11, color:'var(--text3)', marginTop:2 }}>{roleLabel}</div>
        {elderMode && <div style={{ marginTop:6, display:'inline-block', padding:'2px 10px', borderRadius:100, background:'rgba(251,191,36,.15)', color:'var(--amber)', fontSize:11, border:'1px solid rgba(251,191,36,.3)' }}>👴 Simple Mode ON</div>}
      </div>

      {/* User */}
      <div style={{ padding:elderMode?'16px 24px':'12px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:elderMode?44:36, height:elderMode?44:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:elderMode?16:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ overflow:'hidden' }}>
          <div style={{ fontWeight:600, fontSize:elderMode?15:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'User'}</div>
          <div style={{ fontSize:elderMode?12:11, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email||''}</div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
        {nav.map(item => elderMode
          ? <ElderNavItem key={item.to} item={item} onClick={closeMobile} />
          : <NormalNavItem key={item.to} item={item} onClick={closeMobile} />
        )}
      </nav>

      {/* Lang + dark + logout */}
      <div style={{ padding:elderMode?'16px 24px':'12px 24px', borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:elderMode?12:8 }}>
        {/* Language switcher */}
        <div style={{ display:'flex', gap:4 }}>
          {Object.entries(languageNames).map(([code, name]) => (
            <button key={code} onClick={() => setLanguage(code)}
              style={{ flex:1, padding:elderMode?'6px 4px':'4px', borderRadius:8, fontSize:elderMode?12:10, border:`1px solid ${lang===code?'var(--teal)':'var(--border)'}`, background:lang===code?'rgba(0,212,170,.1)':'var(--bg3)', color:lang===code?'var(--teal)':'var(--text2)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              {name}
            </button>
          ))}
        </div>
        <button onClick={toggle}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:elderMode?15:13, padding:'4px 0', fontFamily:"'DM Sans',sans-serif" }}>
          {dark?'☀️':'🌙'} {dark?t('lightMode'):t('darkMode')}
        </button>
        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:elderMode?15:13, padding:'4px 0', fontFamily:"'DM Sans',sans-serif" }}>
          🚪 {t('signOut')}
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside style={{ width:elderMode?260:240, background:'var(--bg2)', borderRight:'1px solid var(--border)', position:'fixed', top:0, left:0, bottom:0, zIndex:50, display:'flex', flexDirection:'column' }}
        className="hidden-mobile">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={closeMobile}
              style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:49 }} />
            <motion.aside initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }} transition={{ type:'tween', duration:.25 }}
              style={{ width:elderMode?270:248, background:'var(--bg2)', borderRight:'1px solid var(--border)', position:'fixed', top:0, left:0, bottom:0, zIndex:60, display:'flex', flexDirection:'column' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main style={{ flex:1, marginLeft:elderMode?260:240, display:'flex', flexDirection:'column', minHeight:'100vh' }} className="main-content">
        {/* Topbar */}
        <header style={{ height:elderMode?68:60, background:'rgba(5,11,24,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:`0 ${elderMode?24:20}px`, position:'sticky', top:0, zIndex:40 }}>
          <button onClick={() => setMobileOpen(o=>!o)} className="mobile-menu-btn"
            style={{ background:'none', border:'none', color:'var(--text)', cursor:'pointer', fontSize:22, display:'none' }}>☰</button>
          <OnlineStatusDot elderMode={elderMode} />
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button onClick={toggle}
              style={{ background:'var(--glass2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'var(--text)', fontSize:elderMode?16:14 }}>
              {dark?'☀️':'🌙'}
            </button>
            <div style={{ width:elderMode?40:34, height:elderMode?40:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:elderMode?15:12, fontWeight:700, color:'#fff', cursor:'pointer' }}>
              {initials}
            </div>
          </div>
        </header>

        <div style={{ flex:1, padding:elderMode?'32px 28px':'24px 28px', overflowY:'auto' }}>
          <ErrorBoundary><Outlet /></ErrorBoundary>
        </div>
      </main>

      <VoiceAssistant />
      <BadgeToast />

      <style>{`
        @media(max-width:768px){
          .hidden-mobile{display:none!important}
          .main-content{margin-left:0!important}
          .mobile-menu-btn{display:flex!important}
        }
      `}</style>
    </div>
  )
}
