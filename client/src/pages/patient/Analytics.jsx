import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../../components/ui'
import { useAnalytics } from '../../context/AnalyticsContext'
import {
  KpiTile, ChartCard, MiniBar, ScoreRing, DeltaBadge, TrendArrow,
  GradientAreaChart, RoundedBarChart, TrendLine, DonutChart,
  MonthlyStackBar, ActivityHeatmap, MoodChip, GradeBadge, AnimNum,
} from '../../components/AnalyticsCharts'

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {[180, 120, 200, 160].map((h, i) => (
        <div key={i} style={{ height: h, background: 'var(--glass)', borderRadius: 20,
          animation: 'shimmer 1.5s infinite', opacity: .6 }} />
      ))}
    </div>
  )
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: '📊 Overview' },
  { id: 'exercises',   label: '🏋️ Exercises' },
  { id: 'posture',     label: '🎯 Posture' },
  { id: 'pain',        label: '💊 Pain' },
  { id: 'consistency', label: '🔥 Consistency' },
  { id: 'usage',       label: '🤖 AI & Remedies' },
  { id: 'progress',    label: '📅 Progress' },
]

function TabBar({ active, setActive }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
      scrollbarWidth: 'none', marginBottom: 24 }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => setActive(tab.id)}
          style={{
            whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 100, cursor: 'pointer',
            border: `1px solid ${active === tab.id ? 'var(--teal)' : 'var(--border)'}`,
            background: active === tab.id ? 'rgba(0,212,170,.12)' : 'var(--bg3)',
            color: active === tab.id ? 'var(--teal)' : 'var(--text2)',
            fontSize: 13, fontFamily: "'DM Sans',sans-serif",
            transition: 'all .15s',
          }}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Two-col grid helper ───────────────────────────────────────────────────────
function Grid2({ children, style = {} }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, ...style }}>
      {children}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ── TAB: OVERVIEW ─────────────────────────────────────────────────────────────
