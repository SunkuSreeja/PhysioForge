/**
 * physioAI.js
 * Pure logic engine for PhysioForge AI Assistant.
 * No React, no UI. Input → structured response object.
 */
import {
  SYMPTOM_CAUSES, PHARMACY_TRIGGERS, PHARMACY_RESPONSES, PHARMACY_QUICK_ACTIONS,
  NAVIGATION_INTENTS, CHECKIN_PROMPTS, CHECKIN_RESPONSES,
  generateRecoverySummary, GENERAL_RESPONSES,
} from './aiKnowledgeBase'

const LS_CHECKINS = 'pf_ai_checkins'
const LS_HISTORY  = 'pf_ai_history'
const LS_LASTDATE = 'pf_ai_lastdate'
const LS_RURALMODE = 'pf_ai_rural'

// ── Storage helpers ──────────────────────────────────────────────────────────
export function getCheckins()  {
  try { return JSON.parse(localStorage.getItem(LS_CHECKINS) || '[]') } catch { return [] }
}
export function saveCheckin(score) {
  const logs = getCheckins()
  logs.push({ score, date: new Date().toISOString(), ts: Date.now() })
  // Keep last 30 days
  const trimmed = logs.slice(-30)
  localStorage.setItem(LS_CHECKINS, JSON.stringify(trimmed))
  return trimmed
}
export function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]') } catch { return [] }
}
export function appendHistory(role, text) {
  const h = getHistory()
  h.push({ role, text, ts: Date.now() })
  localStorage.setItem(LS_HISTORY, JSON.stringify(h.slice(-100))) // keep last 100 msgs
}
export function isNewDay() {
  const last = localStorage.getItem(LS_LASTDATE)
  const today = new Date().toDateString()
  if (last !== today) { localStorage.setItem(LS_LASTDATE, today); return true }
  return false
}
export function getRuralMode() {
  return localStorage.getItem(LS_RURALMODE) === '1'
}
export function setRuralMode(v) {
  localStorage.setItem(LS_RURALMODE, v ? '1' : '0')
}

// ── Language detection ────────────────────────────────────────────────────────
export function detectLanguage(text) {
  // Telugu: Unicode range 0C00-0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'
  // Hindi/Devanagari: 0900-097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi'
  // Telugu latin transliterations
  if (/\b(nopphi|noppi|meeda|bhuujam|mokaali|veepu|vyayamalu)\b/i.test(text)) return 'te'
  // Hindi latin transliterations
  if (/\b(dard|kamar|gardan|kandha|ghutnaa|peeth|dava|goli)\b/i.test(text)) return 'hi'
  return 'en'
}

// ── Pain score extraction ─────────────────────────────────────────────────────
function extractPainScore(text) {
  // "7 out of 10", "7/10", "score 7", "pain is 7", "about 6", just digits 1-10
  const patterns = [
    /(\d{1,2})\s*(?:out of|\/)\s*10/i,
    /(?:score|pain|level)\s+(?:is\s+)?(\d{1,2})/i,
    /(?:about|around|approximately)\s+(\d{1,2})/i,
    /\b([1-9]|10)\b/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) {
      const n = parseInt(m[1])
      if (n >= 1 && n <= 10) return n
    }
  }
  return null
}

// ── Check-in intent detection ─────────────────────────────────────────────────
function isCheckinIntent(text) {
  return /\b(check.?in|check in|today|how am|feeling|pain today|score today|pain score|आज का|नमस्ते|ఈరోజు|నొప్పి ఈ)\b/i.test(text)
}

