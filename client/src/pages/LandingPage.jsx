import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Btn, Badge } from '../components/ui'
import { testimonials } from '../data/mockData'

const features = [
  { icon: '🧠', title: 'AI Posture Correction', desc: 'Real-time skeleton tracking with joint-by-joint coaching. No wearables. Just your phone camera.', color: 'teal' },
  { icon: '📡', title: 'Offline Village Mode', desc: 'Exercise plans download for offline use. Works on 2G. Built for rural India.', color: 'blue' },
  { icon: '🎙️', title: 'Voice Therapist', desc: 'Speaks instructions in Hindi, Telugu, Tamil, Bengali & more. Perfect for elderly patients.', color: 'purple' },
  { icon: '👨‍⚕️', title: 'Doctor Dashboard', desc: 'Monitor adherence, pain trends, and posture accuracy across your entire patient list.', color: 'amber' },
  { icon: '👨‍👩‍👧', title: 'Family Connect', desc: 'Caretakers stay informed. Emergency alerts and daily recovery summaries.', color: 'green' },
  { icon: '📊', title: 'Recovery Analytics', desc: 'Duolingo-style consistency scores. Spotify Wrapped-style monthly reviews.', color: 'red' },
]

const stats = [
  { v: '94%', l: 'Recovery Rate' }, { v: '2.4M', l: 'Sessions Done' },
  { v: '18k', l: 'Rural Users' }, { v: '98%', l: 'Satisfaction' },
]