function OverviewTab({ stats }) {
  const { exercises, posture, checkins, streak, badges, consistency, activity } = stats
  const heatmap = useMemo(() => activity || [], [activity])

  const kpis = [
    { icon: '🏋️', value: exercises.total,     label: 'Total Exercises',    color: '#00d4aa', delta: exercises.weekDelta },
    { icon: '🎯', value: `${posture.avgScore}%`, label: 'Avg Posture Score', color: '#4a9eff', delta: posture.scoreMonthDelta, invertDelta: false, sub: `${posture.totalSessions} sessions` },
    { icon: '💊', value: checkins.avgPainScore != null ? `${checkins.avgPainScore}/10` : '—',
      label: 'Avg Pain Score', color: '#34d399', invertDelta: true,
      sub: checkins.painImprovementPct != null ? `${checkins.painImprovementPct > 0 ? '↓' : '↑'} ${Math.abs(checkins.painImprovementPct)}% this month` : null },
    { icon: '🔥', value: streak.currentStreak,  label: 'Day Streak',         color: '#fbbf24', sub: `Best: ${streak.longestStreak} days` },
    { icon: '⏱',  value: `${exercises.totalMinutes}m`, label: 'Exercise Time', color: '#a78bfa', sub: 'Total across all sessions' },
    { icon: '📅', value: streak.totalActiveDays, label: 'Active Days',       color: '#fb923c', sub: 'Since you started' },
  ]

  return (
    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}>
            <KpiTile {...k} />
          </motion.div>
        ))}
      </div>

      {/* Streak + consistency side-by-side */}
      <Grid2 style={{ marginBottom: 20 }}>
        <ChartCard
          title="🔥 Streak History"
          subtitle={`${streak.currentStreak}-day current · ${streak.longestStreak}-day best`}
          style={{ background: 'linear-gradient(135deg,rgba(251,191,36,.07),rgba(251,191,36,.02))' }}
        >
          <TrendLine data={consistency.trend} dataKey="score" color="#fbbf24" height={120} name="Activity score" />
        </ChartCard>

        <ChartCard
          title="🏆 Recovery Consistency"
          subtitle={`Overall score based on activity, exercises, check-ins`}
          badge={<GradeBadge grade={consistency.grade} />}
          style={{ background: 'linear-gradient(135deg,rgba(0,212,170,.06),rgba(0,212,170,.02))' }}
        >
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 16 }}>
            <ScoreRing value={consistency.score} color="#00d4aa" size={86} stroke={8}
              label={`${consistency.score}%`} sub="score" glow />
            <div style={{ flex: 1 }}>
              <MiniBar label="Daily Activity"    value={consistency.components.activity}  color="#00d4aa" suffix="%" />
              <MiniBar label="Exercise Adherence" value={consistency.components.exercise} color="#4a9eff" suffix="%" />
              <MiniBar label="Check-in Freq"     value={consistency.components.checkin}   color="#a78bfa" suffix="%" />
              <MiniBar label="Posture Sessions"  value={consistency.components.posture}   color="#fbbf24" suffix="%" />
            </div>
          </div>
        </ChartCard>
      </Grid2>

      {/* Activity heatmap */}
      <ChartCard title="🗓 Activity Heatmap (35 days)" style={{ marginBottom: 20 }}>
        <ActivityHeatmap data={heatmap} cols={7} />
        <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text2)' }}>
          {[['None','var(--bg4)'],['Low','rgba(0,212,170,.2)'],['Mid','rgba(0,212,170,.5)'],['High','var(--teal)']].map(([l,c]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
            </span>
          ))}
        </div>
      </ChartCard>

      {/* Badges */}
      <ChartCard title={`🏅 Earned Badges (${badges.length})`} style={{ marginBottom: 20 }}>
        {badges.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>
            Complete exercises, posture sessions, and check-ins to earn badges!
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {badges.map((b, i) => (
              <motion.div key={b.id}
                initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * .06 }} whileHover={{ y: -3 }}
                style={{ background: 'var(--bg3)', border: '1px solid rgba(0,212,170,.2)', borderRadius: 14,
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 26 }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{b.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* Recovery rings */}
      <ChartCard title="🎯 At-a-glance Rings">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'space-around', paddingTop: 8 }}>
          {[
            { v: Math.min(100, exercises.total * 3 + 10), c: '#00d4aa', l: 'Recovery',  s: 'score' },
            { v: posture.avgScore || 0,                   c: '#4a9eff', l: 'Posture',   s: 'accuracy' },
            { v: checkins.avgPainScore ? Math.round((1 - checkins.avgPainScore / 10) * 100) : 0,
                                                          c: '#34d399', l: 'Pain',      s: 'reduced' },
            { v: Math.min(100, streak.currentStreak * 12), c: '#fbbf24', l: 'Streak',   s: 'rate' },
            { v: consistency.score,                        c: '#a78bfa', l: 'Consistent',s: 'score' },
          ].map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * .1 }} style={{ textAlign: 'center' }}>
              <ScoreRing value={r.v} color={r.c} size={88} stroke={7} label={`${r.v}%`} sub={r.s} />
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{r.l}</div>
            </motion.div>
          ))}
        </div>
      </ChartCard>
    </motion.div>
  )
}

