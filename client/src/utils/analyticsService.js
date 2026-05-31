/**
 * analyticsService.js  — PhysioForge v6
 * Complete analytics engine: tracking, calculation, and derived metrics.
 * All state lives in localStorage — offline-first, no backend needed.
 */

// ── Storage keys ──────────────────────────────────────────────────────────────
export const KEYS = {
  EXERCISES : 'pf_analytics_exercises',
  POSTURE   : 'pf_analytics_posture',
  REMEDIES  : 'pf_analytics_remedies',
  CHATBOT   : 'pf_analytics_chatbot',
  CHECKINS  : 'pf_analytics_checkins',
  STREAKS   : 'pf_analytics_streaks',
  BADGES    : 'pf_analytics_badges',
  ACTIVITY  : 'pf_analytics_activity',
}

// ── Low-level helpers ─────────────────────────────────────────────────────────
function safeGet(key, fallback = []) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function safeSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}
function today()       { return new Date().toISOString().slice(0, 10) }
function now()         { return Date.now() }
function dateOffset(n) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function moodToScore(mood) {
  return { comfortable: 1, mildPain: 3, moderate: 6, severe: 9 }[mood] ?? 5
}
const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ── Exercise tracking ─────────────────────────────────────────────────────────
export function trackExerciseStarted(id, name, category) {
  const s = safeGet(KEYS.EXERCISES)
  s.push({ id, name, category, status: 'started', startTs: now(), date: today() })
  safeSet(KEYS.EXERCISES, s.slice(-500))
  bumpActivity('exercise_started')
}

export function trackExerciseCompleted(id, name, durationSec, postureScore) {
  const s = safeGet(KEYS.EXERCISES)
  let idx = -1
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i].id === id && s[i].status === 'started') { idx = i; break }
  }
  if (idx >= 0) {
    s[idx] = { ...s[idx], status: 'completed', endTs: now(), durationSec, postureScore }
  } else {
    s.push({ id, name, status: 'completed', startTs: now() - (durationSec || 0) * 1000,
      endTs: now(), durationSec, postureScore, date: today() })
  }
  safeSet(KEYS.EXERCISES, s.slice(-500))
  bumpActivity('exercise_completed')
  updateStreak()
  checkBadges()
}

// ── Posture tracking ──────────────────────────────────────────────────────────
export function trackPostureSessionStarted(mode) {
  const id = `ps_${now()}`
  const s = safeGet(KEYS.POSTURE)
  s.push({ id, mode, status: 'started', startTs: now(), date: today() })
  safeSet(KEYS.POSTURE, s.slice(-300))
  bumpActivity('posture_started')
  return id
}

export function trackPostureSessionEnded(sessionId, { avgScore, peakScore, issues, durationSec, repsDone }) {
  const s = safeGet(KEYS.POSTURE)
  const idx = s.findIndex(x => x.id === sessionId)
  if (idx >= 0) {
    s[idx] = { ...s[idx], status: 'completed', endTs: now(), avgScore, peakScore, issues, durationSec, repsDone }
  }
  safeSet(KEYS.POSTURE, s.slice(-300))
  bumpActivity('posture_completed')
  updateStreak()
  checkBadges()
}

// ── Remedy tracking ───────────────────────────────────────────────────────────
export function trackRemedyViewed(id, name, painArea, type) {
  const v = safeGet(KEYS.REMEDIES)
  v.push({ id, name, painArea, type, ts: now(), date: today() })
  safeSet(KEYS.REMEDIES, v.slice(-500))
  bumpActivity('remedy_viewed')
}

export function trackRemedyCompleted(id, name, painArea) {
  const v = safeGet(KEYS.REMEDIES)
  v.push({ id, name, painArea, status: 'completed', ts: now(), date: today() })
  safeSet(KEYS.REMEDIES, v.slice(-500))
  bumpActivity('remedy_completed')
  checkBadges()
}

// ── Chatbot tracking ──────────────────────────────────────────────────────────
export function trackChatbotMessage(role, intent) {
  const m = safeGet(KEYS.CHATBOT)
  m.push({ role, intent: intent || 'general', ts: now(), date: today() })
  safeSet(KEYS.CHATBOT, m.slice(-1000))
  if (role === 'user') bumpActivity('chatbot_used')
}

