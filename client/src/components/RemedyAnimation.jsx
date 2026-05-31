/**
 * RemedyAnimation.jsx
 * Lightweight SVG + CSS animations for each remedy type.
 * No external dependencies — pure inline SVG with keyframe animations.
 */

const ANIM_STYLE = `
@keyframes ra-steam1 { 0%,100%{opacity:0;transform:translateY(0) scaleX(1)} 40%{opacity:.7;transform:translateY(-18px) scaleX(1.3)} }
@keyframes ra-steam2 { 0%,100%{opacity:0;transform:translateY(0) scaleX(1)} 40%{opacity:.5;transform:translateY(-14px) scaleX(.8)} }
@keyframes ra-pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
@keyframes ra-sway   { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(12deg)} }
@keyframes ra-drip   { 0%{transform:translateY(0);opacity:1} 80%{transform:translateY(18px);opacity:.5} 100%{transform:translateY(22px);opacity:0} }
@keyframes ra-ripple { 0%{r:4;opacity:.8} 100%{r:22;opacity:0} }
@keyframes ra-bob    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ra-glow   { 0%,100%{opacity:.4} 50%{opacity:1} }
@keyframes ra-spin   { to{transform:rotate(360deg)} }
@keyframes ra-shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
@keyframes ra-stretch-neck { 0%,100%{transform:rotate(0deg)} 40%{transform:rotate(-18deg)} 60%{transform:rotate(18deg)} }
@keyframes ra-compress { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.85)} }
@keyframes ra-slide-r { 0%{transform:translateX(-30px);opacity:0} 30%{opacity:1} 80%{transform:translateX(30px);opacity:1} 100%{transform:translateX(30px);opacity:0} }
@keyframes ra-fade-in-out { 0%,100%{opacity:.15} 50%{opacity:.9} }
@keyframes ra-float  { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-8px) rotate(3deg)} }
@keyframes ra-pendulum{ 0%,100%{transform:rotate(-30deg) translateY(0)} 50%{transform:rotate(30deg) translateY(0)} }
@keyframes ra-cat-cow { 0%,100%{d:path("M 10 28 Q 32 18 54 28")} 50%{d:path("M 10 28 Q 32 38 54 28")} }
@keyframes ra-warm-cool { 0%,100%{stop-color:#ff6b7a} 50%{stop-color:#60a5fa} }
@keyframes ra-wave   { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-8px)} }
@keyframes ra-knee-lift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes ra-dots   { 0%,100%{opacity:0} 50%{opacity:1} }
@keyframes ra-heartbeat { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.1)} 56%{transform:scale(1)} }
@keyframes ra-pour   { 0%{transform:rotate(0deg)} 40%{transform:rotate(-45deg)} 100%{transform:rotate(0deg)} }
@keyframes ra-sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
@keyframes ra-sleep-breath { 0%,100%{transform:scaleX(1) scaleY(1)} 50%{transform:scaleX(1.04) scaleY(.97)} }
@keyframes ra-doorway-stretch { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
@keyframes ra-circle-motion { 0%{transform:rotate(0deg) translateX(14px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(14px) rotate(-360deg)} }
@keyframes ra-squeeze { 0%,100%{rx:12;ry:8} 50%{rx:8;ry:12} }
`

let styleInjected = false
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = ANIM_STYLE
  document.head.appendChild(el)
  styleInjected = true
}

/* ── Individual animation components ─────────────────────────── */

// Warm cloth / compress — glowing red cloth with steam
function WarmCompressAnim({ color = '#ff6b7a' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60" style={{ overflow: 'visible' }}>
      {/* Steam wisps */}
      <ellipse cx="28" cy="20" rx="4" ry="7" fill={color} opacity=".6"
        style={{ animation: 'ra-steam1 2s ease-in-out infinite', transformOrigin: '28px 26px' }} />
      <ellipse cx="40" cy="16" rx="3" ry="6" fill={color} opacity=".5"
        style={{ animation: 'ra-steam2 2.4s ease-in-out infinite .4s', transformOrigin: '40px 22px' }} />
      <ellipse cx="52" cy="20" rx="4" ry="7" fill={color} opacity=".6"
        style={{ animation: 'ra-steam1 2.2s ease-in-out infinite .8s', transformOrigin: '52px 26px' }} />
      {/* Cloth */}
      <rect x="12" y="28" width="56" height="24" rx="8"
        fill={color} opacity=".9"
        style={{ animation: 'ra-pulse 2s ease-in-out infinite' }} />
      {/* Cloth folds */}
      <line x1="20" y1="34" x2="60" y2="34" stroke="white" strokeWidth="1.5" opacity=".3" />
      <line x1="20" y1="40" x2="60" y2="40" stroke="white" strokeWidth="1.5" opacity=".25" />
      {/* Glow */}
      <rect x="12" y="28" width="56" height="24" rx="8"
        fill={color} opacity=".0"
        style={{ filter: `drop-shadow(0 0 8px ${color})`, animation: 'ra-glow 2s ease-in-out infinite' }} />
    </svg>
  )
}