// ── TAB: EXERCISES ────────────────────────────────────────────────────────────
function ExercisesTab({ stats }) {
  const { exercises } = stats

  const catData = Object.entries(exercises.categoryBreakdown || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const catColors = ['#00d4aa','#4a9eff','#a78bfa','#fbbf24','#fb923c','#ff6b7a']

  return (
    <motion.div key="exercises" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '✅', value: exercises.total,          label: 'Total Completed',  color: '#00d4aa', delta: exercises.weekDelta },
          { icon: '📅', value: `${exercises.todayPct}%`, label: "Today's Goal",     color: '#4a9eff', sub: `${exercises.todayCount} of 4 done` },
          { icon: '📆', value: exercises.thisWeekDone,   label: 'This Week',        color: '#a78bfa', delta: exercises.weekDelta },
          { icon: '📊', value: exercises.thisMonthDone,  label: 'This Month',       color: '#fbbf24', delta: exercises.monthDelta },
          { icon: '⏱',  value: `${exercises.totalMinutes}m`, label: 'Total Time',   color: '#fb923c' },
          { icon: '⭐', value: exercises.bestDay,         label: 'Best Day',        color: '#34d399' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>
            <KpiTile {...k} />
          </motion.div>
        ))}
      </div>

      <Grid2 style={{ marginBottom: 20 }}>
        {/* Daily completion % */}
        <ChartCard title="📈 Daily Completion % (7 days)" subtitle="vs. 4-exercise daily goal">
          <RoundedBarChart data={exercises.weekData} dataKey="pct" color="#00d4aa"
            height={150} name="Completion %" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            {exercises.weekData.map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: d.pct >= 100 ? 'var(--teal)' : d.pct >= 50 ? 'var(--amber)' : 'var(--text3)' }}>
                  {d.pct}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{d.day}</div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Category breakdown */}
        <ChartCard title="🗂 Category Breakdown" subtitle="All-time distribution">
          {catData.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, fontStyle: 'italic', padding: '20px 0' }}>
              No exercises tracked yet
            </div>
          ) : (
            <>
              <DonutChart data={catData} colors={catColors} height={160}
                innerLabel={`${exercises.total}`} innerSub="total" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {catData.map((d, i) => (
                  <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[i % catColors.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)' }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: catColors[i % catColors.length] }}>{d.value}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </Grid2>

      {/* 8-week trend */}
      <ChartCard title="📅 8-Week Exercise Volume" subtitle="Sessions completed per week"
        style={{ marginBottom: 20 }}>
        <MonthlyStackBar data={exercises.monthlyChart} height={160} />
      </ChartCard>

      {/* Recent sessions */}
      {exercises.recentSessions.length > 0 && (
        <ChartCard title="🕐 Recent Sessions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {exercises.recentSessions.slice(0, 5).map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * .07 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name || s.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.date} · {Math.round((s.durationSec || 0) / 60)}min</div>
                </div>
                {s.postureScore && (
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: 'var(--teal)', fontSize: 14 }}>
                    {s.postureScore}%
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </ChartCard>
      )}
    </motion.div>
  )
}

// ── TAB: POSTURE ──────────────────────────────────────────────────────────────
function PostureTab({ stats }) {
  const { posture } = stats

  return (
    <motion.div key="posture" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '🎯', value: `${posture.avgScore}%`,  label: 'Avg Accuracy',     color: '#4a9eff', delta: posture.scoreMonthDelta },
          { icon: '🌟', value: `${posture.peakScore}%`, label: 'Peak Score',       color: '#00d4aa' },
          { icon: '📅', value: posture.totalSessions,   label: 'Total Sessions',   color: '#a78bfa' },
          { icon: '⏱',  value: `${posture.totalMinutes}m`, label: 'Total Time',    color: '#fbbf24' },
          { icon: '🔄', value: `${posture.consistencyPct}%`, label: 'Consistency', color: '#fb923c', sub: 'Last 14 days' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>
            <KpiTile {...k} />
          </motion.div>
        ))}
      </div>

      <Grid2 style={{ marginBottom: 20 }}>
        {/* Weekly scores trend */}
        <ChartCard title="📈 Posture Score Trend (7 days)"
          subtitle={posture.scoreTrend > 0.2 ? '📈 Improving' : posture.scoreTrend < -0.2 ? '📉 Declining' : '→ Stable'}>
          <GradientAreaChart data={posture.weeklyScores} dataKey="value" color="#4a9eff"
            height={150} name="Score %" yDomain={[0, 100]} />
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[
              { l: 'Average',  v: `${posture.avgScore}%`,  c: '#4a9eff' },
              { l: 'Peak',     v: `${posture.peakScore}%`, c: '#00d4aa' },
              { l: 'Sessions', v: posture.totalSessions,   c: 'var(--text)' },
            ].map(s => (
              <div key={s.l} style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--text2)' }}>{s.l}: </span>
                <b style={{ color: s.c }}>{s.v}</b>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Score ring + improvement */}
        <ChartCard title="🎯 Accuracy Score" subtitle="Based on completed sessions">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <ScoreRing value={posture.avgScore} color="#4a9eff" size={100} stroke={9}
              label={`${posture.avgScore}%`} sub="accuracy" glow />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>Score bands:</div>
              {[
                { l: 'Excellent', range: '≥90%', color: '#00d4aa', met: posture.avgScore >= 90 },
                { l: 'Good',      range: '75–89%', color: '#4a9eff', met: posture.avgScore >= 75 && posture.avgScore < 90 },
                { l: 'Fair',      range: '60–74%', color: '#fbbf24', met: posture.avgScore >= 60 && posture.avgScore < 75 },
                { l: 'Needs work',range: '<60%',   color: '#ff6b7a', met: posture.avgScore < 60 },
              ].map(b => (
                <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, opacity: b.met ? 1 : .4 }}>
                  <span style={{ fontSize: 14 }}>{b.met ? '✅' : '○'}</span>
                  <span style={{ fontSize: 12, fontWeight: b.met ? 700 : 400, color: b.met ? b.color : 'var(--text3)' }}>{b.l}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{b.range}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </Grid2>

      {/* Common issues */}
      {posture.commonIssues.length > 0 && (
        <ChartCard title="⚠️ Common Issues" subtitle="Most frequently detected posture problems"
          style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posture.commonIssues.map(([issue, count], i) => (
              <MiniBar key={issue} label={issue} value={count}
                max={posture.commonIssues[0][1]} color="#ff6b7a" />
            ))}
          </div>
        </ChartCard>
      )}

      {/* Recent sessions */}
      {posture.recentSessions.length > 0 && (
        <ChartCard title="🕐 Recent Posture Sessions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posture.recentSessions.map((s, i) => (
              <div key={s.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: 'var(--bg3)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.date} · {Math.round((s.durationSec || 0) / 60)}min</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.avgScore >= 80 ? 'var(--teal)' : s.avgScore >= 60 ? 'var(--amber)' : 'var(--red)' }}>
                    {s.avgScore}%
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>avg score</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </motion.div>
  )
}

// ── TAB: PAIN ─────────────────────────────────────────────────────────────────
function PainTab({ stats }) {
  const { checkins } = stats

  const moodDist = Object.entries(checkins.moodDistribution || {})
    .map(([name, value]) => ({ name, value }))
  const moodColors = { comfortable: '#34d399', mildPain: '#a3e635', moderate: '#fbbf24', severe: '#ff6b7a' }

  return (
    <motion.div key="pain" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '💊', value: checkins.avgPainScore != null ? `${checkins.avgPainScore}/10` : '—', label: 'Avg Pain (30d)',    color: '#34d399', invertDelta: true },
          { icon: '📝', value: checkins.totalCheckIns,   label: 'Total Check-ins',   color: '#4a9eff' },
          { icon: '📅', value: checkins.checkIns30Days,  label: 'Check-ins (30d)',   color: '#a78bfa' },
          { icon: '📈', value: checkins.painImprovementPct != null ? `${checkins.painImprovementPct > 0 ? '+' : ''}${checkins.painImprovementPct}%` : '—',
            label: 'Month Improvement', color: checkins.painImprovementPct > 0 ? '#34d399' : '#ff6b7a' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .06 }}>
            <KpiTile {...k} />
          </motion.div>
        ))}
      </div>

      <Grid2 style={{ marginBottom: 20 }}>
        {/* 7-day pain chart */}
        <ChartCard title="😣 Pain Level (7 days)"
          subtitle={`Trend: `}
          badge={<TrendArrow trend={checkins.painTrend}
            labels={{ improving: '↓ Getting Better', worsening: '↑ Increasing — consult physio', stable: '→ Stable' }} />}>
          <GradientAreaChart data={checkins.last7Days} dataKey="pain" color="#ff6b7a"
            height={150} name="Pain (0-10)" yDomain={[0, 10]} />
        </ChartCard>

        {/* Mood distribution donut */}
        <ChartCard title="😊 Mood Distribution" subtitle="All-time check-in breakdown">
          {moodDist.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, fontStyle: 'italic', padding: '20px 0' }}>No check-ins recorded yet</div>
          ) : (
            <>
              <DonutChart
                data={moodDist}
                colors={moodDist.map(d => moodColors[d.name] || '#4a9eff')}
                height={150}
                innerLabel={checkins.totalCheckIns}
                innerSub="check-ins"
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {moodDist.map(d => (
                  <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: moodColors[d.name], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text2)' }}>{d.name.replace(/([A-Z])/g, ' $1')}</span>
                    <b style={{ color: moodColors[d.name] }}>{d.value}</b>
                  </span>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </Grid2>

      {/* Pain improvement banner */}
      {checkins.painImprovementPct !== null && (
        <ChartCard style={{ marginBottom: 20, background: checkins.painImprovementPct > 0
          ? 'linear-gradient(135deg,rgba(52,211,153,.08),rgba(52,211,153,.02))'
          : 'linear-gradient(135deg,rgba(255,107,122,.06),rgba(255,107,122,.02))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 36 }}>{checkins.painImprovementPct > 0 ? '🎉' : '⚠️'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 4,
                color: checkins.painImprovementPct > 0 ? 'var(--teal)' : 'var(--red)' }}>
                {checkins.painImprovementPct > 0
                  ? `Pain improved ${checkins.painImprovementPct}% this month!`
                  : `Pain increased ${Math.abs(checkins.painImprovementPct)}% — consider consulting your physio`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                {checkins.painImprovementPct > 0
                  ? 'Comparing first and second halves of the last 30 days'
                  : 'Your average pain was higher in the second half of the month'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 900,
                color: checkins.painImprovementPct > 0 ? 'var(--teal)' : 'var(--red)' }}>
                {checkins.painImprovementPct > 0 ? '↓' : '↑'}{Math.abs(checkins.painImprovementPct)}%
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      {/* Today's mood */}
      {checkins.latestMood && (
        <ChartCard title="Today's Mood">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 32 }}>
              {{ comfortable: '😊', mildPain: '🙂', moderate: '😐', severe: '😟' }[checkins.latestMood] || '😐'}
            </span>
            <MoodChip mood={checkins.latestMood} />
          </div>
        </ChartCard>
      )}
    </motion.div>
  )
}

// ── TAB: CONSISTENCY ──────────────────────────────────────────────────────────
function ConsistencyTab({ stats }) {
  const { consistency, streak } = stats

  return (
    <motion.div key="consistency" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Score + grade */}
      <ChartCard
        title="🏆 Recovery Consistency Score"
        subtitle="Composite of activity, exercise adherence, check-ins, and posture sessions"
        badge={<GradeBadge grade={consistency.grade} />}
        style={{ marginBottom: 20, background: 'linear-gradient(135deg,rgba(0,212,170,.07),rgba(0,212,170,.02))' }}
      >
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <ScoreRing value={consistency.score} color="#00d4aa" size={110} stroke={10}
            label={`${consistency.score}%`} sub="overall" glow />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 900, color: 'var(--teal)', marginBottom: 4 }}>
              Grade {consistency.grade}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              {consistency.grade === 'A' ? "Outstanding! You're crushing your recovery." :
               consistency.grade === 'B' ? "Good work — keep up the consistency." :
               consistency.grade === 'C' ? "Solid effort — a few more daily sessions will push you up." :
               consistency.grade === 'D' ? "Try to log at least one activity every day." :
               "Every session counts — even short ones. Start today!"}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
          {[
            { l: 'Daily Activity',      v: consistency.components.activity,  c: '#00d4aa', desc: 'Active days in last 14' },
            { l: 'Exercise Adherence',  v: consistency.components.exercise,  c: '#4a9eff', desc: 'vs. 4 exercise/day goal' },
            { l: 'Check-in Frequency',  v: consistency.components.checkin,   c: '#a78bfa', desc: 'Daily pain check-ins' },
            { l: 'Posture Sessions',    v: consistency.components.posture,   c: '#fbbf24', desc: '0.5 sessions/day goal' },
          ].map(c => (
            <div key={c.l} style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>{c.l}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: c.c, marginBottom: 4 }}>{c.v}%</div>
              <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${c.v}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: c.c, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Daily score trend */}
      <ChartCard title="📈 Daily Activity Score (7 days)"
        subtitle="Composite score per day based on recorded events"
        style={{ marginBottom: 20 }}>
        <TrendLine data={consistency.trend} dataKey="score" color="#00d4aa" height={150} name="Daily score" />
      </ChartCard>

      {/* Streak cards */}
      <Grid2>
        <ChartCard title="🔥 Current Streak"
          style={{ background: 'linear-gradient(135deg,rgba(251,191,36,.08),rgba(251,191,36,.02))' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 52, fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                {streak.currentStreak}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>day streak</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Longest streak: <b style={{ color: 'var(--text)' }}>{streak.longestStreak} days</b></div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>Total active days: <b style={{ color: 'var(--text)' }}>{streak.totalActiveDays}</b></div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="💡 How to Improve"
          style={{ background: 'linear-gradient(135deg,rgba(74,158,255,.06),rgba(74,158,255,.02))' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              consistency.components.exercise < 60  ? '📌 Complete 4+ exercises daily to boost adherence score' : null,
              consistency.components.checkin < 50   ? '📌 Log a pain check-in every day on the dashboard' : null,
              consistency.components.posture < 40   ? '📌 Run at least 1 posture session every 2 days' : null,
              streak.currentStreak < 3              ? '📌 3 consecutive days = streak unlocked!' : null,
            ].filter(Boolean).slice(0, 3).map((tip, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{tip}</div>
            ))}
            {consistency.score >= 80 && (
              <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
                🎉 You're doing great — maintain this consistency!
              </div>
            )}
          </div>
        </ChartCard>
      </Grid2>
    </motion.div>
  )
}

