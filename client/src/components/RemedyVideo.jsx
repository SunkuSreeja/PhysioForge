import { useEffect, useRef, useCallback } from 'react'

/**
 * RemedyVideo.jsx
 * Canvas-based animated instructional "video" renderer.
 * Draws smooth 60fps looping animated demos for each remedy.
 * Zero network dependencies — fully offline, works in any Vite/React environment.
 */

// ── Easing helpers ──────────────────────────────────────────────
const ease = {
  inOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  out:   t => 1 - Math.pow(1 - t, 3),
  in:    t => t * t * t,
  sin:   t => (1 - Math.cos(t * Math.PI)) / 2,
  bounce:t => {
    if (t < 1/2.75) return 7.5625 * t * t
    if (t < 2/2.75) { t -= 1.5/2.75; return 7.5625 * t * t + 0.75 }
    t -= 2.625/2.75; return 7.5625 * t * t + 0.984375
  },
}

const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const loop = (t, dur) => (t % dur) / dur  // 0..1 looping

// ── Drawing primitives ──────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawStick(ctx, x, y, scale, headColor, bodyColor, opts = {}) {
  const s = scale || 1
  const {
    headAngle = 0, torsoAngle = 0,
    leftArmAngle = -0.4, rightArmAngle = 0.4,
    leftLegAngle = 0.2, rightLegAngle = -0.2,
    leftElbowAngle = 0, rightElbowAngle = 0,
    leftKneeAngle = 0, rightKneeAngle = 0,
  } = opts

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)

  const HL = 12, NL = 8, TL = 28, AL = 20, LL = 24, FW = 4

  // Head
  ctx.save()
  ctx.rotate(headAngle)
  ctx.beginPath()
  ctx.arc(0, -TL - NL - HL, HL, 0, Math.PI * 2)
  ctx.fillStyle = headColor
  ctx.fill()
  // eyes
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.beginPath(); ctx.arc(-4, -TL - NL - HL - 2, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(4, -TL - NL - HL - 2, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.beginPath(); ctx.arc(-3.5, -TL - NL - HL - 2, 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(4.5, -TL - NL - HL - 2, 1.2, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  // Neck
  ctx.strokeStyle = bodyColor; ctx.lineWidth = FW
  ctx.beginPath(); ctx.moveTo(0, -TL); ctx.lineTo(0, -TL - NL); ctx.stroke()

  // Torso
  ctx.save()
  ctx.rotate(torsoAngle)
  ctx.strokeStyle = bodyColor; ctx.lineWidth = FW + 1
  ctx.beginPath(); ctx.moveTo(0, -TL); ctx.lineTo(0, 0); ctx.stroke()

  // Left arm upper
  ctx.save()
  ctx.translate(0, -TL + 4)
  ctx.rotate(leftArmAngle)
  ctx.strokeStyle = bodyColor; ctx.lineWidth = FW
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, AL * 0.6); ctx.stroke()
  // Left arm lower
  ctx.translate(0, AL * 0.6); ctx.rotate(leftElbowAngle)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, AL * 0.5); ctx.stroke()
  ctx.restore()

  // Right arm upper
  ctx.save()
  ctx.translate(0, -TL + 4)
  ctx.rotate(rightArmAngle)
  ctx.strokeStyle = bodyColor; ctx.lineWidth = FW
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, AL * 0.6); ctx.stroke()
  // Right arm lower
  ctx.translate(0, AL * 0.6); ctx.rotate(rightElbowAngle)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, AL * 0.5); ctx.stroke()
  ctx.restore()

  // Left leg upper
  ctx.save()
  ctx.translate(0, 0)
  ctx.rotate(leftLegAngle)
  ctx.strokeStyle = bodyColor; ctx.lineWidth = FW
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, LL * 0.55); ctx.stroke()
  // Left leg lower
  ctx.translate(0, LL * 0.55); ctx.rotate(leftKneeAngle)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, LL * 0.5); ctx.stroke()
  ctx.restore()

  // Right leg upper
  ctx.save()
  ctx.rotate(rightLegAngle)
  ctx.strokeStyle = bodyColor; ctx.lineWidth = FW
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, LL * 0.55); ctx.stroke()
  ctx.translate(0, LL * 0.55); ctx.rotate(rightKneeAngle)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, LL * 0.5); ctx.stroke()
  ctx.restore()

  ctx.restore() // torso
  ctx.restore()
}

function drawSteam(ctx, x, y, t, color, count = 3) {
  for (let i = 0; i < count; i++) {
    const phase = loop(t + i * 0.33, 1.8)
    const alpha = phase < 0.7 ? phase / 0.7 : 1 - (phase - 0.7) / 0.3
    const rise = phase * 30
    const sway = Math.sin(phase * Math.PI * 3 + i) * 4
    ctx.beginPath()
    ctx.arc(x + sway + (i - 1) * 10, y - rise, 4 + phase * 3, 0, Math.PI * 2)
    ctx.fillStyle = color.replace(')', `,${alpha * 0.6})`).replace('rgb', 'rgba')
    ctx.fill()
  }
}

function drawRipple(ctx, x, y, t, color, count = 2) {
  for (let i = 0; i < count; i++) {
    const phase = loop(t + i * 0.5, 2)
    const r = 4 + phase * 30
    const alpha = (1 - phase) * 0.6
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.strokeStyle = color.replace(')', `,${alpha})`).replace('rgb', 'rgba')
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

function drawSparkle(ctx, x, y, t, color, delay = 0) {
  const phase = loop(t + delay, 1.2)
  const alpha = Math.sin(phase * Math.PI)
  const size = 4 * alpha
  ctx.strokeStyle = color.replace(')', `,${alpha})`).replace('rgb', 'rgba')
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x + size, y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x, y + size); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - size * 0.7, y - size * 0.7); ctx.lineTo(x + size * 0.7, y + size * 0.7); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x + size * 0.7, y - size * 0.7); ctx.lineTo(x - size * 0.7, y + size * 0.7); ctx.stroke()
}

function drawProgressBar(ctx, x, y, w, step, total, color) {
  const h = 4; const r = 2
  // Track
  roundRect(ctx, x, y, w, h, r)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill()
  // Fill
  const fw = (step / total) * w
  if (fw > 0) {
    roundRect(ctx, x, y, fw, h, r)
    ctx.fillStyle = color; ctx.fill()
  }
  // Steps dots
  for (let i = 0; i <= total; i++) {
    const dx = x + (i / total) * w
    ctx.beginPath(); ctx.arc(dx, y + h / 2, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = i <= step ? color : 'rgba(255,255,255,0.2)'; ctx.fill()
  }
}

function drawStepLabel(ctx, x, y, text, color, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = 'bold 10px system-ui, sans-serif'
  ctx.fillStyle = color
  const metrics = ctx.measureText(text)
  const pad = 6; const bh = 18
  roundRect(ctx, x - metrics.width / 2 - pad, y - bh / 2, metrics.width + pad * 2, bh, 9)
  ctx.fillStyle = color + '22'; ctx.fill()
  ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.stroke()
  ctx.fillStyle = color
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ── Background renderer ─────────────────────────────────────────
function drawBg(ctx, W, H, color) {
  // Dark gradient bg
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0a0f1e')
  grad.addColorStop(1, '#0d1829')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.02)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // Color accent glow
  const grd = ctx.createRadialGradient(W * 0.5, H * 0.5, 10, W * 0.5, H * 0.5, H * 0.7)
  grd.addColorStop(0, color + '18')
  grd.addColorStop(1, 'transparent')
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H)
}