export function trackChatbotNavigation(destination) {
  const m = safeGet(KEYS.CHATBOT)
  m.push({ role: 'system', intent: 'navigation', destination, ts: now(), date: today() })
  safeSet(KEYS.CHATBOT, m.slice(-1000))
}

// ── Check-in tracking ─────────────────────────────────────────────────────────
export function trackRecoveryCheckIn(painMood, painScore) {
  const c = safeGet(KEYS.CHECKINS)
  c.push({ painMood, painScore: painScore ?? moodToScore(painMood), ts: now(), date: today() })
  safeSet(KEYS.CHECKINS, c.slice(-90))
  bumpActivity('checkin')
  updateStreak()
}

export function getTodayCheckIn() {
  const c = safeGet(KEYS.CHECKINS)
  for (let i = c.length - 1; i >= 0; i--) {
    if (c[i].date === today()) return c[i]
  }
  return null
}

// ── Activity heatmap ──────────────────────────────────────────────────────────
function bumpActivity(eventType) {
  const a = safeGet(KEYS.ACTIVITY)
  const t = today()
  const idx = a.findIndex(x => x.date === t)
  if (idx >= 0) {
    a[idx].count = (a[idx].count || 0) + 1
    a[idx].events = [...(a[idx].events || []), eventType]
  } else {
    a.push({ date: t, count: 1, events: [eventType] })
  }
  safeSet(KEYS.ACTIVITY, a.slice(-90))
}

export function _getActivityHeatmap(days = 35) {
  const a = safeGet(KEYS.ACTIVITY)
  const m = {}; a.forEach(x => { m[x.date] = x.count })
  return Array.from({ length: days }, (_, i) => {
    const d = dateOffset(-(days - 1 - i))
    return { date: d, count: m[d] || 0 }
  })
}

// ── Streak ────────────────────────────────────────────────────────────────────
export function getStreakData() {
  return safeGet(KEYS.STREAKS, { currentStreak: 0, longestStreak: 0, lastActiveDate: null, totalActiveDays: 0 })
}

function updateStreak() {
  const activity = safeGet(KEYS.ACTIVITY)
  const t = today()
  const prev = getStreakData()
  if (prev.lastActiveDate === t) return

  const activeDates = new Set([...activity.filter(a => a.count > 0).map(a => a.date), t])
  let streak = 1
  for (let i = 1; i < 365; i++) {
    if (activeDates.has(dateOffset(-i))) streak++; else break
  }
  safeSet(KEYS.STREAKS, {
    currentStreak: streak,
    longestStreak: Math.max(prev.longestStreak, streak),
    lastActiveDate: t,
    totalActiveDays: activeDates.size,
  })
}

// ── Badges ────────────────────────────────────────────────────────────────────
const BADGE_DEFS = [
  { id: 'first_exercise',  icon: '🎯', name: 'First Steps',         desc: 'Completed your first exercise',  check: s => s.exercises.total >= 1 },
  { id: 'week_warrior',    icon: '💪', name: '7-Day Warrior',        desc: '7 days active in a row',         check: s => s.streak.currentStreak >= 7 },
  { id: 'posture_master',  icon: '🌟', name: 'Posture Master',       desc: '90%+ posture accuracy',          check: s => s.posture.avgScore >= 90 },
  { id: 'consistent',      icon: '🔥', name: 'Consistent Performer', desc: '8-day streak achieved',          check: s => s.streak.currentStreak >= 8 },
  { id: 'remedy_explorer', icon: '🌿', name: 'Remedy Explorer',      desc: 'Tried 5+ remedies',              check: s => s.remedies.totalViewed >= 5 },
  { id: 'chatbot_pro',     icon: '🤖', name: 'AI Companion',         desc: '10+ AI conversations',           check: s => s.chatbot.totalMessages >= 10 },
  { id: 'recovery_champ',  icon: '🏆', name: 'Recovery Champion',    desc: '20+ sessions completed',         check: s => s.exercises.total >= 20 },
  { id: 'pain_free',       icon: '😊', name: 'Pain-Free Day',        desc: 'Reported comfortable pain level',check: s => s.checkins.latestMood === 'comfortable' },
  { id: 'century',         icon: '💯', name: 'Century Club',         desc: '100+ exercises completed',       check: s => s.exercises.total >= 100 },
]

