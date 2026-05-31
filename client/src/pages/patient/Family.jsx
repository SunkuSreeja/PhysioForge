// Family.jsx — Full Add/Edit/Delete Family Members with localStorage + i18n + Elder Mode
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard, Badge, Btn } from '../../components/ui'
import { weeklyData } from '../../data/mockData'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useLang } from '../../i18n'
import { useAuth } from '../../context/AuthContext'

// ── i18n labels (fallback to English) ──────────────────────────────────────
const FM_LABELS = {
  en: {
    title: 'Family Connect',
    subtitle: 'Your care team can monitor your progress and receive alerts.',
    connected: '👨‍👩‍👧 Connected Family Members',
    addMember: '+ Add Family Member',
    addTitle: 'Add Family Member',
    editTitle: 'Edit Family Member',
    nameLbl: 'Full Name',
    namePh: 'e.g. Ramesh Singh',
    relationLbl: 'Relation',
    relationPh: 'e.g. Son, Daughter, Spouse…',
    ageLbl: 'Age',
    agePh: 'e.g. 35',
    contactLbl: 'Contact Number',
    contactPh: '10-digit mobile number',
    emergencyLbl: 'Emergency Contact',
    emergencyDesc: 'Notify this person in case of emergency',
    save: 'Save Member',
    saving: 'Saving…',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    emptyName: 'Name is required.',
    emptyRelation: 'Relation is required.',
    emptyContact: 'Contact number is required.',
    invalidContact: 'Enter a valid 10-digit phone number.',
    emptyAge: 'Age is required.',
    invalidAge: 'Enter a valid age (1–120).',
    active: 'Active',
    emergency: 'Emergency',
    weeklyTitle: '📊 This Week — Shared View',
    noMembers: 'No family members added yet.',
    confirmDelete: 'Remove this family member?',
    yes: 'Yes, Remove',
    no: 'Keep',
  },
  hi: {
    title: 'परिवार कनेक्ट',
    subtitle: 'आपकी देखभाल टीम आपकी प्रगति देख सकती है और अलर्ट पा सकती है।',
    connected: '👨‍👩‍👧 जुड़े परिवार के सदस्य',
    addMember: '+ परिवार का सदस्य जोड़ें',
    addTitle: 'परिवार का सदस्य जोड़ें',
    editTitle: 'सदस्य संपादित करें',
    nameLbl: 'पूरा नाम',
    namePh: 'जैसे रमेश सिंह',
    relationLbl: 'संबंध',
    relationPh: 'जैसे बेटा, बेटी, पति/पत्नी…',
    ageLbl: 'उम्र',
    agePh: 'जैसे 35',
    contactLbl: 'संपर्क नंबर',
    contactPh: '10 अंकों का मोबाइल नंबर',
    emergencyLbl: 'आपातकालीन संपर्क',
    emergencyDesc: 'आपातकाल में इन्हें सूचित करें',
    save: 'सदस्य सहेजें',
    saving: 'सहेजा जा रहा है…',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    emptyName: 'नाम आवश्यक है।',
    emptyRelation: 'संबंध आवश्यक है।',
    emptyContact: 'संपर्क नंबर आवश्यक है।',
    invalidContact: '10 अंकों का वैध फ़ोन नंबर दर्ज करें।',
    emptyAge: 'उम्र आवश्यक है।',
    invalidAge: 'वैध उम्र दर्ज करें (1–120)।',
    active: 'सक्रिय',
    emergency: 'आपातकाल',
    weeklyTitle: '📊 इस सप्ताह — साझा दृश्य',
    noMembers: 'अभी तक कोई परिवार सदस्य नहीं जोड़ा।',
    confirmDelete: 'इस परिवार के सदस्य को हटाएं?',
    yes: 'हाँ, हटाएं',
    no: 'रखें',
  },
  te: {
    title: 'కుటుంబ కనెక్ట్',
    subtitle: 'మీ సంరక్షణ బృందం మీ పురోగతిని పర్యవేక్షించవచ్చు మరియు అలర్ట్‌లు పొందవచ్చు.',
    connected: '👨‍👩‍👧 అనుసంధానించిన కుటుంబ సభ్యులు',
    addMember: '+ కుటుంబ సభ్యుడిని జోడించు',
    addTitle: 'కుటుంబ సభ్యుడిని జోడించు',
    editTitle: 'సభ్యుడిని సవరించు',
    nameLbl: 'పూర్తి పేరు',
    namePh: 'ఉదా. రమేష్ సింగ్',
    relationLbl: 'సంబంధం',
    relationPh: 'ఉదా. కుమారుడు, కుమార్తె, జీవిత భాగస్వామి…',
    ageLbl: 'వయసు',
    agePh: 'ఉదా. 35',
    contactLbl: 'సంప్రదింపు నంబర్',
    contactPh: '10 అంకెల మొబైల్ నంబర్',
    emergencyLbl: 'అత్యవసర సంప్రదింపు',
    emergencyDesc: 'అత్యవసర పరిస్థితిలో ఈ వ్యక్తికి తెలియజేయు',
    save: 'సభ్యుడిని సేవ్ చేయి',
    saving: 'సేవ్ అవుతోంది…',
    cancel: 'రద్దు చేయి',
    edit: 'సవరించు',
    delete: 'తొలగించు',
    emptyName: 'పేరు అవసరం.',
    emptyRelation: 'సంబంధం అవసరం.',
    emptyContact: 'సంప్రదింపు నంబర్ అవసరం.',
    invalidContact: 'చెల్లుబాటు అయ్యే 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి.',
    emptyAge: 'వయసు అవసరం.',
    invalidAge: 'చెల్లుబాటు అయ్యే వయసు నమోదు చేయండి (1–120).',
    active: 'యాక్టివ్',
    emergency: 'అత్యవసరం',
    weeklyTitle: '📊 ఈ వారం — భాగస్వామ్య వీక్షణ',
    noMembers: 'ఇంకా కుటుంబ సభ్యులు జోడించబడలేదు.',
    confirmDelete: 'ఈ కుటుంబ సభ్యుడిని తొలగించాలా?',
    yes: 'అవును, తొలగించు',
    no: 'ఉంచు',
  },
}