// Ice pack — blue ice cube with cold sparkles
function IcePackAnim({ color = '#60a5fa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Ice cube */}
      <rect x="16" y="18" width="48" height="36" rx="8" fill={color} opacity=".85"
        style={{ animation: 'ra-compress 3s ease-in-out infinite' }} />
      {/* Ice shine */}
      <rect x="22" y="23" width="14" height="8" rx="3" fill="white" opacity=".4" />
      {/* Sparkles */}
      {[[14,12],[62,10],[70,30],[10,40]].map(([x,y],i)=>(
        <g key={i} style={{ animation: `ra-sparkle 1.8s ease-in-out infinite ${i*0.4}s`, transformOrigin:`${x}px ${y}px` }}>
          <line x1={x-4} y1={y} x2={x+4} y2={y} stroke={color} strokeWidth="1.5" />
          <line x1={x} y1={y-4} x2={x} y2={y+4} stroke={color} strokeWidth="1.5" />
        </g>
      ))}
      {/* Cold ripple */}
      <circle cx="40" cy="36" r="4" fill="none" stroke="white" strokeWidth="1.2" opacity=".6"
        style={{ animation: 'ra-ripple 2.4s ease-out infinite' }} />
      <circle cx="40" cy="36" r="4" fill="none" stroke="white" strokeWidth="1" opacity=".4"
        style={{ animation: 'ra-ripple 2.4s ease-out infinite .8s' }} />
    </svg>
  )
}

// Neck stretch — stick figure tilting head side to side
function NeckStretchAnim({ color = '#00d4aa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Body */}
      <rect x="32" y="36" width="16" height="16" rx="3" fill={color} opacity=".7" />
      {/* Neck */}
      <rect x="37" y="28" width="6" height="10" rx="2" fill={color} opacity=".8" />
      {/* Head tilting */}
      <g style={{ animation: 'ra-stretch-neck 3s ease-in-out infinite', transformOrigin: '40px 28px' }}>
        <circle cx="40" cy="20" r="9" fill={color} opacity=".9" />
        {/* Face dots */}
        <circle cx="37" cy="19" r="1.2" fill="white" opacity=".8" />
        <circle cx="43" cy="19" r="1.2" fill="white" opacity=".8" />
        <path d="M37 23 Q40 25 43 23" stroke="white" strokeWidth="1.2" fill="none" opacity=".7" />
      </g>
      {/* Arrows hint */}
      <text x="8" y="24" fontSize="10" fill={color} opacity=".6" style={{ animation: 'ra-fade-in-out 3s infinite .5s' }}>↙</text>
      <text x="63" y="24" fontSize="10" fill={color} opacity=".6" style={{ animation: 'ra-fade-in-out 3s infinite 2s' }}>↘</text>
    </svg>
  )
}

// Turmeric (milk/paste) — golden bowl with swirl
function TurmericAnim({ color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Bowl */}
      <ellipse cx="40" cy="46" rx="28" ry="10" fill={color} opacity=".3" />
      <path d="M 14 36 Q 14 54 40 54 Q 66 54 66 36 Z" fill={color} opacity=".85" />
      {/* Liquid surface */}
      <ellipse cx="40" cy="36" rx="26" ry="7" fill={color} />
      {/* Swirl */}
      <path d="M 40 36 Q 50 30 44 36 Q 38 42 48 38 Q 58 34 50 36"
        stroke="white" strokeWidth="1.5" fill="none" opacity=".6"
        style={{ animation: 'ra-wave 2s ease-in-out infinite' }} />
      {/* Steam */}
      <ellipse cx="36" cy="24" rx="3" ry="6" fill={color} opacity=".5"
        style={{ animation: 'ra-steam2 2.2s ease-in-out infinite' }} />
      <ellipse cx="44" cy="21" rx="2.5" ry="5" fill={color} opacity=".4"
        style={{ animation: 'ra-steam1 1.9s ease-in-out infinite .5s' }} />
      {/* Sparkle spice dot */}
      <circle cx="40" cy="36" r="3" fill="white" opacity=".4"
        style={{ animation: 'ra-pulse 1.5s ease-in-out infinite' }} />
    </svg>
  )
}