function drawVideoOverlay(ctx, W, H, color, stepNum, totalSteps, stepLabel) {
  // Bottom HUD bar
  const barH = 38
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, H - barH, W, barH)

  // Progress
  drawProgressBar(ctx, 12, H - barH + 17, W - 24, stepNum, totalSteps, color)

  // Step label
  if (stepLabel) {
    ctx.font = 'bold 9px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText(stepLabel, 14, H - barH + 4)
  }

  // REC / LOOP indicator
  ctx.beginPath(); ctx.arc(W - 18, H - barH + 10, 4, 0, Math.PI * 2)
  ctx.fillStyle = color; ctx.fill()
  ctx.font = '8px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'
  ctx.fillText('LOOP', W - 26, H - barH + 10)
}

// ── Scene composers per remedy ──────────────────────────────────

const SCENES = {}

// WARM COMPRESS / WARM CLOTH COMPRESSION
function sceneWarmCompress(ctx, W, H, t, color) {
  const phase = loop(t, 6)  // 6s loop
  const step = phase < 0.3 ? 0 : phase < 0.6 ? 1 : phase < 0.85 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Bowl of warm water
  ctx.save()
  ctx.translate(W * 0.28, H * 0.55)
  // Bowl
  ctx.beginPath(); ctx.ellipse(0, 18, 36, 12, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#1e3a5f'; ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-36, 0); ctx.quadraticCurveTo(0, 18, 36, 0)
  ctx.quadraticCurveTo(0, -8, -36, 0)
  ctx.fillStyle = color + 'cc'; ctx.fill()
  // Ripples on water
  drawRipple(ctx, 0, 2, t, color)
  // Steam
  drawSteam(ctx, 0, -4, t, color, 3)
  ctx.restore()

  // Cloth
  const clothY = H * (0.25 + (step >= 1 ? 0.15 * ease.inOut(clamp((phase - 0.3) / 0.2, 0, 1)) : 0))
  ctx.save()
  ctx.translate(W * 0.5, clothY)
  const squeeze = 1 + 0.04 * Math.sin(t * 2)
  ctx.scale(squeeze, 1 / squeeze)
  roundRect(ctx, -30, -12, 60, 24, 10)
  const cg = ctx.createLinearGradient(-30, -12, 30, 12)
  cg.addColorStop(0, color + 'ee'); cg.addColorStop(1, color + '99')
  ctx.fillStyle = cg; ctx.fill()
  // Cloth texture
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(i * 12, -10); ctx.lineTo(i * 12, 10); ctx.stroke()
  }
  ctx.restore()

  // Hands holding cloth → moving to neck
  if (step >= 1) {
    const nx = W * 0.5, ny = clothY + 10
    drawStick(ctx, nx, ny + 60, 0.55, '#fbbf24', color, {
      leftArmAngle: -0.8, rightArmAngle: -0.8,
      leftElbowAngle: 1.2, rightElbowAngle: -1.2,
    })
    if (step >= 2) {
      // Warmth glow on neck
      const grd = ctx.createRadialGradient(nx, ny - 15, 2, nx, ny - 15, 30)
      grd.addColorStop(0, color + '66'); grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd; ctx.fillRect(nx - 40, ny - 45, 80, 60)
      drawSteam(ctx, nx, ny - 20, t * 0.7, color, 2)
    }
  }

  const labels = ['Soak cloth in warm water', 'Wring & fold cloth', 'Apply to neck 15–20 min', 'Repeat 3× daily']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// ICE PACK / ICE COMPRESSION
function sceneIcePack(ctx, W, H, t, color) {
  const phase = loop(t, 5)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Ice cubes in bag
  ctx.save()
  ctx.translate(W * 0.5, H * 0.38)
  const pScale = 1 + 0.03 * Math.sin(t * 1.5)
  ctx.scale(pScale, pScale)
  // Ice bag
  roundRect(ctx, -32, -22, 64, 44, 14)
  ctx.fillStyle = color + 'cc'; ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke()
  // Ice cubes inside
  [[- 16, -8], [0, -8], [16, -8], [-8, 6], [8, 6]].forEach(([ix, iy]) => {
    roundRect(ctx, ix - 8, iy - 7, 16, 14, 4)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.8; ctx.stroke()
  })
  ctx.restore()

  // Sparkles around ice
  ;[[-15, -10], [15, -10], [0, 16], [-20, 5], [20, 5]].forEach(([dx, dy], i) => {
    drawSparkle(ctx, W * 0.5 + dx * 2, H * 0.38 + dy * 2, t, color, i * 0.25)
  })

  // Cold cloth wrapping
  if (step >= 1) {
    ctx.save()
    ctx.translate(W * 0.5, H * 0.38)
    roundRect(ctx, -36, -28, 72, 56, 16)
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2
    ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([])
    ctx.restore()
    drawStepLabel(ctx, W * 0.5, H * 0.38 + 42, 'Wrap in cloth first', color, clamp((phase - 0.25) / 0.1, 0, 1))
  }

  // Figure applying to knee
  if (step >= 2) {
    const alpha = clamp((phase - 0.5) / 0.15, 0, 1)
    ctx.save(); ctx.globalAlpha = alpha
    drawStick(ctx, W * 0.5, H * 0.78, 0.65, '#fbbf24', color, {
      leftArmAngle: -0.3, rightArmAngle: -0.3,
      leftElbowAngle: 0.9, rightElbowAngle: -0.9,
      leftLegAngle: 0.5, rightLegAngle: -0.5,
      leftKneeAngle: -0.6, rightKneeAngle: 0.6,
    })
    // Timer countdown
    const secs = Math.floor((1 - loop(t * 0.5, 15)) * 15)
    ctx.font = 'bold 14px system-ui,sans-serif'
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(`${secs}:00`, W * 0.5, H * 0.08)
    ctx.font = '9px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('APPLY TIME', W * 0.5, H * 0.08 + 16)
    ctx.restore()
  }

  const labels = ['Get ice pack ready', 'Wrap in thin cloth', 'Apply to area 15 min', 'Rest 10 min, repeat']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// NECK STRETCHING
function sceneNeckStretch(ctx, W, H, t, color) {
  const phase = loop(t, 8)
  const stretchPhase = loop(t, 4)  // faster oscillation for stretch
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Chair (simplified)
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(W * 0.35, H * 0.72, W * 0.3, H * 0.06)
  ctx.fillRect(W * 0.35, H * 0.55, W * 0.04, H * 0.17)
  ctx.fillRect(W * 0.61, H * 0.55, W * 0.04, H * 0.17)

  // Neck tilt angle
  let headAngle = 0
  if (step === 1) headAngle = -0.32 * ease.sin(stretchPhase)
  if (step === 2) headAngle = 0.32 * ease.sin(stretchPhase)
  if (step === 3) headAngle = 0.28 * Math.sin(t * 0.8)

  // Sitting person
  drawStick(ctx, W * 0.5, H * 0.64, 0.8, '#fbbf24', color, {
    headAngle,
    leftArmAngle: 0.15, rightArmAngle: -0.15,
    leftLegAngle: 0.5, rightLegAngle: -0.5,
    leftKneeAngle: 0.8, rightKneeAngle: -0.8,
  })

  // Direction arrows
  if (step >= 1) {
    const arrowAlpha = 0.5 + 0.5 * Math.sin(t * 2)
    ctx.save(); ctx.globalAlpha = arrowAlpha
    ctx.font = '22px system-ui,sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    if (step === 1) { ctx.fillStyle = color; ctx.fillText('←', W * 0.28, H * 0.3) }
    if (step === 2) { ctx.fillStyle = color; ctx.fillText('→', W * 0.72, H * 0.3) }
    if (step === 3) {
      ctx.fillStyle = color; ctx.fillText('←', W * 0.28, H * 0.3)
      ctx.fillText('→', W * 0.72, H * 0.3)
    }
    ctx.restore()
  }

  // Hold timer
  if (step >= 1) {
    const holdT = clamp(loop(t, 15) * 15, 0, 15)
    ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'right'; ctx.textBaseline = 'top'
    ctx.fillText(`Hold: ${Math.ceil(15 - holdT)}s`, W - 12, 10)
  }

  const labels = ['Sit upright, chin parallel', 'Tilt head LEFT — hold 15s', 'Tilt head RIGHT — hold 15s', 'Repeat 5× each side']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// TURMERIC MILK / PASTE
function sceneTurmeric(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.55 ? 1 : phase < 0.8 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Table surface
  ctx.fillStyle = '#1e2d3d'
  roundRect(ctx, 10, H * 0.72, W - 20, H * 0.16, 8)
  ctx.fill()

  // Turmeric container
  ctx.save(); ctx.translate(W * 0.28, H * 0.6)
  roundRect(ctx, -16, -20, 32, 36, 6)
  ctx.fillStyle = '#d97706'; ctx.fill()
  ctx.font = 'bold 8px system-ui,sans-serif'; ctx.fillStyle = 'white'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🌿', 0, -4)
  ctx.restore()

  // Coconut oil bottle
  ctx.save(); ctx.translate(W * 0.42, H * 0.6)
  roundRect(ctx, -10, -24, 20, 42, 8)
  ctx.fillStyle = '#f0fdf4'; ctx.fill()
  ctx.strokeStyle = '#86efac'; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.restore()

  // Bowl
  ctx.save(); ctx.translate(W * 0.62, H * 0.63)
  ctx.beginPath(); ctx.ellipse(0, 8, 24, 8, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#334155'; ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-24, 0); ctx.quadraticCurveTo(0, 16, 24, 0); ctx.quadraticCurveTo(0, -4, -24, 0)
  // Paste inside bowl - appears gradually
  if (step >= 1) {
    const fillAmt = clamp((phase - 0.25) / 0.2, 0, 1)
    ctx.save()
    ctx.clip()
    ctx.fillStyle = color + 'ee'; ctx.fillRect(-24, -4 + 8 * (1 - fillAmt), 48, 20)
    // Swirl
    ctx.beginPath()
    ctx.moveTo(0, 4)
    const swirl = t * 2
    ctx.arc(0, 4, 10, swirl, swirl + Math.PI * 1.5)
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2; ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  // Mixing hand animation
  if (step >= 1) {
    const mx = W * 0.62 + Math.sin(t * 4) * 8
    const my = H * 0.6 + Math.cos(t * 4) * 4
    ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24cc'; ctx.fill()
  }

  // Application to body
  if (step >= 2) {
    const alpha = clamp((phase - 0.55) / 0.15, 0, 1)
    ctx.save(); ctx.globalAlpha = alpha
    ctx.beginPath(); ctx.arc(W * 0.5, H * 0.38, 22 + Math.sin(t * 2) * 2, 0, Math.PI * 2)
    ctx.fillStyle = color + '44'; ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
    // Paste patch
    ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.38, 16, 10, 0.3, 0, Math.PI * 2)
    ctx.fillStyle = '#d97706cc'; ctx.fill()
    ctx.restore()
  }

  drawSteam(ctx, W * 0.62, H * 0.55, t, color, 2)
  const labels = ['Gather turmeric + coconut oil', 'Mix into smooth paste', 'Apply to affected area', 'Wrap cloth — wait 30 min']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// QUADRICEPS / KNEE EXERCISE
function sceneKneeExercise(ctx, W, H, t, color) {
  const phase = loop(t, 6)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const legPhase = loop(t, 3)

  drawBg(ctx, W, H, color)

  // Chair
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(W * 0.28, H * 0.7, W * 0.44, H * 0.05)
  ctx.fillRect(W * 0.28, H * 0.52, W * 0.04, H * 0.18)
  ctx.fillRect(W * 0.68, H * 0.52, W * 0.04, H * 0.18)
  ctx.fillRect(W * 0.28, H * 0.44, W * 0.04, H * 0.1)
  ctx.fillRect(W * 0.68, H * 0.44, W * 0.04, H * 0.1)

  // Leg lift animation
  const liftAngle = step >= 1 ? -0.45 * Math.max(0, Math.sin(legPhase * Math.PI)) : 0
  const liftKnee = liftAngle < -0.1 ? -liftAngle * 0.5 : 0

  drawStick(ctx, W * 0.5, H * 0.63, 0.82, '#fbbf24', color, {
    leftArmAngle: 0.5, rightArmAngle: -0.5,
    leftLegAngle: liftAngle + 0.5, rightLegAngle: 0.5,
    leftKneeAngle: -liftKnee + 0.4, rightKneeAngle: 0.4,
  })

  // Count display
  const reps = Math.floor(loop(t * 0.4, 10) * 10)
  ctx.font = 'bold 16px system-ui,sans-serif'
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText(`${reps} / 10`, W * 0.5, 10)
  ctx.font = '9px system-ui,sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('REPS', W * 0.5, 28)

  // Up arrow when lifting
  if (liftAngle < -0.15) {
    const arrowAlpha = Math.abs(liftAngle) * 2
    ctx.save(); ctx.globalAlpha = arrowAlpha
    ctx.font = '20px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('↑', W * 0.32, H * 0.65)
    ctx.restore()
  }

  // 5-second hold indicator
  if (step >= 2 && liftAngle < -0.15) {
    const holdPct = clamp(Math.abs(liftAngle) / 0.4, 0, 1)
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.35, 16, -Math.PI / 2, -Math.PI / 2 + holdPct * Math.PI * 2)
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke()
    ctx.font = 'bold 10px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Hold', W * 0.75, H * 0.35)
  }

  const labels = ['Sit upright in chair', 'Straighten one leg slowly', 'Hold 5 sec at the top', 'Lower slowly — 10 reps']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// PENDULUM EXERCISE (shoulder)
function scenePendulum(ctx, W, H, t, color) {
  const phase = loop(t, 8)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Table/support
  ctx.fillStyle = '#1e293b'
  roundRect(ctx, W * 0.1, H * 0.38, W * 0.35, H * 0.06, 6); ctx.fill()

  // Person leaning forward
  const armSwing = step >= 1 ? Math.sin(t * 1.2) * 0.55 : 0

  ctx.save(); ctx.translate(W * 0.38, H * 0.48)
  // Torso leaning
  ctx.rotate(0.5)
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 10); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()
  // Support arm on table
  ctx.strokeStyle = color; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(-26, -8); ctx.stroke()
  // Swinging arm
  ctx.save()
  ctx.translate(0, -16)
  ctx.rotate(armSwing)
  ctx.strokeStyle = color; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 36); ctx.stroke()
  // Hand
  ctx.beginPath(); ctx.arc(0, 38, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()
  // Circle trace
  if (step >= 2) {
    ctx.strokeStyle = color + '44'; ctx.lineWidth = 1.5
    ctx.setLineDash([3, 4])
    ctx.beginPath(); ctx.arc(0, 20, 18, 0, Math.PI * 2)
    ctx.stroke(); ctx.setLineDash([])
  }
  ctx.restore()
  ctx.restore()

  // Circle indicators
  if (step >= 2) {
    const dir = step === 2 ? '↻' : '↺'
    ctx.font = '22px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const alpha = 0.5 + 0.5 * Math.sin(t * 3)
    ctx.globalAlpha = alpha; ctx.fillText(dir, W * 0.72, H * 0.6); ctx.globalAlpha = 1
  }

  const labels = ['Lean forward on support', 'Let arm hang freely', '10 circles clockwise', '10 circles counter-CW']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// CAT-COW MOVEMENT
function sceneCatCow(ctx, W, H, t, color) {
  const phase = loop(t, 6)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const spinePhase = loop(t, 4)

  drawBg(ctx, W, H, color)

  // Floor mat
  roundRect(ctx, W * 0.05, H * 0.72, W * 0.9, H * 0.08, 8)
  const mg = ctx.createLinearGradient(0, H * 0.72, 0, H * 0.8)
  mg.addColorStop(0, '#1e3a5f'); mg.addColorStop(1, '#172033')
  ctx.fillStyle = mg; ctx.fill()

  const spineArc = Math.sin(spinePhase * Math.PI * 2) * 0.4  // -0.4 to 0.4
  const isCow = spineArc < 0  // Cow: spine dips
  const isLabel = spineArc < -0.25 || spineArc > 0.25

  ctx.save(); ctx.translate(W * 0.5, H * 0.64)

  // Hands
  ctx.beginPath(); ctx.arc(-54, 14, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24cc'; ctx.fill()
  ctx.beginPath(); ctx.arc(54, 14, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24cc'; ctx.fill()

  // Knees
  ctx.beginPath(); ctx.arc(-36, 26, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24cc'; ctx.fill()
  ctx.beginPath(); ctx.arc(36, 26, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24cc'; ctx.fill()

  // Spine (Bezier controlled by arc)
  const ctrlY = spineArc * 60
  ctx.beginPath()
  ctx.moveTo(-54, 10)
  ctx.bezierCurveTo(-20, ctrlY, 20, ctrlY, 54, 10)
  ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round'
  ctx.stroke()

  // Head
  ctx.save()
  ctx.translate(54, 10)
  ctx.rotate(isCow ? -0.3 : 0.3)
  ctx.beginPath(); ctx.arc(12, 0, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()
  ctx.restore()

  // Tail
  ctx.save()
  ctx.translate(-54, 10)
  ctx.rotate(isCow ? 0.5 : -0.8)
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-14, -10, -20, -20)
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke()
  ctx.restore()

  ctx.restore()

  // Breath / pose label
  if (step >= 1 && isLabel) {
    const lbl = isCow ? '🐄 COW — Inhale' : '🐈 CAT — Exhale'
    drawStepLabel(ctx, W * 0.5, H * 0.14, lbl, color, 1)
  }

  // Breath wave
  const bwave = 0.5 + 0.5 * Math.sin(t * 1.0)
  ctx.beginPath()
  for (let x = 0; x <= W - 24; x += 2) {
    const y = H * 0.1 + Math.sin((x / (W - 24)) * Math.PI * 4 + t * 2) * 3 * bwave
    x === 0 ? ctx.moveTo(x + 12, y) : ctx.lineTo(x + 12, y)
  }
  ctx.strokeStyle = color + '55'; ctx.lineWidth = 1.5; ctx.stroke()

  const labels = ['On all fours, wrists under shoulders', 'Inhale — drop belly (Cow)', 'Exhale — round spine (Cat)', 'Flow slowly 10–15 reps']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// KNEE-TO-CHEST STRETCH
function sceneKneeToChest(ctx, W, H, t, color) {
  const phase = loop(t, 6)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const pullPhase = loop(t, 4)

  drawBg(ctx, W, H, color)

  // Mat
  roundRect(ctx, W * 0.05, H * 0.6, W * 0.9, H * 0.1, 8)
  ctx.fillStyle = '#1e3a5f'; ctx.fill()

  const pull = step >= 1 ? ease.inOut(Math.abs(Math.sin(pullPhase * Math.PI))) : 0

  ctx.save(); ctx.translate(W * 0.5, H * 0.56)

  // Body (lying)
  roundRect(ctx, -52, -8, 104, 16, 8)
  ctx.fillStyle = color + 'bb'; ctx.fill()

  // Head
  ctx.beginPath(); ctx.arc(-60, -2, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()

  // Knees pulling to chest
  const kneeX = 30 - pull * 50
  const kneeY = -8 - pull * 22

  ctx.beginPath(); ctx.arc(kneeX, kneeY, 16, 0, Math.PI * 2)
  ctx.fillStyle = color + 'cc'; ctx.fill()
  ctx.beginPath(); ctx.arc(kneeX + 14, kneeY + 10, 12, 0, Math.PI * 2)
  ctx.fillStyle = color + 'bb'; ctx.fill()

  // Arms hugging
  if (step >= 2) {
    ctx.strokeStyle = '#fbbf24cc'; ctx.lineWidth = 5; ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-10, -8)
    ctx.quadraticCurveTo(10, kneeY - 10, kneeX - 8, kneeY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(10, -8)
    ctx.quadraticCurveTo(20, kneeY + 8, kneeX + 10, kneeY + 8)
    ctx.stroke()
  }

  // Breath dots
  const breathScale = 1 + 0.06 * Math.sin(t * 1.2)
  ctx.save(); ctx.scale(breathScale, breathScale)
  ctx.restore()

  ctx.restore()

  // Hold timer ring
  if (step >= 2 && pull > 0.5) {
    const holdPct = pull
    ctx.beginPath(); ctx.arc(W - 24, H * 0.18, 14, -Math.PI / 2, -Math.PI / 2 + holdPct * Math.PI * 2)
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke()
    ctx.font = 'bold 9px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Hold', W - 24, H * 0.18)
  }

  const labels = ['Lie on firm surface', 'Pull knees slowly to chest', 'Hold 20–30 sec, breathe deep', 'Repeat 5×, twice daily']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// NEEM LEAF PASTE
function sceneNeemLeaf(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.55 ? 1 : phase < 0.8 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Floating neem leaves
  for (let i = 0; i < 4; i++) {
    const lx = W * (0.15 + i * 0.22)
    const ly = H * 0.3 + Math.sin(t * 0.8 + i * 1.5) * 12
    const lr = 0.3 + Math.sin(t * 0.5 + i) * 0.15
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(lr)
    // Leaf shape
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2)
    ctx.fillStyle = color + 'cc'; ctx.fill()
    // Vein
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke()
    ctx.restore()
  }

  // Mortar & pestle
  ctx.save(); ctx.translate(W * 0.3, H * 0.6)
  // Bowl
  ctx.beginPath(); ctx.ellipse(0, 10, 22, 8, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#374151'; ctx.fill()
  ctx.beginPath(); ctx.moveTo(-22, 4); ctx.quadraticCurveTo(0, 20, 22, 4); ctx.closePath()
  ctx.fillStyle = '#4b5563'; ctx.fill()
  // Paste
  if (step >= 1) {
    const pg = clamp((phase - 0.25) / 0.2, 0, 1)
    ctx.beginPath(); ctx.ellipse(0, 8, 14 * pg, 5 * pg, 0, 0, Math.PI * 2)
    ctx.fillStyle = color + 'cc'; ctx.fill()
  }
  // Pestle grinding
  const grindX = Math.sin(t * 3) * 8
  ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 6; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(grindX, 8); ctx.lineTo(grindX + 4, -14)
  ctx.stroke()
  ctx.restore()

  // Application to shoulder
  if (step >= 2) {
    const alpha = clamp((phase - 0.55) / 0.15, 0, 1)
    ctx.save(); ctx.globalAlpha = alpha
    // Shoulder shape
    ctx.beginPath(); ctx.arc(W * 0.65, H * 0.45, 24, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf2444'; ctx.fill()
    // Paste layer
    ctx.beginPath(); ctx.ellipse(W * 0.65, H * 0.45, 18, 12, -0.3, 0, Math.PI * 2)
    ctx.fillStyle = color + 'bb'; ctx.fill()
    // Application hand
    ctx.beginPath(); ctx.arc(W * 0.65 + Math.sin(t * 2) * 6, H * 0.4, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24cc'; ctx.fill()
    ctx.restore()
  }

  // Timer (20-30 min)
  if (step === 3) {
    ctx.font = 'bold 13px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('20–30 min', W * 0.5, 10)
  }

  const labels = ['Gather fresh neem leaves', 'Grind into smooth paste', 'Apply paste to shoulder', 'Leave 20–30 min, then rinse']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// WARM SESAME OIL MASSAGE (back)
function sceneBackMassage(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Person lying prone on mat
  ctx.save(); ctx.translate(W * 0.5, H * 0.58)

  // Mat
  roundRect(ctx, -60, 10, 120, 20, 8)
  ctx.fillStyle = '#1e3a5f'; ctx.fill()

  // Body
  roundRect(ctx, -50, -12, 100, 24, 14)
  ctx.fillStyle = '#fbbf2488'; ctx.fill()
  // Head
  ctx.beginPath(); ctx.arc(-62, 0, 11, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()
  // Arms
  ctx.strokeStyle = '#fbbf24aa'; ctx.lineWidth = 7; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-30, -22); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(30, -22); ctx.stroke()

  // Back area highlight
  ctx.beginPath(); ctx.ellipse(10, 0, 38, 12, 0, 0, Math.PI * 2)
  ctx.fillStyle = color + '22'; ctx.fill()

  // Massage hands (circular motion)
  if (step >= 1) {
    const mx1 = Math.cos(t * 2.5) * 12
    const my1 = Math.sin(t * 2.5) * 6
    const mx2 = Math.cos(t * 2.5 + Math.PI) * 12
    const my2 = Math.sin(t * 2.5 + Math.PI) * 6
    ;[[mx1, my1], [mx2, my2]].forEach(([hx, hy]) => {
      ctx.beginPath(); ctx.ellipse(hx + 10, hy, 11, 7, 0, 0, Math.PI * 2)
      ctx.fillStyle = color + 'aa'; ctx.fill()
    })
    // Oil sheen
    const og = ctx.createRadialGradient(10, 0, 2, 10, 0, 26)
    og.addColorStop(0, color + '55'); og.addColorStop(1, 'transparent')
    ctx.fillStyle = og; ctx.fillRect(-36, -14, 72, 28)
  }

  ctx.restore()

  // Oil bottle dripping
  ctx.save(); ctx.translate(W * 0.78, H * 0.3)
  ctx.rotate(-0.4 + 0.05 * Math.sin(t))
  roundRect(ctx, -8, -20, 16, 32, 6)
  ctx.fillStyle = '#d97706'; ctx.fill()
  // Label
  ctx.font = '7px system-ui,sans-serif'; ctx.fillStyle = '#fffbeb'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OIL', 0, -6)
  // Drip
  const dripY = 14 + loop(t, 1.5) * 20
  ctx.beginPath(); ctx.arc(0, dripY, 4, 0, Math.PI * 2)
  ctx.fillStyle = color + 'bb'; ctx.fill()
  ctx.restore()

  const labels = ['Warm sesame oil slightly', 'Apply to lower back muscles', 'Long strokes alongside spine', 'Massage 10–15 min before bed']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// DOORWAY CHEST STRETCH
function sceneDoorwayStretch(ctx, W, H, t, color) {
  const phase = loop(t, 6)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Doorframe
  ctx.fillStyle = '#1e2d3d'
  ctx.fillRect(W * 0.06, 0, W * 0.07, H * 0.88)
  ctx.fillRect(W * 0.87, 0, W * 0.07, H * 0.88)
  ctx.fillRect(W * 0.06, 0, W * 0.88, H * 0.09)

  // Lean amount
  const lean = step >= 2 ? 0.06 + 0.04 * Math.sin(t * 1.5) : 0

  // Figure in doorway
  drawStick(ctx, W * 0.5, H * 0.7, 0.88, '#fbbf24', color, {
    leftArmAngle: -1.42 + lean * 0.5, rightArmAngle: 1.42 - lean * 0.5,
    leftElbowAngle: 1.0, rightElbowAngle: -1.0,
    leftLegAngle: 0.1, rightLegAngle: -0.1,
  })

  // Hands touching frame
  const lhx = W * 0.15, rhx = W * 0.85, hy = H * 0.5
  ctx.beginPath(); ctx.arc(lhx, hy, 6, 0, Math.PI * 2)
  ctx.beginPath(); ctx.arc(rhx, hy, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()

  // Lean arrow
  if (step >= 2) {
    const arrowAlpha = 0.5 + 0.5 * Math.sin(t * 2)
    ctx.save(); ctx.globalAlpha = arrowAlpha
    ctx.font = '18px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('→', W * 0.5, H * 0.22)
    ctx.restore()
  }

  // Stretch sensor arc
  if (step >= 2) {
    const stretchPct = 0.5 + 0.5 * Math.sin(t * 1.5)
    ctx.beginPath(); ctx.arc(W * 0.5, H * 0.4, 20, -Math.PI * 0.9, -Math.PI * 0.9 + stretchPct * Math.PI * 1.8)
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke()
  }

  const labels = ['Stand in doorway, arms at 90°', 'Place hands on frame at shoulder', 'Lean body gently forward', 'Hold 15–20 sec — mild stretch only']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// GENERIC SOAK (Epsom salt bath)
function sceneSoak(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Bucket / basin
  ctx.save(); ctx.translate(W * 0.5, H * 0.55)
  ctx.beginPath()
  ctx.moveTo(-40, -30); ctx.lineTo(-34, 30); ctx.lineTo(34, 30); ctx.lineTo(40, -30)
  ctx.closePath()
  ctx.fillStyle = '#1e293b'; ctx.fill()
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke()

  // Water
  const waveT = t * 1.5
  ctx.save(); ctx.beginPath()
  ctx.moveTo(-38, -10)
  for (let x = -38; x <= 38; x += 4) {
    ctx.lineTo(x, -10 + Math.sin(waveT + x * 0.15) * 3)
  }
  ctx.lineTo(34, 30); ctx.lineTo(-34, 30); ctx.closePath()
  ctx.fillStyle = color + 'aa'; ctx.fill()
  ctx.restore()

  // Ripples
  drawRipple(ctx, 0, -8, t, color)
  // Steam
  drawSteam(ctx, 0, -14, t, color, 3)

  // Salt crystals dissolving
  for (let i = 0; i < 6; i++) {
    const sx = -20 + i * 8, sy = -18 + Math.sin(t + i) * 4
    const salt = loop(t * 0.3 + i * 0.15, 3)
    const alpha = salt < 0.6 ? 1 : (1 - (salt - 0.6) / 0.4) * 0.6
    ctx.beginPath(); ctx.rect(sx - 2, sy - 2, 4, 4)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill()
  }
  ctx.restore()

  // Leg dipping
  if (step >= 2) {
    ctx.save(); ctx.translate(W * 0.5, H * 0.55 - 10)
    const legY = step >= 2 ? clamp((phase - 0.5) / 0.15, 0, 1) * 10 : 0
    ctx.strokeStyle = '#fbbf24cc'; ctx.lineWidth = 8; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(-8, -40); ctx.lineTo(-8, -15 + legY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(8, -40); ctx.lineTo(8, -15 + legY); ctx.stroke()
    ctx.restore()
  }

  const labels = ['Fill bucket with warm water', 'Add 2 cups Epsom salt', 'Soak affected area', 'Soak 20 min, rest after']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// SLEEP POSITION FIX
function sceneSleepFix(ctx, W, H, t, color) {
  const phase = loop(t, 8)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Bed
  roundRect(ctx, W * 0.05, H * 0.54, W * 0.9, H * 0.28, 12)
  ctx.fillStyle = '#1a2744'; ctx.fill()
  // Sheet
  roundRect(ctx, W * 0.05, H * 0.52, W * 0.9, H * 0.06, 8)
  ctx.fillStyle = '#1e3a5f'; ctx.fill()

  // Pillow
  ctx.beginPath(); ctx.ellipse(W * 0.18, H * 0.57, 14, 8, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#f0f9ff'; ctx.fill()

  // Between-knees pillow
  ctx.beginPath(); ctx.ellipse(W * 0.58, H * 0.63, 10, 6, 0.3, 0, Math.PI * 2)
  ctx.fillStyle = '#f0f9ff'; ctx.fill()

  // Lying figure (side position)
  const breathScale = 1 + 0.02 * Math.sin(t * 0.8)
  ctx.save(); ctx.translate(W * 0.5, H * 0.6)
  ctx.scale(breathScale, breathScale)

  // Body
  roundRect(ctx, -40, -9, 60, 18, 10)
  ctx.fillStyle = color + 'bb'; ctx.fill()

  // Head on pillow
  ctx.beginPath(); ctx.arc(-52, -2, 11, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()

  // Knees
  ctx.beginPath(); ctx.arc(28, -6, 12, 0, Math.PI * 2)
  ctx.fillStyle = color + 'aa'; ctx.fill()
  ctx.beginPath(); ctx.arc(32, 6, 11, 0, Math.PI * 2)
  ctx.fillStyle = color + '99'; ctx.fill()

  // Spine alignment arrow
  if (step >= 2) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(-52, -14); ctx.lineTo(32, -14); ctx.stroke()
    ctx.setLineDash([])
    drawStepLabel(ctx, -10, -22, 'Spine aligned ✓', color, 0.8)
  }

  ctx.restore()

  // Zzz particles
  ;['z', 'Z', 'z'].forEach((z, i) => {
    const zt = loop(t * 0.4 + i * 0.5, 4)
    const zx = W * 0.3 + i * 12 + zt * 10
    const zy = H * 0.38 - zt * 20
    ctx.font = `${9 + i * 2}px system-ui,sans-serif`
    ctx.fillStyle = color + Math.round((1 - zt) * 255).toString(16).padStart(2, '0')
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(z, zx, zy)
  })

  const labels = ['Sleep on your SIDE', 'Place pillow between knees', 'Keep spine straight', 'Avoid sleeping on stomach']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// HOT & COLD ALTERNATING (contrast therapy)
function sceneContrastTherapy(ctx, W, H, t, color) {
  const phase = loop(t, 8)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const cycle = loop(t, 4)  // hot=0..0.75, cold=0.75..1
  const isHot = cycle < 0.75

  drawBg(ctx, W, H, isHot ? '#ff6b7a' : color)

  // Left: Hot compress
  ctx.save(); ctx.translate(W * 0.25, H * 0.5)
  const hotAlpha = isHot ? 0.9 : 0.3
  ctx.globalAlpha = hotAlpha
  roundRect(ctx, -24, -20, 48, 40, 12)
  ctx.fillStyle = '#ff6b7a'; ctx.fill()
  ctx.font = 'bold 9px system-ui,sans-serif'; ctx.fillStyle = 'white'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HOT', 0, 0)
  if (isHot) drawSteam(ctx, 0, -24, t, '#ff6b7a', 2)
  ctx.restore()

  // Center figure
  drawStick(ctx, W * 0.5, H * 0.72, 0.7, '#fbbf24', isHot ? '#ff6b7a' : color, {
    leftArmAngle: isHot ? -0.8 : -0.6,
    rightArmAngle: isHot ? 0.5 : 0.7,
    leftElbowAngle: isHot ? 0.8 : 0.6,
  })

  // Right: Cold compress
  ctx.save(); ctx.translate(W * 0.75, H * 0.5)
  const coldAlpha = !isHot ? 0.9 : 0.3
  ctx.globalAlpha = coldAlpha
  roundRect(ctx, -24, -20, 48, 40, 12)
  ctx.fillStyle = color; ctx.fill()
  ctx.font = 'bold 9px system-ui,sans-serif'; ctx.fillStyle = 'white'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COLD', 0, 0)
  if (!isHot) drawSparkle(ctx, 10, -14, t, color, 0)
  ctx.restore()

  // Timer indicator
  const cycleText = isHot ? `HOT: ${Math.ceil(3 - (cycle / 0.75) * 3)}min` : `COLD: ${Math.ceil(1 - ((cycle - 0.75) / 0.25))}min`
  ctx.font = 'bold 11px system-ui,sans-serif'; ctx.fillStyle = isHot ? '#ff6b7a' : color
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.globalAlpha = 1
  ctx.fillText(cycleText, W * 0.5, 10)

  // Swap arrow
  const swapAlpha = 0.4 + 0.4 * Math.sin(t * 3)
  ctx.save(); ctx.globalAlpha = swapAlpha
  ctx.font = '18px system-ui,sans-serif'; ctx.fillStyle = 'white'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('⇄', W * 0.5, H * 0.46)
  ctx.restore()

  const labels = ['Apply warm compress 3 min', 'Switch to cold pack 1 min', 'Repeat cycle 3–4 times', 'Always end with COLD']
  drawVideoOverlay(ctx, W, H, isHot ? '#ff6b7a' : color, step, 3, labels[step])
}

// RANGE OF MOTION (joint)
function sceneRangeOfMotion(ctx, W, H, t, color) {
  const phase = loop(t, 6)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const angle = t * 1.2

  drawBg(ctx, W, H, color)

  const cx = W * 0.5, cy = H * 0.5, R = Math.min(W, H) * 0.28

  // Orbit track
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.strokeStyle = color + '33'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([])

  // Joint center
  const jg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 22)
  jg.addColorStop(0, color + 'ff'); jg.addColorStop(1, color + '44')
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2)
  ctx.fillStyle = jg; ctx.fill()

  // Orbiting dot (moving along track)
  const ox = cx + Math.cos(angle) * R
  const oy = cy + Math.sin(angle) * R
  ctx.beginPath(); ctx.arc(ox, oy, 9, 0, Math.PI * 2)
  const dg = ctx.createRadialGradient(ox, oy, 1, ox, oy, 9)
  dg.addColorStop(0, 'white'); dg.addColorStop(1, color)
  ctx.fillStyle = dg; ctx.fill()

  // Trailing glow
  for (let i = 1; i <= 6; i++) {
    const ta = angle - i * 0.15
    const tx = cx + Math.cos(ta) * R
    const ty = cy + Math.sin(ta) * R
    ctx.beginPath(); ctx.arc(tx, ty, 4 - i * 0.4, 0, Math.PI * 2)
    ctx.fillStyle = color + Math.round((1 - i / 8) * 180).toString(16).padStart(2, '0'); ctx.fill()
  }

  // Direction arrow at dot
  ctx.save(); ctx.translate(ox, oy); ctx.rotate(angle + Math.PI / 2)
  ctx.strokeStyle = 'white'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4, 0); ctx.lineTo(-4, 0); ctx.closePath()
  ctx.fill()
  ctx.restore()

  // ROM label
  const deg = Math.round(((angle % (Math.PI * 2)) / (Math.PI * 2)) * 360)
  ctx.font = 'bold 12px system-ui,sans-serif'; ctx.fillStyle = color
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(`${deg}°`, cx, 10)

  const labels = ['Identify each painful joint', 'Move through pain-free range', 'Slow circles — no forcing', 'Repeat 5–10× per joint, 2×/day']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// MUSCLE STRETCHING ROUTINE
function sceneMuscleStretch(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const stretchAmt = step >= 1 ? ease.inOut(Math.abs(Math.sin(loop(t, 3) * Math.PI))) : 0

  drawBg(ctx, W, H, color)

  // Mat
  roundRect(ctx, W * 0.05, H * 0.75, W * 0.9, H * 0.1, 8)
  ctx.fillStyle = '#1e3a5f'; ctx.fill()

  // Person seated reaching forward
  ctx.save(); ctx.translate(W * 0.38, H * 0.68)

  // Lower body
  roundRect(ctx, -22, 0, 44, 14, 8)
  ctx.fillStyle = color + 'bb'; ctx.fill()

  // Torso leaning
  ctx.save(); ctx.rotate(-0.3 - stretchAmt * 0.35)
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.stroke()
  // Head
  ctx.beginPath(); ctx.arc(0, -46, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()

  // Arms reaching
  const armReach = stretchAmt * 48
  ctx.strokeStyle = '#fbbf24cc'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(-4 + armReach * 0.85, -24 + armReach * 0.3); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(4, -28); ctx.lineTo(4 + armReach * 0.9, -22 + armReach * 0.4); ctx.stroke()

  // Hands
  ctx.beginPath(); ctx.arc(-4 + armReach * 0.85, -24 + armReach * 0.3, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#fbbf24'; ctx.fill()
  ctx.restore()
  ctx.restore()

  // Stretch intensity meter
  const meterH = H * 0.3
  const meterX = W * 0.84
  const meterY = H * 0.35
  roundRect(ctx, meterX - 6, meterY, 12, meterH, 6)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill()
  roundRect(ctx, meterX - 6, meterY + meterH * (1 - stretchAmt), 12, meterH * stretchAmt, 6)
  ctx.fillStyle = color; ctx.fill()
  ctx.font = '8px system-ui,sans-serif'; ctx.fillStyle = color
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText('STRETCH', meterX, meterY + meterH + 4)

  // Hold timer
  if (stretchAmt > 0.7) {
    ctx.font = 'bold 11px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText('HOLD ✓', W * 0.5, 10)
  }

  const labels = ['Identify sore muscle group', 'Stretch to mild tension only', 'Hold 20–30 sec, no bouncing', 'Repeat 3–4× per muscle, 2×/day']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// POSTURE CORRECTION
function scenePosture(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3
  const improveT = step >= 2 ? clamp((phase - 0.5) / 0.2, 0, 1) : 0

  drawBg(ctx, W, H, color)

  // Desk
  roundRect(ctx, W * 0.1, H * 0.58, W * 0.8, H * 0.06, 6)
  ctx.fillStyle = '#1e2d3d'; ctx.fill()

  // Monitor rising to eye level
  const monY = H * 0.3 - improveT * H * 0.1
  roundRect(ctx, W * 0.52, monY, W * 0.28, H * 0.22, 8)
  ctx.fillStyle = '#0f172a'; ctx.fill()
  ctx.strokeStyle = color + '77'; ctx.lineWidth = 1.5; ctx.stroke()
  // Screen glow
  const sg = ctx.createLinearGradient(W * 0.52, monY, W * 0.8, monY + H * 0.22)
  sg.addColorStop(0, color + '33'); sg.addColorStop(1, color + '11')
  ctx.fillStyle = sg; ctx.fill()
  // Monitor stand
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(W * 0.66, monY + H * 0.22); ctx.lineTo(W * 0.66, H * 0.58); ctx.stroke()

  // Poor posture person → correcting
  const hunchAngle = (1 - improveT) * 0.35
  const headFwd = (1 - improveT) * 0.3
  drawStick(ctx, W * 0.35, H * 0.7, 0.78, '#fbbf24', color, {
    headAngle: headFwd,
    torsoAngle: hunchAngle,
    leftArmAngle: 0.2, rightArmAngle: -0.2,
    leftLegAngle: 0.5, rightLegAngle: -0.5,
    leftKneeAngle: 0.6, rightKneeAngle: -0.6,
  })

  // Eye level guide line
  if (step >= 1) {
    const eyeY = H * 0.38 - improveT * H * 0.05
    ctx.strokeStyle = color + '66'; ctx.lineWidth = 1; ctx.setLineDash([5, 4])
    ctx.beginPath(); ctx.moveTo(W * 0.2, eyeY); ctx.lineTo(W * 0.8, eyeY); ctx.stroke()
    ctx.setLineDash([])
    drawStepLabel(ctx, W * 0.5, eyeY - 10, 'Eye Level', color, 0.7)
  }

  // Posture score
  if (step >= 2) {
    const score = Math.round(60 + improveT * 38)
    ctx.font = 'bold 14px system-ui,sans-serif'; ctx.fillStyle = color
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(`Posture: ${score}%`, W * 0.5, 10)
  }

  const labels = ['Raise screen to eye level', 'Chin parallel to floor', 'Break every 30 min of screen', 'Firm pillow — neck curve support']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// RICE METHOD
function sceneRICE(ctx, W, H, t, color) {
  const phase = loop(t, 8)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  const letters = ['R', 'I', 'C', 'E']
  const words = ['Rest', 'Ice', 'Compress', 'Elevate']
  const icons = ['🛋️', '🧊', '🩹', '⬆️']
  const colors = ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24']

  drawBg(ctx, W, H, color)

  // Show each letter prominently with the step
  letters.forEach((L, i) => {
    const isActive = i === step
    const xp = W * (0.18 + i * 0.21)
    const yp = H * 0.35

    // Card
    roundRect(ctx, xp - 22, yp - 30, 44, 60, 12)
    ctx.fillStyle = isActive ? colors[i] + '33' : 'rgba(255,255,255,0.04)'
    ctx.fill()
    ctx.strokeStyle = isActive ? colors[i] : 'rgba(255,255,255,0.1)'
    ctx.lineWidth = isActive ? 2 : 1; ctx.stroke()

    // Letter
    ctx.font = `bold ${isActive ? 24 : 18}px system-ui,sans-serif`
    ctx.fillStyle = isActive ? colors[i] : 'rgba(255,255,255,0.3)'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(L, xp, yp - 8)

    // Word
    ctx.font = `${isActive ? 9 : 8}px system-ui,sans-serif`
    ctx.fillStyle = isActive ? colors[i] : 'rgba(255,255,255,0.2)'
    ctx.fillText(words[i], xp, yp + 14)
  })

  // Active illustration
  ctx.save(); ctx.translate(W * 0.5, H * 0.68)
  if (step === 0) {
    // Rest — person lying
    roundRect(ctx, -50, -8, 100, 16, 8)
    ctx.fillStyle = '#34d399bb'; ctx.fill()
    ctx.beginPath(); ctx.arc(-62, 0, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'; ctx.fill()
  } else if (step === 1) {
    // Ice — ice pack
    roundRect(ctx, -28, -20, 56, 40, 14)
    ctx.fillStyle = '#60a5fabb'; ctx.fill()
    ;[[- 10, -6], [10, -6], [0, 8]].forEach(([ix, iy]) => {
      roundRect(ctx, ix - 8, iy - 6, 16, 12, 4)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill()
    })
    drawSparkle(ctx, -22, -14, t, '#60a5fa', 0)
    drawSparkle(ctx, 22, -14, t, '#60a5fa', 0.4)
  } else if (step === 2) {
    // Compress
    for (let i = 0; i < 3; i++) {
      const wr = 48 - i * 10
      ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2)
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 4 - i; ctx.stroke()
    }
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2)
    ctx.fillStyle = '#a78bfacc'; ctx.fill()
  } else {
    // Elevate
    ctx.save(); ctx.translate(0, -10)
    // Leg elevated
    ctx.rotate(-0.3)
    roundRect(ctx, -30, -6, 60, 12, 6)
    ctx.fillStyle = '#fbbf24bb'; ctx.fill()
    ctx.restore()
    // Pillow under
    ctx.beginPath(); ctx.ellipse(14, 14, 22, 10, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#f0f9ffaa'; ctx.fill()
    // Up arrow
    ctx.font = '20px system-ui,sans-serif'; ctx.fillStyle = '#fbbf24'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('↑', 0, -28)
  }
  ctx.restore()

  drawVideoOverlay(ctx, W, H, colors[step], step, 3, words[step] + ': ' + ['Avoid stress on joint', 'Ice 15 min on/off', 'Wrap with bandage', 'Keep leg raised'][step])
}

// GINGER COMPRESS
function sceneGingerCompress(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Grater
  ctx.save(); ctx.translate(W * 0.25, H * 0.5)
  roundRect(ctx, -14, -30, 28, 52, 6)
  ctx.fillStyle = '#374151'; ctx.fill()
  // Grater holes
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    ctx.beginPath(); ctx.arc(-8 + c * 8, -20 + r * 13, 2, 0, Math.PI * 2)
    ctx.fillStyle = '#1f2937'; ctx.fill()
  }
  // Ginger root
  const gx = Math.sin(t * 4) * 3
  ctx.beginPath(); ctx.ellipse(gx, -38, 14, 9, 0.2, 0, Math.PI * 2)
  ctx.fillStyle = '#d97706'; ctx.fill()
  // Grating bits
  for (let i = 0; i < 4; i++) {
    const bx = -4 + i * 3 + Math.random() * 0.5
    const by = -16 + loop(t * 2 + i, 1) * 20
    ctx.beginPath(); ctx.rect(bx, by, 3, 2)
    ctx.fillStyle = '#d97706aa'; ctx.fill()
  }
  ctx.restore()

  // Cloth
  ctx.save(); ctx.translate(W * 0.55, H * 0.5)
  roundRect(ctx, -26, -18, 52, 36, 12)
  ctx.fillStyle = '#d97706bb'; ctx.fill()
  // Texture
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.2
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-20, -10 + i * 8); ctx.lineTo(20, -10 + i * 8); ctx.stroke()
  }
  // Ginger paste inside
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#d97706cc'; ctx.fill()
  drawSteam(ctx, 0, -20, t, color, 2)
  ctx.restore()

  // Apply to knee
  if (step >= 2) {
    const alpha = clamp((phase - 0.5) / 0.15, 0, 1)
    ctx.save(); ctx.globalAlpha = alpha
    ctx.beginPath(); ctx.arc(W * 0.5, H * 0.75, 20, 0, Math.PI * 2)
    ctx.fillStyle = '#d97706aa'; ctx.fill()
    ctx.beginPath(); ctx.arc(W * 0.5, H * 0.75, 25, 0, Math.PI * 2)
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke()
    ctx.restore()
  }

  const labels = ['Grate 2 tbsp fresh ginger', 'Wrap in cloth, dip in warm water', 'Apply to knee 15 min', 'Or: drink ginger tea 2× daily']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// CASTOR OIL MASSAGE (joint)
function sceneCastorMassage(ctx, W, H, t, color) {
  const phase = loop(t, 7)
  const step = phase < 0.25 ? 0 : phase < 0.5 ? 1 : phase < 0.75 ? 2 : 3

  drawBg(ctx, W, H, color)

  // Joint visualization (knee)
  ctx.save(); ctx.translate(W * 0.5, H * 0.52)
  // Joint glow
  const jg = ctx.createRadialGradient(0, 0, 8, 0, 0, 42)
  jg.addColorStop(0, color + '55'); jg.addColorStop(1, 'transparent')
  ctx.fillStyle = jg; ctx.fillRect(-42, -42, 84, 84)

  // Joint circle
  ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2)
  ctx.fillStyle = '#1e2d3d'; ctx.fill()
  ctx.strokeStyle = color + '77'; ctx.lineWidth = 2; ctx.stroke()

  // Oil bottle tipping
  ctx.save(); ctx.translate(-50, -50)
  const pourAngle = step >= 1 ? -0.5 + 0.1 * Math.sin(t) : 0
  ctx.rotate(pourAngle)
  roundRect(ctx, -8, -18, 16, 30, 6)
  ctx.fillStyle = '#92400e'; ctx.fill()
  ctx.font = '7px system-ui,sans-serif'; ctx.fillStyle = 'white'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OIL', 0, -6)
  // Pour drip
  if (step >= 1) {
    const dY = 16 + loop(t, 1.2) * 28
    ctx.beginPath(); ctx.arc(0, dY, 4, 0, Math.PI * 2)
    ctx.fillStyle = color + 'cc'; ctx.fill()
  }
  ctx.restore()

  // Massage circles
  if (step >= 1) {
    const mAngle = t * 2
    for (let i = 0; i < 3; i++) {
      const mr = 14 + i * 7
      const ma = mAngle + i * 0.5
      const mx = Math.cos(ma) * mr, my = Math.sin(ma) * mr
      ctx.beginPath(); ctx.arc(mx, my, 5 - i, 0, Math.PI * 2)
      ctx.fillStyle = color + ['cc', '88', '44'][i]; ctx.fill()
    }
    // Ripple
    drawRipple(ctx, 0, 0, t, color)
  }

  // Warm cloth
  if (step >= 2) {
    ctx.save(); ctx.globalAlpha = clamp((phase - 0.5) / 0.15, 0, 1)
    roundRect(ctx, -36, -36, 72, 72, 16)
    ctx.strokeStyle = '#ff6b7a'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([])
    ctx.restore()
  }

  ctx.restore()

  const labels = ['Warm castor oil slightly', 'Massage joint in circles 10–15 min', 'Cover with warm cloth', 'Repeat nightly']
  drawVideoOverlay(ctx, W, H, color, step, 3, labels[step])
}

// ── Master renderer map ─────────────────────────────────────────
const RENDERERS = {
  'Warm Compress':              sceneWarmCompress,
  'Warm Cloth Compression':     sceneWarmCompress,
  'Ice Pack (Acute pain)':      sceneIcePack,
  'Ice Compression (First 24h)':sceneIcePack,
  'Neck Stretching':            sceneNeckStretch,
  'Turmeric Milk':              sceneTurmeric,
  'Turmeric Paste':             sceneTurmeric,
  'Turmeric Paste Wrap':        sceneTurmeric,
  'Quadriceps Strengthening':   sceneKneeExercise,
  'Pendulum Exercise':          scenePendulum,
  'Cat-Cow Movement':           sceneCatCow,
  'Knee-to-Chest Stretch':      sceneKneeToChest,
  'Neem Leaf Paste':            sceneNeemLeaf,
  'Warm Sesame Oil Massage':    sceneBackMassage,
  'Ginger & Sesame Oil Rub':    sceneBackMassage,
  'Doorway Chest Stretch':      sceneDoorwayStretch,
  'Epsom Salt Bath':            sceneSoak,
  'Warm Epsom Salt Soak':       sceneSoak,
  'Sleep Position Fix':         sceneSleepFix,
  'Hot & Cold Alternating':     sceneContrastTherapy,
  'Gentle Range-of-Motion':     sceneRangeOfMotion,
  'Muscle Stretching Routine':  sceneMuscleStretch,
  'Posture Correction':         scenePosture,
  'RICE Method':                sceneRICE,
  'Ginger Compress':            sceneGingerCompress,
  'Castor Oil Massage':         sceneCastorMassage,
  'Castor Oil Wrap':            sceneWarmCompress,
  'Omega-3 Rich Foods':         sceneRangeOfMotion,
  'Fenugreek Seeds':            sceneRangeOfMotion,
}

// ── React component ─────────────────────────────────────────────
export default function RemedyVideo({ title, type, color = '#00d4aa', width = 280, height = 160 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const renderer = RENDERERS[title] || (() => {
    // type fallback
    if (type?.includes('Heat')) return sceneWarmCompress
    if (type?.includes('Cold')) return sceneIcePack
    if (type?.includes('Massage')) return sceneBackMassage
    if (type?.includes('Soak')) return sceneSoak
    if (type?.includes('Stretch') || type?.includes('Movement')) return sceneMuscleStretch
    if (type?.includes('Exercise')) return sceneKneeExercise
    return sceneRangeOfMotion
  })()

  const animate = useCallback((ts) => {
    if (!startRef.current) startRef.current = ts
    const t = (ts - startRef.current) / 1000

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)
    try {
      renderer(ctx, width, height, t, color)
    } catch (e) {
      // silent fallback
      drawBg(ctx, width, height, color)
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [renderer, color, width, height])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 0 }}
    />
  )
}