const STORAGE_KEY = 'pf_family_members'

const BLANK_FORM = { name: '', relation: '', age: '', contact: '', emergency: false }

function loadMembers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return [
    { id: '1', name: 'Ramesh Singh', relation: 'Son', age: '38', contact: '9876543210', emergency: true },
    { id: '2', name: 'Sunita Singh', relation: 'Daughter-in-law', age: '34', contact: '9876543211', emergency: false },
  ]
}

function saveMembers(members) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(members)) } catch {}
}

// ── Avatar color palette ────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,var(--purple),var(--blue))',
  'linear-gradient(135deg,var(--teal),var(--blue))',
  'linear-gradient(135deg,var(--amber),var(--orange,#f59e0b))',
  'linear-gradient(135deg,var(--green),var(--teal))',
  'linear-gradient(135deg,#e879f9,var(--purple))',
]

// ── Field component ──────────────────────────────────────────────────────────
function Field({ label, error, elder, children }) {
  return (
    <div style={{ marginBottom: elder ? 20 : 14 }}>
      <label style={{ display:'block', fontSize: elder ? 15 : 12, fontWeight:600, color:'var(--text2)', marginBottom: elder ? 8 : 4 }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: elder ? 13 : 11, color:'var(--red,#ef4444)', marginTop:4 }}>{error}</div>
      )}
    </div>
  )
}