// RICE method — ice + elevation combo
function RICEAnim({ color = '#60a5fa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Leg elevated */}
      <rect x="10" y="38" width="60" height="12" rx="6" fill="#94a3b8" opacity=".5" />
      {/* Ice wrap */}
      <rect x="24" y="20" width="32" height="22" rx="8" fill={color} opacity=".85"
        style={{ animation: 'ra-compress 2.8s ease-in-out infinite' }} />
      {/* Bandage cross lines */}
      <line x1="24" y1="28" x2="56" y2="28" stroke="white" strokeWidth="2" opacity=".5" />
      <line x1="40" y1="20" x2="40" y2="42" stroke="white" strokeWidth="2" opacity=".5" />
      {/* Cold sparkles */}
      {[[18,16],[62,16],[18,46]].map(([x,y],i)=>(
        <g key={i} style={{ animation: `ra-sparkle 2s ease-in-out infinite ${i*0.5}s`, transformOrigin:`${x}px ${y}px` }}>
          <line x1={x-3} y1={y} x2={x+3} y2={y} stroke={color} strokeWidth="1.5" />
          <line x1={x} y1={y-3} x2={x} y2={y+3} stroke={color} strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  )
}

// Ginger compress / massage — hand rubbing motion
function MassageAnim({ color = '#fb923c' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Body area */}
      <ellipse cx="40" cy="42" rx="26" ry="14" fill={color} opacity=".25" />
      {/* Hand */}
      <g style={{ animation: 'ra-wave 1.8s ease-in-out infinite', transformOrigin: '40px 30px' }}>
        <ellipse cx="40" cy="30" rx="14" ry="9" fill={color} opacity=".8" />
        {/* Fingers */}
        {[28,33,40,47,52].map((x,i)=>(
          <rect key={i} x={x-2.5} y="18" width="5" height={10+i*0.8} rx="2.5" fill={color} opacity=".7" />
        ))}
      </g>
      {/* Motion lines */}
      {[0,1,2].map(i=>(
        <line key={i} x1={20+i*10} y1={50+i*2} x2={30+i*10} y2={46+i*2}
          stroke={color} strokeWidth="1.5" opacity=".5"
          style={{ animation: `ra-fade-in-out 1.8s ease-in-out infinite ${i*0.3}s` }} />
      ))}
    </svg>
  )
}

// Quadriceps / knee exercise — leg straightening
function KneeExerciseAnim({ color = '#34d399' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Chair seat */}
      <rect x="8" y="28" width="36" height="5" rx="2" fill="#94a3b8" opacity=".6" />
      <rect x="10" y="33" width="5" height="22" rx="2" fill="#94a3b8" opacity=".5" />
      <rect x="34" y="33" width="5" height="22" rx="2" fill="#94a3b8" opacity=".5" />
      {/* Thigh */}
      <rect x="14" y="23" width="26" height="10" rx="5" fill={color} opacity=".7" />
      {/* Lower leg animating */}
      <g style={{ animation: 'ra-knee-lift 2.4s ease-in-out infinite', transformOrigin: '27px 33px' }}>
        <rect x="16" y="33" width="22" height="10" rx="5" fill={color} opacity=".8" />
        {/* Foot */}
        <ellipse cx="38" cy="43" rx="10" ry="5" fill={color} opacity=".75" />
      </g>
      {/* Arrow up */}
      <text x="54" y="36" fontSize="16" fill={color}
        style={{ animation: 'ra-bob 2.4s ease-in-out infinite' }}>↑</text>
    </svg>
  )
}

// Epsom salt soak — bucket with ripples
function SoakAnim({ color = '#818cf8' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Bucket */}
      <path d="M 18 20 L 22 54 Q 40 58 58 54 L 62 20 Z" fill={color} opacity=".3" />
      <path d="M 18 20 L 62 20" stroke={color} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      {/* Water */}
      <path d="M 22 30 Q 40 26 58 30 L 58 54 Q 40 58 22 54 Z" fill={color} opacity=".7" />
      {/* Ripples */}
      <ellipse cx="40" cy="30" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1.2" opacity=".7"
        style={{ animation: 'ra-ripple 2s ease-out infinite' }} />
      <ellipse cx="40" cy="30" rx="8" ry="3" fill="none" stroke="white" strokeWidth="1" opacity=".5"
        style={{ animation: 'ra-ripple 2s ease-out infinite .7s' }} />
      {/* Steam */}
      <ellipse cx="32" cy="12" rx="3" ry="6" fill={color} opacity=".5"
        style={{ animation: 'ra-steam2 2.5s ease-in-out infinite' }} />
      <ellipse cx="48" cy="10" rx="2.5" ry="5" fill={color} opacity=".4"
        style={{ animation: 'ra-steam1 2s ease-in-out infinite .6s' }} />
      {/* Salt crystals */}
      {[[30,34],[44,32],[38,38]].map(([x,y],i)=>(
        <rect key={i} x={x-1.5} y={y-1.5} width="3" height="3" rx="1" fill="white" opacity=".6"
          style={{ animation: `ra-sparkle 2.2s ease-in-out infinite ${i*0.5}s` }} />
      ))}
    </svg>
  )
}

// Omega-3 / dietary — fish/food bouncing
function DietaryAnim({ color = '#4a9eff' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Fish body */}
      <g style={{ animation: 'ra-bob 2.2s ease-in-out infinite', transformOrigin: '40px 32px' }}>
        <ellipse cx="40" cy="32" rx="22" ry="12" fill={color} opacity=".8" />
        {/* Tail */}
        <path d="M 62 32 L 74 22 L 74 42 Z" fill={color} opacity=".7" />
        {/* Eye */}
        <circle cx="25" cy="29" r="3" fill="white" opacity=".9" />
        <circle cx="24" cy="29" r="1.5" fill="#1e293b" opacity=".9" />
        {/* Scale lines */}
        <path d="M 40 22 Q 46 32 40 42" stroke="white" strokeWidth="1" fill="none" opacity=".3" />
        <path d="M 48 24 Q 54 32 48 40" stroke="white" strokeWidth="1" fill="none" opacity=".3" />
      </g>
      {/* Omega dots */}
      {[0,1,2].map(i=>(
        <circle key={i} cx={20+i*20} cy={54} r="3" fill={color} opacity=".5"
          style={{ animation: `ra-dots 1.5s ease-in-out infinite ${i*0.4}s` }} />
      ))}
    </svg>
  )
}