// ── TAB: AI & REMEDIES ────────────────────────────────────────────────────────
function UsageTab({ stats }) {
  const { chatbot, remedies } = stats

  const intentColors = ['#00d4aa','#4a9eff','#a78bfa','#fbbf24','#fb923c']

  return (
    <motion.div key="usage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Grid2 style={{ marginBottom: 20 }}>
        {/* Chatbot stats */}
        <ChartCard title="🤖 AI Chatbot Usage" subtitle="Messages and interactions"
          style={{ background: 'linear-gradient(135deg,rgba(74,158,255,.06),rgba(74,158,255,.02))' }}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: '#4a9eff', lineHeight: 1 }}>{chatbot.totalMessages}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>total messages</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Today: <b style={{ color: 'var(--text)' }}>{chatbot.todayMessages}</b></div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>This week: <b style={{ color: 'var(--text)' }}>{chatbot.weekDelta !== null ? <DeltaBadge delta={chatbot.weekDelta} /> : '—'}</b></div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Navigations: <b style={{ color: 'var(--text)' }}>{chatbot.navigationCount}</b></div>
            </div>
          </div>

          {chatbot.topIntents.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Top topics asked:</div>
              {chatbot.topIntents.map(([intent, count], i) => (
                <MiniBar key={intent} label={intent} value={count}
                  max={chatbot.topIntents[0][1]} color={intentColors[i % intentColors.length]} />
              ))}
            </>
          )}
        </ChartCard>

        {/* Chatbot daily usage */}
        <ChartCard title="📅 Chatbot Activity (7 days)" subtitle="Messages sent per day">
          <RoundedBarChart data={chatbot.dailyUsage} dataKey="count" color="#4a9eff"
            height={150} name="Messages" />
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10 }}>
            {chatbot.peakHour !== undefined && (
              <>Peak usage: <b style={{ color: 'var(--blue)' }}>{chatbot.peakHour}:00–{chatbot.peakHour + 1}:00</b></>
            )}
          </div>
        </ChartCard>
      </Grid2>

      <Grid2 style={{ marginBottom: 20 }}>
        {/* Remedy stats */}
        <ChartCard title="🌿 Remedy Usage" subtitle="Views and completions">
          <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{remedies.totalViewed}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>viewed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: '#00d4aa', lineHeight: 1 }}>{remedies.totalCompleted}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ScoreRing value={remedies.completionRate} color="#00d4aa" size={60} stroke={6}
                label={`${remedies.completionRate}%`} sub="rate" />
            </div>
          </div>

          {remedies.topPainAreas.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Top pain areas:</div>
              {remedies.topPainAreas.slice(0, 4).map(([area, count], i) => (
                <MiniBar key={area} label={area} value={count}
                  max={remedies.topPainAreas[0][1]} color="#34d399" />
              ))}
            </>
          )}
        </ChartCard>

        {/* Remedy weekly usage */}
        <ChartCard title="📅 Remedy Activity (7 days)" subtitle="Views per day">
          <RoundedBarChart data={remedies.weeklyUsage} dataKey="count" color="#34d399"
            secondKey="completed" secondColor="#00d4aa" height={150} name="Viewed" />
          <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11 }}>
            {[['Viewed','#34d399'],['Completed','#00d4aa']].map(([l,c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
              </span>
            ))}
          </div>
        </ChartCard>
      </Grid2>

      {/* Remedy type breakdown */}
      {remedies.topTypes.length > 0 && (
        <ChartCard title="💆 Remedy Types Used">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {remedies.topTypes.map(([type, count], i) => (
              <div key={type} style={{ padding: '10px 16px', borderRadius: 12,
                background: 'var(--bg3)', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800,
                  color: intentColors[i % intentColors.length] }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{type}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </motion.div>
  )
}

// ── TAB: PROGRESS REPORT ──────────────────────────────────────────────────────
function ProgressTab({ stats }) {
  const { progress, exercises, posture, checkins } = stats

  return (
    <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Monthly chart */}
      <ChartCard title="📅 Monthly Exercise Volume"
        subtitle="Exercises completed per month (last 4 months)"
        style={{ marginBottom: 20 }}>
        <MonthlyStackBar data={progress.months} height={170} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginTop: 14 }}>
          {progress.months.map((m, i) => (
            <div key={m.label} style={{ background: 'var(--bg3)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{m.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Exercises: <b style={{ color: 'var(--teal)' }}>{m.exercises}</b></div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Avg pain: <b style={{ color: 'var(--text)' }}>{m.avgPain != null ? `${m.avgPain}/10` : '—'}</b></div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Posture: <b style={{ color: '#4a9eff' }}>{m.avgPosture != null ? `${m.avgPosture}%` : '—'}</b></div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Weekly volume chart */}
      <ChartCard title="📊 Weekly Volume (last 8 weeks)"
        subtitle="Exercises per week"
        style={{ marginBottom: 20 }}>
        <RoundedBarChart data={progress.weeks} dataKey="exercises" color="#4a9eff"
          height={160} name="Exercises" />
      </ChartCard>

      {/* Recovery timeline */}
      <ChartCard title="🏁 Recovery Timeline">
        <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, marginBottom: 20, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (exercises.total / 60) * 100)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 4 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Start',           sub: 'Week 0',   done: true },
            { label: 'Pain Reduction',  sub: 'Week 2',   done: checkins.avgPainScore != null && checkins.avgPainScore < 5 },
            { label: '50% Mobility',    sub: 'Week 4',   done: exercises.total >= 12 },
            { label: 'Full ROM',        sub: 'Week 6',   done: exercises.total >= 25, active: exercises.total >= 12 && exercises.total < 25 },
            { label: 'Return to Sport', sub: 'Week 8–10', done: exercises.total >= 50 },
          ].map((m, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              style={{ textAlign: 'center', flex: 1, minWidth: 72 }}>
              <motion.div
                animate={m.active ? { boxShadow: ['0 0 0 0 var(--teal)','0 0 0 8px rgba(0,212,170,.15)','0 0 0 0 var(--teal)'] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 14, height: 14, borderRadius: '50%', margin: '0 auto 8px',
                  background: m.done ? 'var(--teal)' : m.active ? 'var(--blue)' : 'var(--bg4)',
                  border: m.active ? '2px solid var(--blue)' : 'none' }}
              />
              <div style={{ fontSize: 11, fontWeight: 600, color: m.done ? 'var(--teal)' : m.active ? 'var(--blue)' : 'var(--text3)' }}>
                {m.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>{m.sub}</div>
            </motion.div>
          ))}
        </div>
      </ChartCard>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ── Main Analytics page ───────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { stats, getHeatmap } = useAnalytics()
  const [activeTab, setActiveTab] = useState('overview')

  const heatmapData = useMemo(() => getHeatmap(35), [getHeatmap, stats])

  // Inject heatmap into stats.activity for overview
  const enrichedStats = useMemo(() => {
    if (!stats) return null
    return { ...stats, activity: heatmapData }
  }, [stats, heatmapData])

  if (!enrichedStats) return <Skeleton />

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Badge color="purple" style={{ marginBottom: 10 }}>Live Analytics</Badge>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          Recovery Report
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          Real metrics calculated from your sessions, posture checks, pain check-ins and AI usage.
        </p>
      </div>

      <TabBar active={activeTab} setActive={setActiveTab} />

      <AnimatePresence mode="wait">
        {activeTab === 'overview'    && <OverviewTab     key="overview"    stats={enrichedStats} />}
        {activeTab === 'exercises'   && <ExercisesTab    key="exercises"   stats={enrichedStats} />}
        {activeTab === 'posture'     && <PostureTab      key="posture"     stats={enrichedStats} />}
        {activeTab === 'pain'        && <PainTab         key="pain"        stats={enrichedStats} />}
        {activeTab === 'consistency' && <ConsistencyTab  key="consistency" stats={enrichedStats} />}
        {activeTab === 'usage'       && <UsageTab        key="usage"       stats={enrichedStats} />}
        {activeTab === 'progress'    && <ProgressTab     key="progress"    stats={enrichedStats} />}
      </AnimatePresence>
    </div>
  )
}
