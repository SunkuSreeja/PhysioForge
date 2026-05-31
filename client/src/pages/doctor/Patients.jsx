import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn, Avatar } from '../../components/ui'
import { mockPatients } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_PATIENTS  = 'pf_doc_patients'
const LS_NOTES     = 'pf_doc_notes'
const LS_CONSULTS  = 'pf_doc_consults'

const lsGet  = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const lsSet  = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusColor = s => s === 'On Track' ? 'green' : s === 'At Risk' ? 'red' : 'amber'

// ─── Shared Modal Shell ───────────────────────────────────────────────────────
function ModalShell({ title, subtitle, onClose, children, maxWidth = 520, elderMode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <motion.div
        initial={{ opacity:0, scale:.93, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:.93, y:20 }}
        transition={{ type:'spring', stiffness:320, damping:28 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:24, width:'100%', maxWidth, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.5)' }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize: elderMode ? 22 : 18, fontWeight:800, marginBottom:4 }}>{title}</div>
            {subtitle && <div style={{ color:'var(--text2)', fontSize: elderMode ? 15 : 13 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'50%', width: elderMode ? 40 : 32, height: elderMode ? 40 : 32, cursor:'pointer', color:'var(--text2)', fontSize: elderMode ? 18 : 14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
        </div>
        <div style={{ padding:'20px 24px' }}>{children}</div>
      </motion.div>
    </motion.div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return (
    <motion.div
      initial={{ opacity:0, y:40, scale:.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:.95 }}
      style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:2000, background:'var(--bg2)', border:'1px solid rgba(0,212,170,.35)', borderRadius:14, padding:'14px 22px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 40px rgba(0,212,170,.15)', whiteSpace:'nowrap' }}>
      <span style={{ fontSize:20 }}>✅</span>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, color:'var(--teal)' }}>{message}</span>
    </motion.div>
  )
}

// ─── Inline field ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type='text', placeholder='', required=false, min, max, elderMode, as='input', rows=3 }) {
  const fs = elderMode ? 16 : 14
  const pd = elderMode ? '13px 16px' : '10px 13px'
  const shared = {
    width:'100%', boxSizing:'border-box',
    background:'var(--bg3)', border:'1px solid var(--border)',
    borderRadius:10, padding:pd, color:'var(--text)', fontSize:fs,
    fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'border-color .15s'
  }
  return (
    <div>
      <label style={{ display:'block', fontSize: elderMode ? 14 : 12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>
        {label}{required && <span style={{ color:'var(--red)' }}> *</span>}
      </label>
      {as === 'textarea'
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...shared, resize:'vertical', lineHeight:1.55 }} onFocus={e => e.target.style.borderColor='var(--teal)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} style={shared} onFocus={e => e.target.style.borderColor='var(--teal)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
      }
    </div>
  )
}

// ─── NOTES MODAL ─────────────────────────────────────────────────────────────
function NotesModal({ patient, onClose, elderMode }) {
  const [notesMap, setNotesMap] = useState(() => lsGet(LS_NOTES, {}))
  const [text, setText] = useState(notesMap[patient.id] || '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!text.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const updated = { ...notesMap, [patient.id]: text.trim() }
    lsSet(LS_NOTES, updated)
    setNotesMap(updated)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <ModalShell title={`📋 Notes — ${patient.name}`} subtitle={`${patient.diagnosis} · Age ${patient.age}`} onClose={onClose} elderMode={elderMode}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Field as="textarea" label="Clinical Notes" value={text} onChange={setText} placeholder="Write your clinical observations, treatment notes, follow-up instructions..." rows={elderMode ? 10 : 8} elderMode={elderMode} />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <Btn variant="ghost" size={elderMode?'lg':'md'} onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" size={elderMode?'lg':'md'} disabled={loading || !text.trim()} onClick={handleSave}>
            {loading ? '⟳ Saving...' : saved ? '✅ Saved!' : '💾 Save Notes'}
          </Btn>
        </div>
        {notesMap[patient.id] && notesMap[patient.id] !== text && (
          <div style={{ fontSize:12, color:'var(--text3)', textAlign:'center' }}>Unsaved changes</div>
        )}
      </div>
    </ModalShell>
  )
}

// ─── REPORT MODAL ─────────────────────────────────────────────────────────────
function ReportModal({ patient, onClose, elderMode }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    await new Promise(r => setTimeout(r, 600))
    const lines = [
      `PHYSIOFORGE PATIENT REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `──────────────────────────────`,
      `Patient: ${patient.name}`,
      `Age: ${patient.age}`,
      `Diagnosis: ${patient.diagnosis}`,
      `Status: ${patient.status}`,
      `Doctor: ${patient.doctor}`,
      ``,
      `── RECOVERY METRICS ──`,
      `Recovery Score:   ${patient.recoveryScore}%`,
      `Adherence:        ${patient.adherence}%`,
      `Pain Level:       ${patient.painLevel}/10`,
      `Posture Accuracy: ${patient.postureAccuracy}%`,
      `Streak:           ${patient.streak} days`,
      `Last Session:     ${patient.lastSession}`,
      ``,
      `── SUMMARY ──`,
      `${patient.name} is currently ${patient.status.toLowerCase()}.`,
      `Recovery at ${patient.recoveryScore}% with ${patient.adherence}% exercise adherence.`,
      `Pain reported at ${patient.painLevel}/10.`,
    ]
    const blob = new Blob([lines.join('\n')], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `report_${patient.name.replace(/\s+/g,'_')}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const metrics = [
    { label:'Recovery Score', value:`${patient.recoveryScore}%`,  color: patient.recoveryScore > 70 ? 'var(--teal)' : patient.recoveryScore > 50 ? 'var(--amber)' : 'var(--red)', bar: patient.recoveryScore },
    { label:'Adherence',      value:`${patient.adherence}%`,      color: patient.adherence > 70 ? 'var(--green)' : patient.adherence > 50 ? 'var(--amber)' : 'var(--red)', bar: patient.adherence },
    { label:'Pain Level',     value:`${patient.painLevel}/10`,    color: patient.painLevel <= 3 ? 'var(--green)' : patient.painLevel <= 6 ? 'var(--amber)' : 'var(--red)', bar: patient.painLevel * 10 },
    { label:'Posture Accuracy',value:`${patient.postureAccuracy}%`,color:'var(--blue)', bar: patient.postureAccuracy },
  ]

  const fs = elderMode ? 15 : 13

  return (
    <ModalShell title={`📊 Report — ${patient.name}`} subtitle={`${patient.diagnosis} · ${patient.status}`} onClose={onClose} maxWidth={540} elderMode={elderMode}>
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

        {/* Patient summary card */}
        <div style={{ background:'var(--bg3)', borderRadius:14, padding:16, display:'flex', gap:14, alignItems:'center' }}>
          <Avatar initials={patient.avatar} size={elderMode ? 56 : 46} />
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize: elderMode ? 20 : 16, fontWeight:800 }}>{patient.name}</div>
            <div style={{ color:'var(--text2)', fontSize:fs }}>Age {patient.age} · {patient.doctor}</div>
            <div style={{ marginTop:6 }}><Badge color={statusColor(patient.status)} style={{ fontSize:11 }}>{patient.status}</Badge></div>
          </div>
        </div>

        {/* Metrics with progress bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {metrics.map((m,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:fs, color:'var(--text2)', fontWeight:500 }}>{m.label}</span>
                <span style={{ fontSize:fs, fontWeight:700, color:m.color }}>{m.value}</span>
              </div>
              <div style={{ height:7, background:'var(--bg3)', borderRadius:4, overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${m.bar}%` }} transition={{ duration:0.9, delay: i*0.12 }}
                  style={{ height:'100%', background:m.color, borderRadius:4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Info row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { icon:'📅', label:'Last Session', value: patient.lastSession },
            { icon:'🔥', label:'Streak',        value:`${patient.streak} days` },
          ].map((item,i) => (
            <div key={i} style={{ background:'var(--bg3)', borderRadius:12, padding:'12px 14px' }}>
              <div style={{ fontSize:fs-1, color:'var(--text2)' }}>{item.icon} {item.label}</div>
              <div style={{ fontWeight:700, fontSize:fs+1, marginTop:4 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Summary text */}
        <div style={{ background:'rgba(74,158,255,.06)', border:'1px solid rgba(74,158,255,.15)', borderRadius:12, padding:14 }}>
          <div style={{ fontSize:fs-1, color:'var(--text2)', marginBottom:4, fontWeight:600 }}>📝 Summary</div>
          <div style={{ fontSize:fs, lineHeight:1.6, color:'var(--text)' }}>
            {patient.name} is currently <strong style={{ color: statusColor(patient.status) === 'green' ? 'var(--green)' : statusColor(patient.status) === 'red' ? 'var(--red)' : 'var(--amber)' }}>{patient.status.toLowerCase()}</strong>.
            Recovery at <strong>{patient.recoveryScore}%</strong> with <strong>{patient.adherence}%</strong> exercise adherence.
            Pain reported at <strong>{patient.painLevel}/10</strong>.
            {patient.streak >= 7 ? ' Strong consistency streak.' : patient.streak <= 2 ? ' Low engagement — follow-up recommended.' : ' Moderate engagement.'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="ghost" size={elderMode?'lg':'md'} onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Close</Btn>
          <Btn variant="primary" size={elderMode?'lg':'md'} onClick={handleExport} disabled={exporting} style={{ flex:2, justifyContent:'center' }}>
            {exporting ? '⟳ Exporting...' : '⬇ Download Report'}
          </Btn>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── CONSULT MODAL ────────────────────────────────────────────────────────────
function ConsultModal({ patient, onClose, elderMode }) {
  const [allConsults, setAllConsults] = useState(() => lsGet(LS_CONSULTS, {}))
  const msgs = allConsults[patient.id] || []
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [msgs])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setSending(true)
    await new Promise(r => setTimeout(r, 300))
    const newMsg = { id: Date.now(), from:'doctor', text, ts: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), date: new Date().toLocaleDateString() }
    const updated = { ...allConsults, [patient.id]: [...msgs, newMsg] }
    lsSet(LS_CONSULTS, updated)
    setAllConsults(updated)
    setInput('')
    setSending(false)
  }

  const fs = elderMode ? 15 : 13

  return (
    <ModalShell title={`💬 Consult — ${patient.name}`} subtitle={`${patient.diagnosis}`} onClose={onClose} maxWidth={500} elderMode={elderMode}>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

        {/* Chat window */}
        <div style={{ height: elderMode ? 320 : 280, overflowY:'auto', background:'var(--bg3)', borderRadius:14, padding:'12px 14px', display:'flex', flexDirection:'column', gap:10, scrollbarWidth:'thin' }}>
          {msgs.length === 0 && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontSize:fs, textAlign:'center', padding:'20px 0' }}>
              No messages yet. Start the consultation below.
            </div>
          )}
          {msgs.map((m, i) => {
            const showDate = i === 0 || msgs[i-1].date !== m.date
            return (
              <div key={m.id}>
                {showDate && (
                  <div style={{ textAlign:'center', fontSize:11, color:'var(--text3)', margin:'4px 0 8px' }}>{m.date}</div>
                )}
                <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  style={{ display:'flex', justifyContent: m.from === 'doctor' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth:'80%', background: m.from === 'doctor' ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'var(--bg2)', borderRadius: m.from === 'doctor' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding:'10px 14px', boxShadow:'0 2px 8px rgba(0,0,0,.15)' }}>
                    <div style={{ fontSize:fs, lineHeight:1.5, color: m.from === 'doctor' ? '#fff' : 'var(--text)' }}>{m.text}</div>
                    <div style={{ fontSize:10, color: m.from === 'doctor' ? 'rgba(255,255,255,.65)' : 'var(--text3)', textAlign:'right', marginTop:4 }}>{m.ts}</div>
                  </div>
                </motion.div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div style={{ display:'flex', gap:8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a consultation message..."
            style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding: elderMode ? '14px 16px' : '10px 13px', color:'var(--text)', fontSize:fs, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
            onFocus={e => e.target.style.borderColor='var(--teal)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          <Btn variant="primary" size={elderMode?'lg':'md'} onClick={send} disabled={sending || !input.trim()} style={{ flexShrink:0 }}>
            {sending ? '⟳' : '▶ Send'}
          </Btn>
        </div>
        <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>Messages are stored locally and persist after refresh.</div>
      </div>
    </ModalShell>
  )
}

// ─── ADD PATIENT MODAL ────────────────────────────────────────────────────────
const GENDERS   = ['Male', 'Female', 'Other']
const STATUSES  = ['On Track', 'At Risk', 'Monitor']
const DIAGNOSES = ['ACL Rehabilitation', 'Lower Back Pain', 'Knee Osteoarthritis', 'Hip Replacement Recovery', 'Post Shoulder Surgery', 'Cervical Spondylosis', 'Plantar Fasciitis', 'Rotator Cuff Repair', 'Other']

function AddPatientModal({ onClose, onAdd, elderMode }) {
  const [form, setForm] = useState({ name:'', age:'', gender:'Male', diagnosis:'ACL Rehabilitation', status:'On Track', condition:'' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async () => {
    if (!form.name.trim()) return setError('Patient name is required.')
    const age = Number(form.age)
    if (!form.age || isNaN(age) || age < 1 || age > 120) return setError('Enter a valid age (1–120).')
    if (!form.diagnosis) return setError('Please select a diagnosis.')
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const initials = form.name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
    const newPatient = {
      id: `p_${Date.now()}`,
      name: form.name.trim(),
      age,
      gender: form.gender,
      diagnosis: form.diagnosis,
      status: form.status,
      avatar: initials,
      adherence: 0,
      painLevel: 5,
      recoveryScore: 0,
      postureAccuracy: 0,
      lastSession: 'Not started',
      streak: 0,
      doctor: 'Dr. Arjun Sharma',
      isNew: true,
    }
    setLoading(false)
    onAdd(newPatient)
    onClose()
  }

  const selectStyle = (val, options) => ({
    width:'100%', boxSizing:'border-box',
    background:'var(--bg3)', border:'1px solid var(--border)',
    borderRadius:10, padding: elderMode ? '13px 16px' : '10px 13px',
    color:'var(--text)', fontSize: elderMode ? 16 : 14,
    fontFamily:"'DM Sans',sans-serif", outline:'none', cursor:'pointer'
  })

  return (
    <ModalShell title="➕ Add Patient" subtitle="New patient will appear in the list immediately" onClose={onClose} maxWidth={480} elderMode={elderMode}>
      <div style={{ display:'flex', flexDirection:'column', gap: elderMode ? 18 : 14 }}>
        <Field label="Full Name" value={form.name} onChange={set('name')} placeholder="e.g. Sunita Devi" required elderMode={elderMode} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field label="Age" type="number" value={form.age} onChange={set('age')} placeholder="e.g. 45" min="1" max="120" required elderMode={elderMode} />
          <div>
            <label style={{ display:'block', fontSize: elderMode ? 14 : 12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Gender <span style={{ color:'var(--red)' }}>*</span></label>
            <select value={form.gender} onChange={e => set('gender')(e.target.value)} style={selectStyle()}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ display:'block', fontSize: elderMode ? 14 : 12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Diagnosis <span style={{ color:'var(--red)' }}>*</span></label>
          <select value={form.diagnosis} onChange={e => set('diagnosis')(e.target.value)} style={selectStyle()}>
            {DIAGNOSES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize: elderMode ? 14 : 12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>Recovery Status</label>
          <div style={{ display:'flex', gap:8 }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => set('status')(s)}
                style={{ flex:1, padding: elderMode ? '12px 8px' : '9px 6px', borderRadius:10, border:`1px solid ${form.status===s ? (s==='On Track'?'var(--teal)':s==='At Risk'?'var(--red)':'var(--amber)') : 'var(--border)'}`, background: form.status===s ? (s==='On Track'?'rgba(0,212,170,.1)':s==='At Risk'?'rgba(255,107,122,.1)':'rgba(251,191,36,.1)') : 'var(--bg3)', color: form.status===s ? (s==='On Track'?'var(--teal)':s==='At Risk'?'var(--red)':'var(--amber)') : 'var(--text2)', fontSize: elderMode ? 13 : 12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight: form.status===s ? 600 : 400 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              style={{ background:'rgba(255,107,122,.08)', border:'1px solid rgba(255,107,122,.2)', borderRadius:10, padding:'10px 14px', fontSize: elderMode ? 14 : 13, color:'var(--red)' }}>
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display:'flex', gap:10 }}>
          <Btn variant="ghost" size={elderMode?'lg':'md'} onClick={onClose} style={{ flex:1, justifyContent:'center' }}>Cancel</Btn>
          <Btn variant="primary" size={elderMode?'lg':'md'} onClick={handleAdd} disabled={loading} style={{ flex:2, justifyContent:'center' }}>
            {loading ? '⟳ Adding...' : '➕ Add Patient'}
          </Btn>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DoctorPatients() {
  const { elderMode } = useAuth()

  const [patients, setPatients] = useState(() => lsGet(LS_PATIENTS, null) || mockPatients)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('All')
  const [detail,   setDetail]   = useState(null)
  const [toast,    setToast]    = useState('')

  // Modal state — one at a time
  const [notesFor,   setNotesFor]   = useState(null)
  const [reportFor,  setReportFor]  = useState(null)
  const [consultFor, setConsultFor] = useState(null)
  const [addOpen,    setAddOpen]    = useState(false)

  const showToast = msg => { setToast(msg) }

  const handleAddPatient = useCallback(patient => {
    setPatients(prev => {
      const updated = [patient, ...prev]
      lsSet(LS_PATIENTS, updated)
      return updated
    })
    showToast(`Patient "${patient.name}" added successfully`)
  }, [])

  const atRiskCount = patients.filter(p => p.status === 'At Risk').length
  const filters = ['All', 'On Track', 'At Risk', 'Monitor']

  const shown = patients.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q)
    const matchFilter = filter === 'All' || p.status === filter
    return matchSearch && matchFilter
  })

  const btnSz = elderMode ? 'sm' : 'sm'

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize: elderMode ? 30 : 26, fontWeight:800, marginBottom:4 }}>Patient List</h1>
          <p style={{ color:'var(--text2)', fontSize: elderMode ? 15 : 14 }}>{patients.length} patients · {atRiskCount} at risk</p>
        </div>
        <Btn variant="primary" size={elderMode?'md':'sm'} onClick={() => setAddOpen(true)}>+ Add Patient</Btn>
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search patients or diagnosis..."
          style={{ flex:1, minWidth:200, padding: elderMode ? '13px 16px' : '10px 14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', fontSize: elderMode ? 15 : 14, fontFamily:"'DM Sans',sans-serif", outline:'none' }}
          onFocus={e => e.target.style.borderColor='var(--teal)'}
          onBlur={e => e.target.style.borderColor='var(--border)'} />
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: elderMode ? '10px 18px' : '8px 14px', borderRadius:100, border:`1px solid ${filter===f?'var(--teal)':'var(--border)'}`, background: filter===f?'rgba(0,212,170,.12)':'var(--bg3)', color: filter===f?'var(--teal)':'var(--text2)', fontSize: elderMode ? 14 : 13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Patient cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
        <AnimatePresence>
          {shown.map((p, i) => (
            <motion.div key={p.id} layout initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:.95 }} transition={{ delay: i * .06 }}>
              <GlassCard hover onClick={() => setDetail(detail === p.id ? null : p.id)}
                style={{ cursor:'pointer', borderColor: detail === p.id ? 'var(--teal)' : 'var(--border)' }}>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Avatar initials={p.avatar} size={elderMode ? 50 : 44} />
                    <div>
                      <div style={{ fontWeight:700, fontSize: elderMode ? 17 : 15 }}>{p.name}</div>
                      <div style={{ fontSize: elderMode ? 13 : 12, color:'var(--text2)' }}>Age {p.age} · {p.diagnosis}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                    <Badge color={statusColor(p.status)} style={{ fontSize:11 }}>{p.status}</Badge>
                    {p.isNew && <Badge color="blue" style={{ fontSize:10 }}>New</Badge>}
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
                  {[
                    { l:'Adherence', v:`${p.adherence}%`,       c: p.adherence > 70 ? 'var(--teal)' : p.adherence > 50 ? 'var(--amber)' : 'var(--red)' },
                    { l:'Pain',      v:`${p.painLevel}/10`,     c: p.painLevel <= 3 ? 'var(--green)' : p.painLevel <= 6 ? 'var(--amber)' : 'var(--red)' },
                    { l:'Posture',   v:`${p.postureAccuracy}%`, c:'var(--blue)' },
                  ].map((s, idx) => (
                    <div key={idx} style={{ textAlign:'center', background:'var(--bg3)', borderRadius:8, padding: elderMode ? '10px 4px' : '8px 4px' }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize: elderMode ? 18 : 16, fontWeight:800, color:s.c }}>{s.v}</div>
                      <div style={{ fontSize: elderMode ? 11 : 10, color:'var(--text2)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize: elderMode ? 13 : 12, color:'var(--text2)' }}>
                  <span>Last: {p.lastSession}</span>
                  <span>🔥 {p.streak}-day streak</span>
                </div>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {detail === p.id && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}>
                      <div style={{ borderTop:'1px solid var(--border)', marginTop:14, paddingTop:14 }}>
                        {/* Recovery bar */}
                        <div style={{ marginBottom:8, height:6, background:'var(--bg3)', borderRadius:3, overflow:'hidden' }}>
                          <motion.div initial={{ width:0 }} animate={{ width:`${p.recoveryScore}%` }} transition={{ duration:1 }}
                            style={{ height:'100%', background:'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius:3 }} />
                        </div>
                        <div style={{ fontSize: elderMode ? 13 : 12, color:'var(--text2)', marginBottom:14 }}>
                          Recovery score: <strong style={{ color:'var(--teal)' }}>{p.recoveryScore}%</strong>
                        </div>
                        {/* Action buttons */}
                        <div style={{ display:'flex', gap:8 }}>
                          <Btn variant="primary" size={btnSz}
                            onClick={e => { e.stopPropagation(); setConsultFor(p) }}
                            style={{ flex:1, justifyContent:'center', fontSize: elderMode ? 13 : 12 }}>
                            💬 Consult
                          </Btn>
                          <Btn variant="ghost" size={btnSz}
                            onClick={e => { e.stopPropagation(); setNotesFor(p) }}
                            style={{ flex:1, justifyContent:'center', fontSize: elderMode ? 13 : 12 }}>
                            📋 Notes
                          </Btn>
                          <Btn variant="ghost" size={btnSz}
                            onClick={e => { e.stopPropagation(); setReportFor(p) }}
                            style={{ flex:1, justifyContent:'center', fontSize: elderMode ? 13 : 12 }}>
                            📊 Report
                          </Btn>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {shown.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--text2)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:'var(--text)', marginBottom:8 }}>No patients found</div>
          <div>Try a different search term or filter.</div>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {notesFor   && <NotesModal   patient={notesFor}   onClose={() => setNotesFor(null)}   elderMode={elderMode} />}
        {reportFor  && <ReportModal  patient={reportFor}  onClose={() => setReportFor(null)}  elderMode={elderMode} />}
        {consultFor && <ConsultModal patient={consultFor} onClose={() => setConsultFor(null)} elderMode={elderMode} />}
        {addOpen    && <AddPatientModal onClose={() => setAddOpen(false)} onAdd={handleAddPatient} elderMode={elderMode} />}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  )
}