// Fenugreek seeds — seeds sprouting
function SeedAnim({ color = '#34d399' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Water glass */}
      <rect x="28" y="28" width="24" height="28" rx="4" fill={color} opacity=".3" />
      <rect x="28" y="28" width="24" height="28" rx="4" fill="none" stroke={color} strokeWidth="1.5" opacity=".7" />
      {/* Water level */}
      <rect x="30" y="38" width="20" height="16" rx="2" fill={color} opacity=".5" />
      {/* Seeds */}
      {[[36,42],[44,40],[40,46]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="3" ry="2" fill={color} opacity=".9"
          style={{ animation: `ra-bob ${1.8+i*0.3}s ease-in-out infinite ${i*0.4}s` }} />
      ))}
      {/* Sprout */}
      <g style={{ animation: 'ra-float 3s ease-in-out infinite' }}>
        <line x1="40" y1="28" x2="40" y2="16" stroke={color} strokeWidth="2" opacity=".8" />
        <ellipse cx="34" cy="18" rx="6" ry="4" fill={color} opacity=".7" transform="rotate(-30 34 18)" />
        <ellipse cx="46" cy="18" rx="6" ry="4" fill={color} opacity=".7" transform="rotate(30 46 18)" />
      </g>
    </svg>
  )
}

// Range of motion — joint rotating
function RangeOfMotionAnim({ color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Arc track */}
      <circle cx="40" cy="38" r="22" fill="none" stroke={color} strokeWidth="2" opacity=".2" strokeDasharray="4 4" />
      {/* Moving dot on arc */}
      <g style={{ animation: 'ra-circle-motion 3s linear infinite', transformOrigin: '40px 38px' }}>
        <circle cx="40" cy="38" r="5" fill={color} opacity=".9" />
      </g>
      {/* Joint center */}
      <circle cx="40" cy="38" r="8" fill={color} opacity=".3" />
      <circle cx="40" cy="38" r="4" fill={color} opacity=".8" style={{ animation: 'ra-heartbeat 2s ease-in-out infinite' }} />
    </svg>
  )
}

// Pendulum exercise — arm swinging
function PendulumAnim({ color = '#a78bfa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Shoulder */}
      <ellipse cx="40" cy="16" rx="16" ry="8" fill={color} opacity=".6" />
      {/* Body torso (leaning) */}
      <rect x="32" y="16" width="16" height="14" rx="4" fill={color} opacity=".5" />
      {/* Arm pendulum */}
      <g style={{ animation: 'ra-pendulum 2.4s ease-in-out infinite', transformOrigin: '40px 24px' }}>
        <rect x="37" y="24" width="6" height="26" rx="3" fill={color} opacity=".8" />
        {/* Hand */}
        <ellipse cx="40" cy="52" rx="5" ry="4" fill={color} opacity=".7" />
      </g>
      {/* Arc path hint */}
      <path d="M 18 52 Q 40 44 62 52" stroke={color} strokeWidth="1.5" fill="none" opacity=".3" strokeDasharray="3 3" />
    </svg>
  )
}

// Hot & cold alternating — thermometer switching
function ContrastTherapyAnim({ color = '#60a5fa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Left: Hot */}
      <g style={{ animation: 'ra-fade-in-out 2.4s ease-in-out infinite' }}>
        <rect x="12" y="16" width="22" height="38" rx="11" fill="#ff6b7a" opacity=".8" />
        <rect x="17" y="22" width="12" height="20" rx="6" fill="white" opacity=".4" />
        {/* Mercury hot */}
        <rect x="19" y="28" width="8" height="14" rx="4" fill="#ff6b7a" opacity=".9" />
        <circle cx="23" cy="47" r="7" fill="#ff6b7a" opacity=".9" />
        <ellipse cx="20" cy="10" rx="3" ry="5" fill="#ff6b7a" opacity=".5"
          style={{ animation: 'ra-steam1 1.8s ease-in-out infinite' }} />
      </g>
      {/* Arrow */}
      <text x="35" y="36" fontSize="14" fill="var(--text3)" opacity=".8"
        style={{ animation: 'ra-wave 2.4s ease-in-out infinite' }}>⇄</text>
      {/* Right: Cold */}
      <g style={{ animation: 'ra-fade-in-out 2.4s ease-in-out infinite 1.2s' }}>
        <rect x="46" y="16" width="22" height="38" rx="11" fill={color} opacity=".8" />
        <rect x="51" y="22" width="12" height="20" rx="6" fill="white" opacity=".4" />
        {/* Mercury cold (low) */}
        <rect x="53" y="36" width="8" height="6" rx="4" fill={color} opacity=".9" />
        <circle cx="57" cy="47" r="7" fill={color} opacity=".9" />
        {/* Snowflake */}
        <line x1="57" y1="6" x2="57" y2="14" stroke={color} strokeWidth="1.5" opacity=".7" />
        <line x1="53" y1="10" x2="61" y2="10" stroke={color} strokeWidth="1.5" opacity=".7" />
      </g>
    </svg>
  )
}