// ── Delete confirm mini-modal ────────────────────────────────────────────────
function DeleteConfirm({ lbl, elder, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.92 }}
      animate={{ opacity:1, scale:1 }}
      exit={{ opacity:0, scale:0.92 }}
      style={{
        position:'fixed', inset:0, zIndex:1100,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:24,
        background:'rgba(0,0,0,0.55)',
        backdropFilter:'blur(4px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:18, padding: elder ? 32 : 24,
          maxWidth:340, width:'100%',
          boxShadow:'0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontSize: elder ? 17 : 15, fontWeight:600, marginBottom: elder ? 24 : 18, lineHeight:1.4 }}>
          {lbl.confirmDelete}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button
            onClick={onConfirm}
            style={{
              flex:1, padding: elder ? '14px 0' : '10px 0', borderRadius:10,
              background:'var(--red,#ef4444)', border:'none', color:'#fff',
              fontWeight:700, fontSize: elder ? 15 : 13, cursor:'pointer',
              transition:'opacity .15s',
            }}
            onMouseEnter={e => e.target.style.opacity='.8'}
            onMouseLeave={e => e.target.style.opacity='1'}
          >{lbl.yes}</button>
          <button
            onClick={onCancel}
            style={{
              flex:1, padding: elder ? '14px 0' : '10px 0', borderRadius:10,
              background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)',
              fontWeight:600, fontSize: elder ? 15 : 13, cursor:'pointer',
              transition:'opacity .15s',
            }}
            onMouseEnter={e => e.target.style.opacity='.8'}
            onMouseLeave={e => e.target.style.opacity='1'}
          >{lbl.no}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Add/Edit Modal ───────────────────────────────────────────────────────────
function MemberModal({ lbl, elder, editingMember, onSave, onClose }) {
  const [form, setForm] = useState(editingMember
    ? { name: editingMember.name, relation: editingMember.relation, age: editingMember.age, contact: editingMember.contact, emergency: editingMember.emergency }
    : { ...BLANK_FORM }
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => {
    setTimeout(() => firstRef.current?.focus(), 80)
  }, [])

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = lbl.emptyName
    if (!form.relation.trim()) e.relation = lbl.emptyRelation
    if (!form.age.trim()) e.age = lbl.emptyAge
    else if (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) e.age = lbl.invalidAge
    if (!form.contact.trim()) e.contact = lbl.emptyContact
    else if (!/^\d{10}$/.test(form.contact.replace(/\s/g, ''))) e.contact = lbl.invalidContact
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 320)) // micro-delay for UX feel
    onSave(form)
    setSaving(false)
  }

  const inputStyle = {
    width:'100%', padding: elder ? '13px 14px' : '9px 12px',
    background:'var(--bg3)', border:'1px solid var(--border)',
    borderRadius:10, color:'var(--text)', fontSize: elder ? 15 : 13,
    outline:'none', transition:'border-color .15s', boxSizing:'border-box',
  }
  const focusStyle = { borderColor:'var(--teal)' }

  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'16px',
        background:'rgba(0,0,0,0.6)',
        backdropFilter:'blur(6px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity:0, y:40, scale:0.95 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:30, scale:0.95 }}
        transition={{ type:'spring', stiffness:380, damping:32 }}
        onClick={e => e.stopPropagation()}
        style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:20, padding: elder ? 32 : 24,
          maxWidth:480, width:'100%',
          maxHeight:'90vh', overflowY:'auto',
          boxShadow:'0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: elder ? 28 : 20 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize: elder ? 22 : 18, fontWeight:800, margin:0 }}>
            {editingMember ? lbl.editTitle : lbl.addTitle}
          </h2>
          <button
            onClick={onClose}
            style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, width: elder?40:32, height: elder?40:32, cursor:'pointer', color:'var(--text2)', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg3)'}
          >✕</button>
        </div>

        {/* Name */}
        <Field label={lbl.nameLbl} error={errors.name} elder={elder}>
          <input
            ref={firstRef}
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder={lbl.namePh}
            style={{ ...inputStyle, ...(errors.name ? { borderColor:'var(--red,#ef4444)' } : {}) }}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => e.target.style.borderColor = errors.name ? 'var(--red,#ef4444)' : 'var(--border)'}
          />
        </Field>

        {/* Relation */}
        <Field label={lbl.relationLbl} error={errors.relation} elder={elder}>
          <input
            value={form.relation}
            onChange={e => set('relation', e.target.value)}
            placeholder={lbl.relationPh}
            style={{ ...inputStyle, ...(errors.relation ? { borderColor:'var(--red,#ef4444)' } : {}) }}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => e.target.style.borderColor = errors.relation ? 'var(--red,#ef4444)' : 'var(--border)'}
          />
        </Field>

        {/* Age */}
        <Field label={lbl.ageLbl} error={errors.age} elder={elder}>
          <input
            value={form.age}
            onChange={e => set('age', e.target.value)}
            placeholder={lbl.agePh}
            inputMode="numeric"
            style={{ ...inputStyle, ...(errors.age ? { borderColor:'var(--red,#ef4444)' } : {}) }}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => e.target.style.borderColor = errors.age ? 'var(--red,#ef4444)' : 'var(--border)'}
          />
        </Field>

        {/* Contact */}
        <Field label={lbl.contactLbl} error={errors.contact} elder={elder}>
          <input
            value={form.contact}
            onChange={e => set('contact', e.target.value.replace(/\D/g,'').slice(0,10))}
            placeholder={lbl.contactPh}
            inputMode="tel"
            style={{ ...inputStyle, ...(errors.contact ? { borderColor:'var(--red,#ef4444)' } : {}) }}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => e.target.style.borderColor = errors.contact ? 'var(--red,#ef4444)' : 'var(--border)'}
          />
        </Field>

        {/* Emergency toggle */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding: elder ? '16px 14px' : '12px 12px',
          background:'var(--bg3)', borderRadius:12,
          border:'1px solid var(--border)', marginBottom: elder ? 28 : 20,
        }}>
          <div>
            <div style={{ fontWeight:600, fontSize: elder ? 15 : 13 }}>{lbl.emergencyLbl}</div>
            <div style={{ fontSize: elder ? 13 : 11, color:'var(--text2)', marginTop:2 }}>{lbl.emergencyDesc}</div>
          </div>
          <button
            onClick={() => set('emergency', !form.emergency)}
            style={{
              width: elder ? 52 : 44, height: elder ? 28 : 24,
              borderRadius: 100, background: form.emergency ? 'var(--teal)' : 'var(--bg4)',
              border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0,
            }}
            aria-label={lbl.emergencyLbl}
          >
            <div style={{
              width: elder ? 22 : 18, height: elder ? 22 : 18,
              borderRadius:'50%', background:'#fff', position:'absolute',
              top: elder ? 3 : 3,
              left: form.emergency ? (elder ? 27 : 23) : 3,
              transition:'left .2s',
              boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', gap:10 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex:1, padding: elder ? '16px 0' : '11px 0', borderRadius:12,
              background: saving ? 'var(--bg4)' : 'var(--teal)',
              border:'none', color: saving ? 'var(--text2)' : '#fff',
              fontWeight:700, fontSize: elder ? 16 : 14, cursor: saving ? 'default' : 'pointer',
              transition:'all .15s', fontFamily:"'DM Sans',sans-serif",
            }}
            onMouseEnter={e => { if(!saving) e.currentTarget.style.opacity='.85' }}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >{saving ? lbl.saving : lbl.save}</button>
          <button
            onClick={onClose}
            style={{
              padding: elder ? '16px 22px' : '11px 18px', borderRadius:12,
              background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)',
              fontWeight:600, fontSize: elder ? 15 : 13, cursor:'pointer',
              transition:'background .15s', fontFamily:"'DM Sans',sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg3)'}
          >{lbl.cancel}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main FamilyPage ──────────────────────────────────────────────────────────
export function FamilyPage() {
  const { lang } = useLang()
  const { elderMode } = useAuth()
  const lbl = FM_LABELS[lang] || FM_LABELS.en

  const [members, setMembers] = useState(() => loadMembers())
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null) // null = add, object = edit
  const [deleteId, setDeleteId] = useState(null)
  const [sent, setSent] = useState({})

  // Persist on change
  useEffect(() => { saveMembers(members) }, [members])

  const openAdd = () => { setEditingMember(null); setShowModal(true) }
  const openEdit = (m) => { setEditingMember(m); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditingMember(null) }

  const handleSave = (form) => {
    if (editingMember) {
      setMembers(ms => ms.map(m => m.id === editingMember.id ? { ...m, ...form } : m))
    } else {
      const newMember = { id: Date.now().toString(), ...form }
      setMembers(ms => [...ms, newMember])
    }
    closeModal()
  }

  const handleDelete = (id) => { setDeleteId(id) }
  const confirmDelete = () => {
    setMembers(ms => ms.filter(m => m.id !== deleteId))
    setDeleteId(null)
  }

  const em = elderMode
  const cardPad = em ? 24 : 18

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: em ? 28 : 22 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize: em ? 30 : 26, fontWeight:800, marginBottom:6 }}>
          {lbl.title}
        </h1>
        <p style={{ color:'var(--text2)', fontSize: em ? 16 : 14 }}>{lbl.subtitle}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:20 }}>

        {/* ── Connected Members Card ── */}
        <GlassCard style={{ padding: cardPad }}>
          <div style={{ fontWeight:700, marginBottom:16, fontSize: em ? 16 : 14 }}>{lbl.connected}</div>

          <AnimatePresence initial={false}>
            {members.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                exit={{ opacity:0 }}
                style={{ color:'var(--text2)', fontSize: em ? 15 : 13, padding:'12px 0', textAlign:'center' }}
              >
                {lbl.noMembers}
              </motion.div>
            )}
            {members.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity:0, x:-16 }}
                animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:16, height:0, marginBottom:0 }}
                transition={{ duration:0.25, delay: i * 0.04 }}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding: em ? '14px 0' : '10px 0',
                  borderBottom: i < members.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: em ? 46 : 40, height: em ? 46 : 40,
                  borderRadius:'50%',
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize: em ? 18 : 16, color:'#fff', fontWeight:700, flexShrink:0,
                }}>
                  {m.name[0]?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize: em ? 15 : 14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: em ? 13 : 12, color:'var(--text2)' }}>
                    {m.relation}{m.age ? ` · ${m.age}y` : ''}
                  </div>
                  {m.contact && (
                    <div style={{ fontSize: em ? 12 : 11, color:'var(--text3,var(--text2))', marginTop:1 }}>
                      📞 {m.contact}
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end', flexShrink:0 }}>
                  <Badge color="green">{lbl.active}</Badge>
                  {m.emergency && <Badge color="red">{lbl.emergency}</Badge>}
                </div>

                {/* Action buttons */}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button
                    onClick={() => openEdit(m)}
                    title={lbl.edit}
                    style={{
                      width: em ? 36 : 30, height: em ? 36 : 30,
                      borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)',
                      cursor:'pointer', color:'var(--text2)', fontSize: em ? 15 : 13,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='var(--bg4)'; e.currentTarget.style.color='var(--teal)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text2)' }}
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    title={lbl.delete}
                    style={{
                      width: em ? 36 : 30, height: em ? 36 : 30,
                      borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)',
                      cursor:'pointer', color:'var(--text2)', fontSize: em ? 15 : 13,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,.12)'; e.currentTarget.style.color='var(--red,#ef4444)' }}
                    onMouseLeave={e => { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text2)' }}
                  >🗑️</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add button */}
          <motion.button
            whileHover={{ scale:1.02 }}
            whileTap={{ scale:0.97 }}
            onClick={openAdd}
            style={{
              marginTop: em ? 18 : 14, width:'100%',
              padding: em ? '14px 0' : '10px 0',
              borderRadius:12, background:'var(--bg3)',
              border:'1.5px dashed var(--teal)',
              color:'var(--teal)', fontWeight:700,
              fontSize: em ? 16 : 13, cursor:'pointer',
              transition:'background .15s',
              fontFamily:"'DM Sans',sans-serif",
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(0,212,170,.08)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--bg3)'}
          >
            {lbl.addMember}
          </motion.button>
        </GlassCard>

        {/* ── Weekly Share Card ── */}
        <GlassCard style={{ padding: cardPad }}>
          <div style={{ fontWeight:700, marginBottom:16, fontSize: em ? 16 : 14 }}>{lbl.weeklyTitle}</div>
          <ResponsiveContainer width="100%" height={em ? 140 : 120}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fill:'var(--text3,var(--text2))', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }} />
              <Bar dataKey="score" fill="#00d4aa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:12, marginTop:12, fontSize: em ? 14 : 12, color:'var(--text2)' }}>
            <span>Sessions: <strong style={{ color:'var(--teal)' }}>5/7</strong></span>
            <span>Pain today: <strong style={{ color:'var(--green)' }}>3/10</strong></span>
            <span>Streak: <strong style={{ color:'var(--amber)' }}>🔥 8</strong></span>
          </div>
        </GlassCard>
      </div>

      {/* ── Alert Settings ── */}
      <GlassCard style={{ marginBottom:20, padding: cardPad }}>
        <div style={{ fontWeight:700, marginBottom:16, fontSize: em ? 16 : 14 }}>🔔 Alert Preferences</div>
        {[
          { label:'Missed session alerts', desc:'Notify caretaker when session is skipped', key:'missed' },
          { label:'Pain spike alerts', desc:'Alert when pain level exceeds 7/10', key:'pain' },
          { label:'Daily summary', desc:'Send end-of-day progress report', key:'daily' },
          { label:'Emergency alerts', desc:'Immediately notify if SOS triggered', key:'sos' },
        ].map((a, i) => (
          <div key={i} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding: em ? '16px 0' : '12px 0',
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <div style={{ fontWeight:500, fontSize: em ? 15 : 14 }}>{a.label}</div>
              <div style={{ fontSize: em ? 13 : 12, color:'var(--text2)' }}>{a.desc}</div>
            </div>
            <button
              onClick={() => setSent(s => ({ ...s, [a.key]: !s[a.key] }))}
              style={{
                width: em ? 52 : 44, height: em ? 28 : 24, borderRadius:12,
                background: sent[a.key] === false ? 'var(--bg4)' : 'var(--teal)',
                border:'none', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0,
              }}
            >
              <div style={{
                width: em ? 22 : 18, height: em ? 22 : 18,
                borderRadius:'50%', background:'#fff', position:'absolute',
                top:3, left: sent[a.key] === false ? 3 : (em ? 27 : 23),
                transition:'left .2s',
              }} />
            </button>
          </div>
        ))}
      </GlassCard>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <MemberModal
            key="member-modal"
            lbl={lbl}
            elder={em}
            editingMember={editingMember}
            onSave={handleSave}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <DeleteConfirm
            key="delete-confirm"
            lbl={lbl}
            elder={em}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default FamilyPage
