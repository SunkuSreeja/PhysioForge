import { useState } from 'react'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../i18n'

function Toggle({ on, setOn, color='var(--teal)' }) {
  return (
    <button onClick={() => setOn(v=>!v)} style={{ width:48, height:26, borderRadius:13, background:on?color:'var(--bg4)', border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:4, left:on?26:4, transition:'left .18s' }}/>
    </button>
  )
}

export default function CaretakerSettings() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { lang, setLanguage, t, languageNames } = useLang()
  const [saved, setSaved] = useState(false)

  return (
    <div style={{ maxWidth:580 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, marginBottom:6 }}>Settings</h1>
      </div>
      <GlassCard style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:14 }}>Caretaker Profile</div>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,var(--purple),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
            {user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style={{ fontWeight:600 }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>{user?.email}</div>
            <Badge color="purple" style={{ marginTop:4 }}>Caretaker</Badge>
          </div>
        </div>
      </GlassCard>
      <GlassCard style={{ marginBottom:14 }}>
        <div style={{ fontWeight:700, marginBottom:12 }}>🌐 Language</div>
        <div style={{ display:'flex', gap:8 }}>
          {Object.entries(languageNames).map(([code,name]) => (
            <button key={code} onClick={() => setLanguage(code)}
              style={{ flex:1, padding:'8px 4px', borderRadius:10, fontSize:12, border:`1px solid ${lang===code?'var(--teal)':'var(--border)'}`, background:lang===code?'rgba(0,212,170,.1)':'var(--bg3)', color:lang===code?'var(--teal)':'var(--text2)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              {name}
            </button>
          ))}
        </div>
      </GlassCard>
      <GlassCard style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700 }}>{dark?'🌙 Dark':'☀️ Light'} Mode</div>
            <div style={{ fontSize:13, color:'var(--text2)' }}>Toggle interface theme</div>
          </div>
          <Toggle on={dark} setOn={() => toggle()} color="var(--purple)"/>
        </div>
      </GlassCard>
      <div style={{ display:'flex', gap:10 }}>
        <Btn variant="primary" onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2000) }} style={{ flex:1, justifyContent:'center' }}>
          {saved?'✓ Saved!':'Save Settings'}
        </Btn>
        <Btn variant="danger" onClick={logout} style={{ flex:1, justifyContent:'center' }}>🚪 Sign Out</Btn>
      </div>
    </div>
  )
}