// Neem leaf paste — leaf with paste application
function NeemAnim({ color = '#34d399' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Leaf */}
      <g style={{ animation: 'ra-float 3s ease-in-out infinite', transformOrigin: '38px 30px' }}>
        <path d="M 38 54 Q 14 40 18 18 Q 38 8 58 18 Q 62 40 38 54 Z"
          fill={color} opacity=".8" />
        {/* Veins */}
        <line x1="38" y1="54" x2="38" y2="16" stroke="white" strokeWidth="1.2" opacity=".5" />
        <line x1="38" y1="28" x2="26" y2="22" stroke="white" strokeWidth="1" opacity=".4" />
        <line x1="38" y1="34" x2="50" y2="26" stroke="white" strokeWidth="1" opacity=".4" />
        <line x1="38" y1="40" x2="28" y2="36" stroke="white" strokeWidth="1" opacity=".4" />
      </g>
      {/* Paste drip */}
      <circle cx="38" cy="56" r="4" fill={color} opacity=".7"
        style={{ animation: 'ra-drip 2.2s ease-in-out infinite' }} />
    </svg>
  )
}

// Knee to chest stretch — lying figure pulling knees
function KneeToChestAnim({ color = '#00d4aa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Body lying flat */}
      <ellipse cx="40" cy="48" rx="28" ry="6" fill={color} opacity=".2" />
      {/* Torso */}
      <rect x="10" y="38" width="30" height="14" rx="7" fill={color} opacity=".6" />
      {/* Head */}
      <circle cx="10" cy="42" r="7" fill={color} opacity=".75" />
      {/* Knees pulling to chest */}
      <g style={{ animation: 'ra-knee-lift 2.8s ease-in-out infinite', transformOrigin: '44px 42px' }}>
        <ellipse cx="50" cy="36" rx="14" ry="9" fill={color} opacity=".75" />
        <ellipse cx="60" cy="28" rx="10" ry="7" fill={color} opacity=".65" />
      </g>
      {/* Arrow */}
      <text x="58" y="48" fontSize="13" fill={color} opacity=".8"
        style={{ animation: 'ra-bob 2.8s ease-in-out infinite' }}>↙</text>
    </svg>
  )
}

// Sesame oil massage on back — circular motions
function BackMassageAnim({ color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Back area */}
      <rect x="14" y="20" width="52" height="34" rx="10" fill={color} opacity=".25" />
      {/* Spine line */}
      <line x1="40" y1="20" x2="40" y2="54" stroke={color} strokeWidth="1.5" opacity=".4" strokeDasharray="3 3" />
      {/* Massage hand */}
      <g style={{ animation: 'ra-wave 1.6s ease-in-out infinite', transformOrigin: '40px 36px' }}>
        <ellipse cx="40" cy="36" rx="13" ry="9" fill={color} opacity=".7" />
      </g>
      {/* Oil drip */}
      <g style={{ animation: 'ra-drip 2.5s ease-in-out infinite .5s' }}>
        <circle cx="40" cy="14" r="4" fill={color} opacity=".6" />
      </g>
      {/* Motion circles */}
      {[[28,30],[52,30],[28,46],[52,46]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="5" fill="none" stroke={color} strokeWidth="1.2" opacity=".4"
          style={{ animation: `ra-ripple ${2+i*0.3}s ease-out infinite ${i*0.4}s` }} />
      ))}
    </svg>
  )
}

// Cat-cow yoga — spine arching
function CatCowAnim({ color = '#a78bfa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Hands */}
      <ellipse cx="14" cy="46" rx="7" ry="5" fill={color} opacity=".7" />
      <ellipse cx="66" cy="46" rx="7" ry="5" fill={color} opacity=".7" />
      {/* Knees */}
      <ellipse cx="20" cy="52" rx="7" ry="5" fill={color} opacity=".6" />
      <ellipse cx="60" cy="52" rx="7" ry="5" fill={color} opacity=".6" />
      {/* Spine curving */}
      <g style={{ animation: 'ra-pulse 2.5s ease-in-out infinite', transformOrigin: '40px 36px' }}>
        <path d="M 14 42 Q 40 22 66 42" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".8" />
        {/* Head */}
        <circle cx="66" cy="36" r="8" fill={color} opacity=".8" />
      </g>
      {/* Tail (arrow) */}
      <text x="4" y="38" fontSize="11" fill={color} opacity=".7"
        style={{ animation: 'ra-bob 2.5s ease-in-out infinite' }}>↕</text>
    </svg>
  )
}