const faqs = [
  { q: 'Does it need special equipment?', a: 'No. PhysioForge works with any smartphone camera. No wearables, no sensors.' },
  { q: 'Is it available in regional languages?', a: 'Yes — Hindi, Telugu, Tamil, Bengali, Kannada, and English are supported in the voice interface.' },
  { q: 'Can doctors monitor remotely?', a: 'Absolutely. Doctors get a full dashboard showing adherence, pain trends, and posture accuracy.' },
  { q: 'Does it work without internet?', a: 'Core exercises work completely offline. Session data syncs automatically when connectivity returns.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,11,24,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚕ PhysioForge</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Btn>
          <Btn variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started Free</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, background: 'radial-gradient(ellipse,rgba(0,212,170,.1) 0%,transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 300, right: -100, width: 600, height: 600, background: 'radial-gradient(ellipse,rgba(74,158,255,.07) 0%,transparent 65%)', pointerEvents: 'none' }} />

        {/* Floating orbs */}
        {[{ t: '15%', l: '6%', s: 80, c: 'rgba(0,212,170,.25),rgba(74,158,255,.15)', d: 0 }, { t: '25%', r: '8%', s: 55, c: 'rgba(167,139,250,.25),rgba(0,212,170,.15)', d: .7 }, { b: '20%', l: '10%', s: 65, c: 'rgba(74,158,255,.2),rgba(0,212,170,.12)', d: .4 }].map((o, i) => (
          <motion.div key={i} style={{ position: 'absolute', top: o.t, left: o.l, right: o.r, bottom: o.b, width: o.s, height: o.s, borderRadius: '50%', background: `linear-gradient(135deg,${o.c})` }}
            animate={{ y: [0, -12, 0] }} transition={{ duration: 4 + i * .5, repeat: Infinity, delay: o.d, ease: 'easeInOut' }} />
        ))}

        <div style={{ maxWidth: 880, position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
            <Badge color="teal" className="mb-5">✨ AI-Powered Rehabilitation Platform</Badge>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .6 }}
            style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(40px,7vw,82px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 24, marginTop: 16 }}>
            Turn physiotherapy into a<br />
            <span className="gradient-text">guided daily recovery</span><br />
            experience.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
            style={{ fontSize: 18, color: 'var(--text2)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.75 }}>
            AI posture tracking, personalised exercise plans, doctor monitoring, and voice guidance in your language. Works offline in rural India.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Btn variant="primary" size="xl" onClick={() => navigate('/register')}>Start Recovery Free →</Btn>
            <Btn variant="ghost" size="xl" onClick={() => navigate('/login')}>Sign In</Btn>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }}
            style={{ fontSize: 13, color: 'var(--text3)' }}>
            Demo: patient@demo.com · doctor@demo.com · caretaker@demo.com — password: <strong style={{ color: 'var(--text2)' }}>password123</strong>
          </motion.p>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }}
            style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 64, flexWrap: 'wrap', alignItems: 'center' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                {i > 0 && <div style={{ width: 1, height: 40, background: 'var(--border)' }} />}
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.v}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>{s.l}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Badge color="blue" className="mb-4">Platform Features</Badge>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginTop: 14, marginBottom: 14 }}>Built for real recovery.</h2>
          <p style={{ color: 'var(--text2)', maxWidth: 500, margin: '0 auto' }}>Every feature exists because patients needed it, doctors asked for it, or caregivers couldn't function without it.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * .08 }} viewport={{ once: true }}
              whileHover={{ y: -6, borderColor: `var(--${f.color})` }}
              style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI POSTURE DEMO */}
      <section style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 60, alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <Badge color="purple" className="mb-4">AI Posture Engine</Badge>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 16, marginTop: 12, lineHeight: 1.15 }}>See your form.<br />Fix it instantly.</h2>
          <p style={{ color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>Point your camera. PhysioForge's AI detects 17 body joints in real time and coaches your movement with voice feedback in your language.</p>
          {['Detects 17 joint positions simultaneously', 'Real-time correction in under 100ms', 'Works on any smartphone camera', 'No special app permissions beyond camera'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, color: 'var(--text2)', fontSize: 14 }}>
              <span style={{ color: 'var(--teal)' }}>✓</span> {t}
            </div>
          ))}
          <div style={{ marginTop: 24 }}><Btn variant="primary" onClick={() => navigate('/register')}>Try AI Posture →</Btn></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          onClick={() => navigate('/register')}
          whileHover={{ boxShadow: '0 0 60px rgba(0,212,170,.2)' }}
          style={{ background: 'radial-gradient(ellipse at center,rgba(0,212,170,.07) 0%,var(--bg2) 70%)', border: '1px solid rgba(0,212,170,.25)', borderRadius: 24, padding: '40px 30px', cursor: 'pointer', textAlign: 'center' }}>
          <svg viewBox="0 0 300 360" width="100%" style={{ maxHeight: 280 }}>
            <circle cx="150" cy="45" r="24" fill="none" stroke="rgba(0,212,170,.6)" strokeWidth="2" />
            <line x1="150" y1="69" x2="150" y2="160" stroke="var(--teal)" strokeWidth="2.5" opacity=".8" />
            <line x1="78" y1="95" x2="222" y2="95" stroke="var(--teal)" strokeWidth="2.5" opacity=".8" />
            <line x1="78" y1="95" x2="50" y2="168" stroke="var(--teal)" strokeWidth="2" opacity=".7" />
            <line x1="50" y1="168" x2="38" y2="242" stroke="var(--teal)" strokeWidth="2" opacity=".6" />
            <line x1="222" y1="95" x2="258" y2="162" stroke="#fbbf24" strokeWidth="2.5" opacity=".9" />
            <line x1="258" y1="162" x2="278" y2="230" stroke="#fbbf24" strokeWidth="2" opacity=".8" />
            <line x1="112" y1="160" x2="188" y2="160" stroke="var(--teal)" strokeWidth="2.5" opacity=".8" />
            <line x1="112" y1="160" x2="97" y2="268" stroke="var(--teal)" strokeWidth="2" opacity=".7" />
            <line x1="97" y1="268" x2="88" y2="348" stroke="var(--teal)" strokeWidth="2" opacity=".6" />
            <line x1="188" y1="160" x2="198" y2="268" stroke="var(--teal)" strokeWidth="2" opacity=".7" />
            <line x1="198" y1="268" x2="203" y2="348" stroke="var(--teal)" strokeWidth="2" opacity=".6" />
            {[[150,69],[78,95],[222,95],[150,160],[112,160],[188,160],[50,168],[38,242],[97,268],[88,348],[198,268],[203,348]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5" fill="var(--teal)" opacity=".85"/>)}
            <motion.circle cx="222" cy="95" r="10" fill="none" stroke="#fbbf24" strokeWidth="2" animate={{ r:[8,13,8], opacity:[1,.3,1] }} transition={{ duration:1.5, repeat:Infinity }} />
            <circle cx="222" cy="95" r="4" fill="#fbbf24" />
            <text x="232" y="88" fill="#fbbf24" fontSize="10" fontFamily="DM Sans">↑ Raise arm</text>
            <motion.circle cx="258" cy="162" r="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" animate={{ opacity:[1,.2,1] }} transition={{ duration:1.8, repeat:Infinity }} />
            <circle cx="258" cy="162" r="3.5" fill="#fbbf24" opacity=".8" />
          </svg>
          <div style={{ background: 'rgba(0,0,0,.6)', border: '1px solid #fbbf24', borderRadius: 100, padding: '6px 16px', fontSize: 13, color: '#fbbf24', display: 'inline-block', marginTop: 12 }}>
            ⚠ Raise your right arm 18° higher
          </div>
        </motion.div>
      </section>

      {/* ELDER MODE */}
      <section style={{ padding: '60px 32px', maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(135deg,rgba(251,191,36,.07),rgba(251,191,36,.02))', border: '1px solid rgba(251,191,36,.2)', borderRadius: 32, marginBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 50, alignItems: 'center' }}>
          <div>
            <Badge color="amber" className="mb-4">👴 Elder Mode</Badge>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16, marginTop: 12, lineHeight: 1.2 }}>Designed for every generation.</h2>
            <p style={{ color: 'var(--text2)', lineHeight: 1.8, marginBottom: 20 }}>One-tap Simple Mode gives elderly users huge buttons, voice-first navigation, and regional language support. No tech skills required.</p>
            {['Telugu · Hindi · Tamil · Bengali · English', 'Emergency SOS button always visible', 'Voice reads every instruction aloud', 'Font size adjusts automatically'].map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, color: 'var(--text2)', fontSize: 14 }}><span style={{ color: 'var(--amber)' }}>✓</span> {t}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[{ icon: '🏃', label: 'आज का व्यायाम', sub: 'Start Exercise', color: '#00d4aa' }, { icon: '🆘', label: 'आपातकालीन', sub: 'Emergency', color: '#ff6b7a' }, { icon: '🎙️', label: 'आवाज़ गाइड', sub: 'Voice Guide', color: '#4a9eff' }, { icon: '👨‍⚕️', label: 'डॉक्टर', sub: 'My Doctor', color: '#a78bfa' }].map((b, i) => (
              <motion.div key={i} whileHover={{ scale: 1.04, borderColor: b.color }}
                style={{ background: 'var(--glass)', border: '2px solid var(--border)', borderRadius: 20, padding: '20px 12px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: b.color }}>{b.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{b.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <Badge color="green" className="mb-4">Testimonials</Badge>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, marginTop: 12 }}>Real stories. Real recovery.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * .1 }} viewport={{ once: true }}
              style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 20, marginBottom: 14, color: '#fbbf24' }}>{'★'.repeat(t.rating)}</div>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.avatar}</div>
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}, {t.age}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.city} · {t.recovery}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 32px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 40 }}>Common Questions</h2>
        {faqs.map((f, i) => (
          <motion.div key={i} onClick={() => setFaqOpen(faqOpen === i ? null : i)}
            style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 15 }}>
              {f.q} <span style={{ color: 'var(--teal)', fontSize: 20 }}>{faqOpen === i ? '−' : '+'}</span>
            </div>
            {faqOpen === i && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--text2)', fontSize: 14, marginTop: 10, lineHeight: 1.7 }}>{f.a}</motion.p>}
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(0,212,170,.08),rgba(74,158,255,.05))', borderTop: '1px solid rgba(0,212,170,.15)', borderBottom: '1px solid rgba(0,212,170,.15)' }}>
        <Badge color="teal" className="mb-5">Get Started Today</Badge>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(28px,5vw,54px)', fontWeight: 800, marginBottom: 20, marginTop: 14 }}>Your recovery starts now.</h2>
        <p style={{ color: 'var(--text2)', fontSize: 17, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>Join 18,000+ patients recovering smarter with PhysioForge.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn variant="primary" size="xl" onClick={() => navigate('/register')}>Create Free Account →</Btn>
          <Btn variant="ghost" size="xl" onClick={() => navigate('/login')}>Sign In</Btn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '48px 32px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>⚕ PhysioForge</div>
        <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>Healing India, one recovery at a time · © 2025 PhysioForge Technologies Pvt. Ltd.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Patients', 'Doctors', 'Caretakers', 'Research', 'Privacy Policy', 'Contact Us'].map(l => (
            <a key={l} href="#" style={{ color: 'var(--text3)', fontSize: 13, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