// ── Main process function ─────────────────────────────────────────────────────
export function processMessage(input, currentLang = 'en', userName = '') {
  const lower = input.toLowerCase().trim()
  const detectedLang = detectLanguage(input)
  const lang = detectedLang !== 'en' ? detectedLang : currentLang
  const rural = getRuralMode()

  // 1. GREETING
  for (const t of GENERAL_RESPONSES.greet.triggers) {
    if (lower.includes(t)) {
      return {
        type: 'greeting',
        text: GENERAL_RESPONSES.greet.response[lang]?.(userName) || GENERAL_RESPONSES.greet.response.en(userName),
        lang,
        actions: [],
        showCheckin: true,
      }
    }
  }

  // 2. THANKS / ACK
  for (const t of GENERAL_RESPONSES.thanks.triggers) {
    if (lower.includes(t)) {
      return {
        type: 'thanks',
        text: GENERAL_RESPONSES.thanks.response[lang]?.() || GENERAL_RESPONSES.thanks.response.en(),
        lang,
        actions: [],
      }
    }
  }

  // 3. RURAL MODE request
  for (const t of GENERAL_RESPONSES.rural_mode.triggers) {
    if (lower.includes(t)) {
      setRuralMode(true)
      return {
        type: 'rural',
        text: GENERAL_RESPONSES.rural_mode.response[lang]?.() || GENERAL_RESPONSES.rural_mode.response.en(),
        lang,
        actions: [],
      }
    }
  }

  // 4. PHARMACY / SELF-MEDICATION
  if (PHARMACY_TRIGGERS.some(t => lower.includes(t.toLowerCase()))) {
    const data = PHARMACY_RESPONSES[lang] || PHARMACY_RESPONSES.en
    return {
      type: 'pharmacy',
      lang,
      headline: data.headline,
      scenarios: data.scenarios,
      safer: data.safer,
      when_doctor: data.when_doctor,
      encouragement: data.encouragement,
      actions: PHARMACY_QUICK_ACTIONS,
    }
  }

  // 5. CHECK-IN or pain score
  const score = extractPainScore(input)
  if (score !== null && (isCheckinIntent(lower) || lower.match(/\b\d\b/))) {
    const logs = saveCheckin(score)
    const prev = logs.length >= 2 ? logs[logs.length - 2].score : null
    let text
    if (prev === null) {
      text = CHECKIN_RESPONSES.first[lang]?.(score) || CHECKIN_RESPONSES.first.en(score)
    } else if (score < prev) {
      text = CHECKIN_RESPONSES.improving[lang]?.(score, prev) || CHECKIN_RESPONSES.improving.en(score, prev)
    } else if (score === prev) {
      text = CHECKIN_RESPONSES.same[lang]?.(score) || CHECKIN_RESPONSES.same.en(score)
    } else {
      text = CHECKIN_RESPONSES.worsening[lang]?.(score, prev) || CHECKIN_RESPONSES.worsening.en(score, prev)
    }
    const summary = generateRecoverySummary(logs, lang)
    return {
      type: 'checkin',
      text,
      summary,
      lang,
      actions: [
        { label: { en: 'View Analytics', hi: 'एनालिटिक्स देखें', te: 'అనలిటిక్స్' }, route: '/patient/analytics', icon: '📊' },
        { label: { en: 'Exercises Today', hi: 'आज के व्यायाम', te: 'నేటి వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
      ],
    }
  }

  // 6. PURE NAVIGATION INTENTS
  for (const intent of NAVIGATION_INTENTS) {
    if (intent.triggers.some(t => lower.includes(t))) {
      return {
        type: 'navigate',
        text: intent.response[lang] || intent.response.en,
        route: intent.route,
        icon: intent.icon,
        lang,
        actions: [{ label: { en: 'Open Now', hi: 'अभी खोलें', te: 'ఇప్పుడు తెరవండి' }, route: intent.route, icon: intent.icon }],
        autoNavigate: true,
      }
    }
  }

  // 7. SYMPTOM + LIFESTYLE CAUSE (the "Why am I feeling this?" engine)
  for (const symptom of SYMPTOM_CAUSES) {
    const matchesTrigger = symptom.triggers.some(t => lower.includes(t.toLowerCase()))
    if (!matchesTrigger) continue

    const matchesContext = symptom.context.length === 0 ||
      symptom.context.some(c => lower.includes(c.toLowerCase()))

    if (matchesTrigger) {
      const causes = symptom.causes[lang] || symptom.causes.en
      const followUp = symptom.followUp[lang] || symptom.followUp.en

      // Rural mode: use first 2 causes in simpler framing
      const displayCauses = rural ? causes.slice(0, 2) : causes

      let text
      if (matchesContext) {
        const opener = {
          en: "Here's likely why this is happening:",
          hi: "यह दर्द इन कारणों से हो सकता है:",
          te: "ఇది ఎందుకు జరుగుతుందో అర్థమవుతోంది:",
        }
        text = (opener[lang] || opener.en) + '\n\n' + displayCauses.join('\n') + '\n\n' + followUp
      } else {
        // Trigger matched but no specific context — give general cause
        const opener = {
          en: `Common reasons for ${symptom.id.split('_')[0]} pain:`,
          hi: `${symptom.id.split('_')[0] === 'neck' ? 'गर्दन' : symptom.id.split('_')[0] === 'shoulder' ? 'कंधे' : symptom.id.split('_')[0] === 'back' ? 'पीठ' : 'घुटने'} दर्द के सामान्य कारण:`,
          te: `${symptom.id.split('_')[0]} నొప్పికి సాధారణ కారణాలు:`,
        }
        text = (opener[lang] || opener.en) + '\n\n' + displayCauses.slice(0, 2).join('\n') + '\n\n' + followUp
      }

      return {
        type: 'symptom',
        text,
        causes: displayCauses,
        followUp,
        lang,
        actions: symptom.quickActions,
        symptomId: symptom.id,
      }
    }
  }

  // 8. CHECK-IN PROMPT (if user asks about their status generically)
  if (isCheckinIntent(lower)) {
    const prompts = CHECKIN_PROMPTS[lang] || CHECKIN_PROMPTS.en
    const logs = getCheckins()
    if (logs.length > 0) {
      const summary = generateRecoverySummary(logs, lang)
      return {
        type: 'checkin_prompt',
        text: prompts[0] + (summary ? `\n\n${summary}` : ''),
        lang,
        actions: [
          { label: { en: 'View Analytics', hi: 'एनालिटिक्स', te: 'అనలిటిక్స్' }, route: '/patient/analytics', icon: '📊' },
        ],
      }
    }
    return {
      type: 'checkin_prompt',
      text: prompts[Math.floor(Math.random() * prompts.length)],
      lang,
      actions: [],
    }
  }

  // 9. FALLBACK
  const fallbacks = {
    en: `I understand you're looking for help. Could you describe your pain more specifically? For example:\n• "My neck hurts after studying"\n• "Shoulder pain from laptop"\n• Say a number (1–10) to log your pain score today`,
    hi: `मैं समझना चाहता हूं। ज़रा विस्तार से बताएं, जैसे:\n• "पढ़ाई के बाद गर्दन दर्द"\n• "लैपटॉप से कंधे में दर्द"\n• आज का दर्द स्कोर (1-10) बताएं`,
    te: `అర్థమైంది. కొంచెం వివరంగా చెప్పగలరా, ఉదాహరణకు:\n• "చదువు తర్వాత మెడ నొప్పి"\n• "లాప్టాప్ వలన భుజం నొప్పి"\n• ఈరోజు నొప్పి స్కోర్ (1-10) చెప్పండి`,
  }

  return {
    type: 'fallback',
    text: fallbacks[lang] || fallbacks.en,
    lang,
    actions: [
      { label: { en: 'My Exercises', hi: 'मेरे व्यायाम', te: 'నా వ్యాయామాలు' }, route: '/patient/exercises', icon: '🏋️' },
      { label: { en: 'Relief Remedies', hi: 'घरेलू उपाय', te: 'ఇంటి చిట్కాలు' }, route: '/patient/remedies', icon: '🌿' },
    ],
  }
}

// ── Daily check-in greeting ───────────────────────────────────────────────────
export function getDailyGreeting(lang = 'en', userName = '') {
  if (!isNewDay()) return null
  const logs = getCheckins()
  const greetings = {
    en: `Good morning${userName ? `, ${userName}` : ''}! 🌅 New day, new progress. How is your pain today? Reply with a number (1–10) for a quick check-in.${logs.length > 0 ? ` Yesterday: ${logs[logs.length - 1].score}/10` : ''}`,
    hi: `सुप्रभात${userName ? `, ${userName}` : ''}! 🌅 नया दिन, नई प्रगति। आज दर्द कैसा है? 1-10 में बताएं।${logs.length > 0 ? ` कल: ${logs[logs.length - 1].score}/10` : ''}`,
    te: `శుభోదయం${userName ? `, ${userName}` : ''}! 🌅 కొత్త రోజు, కొత్త పురోగతి. ఈరోజు నొప్పి ఎలా ఉంది? 1-10 స్కేల్‌లో చెప్పండి.${logs.length > 0 ? ` నిన్న: ${logs[logs.length - 1].score}/10` : ''}`,
  }
  return greetings[lang] || greetings.en
}

// ── Analytics-aware context injection ────────────────────────────────────────
// Reads from analyticsService localStorage to give contextual responses
function getAnalyticsContext() {
  try {
    const exercises = JSON.parse(localStorage.getItem('pf_analytics_exercises') || '[]')
    const posture = JSON.parse(localStorage.getItem('pf_analytics_posture') || '[]')
    const checkins = JSON.parse(localStorage.getItem('pf_analytics_checkins') || '[]')
    const streaks = JSON.parse(localStorage.getItem('pf_analytics_streaks') || '{}')

    const completedEx = exercises.filter(s => s.status === 'completed')
    const postureDone = posture.filter(s => s.status === 'completed')
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayCheckin = checkins.filter(c => c.date === todayStr).pop()
    const lastExDate = completedEx.length ? completedEx[completedEx.length - 1].date : null
    const didExToday = lastExDate === todayStr

    return {
      totalExercises: completedEx.length,
      currentStreak: streaks.currentStreak || 0,
      avgPosture: postureDone.length
        ? Math.round(postureDone.reduce((a, s) => a + (s.avgScore || 0), 0) / postureDone.length)
        : 0,
      todayPain: todayCheckin?.painMood || null,
      didExToday,
    }
  } catch { return null }
}

export function getAnalyticsSummaryForAI() {
  const ctx = getAnalyticsContext()
  if (!ctx) return ''
  const parts = []
  if (ctx.totalExercises > 0) parts.push(`${ctx.totalExercises} exercises done`)
  if (ctx.currentStreak > 0) parts.push(`${ctx.currentStreak}-day streak`)
  if (ctx.avgPosture > 0) parts.push(`${ctx.avgPosture}% avg posture`)
  if (ctx.todayPain) parts.push(`today's pain: ${ctx.todayPain}`)
  if (ctx.didExToday) parts.push('already exercised today')
  return parts.join(', ')
}