// Castor oil wrap on back — wrap layers
function OilWrapAnim({ color = '#ff6b7a' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Back */}
      <rect x="16" y="18" width="48" height="32" rx="10" fill={color} opacity=".2" />
      {/* Flannel cloth */}
      <rect x="20" y="22" width="40" height="24" rx="7" fill={color} opacity=".6"
        style={{ animation: 'ra-pulse 3s ease-in-out infinite' }} />
      {/* Plastic wrap lines */}
      <line x1="20" y1="28" x2="60" y2="28" stroke="white" strokeWidth="1.5" opacity=".4" />
      <line x1="20" y1="35" x2="60" y2="35" stroke="white" strokeWidth="1.5" opacity=".4" />
      {/* Heat waves */}
      {[0,1,2].map(i=>(
        <ellipse key={i} cx={30+i*10} cy={10} rx="3" ry="6" fill={color} opacity=".4"
          style={{ animation: `ra-steam1 ${2+i*0.3}s ease-in-out infinite ${i*0.5}s`, transformOrigin: `${30+i*10}px 16px` }} />
      ))}
    </svg>
  )
}

// Sleep position — side sleeping
function SleepAnim({ color = '#4a9eff' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Mattress */}
      <rect x="4" y="44" width="72" height="12" rx="4" fill="#475569" opacity=".5" />
      {/* Pillow */}
      <ellipse cx="16" cy="40" rx="10" ry="6" fill="white" opacity=".6" />
      {/* Body side sleeping */}
      <g style={{ animation: 'ra-sleep-breath 4s ease-in-out infinite' }}>
        {/* Torso */}
        <ellipse cx="44" cy="40" rx="20" ry="9" fill={color} opacity=".7" />
        {/* Head on pillow */}
        <circle cx="16" cy="36" r="8" fill={color} opacity=".8" />
        {/* Knees bent with pillow between */}
        <ellipse cx="66" cy="36" rx="10" ry="7" fill={color} opacity=".65" />
        <ellipse cx="68" cy="46" rx="9" ry="6" fill={color} opacity=".6" />
        {/* Pillow between knees */}
        <ellipse cx="68" cy="41" rx="5" ry="3" fill="white" opacity=".5" />
      </g>
      {/* Zzz */}
      {['z','Z','z'].map((z,i)=>(
        <text key={i} x={28+i*10} y={20-i*5} fontSize={10+i*2} fill={color} opacity=".5"
          style={{ animation: `ra-float ${2+i*0.5}s ease-in-out infinite ${i*0.6}s` }}>{z}</text>
      ))}
    </svg>
  )
}

// Doorway chest stretch — arms spread in doorway
function DoorwayStretchAnim({ color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Doorframe */}
      <rect x="6" y="4" width="8" height="56" rx="2" fill="#475569" opacity=".5" />
      <rect x="66" y="4" width="8" height="56" rx="2" fill="#475569" opacity=".5" />
      <rect x="6" y="4" width="68" height="6" rx="2" fill="#475569" opacity=".5" />
      {/* Figure */}
      {/* Head */}
      <circle cx="40" cy="18" r="7" fill={color} opacity=".85" />
      {/* Body */}
      <rect x="36" y="25" width="8" height="18" rx="4" fill={color} opacity=".7" />
      {/* Arms spreading to doorframe */}
      <g style={{ animation: 'ra-doorway-stretch 3s ease-in-out infinite', transformOrigin: '40px 30px' }}>
        <line x1="40" y1="30" x2="14" y2="30" stroke={color} strokeWidth="6" strokeLinecap="round" opacity=".7" />
        <line x1="40" y1="30" x2="66" y2="30" stroke={color} strokeWidth="6" strokeLinecap="round" opacity=".7" />
        {/* Hands on frame */}
        <circle cx="14" cy="30" r="4" fill={color} opacity=".8" />
        <circle cx="66" cy="30" r="4" fill={color} opacity=".8" />
      </g>
      {/* Legs */}
      <line x1="38" y1="43" x2="34" y2="58" stroke={color} strokeWidth="5" strokeLinecap="round" opacity=".65" />
      <line x1="42" y1="43" x2="46" y2="58" stroke={color} strokeWidth="5" strokeLinecap="round" opacity=".65" />
    </svg>
  )
}

// Castor oil joint massage
function CastorMassageAnim({ color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Joint */}
      <circle cx="40" cy="36" r="18" fill={color} opacity=".25" />
      <circle cx="40" cy="36" r="10" fill={color} opacity=".5" style={{ animation: 'ra-pulse 2s ease-in-out infinite' }} />
      {/* Oil bottle tipping */}
      <g style={{ animation: 'ra-pour 3s ease-in-out infinite', transformOrigin: '24px 20px' }}>
        <rect x="18" y="8" width="12" height="20" rx="4" fill="#92400e" opacity=".8" />
        <rect x="22" y="4" width="4" height="6" rx="1" fill="#92400e" opacity=".8" />
      </g>
      {/* Oil drip */}
      <circle cx="30" cy="28" r="4" fill={color} opacity=".8"
        style={{ animation: 'ra-drip 2.5s ease-in-out infinite .8s' }} />
      {/* Massage circles */}
      <circle cx="40" cy="36" r="14" fill="none" stroke={color} strokeWidth="1.5" opacity=".4"
        style={{ animation: 'ra-ripple 2.5s ease-out infinite' }} />
    </svg>
  )
}