export function getBadges() { return safeGet(KEYS.BADGES, []) }

function checkBadges() {
  const stats = getAllStats()
  const earned = new Set(safeGet(KEYS.BADGES, []).map(b => b.id))
  const fresh = BADGE_DEFS.filter(d => !earned.has(d.id) && d.check(stats))
    .map(d => ({ ...d, earnedAt: now(), earnedDate: today() }))
  if (fresh.length) safeSet(KEYS.BADGES, [...safeGet(KEYS.BADGES, []), ...fresh])
  return fresh
}

// ═════════════════════════════════════════════════════════════════════════════
// ── RICH ANALYTICS CALCULATIONS ──────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

// ── Exercise stats ────────────────────────────────────────────────────────────
export function getExerciseStats() {
  const all = safeGet(KEYS.EXERCISES)
  const done = all.filter(s => s.status === 'completed')
  const t = today()
  const todayDone = done.filter(s => s.date === t)

  // Category breakdown
  const catCounts = {}
  done.forEach(s => { catCounts[s.category || 'other'] = (catCounts[s.category || 'other'] || 0) + 1 })

  // Weekly completion % — assume 4 prescribed per day
  const DAILY_GOAL = 4
  const weekData = buildWeekDays(7).map(({ day, date }) => {
    const dayDone = done.filter(s => s.date === date).length
    return { day, date, count: dayDone, pct: Math.min(100, Math.round((dayDone / DAILY_GOAL) * 100)) }
  })

  // Month-over-month
  const thisMonthDone = done.filter(s => s.date >= dateOffset(-30)).length
  const lastMonthDone = done.filter(s => s.date >= dateOffset(-60) && s.date < dateOffset(-30)).length
  const monthDelta = lastMonthDone > 0 ? Math.round(((thisMonthDone - lastMonthDone) / lastMonthDone) * 100) : null

  // Week-over-week
  const thisWeekDone = done.filter(s => s.date >= dateOffset(-7)).length
  const lastWeekDone = done.filter(s => s.date >= dateOffset(-14) && s.date < dateOffset(-7)).length
  const weekDelta = lastWeekDone > 0 ? Math.round(((thisWeekDone - lastWeekDone) / lastWeekDone) * 100) : null

  // Total duration
  const totalMins = Math.round(done.reduce((a, s) => a + (s.durationSec || 0), 0) / 60)

  // Average posture score across exercises
  const withPosture = done.filter(s => s.postureScore)
  const avgPostureScore = withPosture.length
    ? Math.round(withPosture.reduce((a, s) => a + s.postureScore, 0) / withPosture.length) : 0

  // Best day of week
  const dayTotals = Array(7).fill(0)
  done.forEach(s => { const d = new Date(s.date); dayTotals[d.getDay()]++ })
  const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals))

  // Monthly chart (last 8 weeks by week)
  const monthlyChart = buildMonthlyWeeks(done)

  // Today's completion %
  const todayPct = Math.min(100, Math.round((todayDone.length / DAILY_GOAL) * 100))

  return {
    total: done.length,
    todayCount: todayDone.length,
    todayPct,
    totalMinutes: totalMins,
    avgPostureScore,
    categoryBreakdown: catCounts,
    weekData,        // [{day, date, count, pct}] last 7 days
    monthlyChart,    // [{week, count}] last 8 weeks
    thisWeekDone,
    lastWeekDone,
    weekDelta,       // % change
    thisMonthDone,
    lastMonthDone,
    monthDelta,
    bestDay: DAY_ABBR[bestDayIdx],
    recentSessions: done.slice(-7).reverse(),
  }
}

// ── Posture stats ─────────────────────────────────────────────────────────────
export function getPostureStats() {
  const all = safeGet(KEYS.POSTURE)
  const done = all.filter(s => s.status === 'completed')
  const scores = done.filter(s => s.avgScore != null).map(s => s.avgScore)
  const avgScore = scores.length ? Math.round(avg(scores)) : 0
  const peakScore = scores.length ? Math.max(...scores) : 0
  const totalMins = Math.round(done.reduce((a, s) => a + (s.durationSec || 0), 0) / 60)
  const todaySessions = done.filter(s => s.date === today())

  // Issue frequency
  const issueCounts = {}
  done.forEach(s => { (s.issues || []).forEach(i => { issueCounts[i] = (issueCounts[i] || 0) + 1 }) })

  // Weekly scores trend
  const weeklyScores = buildWeekDays(7).map(({ day, date }) => {
    const daySessions = done.filter(s => s.date === date)
    const dayScores = daySessions.filter(s => s.avgScore != null).map(s => s.avgScore)
    return { day, date, value: dayScores.length ? Math.round(avg(dayScores)) : 0, count: daySessions.length }
  })

  // Score improvement trend (linear regression over last 14 days)
  const last14 = done.filter(s => s.date >= dateOffset(-14) && s.avgScore != null)
  const scoreTrend = linearTrend(last14.map((s, i) => [i, s.avgScore]))

  // Consistency: sessions in last 14 days / 14
  const consistencyPct = Math.round((done.filter(s => s.date >= dateOffset(-14)).length / 14) * 100)

  // Month-over-month avg score
  const thisMonthScores = done.filter(s => s.date >= dateOffset(-30) && s.avgScore != null).map(s => s.avgScore)
  const lastMonthScores = done.filter(s => s.date >= dateOffset(-60) && s.date < dateOffset(-30) && s.avgScore != null).map(s => s.avgScore)
  const scoreMonthDelta = thisMonthScores.length && lastMonthScores.length
    ? Math.round(avg(thisMonthScores) - avg(lastMonthScores)) : null

  return {
    totalSessions: done.length,
    todaySessions: todaySessions.length,
    avgScore,
    peakScore,
    totalMinutes: totalMins,
    commonIssues: Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 3),
    weeklyScores,
    scoreTrend,        // positive = improving
    consistencyPct,
    scoreMonthDelta,
    recentSessions: done.slice(-5).reverse(),
  }
}

// ── Check-in / pain stats ─────────────────────────────────────────────────────
export function getCheckInStats() {
  const all = safeGet(KEYS.CHECKINS)
  const recent30 = all.filter(c => c.date >= dateOffset(-30))
  const recent14 = all.filter(c => c.date >= dateOffset(-14))

  const scores30 = recent30.map(c => c.painScore)
  const avgPain = scores30.length ? Math.round(avg(scores30) * 10) / 10 : null

  // Pain improvement: compare first half vs second half of last 30 days
  const firstHalf  = all.filter(c => c.date >= dateOffset(-30) && c.date < dateOffset(-15)).map(c => c.painScore)
  const secondHalf = all.filter(c => c.date >= dateOffset(-15)).map(c => c.painScore)
  let painImprovementPct = null
  if (firstHalf.length && secondHalf.length) {
    const diff = avg(firstHalf) - avg(secondHalf) // positive = pain went down = good
    painImprovementPct = Math.round((diff / avg(firstHalf)) * 100)
  }

  // Linear trend direction
  const scoreTrend = linearTrend(recent14.map((c, i) => [i, c.painScore]))
  const trend = scoreTrend < -0.05 ? 'improving' : scoreTrend > 0.05 ? 'worsening' : 'stable'

  // Last 7 days chart
  const last7Days = buildWeekDays(7).map(({ day, date }) => {
    const dayCheckins = all.filter(c => c.date === date)
    const scores = dayCheckins.map(c => c.painScore)
    return { day, date, pain: scores.length ? Math.round(avg(scores) * 10) / 10 : null, hasCheckin: dayCheckins.length > 0 }
  })

  // Mood distribution
  const moodCounts = {}
  all.forEach(c => { moodCounts[c.painMood] = (moodCounts[c.painMood] || 0) + 1 })

  return {
    totalCheckIns: all.length,
    checkIns30Days: recent30.length,
    avgPainScore: avgPain,
    painTrend: trend,
    painImprovementPct, // % improvement from first→second half of month
    last7Days,
    latestMood: all.length ? all[all.length - 1].painMood : null,
    moodDistribution: moodCounts,
  }
}