// Posture correction — screen at eye level
function PostureAnim({ color = '#a78bfa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Desk */}
      <rect x="8" y="42" width="64" height="5" rx="2" fill="#475569" opacity=".6" />
      {/* Monitor */}
      <rect x="36" y="16" width="24" height="18" rx="3" fill="#1e293b" opacity=".8" />
      <rect x="36" y="16" width="24" height="18" rx="3" fill={color} opacity=".2" />
      <rect x="44" y="34" width="8" height="8" rx="1" fill="#475569" opacity=".5" />
      {/* Screen glow */}
      <rect x="38" y="18" width="20" height="14" rx="2" fill={color} opacity=".3"
        style={{ animation: 'ra-glow 2.5s ease-in-out infinite' }} />
      {/* Person */}
      <circle cx="18" cy="20" r="7" fill={color} opacity=".8" />
      <rect x="14" y="27" width="8" height="15" rx="4" fill={color} opacity=".7" />
      {/* Eye level arrow */}
      <line x1="26" y1="22" x2="36" y2="22" stroke={color} strokeWidth="2" strokeDasharray="3 3" opacity=".7"
        style={{ animation: 'ra-slide-r 2.5s ease-in-out infinite' }} />
    </svg>
  )
}

// Warm Epsom Salt Soak (knee) — specific
function KneeSoakAnim({ color = '#a78bfa' }) {
  return <SoakAnim color={color} />
}

// Ginger tea / drink
function GingerCompressAnim({ color = '#fbbf24' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Cloth with ginger */}
      <ellipse cx="40" cy="44" rx="26" ry="12" fill={color} opacity=".3" />
      <rect x="18" y="30" width="44" height="20" rx="10" fill={color} opacity=".7"
        style={{ animation: 'ra-compress 2.5s ease-in-out infinite' }} />
      {/* Ginger root shape */}
      <ellipse cx="40" cy="18" rx="14" ry="8" fill="#d97706" opacity=".8"
        style={{ animation: 'ra-bob 2s ease-in-out infinite' }} />
      <ellipse cx="50" cy="14" rx="7" ry="5" fill="#d97706" opacity=".7" transform="rotate(-20 50 14)" />
      <ellipse cx="30" cy="13" rx="6" ry="4" fill="#d97706" opacity=".7" transform="rotate(15 30 13)" />
      {/* Steam */}
      <ellipse cx="36" cy="10" rx="2.5" ry="5" fill={color} opacity=".4"
        style={{ animation: 'ra-steam2 2s ease-in-out infinite' }} />
      <ellipse cx="44" cy="8" rx="2" ry="4" fill={color} opacity=".35"
        style={{ animation: 'ra-steam1 1.7s ease-in-out infinite .4s' }} />
    </svg>
  )
}

// Turmeric paste (knee) - specific
function TurmericPasteAnim({ color = '#fb923c' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Knee shape */}
      <ellipse cx="40" cy="40" rx="22" ry="16" fill="#94a3b8" opacity=".3" />
      {/* Paste being applied */}
      <g style={{ animation: 'ra-wave 2s ease-in-out infinite', transformOrigin: '40px 32px' }}>
        <ellipse cx="40" cy="32" rx="16" ry="10" fill="#fbbf24" opacity=".85" />
        {/* Paste texture */}
        <ellipse cx="36" cy="30" rx="4" ry="3" fill="#d97706" opacity=".5" />
        <ellipse cx="46" cy="33" rx="5" ry="3" fill="#d97706" opacity=".4" />
      </g>
      {/* Cloth wrap */}
      <path d="M 18 40 Q 40 56 62 40" stroke="#e2e8f0" strokeWidth="4" fill="none" opacity=".5" strokeDasharray="6 3"
        style={{ animation: 'ra-compress 2.5s ease-in-out infinite' }} />
      {/* Golden sparkles */}
      {[[22,22],[58,22],[40,12]].map(([x,y],i)=>(
        <g key={i} style={{ animation: `ra-sparkle 1.8s ease-in-out infinite ${i*0.5}s`, transformOrigin:`${x}px ${y}px` }}>
          <line x1={x-3} y1={y} x2={x+3} y2={y} stroke="#fbbf24" strokeWidth="1.5" />
          <line x1={x} y1={y-3} x2={x} y2={y+3} stroke="#fbbf24" strokeWidth="1.5" />
        </g>
      ))}
    </svg>
  )
}