// ── Remedy stats ──────────────────────────────────────────────────────────────
export function getRemedyStats() {
  const all = safeGet(KEYS.REMEDIES)
  const done = all.filter(v => v.status === 'completed')

  // Top pain areas
  const painAreaCounts = {}
  all.forEach(v => { if (v.painArea) painAreaCounts[v.painArea] = (painAreaCounts[v.painArea] || 0) + 1 })

  // Type distribution
  const typeCounts = {}
  all.forEach(v => { if (v.type) typeCounts[v.type] = (typeCounts[v.type] || 0) + 1 })

  // Weekly remedy usage
  const weeklyUsage = buildWeekDays(7).map(({ day, date }) => ({
    day, date,
    count: all.filter(v => v.date === date).length,
    completed: done.filter(v => v.date === date).length,
  }))

  // Completion rate
  const completionRate = all.length ? Math.round((done.length / all.length) * 100) : 0

  return {
    totalViewed: all.length,
    totalCompleted: done.length,
    completionRate,
    topPainAreas: Object.entries(painAreaCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    topTypes: Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4),
    weeklyUsage,
    recentViews: all.slice(-6).reverse(),
  }
}

// ── Chatbot stats ─────────────────────────────────────────────────────────────
export function getChatbotStats() {
  const all = safeGet(KEYS.CHATBOT)
  const userMsgs = all.filter(m => m.role === 'user')
  const todayMsgs = userMsgs.filter(m => m.date === today())

  // Intent breakdown
  const intentCounts = {}
  userMsgs.forEach(m => { intentCounts[m.intent] = (intentCounts[m.intent] || 0) + 1 })

  // Navigation usage
  const navCount = all.filter(m => m.intent === 'navigation').length

  // Hourly distribution (0-23)
  const hourly = Array(24).fill(0)
  userMsgs.forEach(m => { hourly[new Date(m.ts).getHours()]++ })
  const peakHour = hourly.indexOf(Math.max(...hourly))

  // Week-over-week
  const thisWeek = userMsgs.filter(m => m.date >= dateOffset(-7)).length
  const lastWeek = userMsgs.filter(m => m.date >= dateOffset(-14) && m.date < dateOffset(-7)).length
  const weekDelta = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null

  // Daily usage last 7 days
  const dailyUsage = buildWeekDays(7).map(({ day, date }) => ({
    day, date, count: userMsgs.filter(m => m.date === date).length,
  }))

  return {
    totalMessages: userMsgs.length,
    todayMessages: todayMsgs.length,
    topIntents: Object.entries(intentCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    navigationCount: navCount,
    peakHour,
    hourlyDistribution: hourly,
    weekDelta,
    dailyUsage,
  }
}

// ── Recovery Consistency Score ────────────────────────────────────────────────
// Composite 0-100 score weighing streak, checkin frequency, exercise adherence, posture sessions
export function getRecoveryConsistencyScore() {
  const activity = safeGet(KEYS.ACTIVITY)
  const exercises = safeGet(KEYS.EXERCISES).filter(s => s.status === 'completed')
  const checkins  = safeGet(KEYS.CHECKINS)
  const posture   = safeGet(KEYS.POSTURE).filter(s => s.status === 'completed')
  const streak    = getStreakData()

  // Last 14 days active days
  const last14Active = activity.filter(a => a.count > 0 && a.date >= dateOffset(-14)).length
  const activePct = (last14Active / 14) * 100

  // Exercise adherence last 14 days (assuming 4/day goal)
  const exLast14 = exercises.filter(s => s.date >= dateOffset(-14)).length
  const exAdherence = Math.min(100, (exLast14 / (14 * 4)) * 100)

  // Checkin frequency last 14 days
  const ciLast14 = checkins.filter(c => c.date >= dateOffset(-14)).length
  const ciFq = Math.min(100, (ciLast14 / 14) * 100)

  // Posture sessions last 14 days
  const psLast14 = posture.filter(s => s.date >= dateOffset(-14)).length
  const psFq = Math.min(100, (psLast14 / 14) * 100 * 2) // 0.5 session/day is 100%

  // Streak bonus
  const streakBonus = Math.min(20, streak.currentStreak * 2)

  const score = Math.round(
    activePct    * 0.30 +
    exAdherence  * 0.35 +
    ciFq         * 0.15 +
    psFq         * 0.10 +
    streakBonus  * 0.10
  )

  // Factors breakdown for UI
  return {
    score: Math.min(100, score),
    grade: score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F',
    components: {
      activity:  Math.round(activePct),
      exercise:  Math.round(exAdherence),
      checkin:   Math.round(ciFq),
      posture:   Math.round(psFq),
      streak:    streakBonus * 5, // scale to 0-100 for display
    },
    trend: buildWeekDays(7).map(({ day, date }) => {
      const dayActivity = activity.find(a => a.date === date)
      const dayEx = exercises.filter(s => s.date === date).length
      const localScore = Math.min(100, (dayActivity?.count || 0) * 15 + dayEx * 12)
      return { day, date, score: localScore }
    }),
  }
}

// ── Progress report (weekly/monthly summary for the report tab) ────────────────
export function getProgressReport() {
  const exercises = safeGet(KEYS.EXERCISES).filter(s => s.status === 'completed')
  const checkins  = safeGet(KEYS.CHECKINS)
  const posture   = safeGet(KEYS.POSTURE).filter(s => s.status === 'completed')

  // Monthly breakdown (last 4 months)
  const months = []
  for (let i = 3; i >= 0; i--) {
    const start = monthStart(-i)
    const end   = monthStart(-i + 1)
    const label = new Date(start).toLocaleString('default', { month: 'short' })
    const exCount  = exercises.filter(s => s.date >= start && s.date < end).length
    const ciScores = checkins.filter(c => c.date >= start && c.date < end).map(c => c.painScore)
    const psScores = posture.filter(s => s.date >= start && s.date < end && s.avgScore != null).map(s => s.avgScore)
    months.push({
      label, start, end,
      exercises:    exCount,
      avgPain:      ciScores.length ? Math.round(avg(ciScores) * 10) / 10 : null,
      avgPosture:   psScores.length ? Math.round(avg(psScores)) : null,
    })
  }

  // Weekly breakdown (last 8 weeks)
  const weeks = []
  for (let i = 7; i >= 0; i--) {
    const start = dateOffset(-((i + 1) * 7))
    const end   = dateOffset(-(i * 7))
    const label = i === 0 ? 'This wk' : `W-${i}`
    const exCount  = exercises.filter(s => s.date >= start && s.date < end).length
    const ciScores = checkins.filter(c => c.date >= start && c.date < end).map(c => c.painScore)
    weeks.push({
      label, start, end,
      exercises: exCount,
      avgPain:   ciScores.length ? Math.round(avg(ciScores) * 10) / 10 : null,
    })
  }

  return { months, weeks }
}

// ── Combined stats ────────────────────────────────────────────────────────────
export function getAllStats() {
  const exercises   = getExerciseStats()
  const posture     = getPostureStats()
  const remedies    = getRemedyStats()
  const chatbot     = getChatbotStats()
  const checkins    = getCheckInStats()
  const streak      = getStreakData()
  const badges      = getBadges()
  const activity    = _getActivityHeatmap()
  const consistency = getRecoveryConsistencyScore()
  const progress    = getProgressReport()
  return { exercises, posture, remedies, chatbot, checkins, streak, badges, activity, consistency, progress }
}

// ── Demo seed ─────────────────────────────────────────────────────────────────
export function seedDemoDataIfEmpty() {
  if (safeGet(KEYS.EXERCISES).length > 0) return

  const exIds = ['ankle_circles','quad_stretch','hip_flexor','calf_raise','knee_extension','shoulder_pendulum','bridge']
  const cats  = ['mobility','strength','flexibility','balance']
  const seeded = []

  for (let i = 27; i >= 0; i--) {
    const d = dateOffset(-i)
    if (i % 8 === 0) continue // ~12% skip
    const n = Math.floor(Math.random() * 3) + 2
    for (let j = 0; j < n; j++) {
      const id = exIds[Math.floor(Math.random() * exIds.length)]
      seeded.push({
        id, name: id.replace(/_/g, ' '), category: cats[Math.floor(Math.random() * cats.length)],
        status: 'completed', startTs: now(), endTs: now(),
        durationSec: 300 + Math.floor(Math.random() * 600),
        postureScore: 60 + Math.floor(Math.random() * 30), date: d,
      })
    }
  }
  safeSet(KEYS.EXERCISES, seeded)

  const postureSeed = []
  for (let i = 20; i >= 0; i--) {
    const d = dateOffset(-i)
    if (i % 5 === 0) continue
    postureSeed.push({
      id: `ps_demo_${i}`, mode: 'simulation', status: 'completed',
      startTs: now(), endTs: now(),
      avgScore:  60 + Math.floor(Math.random() * 28) + Math.floor(i < 10 ? 4 : 0),
      peakScore: 75 + Math.floor(Math.random() * 18),
      durationSec: 300 + Math.floor(Math.random() * 900),
      repsDone: 4 + Math.floor(Math.random() * 8), date: d,
    })
  }
  safeSet(KEYS.POSTURE, postureSeed)

  // Checkins with improving pain trend
  const moods = ['severe','moderate','moderate','mildPain','mildPain','mildPain','comfortable','comfortable']
  const ciSeed = []
  for (let i = 27; i >= 0; i--) {
    if (i % 4 === 1) continue
    const moodIdx = Math.min(moods.length - 1, Math.floor((27 - i) / 4))
    const mood = moods[moodIdx]
    ciSeed.push({ painMood: mood, painScore: moodToScore(mood), ts: now() - i * 86400000, date: dateOffset(-i) })
  }
  safeSet(KEYS.CHECKINS, ciSeed)

  // Chatbot messages
  const intents = ['exercise','pain','posture','remedy','general','navigation']
  const chatSeed = []
  for (let i = 20; i >= 0; i--) {
    const d = dateOffset(-i)
    const msgs = 1 + Math.floor(Math.random() * 5)
    for (let j = 0; j < msgs; j++) {
      chatSeed.push({ role: 'user', intent: intents[Math.floor(Math.random() * intents.length)], ts: now() - i * 86400000, date: d })
    }
  }
  safeSet(KEYS.CHATBOT, chatSeed)

  // Activity
  const actSeed = []
  for (let i = 34; i >= 0; i--) {
    const d = dateOffset(-i)
    if (i % 7 === 2 || i % 11 === 0) continue
    actSeed.push({ date: d, count: 2 + Math.floor(Math.random() * 5), events: ['exercise_completed'] })
  }
  safeSet(KEYS.ACTIVITY, actSeed)

  // Remedy views
  const areas = ['Knee','Back','Shoulder','Hip','Ankle']
  const types = ['Heat Therapy','Ice Therapy','Stretching','Massage']
  const remSeed = []
  for (let i = 15; i >= 0; i--) {
    if (i % 5 === 0) continue
    remSeed.push({
      id: `r_${i}`, name: `Remedy ${i}`,
      painArea: areas[i % areas.length],
      type: types[i % types.length],
      ts: now(), date: dateOffset(-i),
      ...(i % 3 === 0 ? { status: 'completed' } : {}),
    })
  }
  safeSet(KEYS.REMEDIES, remSeed)

  updateStreak()
}

// ─────────────────────────────────────────────────────────────────────────────
// ── Pure computation helpers (no side-effects) ────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0 }

/** Slope of a simple linear regression over [x,y] pairs */
function linearTrend(points) {
  if (points.length < 2) return 0
  const n = points.length
  const sumX  = points.reduce((a, [x]) => a + x, 0)
  const sumY  = points.reduce((a, [, y]) => a + y, 0)
  const sumXY = points.reduce((a, [x, y]) => a + x * y, 0)
  const sumX2 = points.reduce((a, [x]) => a + x * x, 0)
  const denom = n * sumX2 - sumX * sumX
  return denom ? (n * sumXY - sumX * sumY) / denom : 0
}

/** Build array of {day, date} for last N days */
function buildWeekDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = dateOffset(-(n - 1 - i))
    return { day: DAY_ABBR[new Date(d).getDay()], date: d }
  })
}

/** Group completed sessions into 8 weekly buckets */
function buildMonthlyWeeks(done) {
  return Array.from({ length: 8 }, (_, i) => {
    const start = dateOffset(-((7 - i) * 7 + 7))
    const end   = dateOffset(-((7 - i) * 7))
    return {
      label: i === 7 ? 'This wk' : `W${8 - i - 7 >= 0 ? '' : '-'}${8 - i}`,
      week:  `W${i + 1}`,
      count: done.filter(s => s.date >= start && s.date < end).length,
    }
  })
}

/** First date of month offset by monthOffset */
function monthStart(monthOffset) {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + monthOffset)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}