// Muscle stretching routine
function MuscleStretchAnim({ color = '#a78bfa' }) {
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      {/* Figure seated, stretching forward */}
      {/* Torso */}
      <g style={{ animation: 'ra-doorway-stretch 3s ease-in-out infinite', transformOrigin: '36px 30px' }}>
        <rect x="28" y="24" width="16" height="22" rx="7" fill={color} opacity=".7" />
      </g>
      {/* Head */}
      <circle cx="36" cy="16" r="8" fill={color} opacity=".85" />
      {/* Arms reaching forward */}
      <g style={{ animation: 'ra-slide-r 3s ease-in-out infinite', transformOrigin: '50px 32px' }}>
        <line x1="44" y1="32" x2="68" y2="28" stroke={color} strokeWidth="5" strokeLinecap="round" opacity=".7" />
        <circle cx="68" cy="28" r="4" fill={color} opacity=".6" />
      </g>
      {/* Legs */}
      <rect x="22" y="44" width="28" height="10" rx="5" fill={color} opacity=".6" />
      {/* Stretch indicator */}
      <path d="M 52 24 Q 60 20 68 24" stroke={color} strokeWidth="1.5" fill="none" opacity=".5" strokeDasharray="3 2"
        style={{ animation: 'ra-fade-in-out 3s ease-in-out infinite' }} />
    </svg>
  )
}

/* ── Master lookup map ─────────────────────────────────────────── */
const ANIMATION_MAP = {
  // Neck
  'Warm Compress':          (c) => <WarmCompressAnim color={c} />,
  'Neck Stretching':        (c) => <NeckStretchAnim color={c} />,
  'Turmeric Milk':          (c) => <TurmericAnim color={c} />,
  'Ice Pack (Acute pain)':  (c) => <IcePackAnim color={c} />,
  'Posture Correction':     (c) => <PostureAnim color={c} />,
  // Knee
  'RICE Method':            (c) => <RICEAnim color={c} />,
  'Ginger Compress':        (c) => <GingerCompressAnim color={c} />,
  'Quadriceps Strengthening':(c)=> <KneeExerciseAnim color={c} />,
  'Turmeric Paste':         (c) => <TurmericPasteAnim color={c} />,
  'Warm Epsom Salt Soak':   (c) => <KneeSoakAnim color={c} />,
  // Joint
  'Castor Oil Massage':     (c) => <CastorMassageAnim color={c} />,
  'Omega-3 Rich Foods':     (c) => <DietaryAnim color={c} />,
  'Fenugreek Seeds':        (c) => <SeedAnim color={c} />,
  'Gentle Range-of-Motion': (c) => <RangeOfMotionAnim color={c} />,
  // Shoulder
  'Pendulum Exercise':      (c) => <PendulumAnim color={c} />,
  'Hot & Cold Alternating': (c) => <ContrastTherapyAnim color={c} />,
  'Neem Leaf Paste':        (c) => <NeemAnim color={c} />,
  'Doorway Chest Stretch':  (c) => <DoorwayStretchAnim color={c} />,
  // Back
  'Knee-to-Chest Stretch':  (c) => <KneeToChestAnim color={c} />,
  'Warm Sesame Oil Massage':(c) => <BackMassageAnim color={c} />,
  'Cat-Cow Movement':       (c) => <CatCowAnim color={c} />,
  'Castor Oil Wrap':        (c) => <OilWrapAnim color={c} />,
  'Sleep Position Fix':     (c) => <SleepAnim color={c} />,
  // Muscle
  'Epsom Salt Bath':        (c) => <SoakAnim color={c} />,
  'Turmeric Paste Wrap':    (c) => <TurmericPasteAnim color={c} />,
  'Ice Compression (First 24h)': (c) => <IcePackAnim color={c} />,
  'Warm Cloth Compression': (c) => <WarmCompressAnim color={c} />,
  'Ginger & Sesame Oil Rub':(c) => <MassageAnim color={c} />,
  'Muscle Stretching Routine':(c)=> <MuscleStretchAnim color={c} />,
}

/**
 * RemedyAnimation
 * Renders an animated SVG illustration for a given remedy title.
 * Falls back to a type-based generic animation if no specific one found.
 */
export default function RemedyAnimation({ title, type, color = '#00d4aa' }) {
  injectStyle()

  const factory = ANIMATION_MAP[title]
  if (factory) return factory(color)

  // Fallback by type
  if (type?.includes('Heat'))     return <WarmCompressAnim color={color} />
  if (type?.includes('Cold'))     return <IcePackAnim color={color} />
  if (type?.includes('Stretch') || type?.includes('Movement') || type?.includes('Yoga'))
                                  return <MuscleStretchAnim color={color} />
  if (type?.includes('Massage'))  return <MassageAnim color={color} />
  if (type?.includes('Soak'))     return <SoakAnim color={color} />
  if (type?.includes('Ayurvedic'))return <TurmericAnim color={color} />
  if (type?.includes('Exercise')) return <KneeExerciseAnim color={color} />

  // Generic pulse fallback
  return (
    <svg viewBox="0 0 80 60" width="80" height="60">
      <circle cx="40" cy="30" r="18" fill={color} opacity=".3"
        style={{ animation: 'ra-ripple 2s ease-out infinite' }} />
      <circle cx="40" cy="30" r="10" fill={color} opacity=".6"
        style={{ animation: 'ra-pulse 2s ease-in-out infinite' }} />
      <text x="34" y="34" fontSize="14">💊</text>
    </svg>
  )
}
