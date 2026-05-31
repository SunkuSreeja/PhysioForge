# Changelog

All notable changes to PhysioForge are documented here.
Format: [Semantic Versioning](https://semver.org/)

---

## [6.0.0] — 2025 (Current)

### Added
- **Dynamic Analytics Engine** — Complete rewrite of `analyticsService.js` with 8 metrics modules
- **7-Tab Analytics Page** — Overview, Exercises, Posture, Pain, Consistency, AI & Remedies, Progress
- **Recovery Consistency Score** — Weighted A/B/C/D/F composite grade with component breakdown
- **Pain improvement % calculation** — First-half vs. second-half of 30-day comparison
- **Linear regression trend lines** — Slope-based posture and pain trend detection
- **8-week exercise volume chart** — Weekly grouping for long-term progress view
- **Monthly exercise breakdown table** — 4-month comparison with pain and posture averages
- **Reusable `AnalyticsCharts.jsx`** — `KpiTile`, `ScoreRing`, `DeltaBadge`, `MiniBar`, chart wrappers
- **28-day demo data seeding** — Realistic improving-trend data for immediate chart population
- **`getProgressReport()`** — Monthly and weekly breakdown functions

---

## [5.0.0] — 2025

### Added
- **Reminder System** — Medicine, exercise, hydration reminders with browser notifications
- **`reminderService.js`** — CRUD, 30-second scheduler, `fireNotification()`, `formatNextFire()`
- **`ReminderContext`** — React context with toggle, update, add, remove, testFire
- **`RemindersPage`** — Full UI with category sections, day-picker, time input, add-modal
- **`ReminderWidget`** — Dashboard compact widget showing next 3 upcoming reminders
- **🔔 Reminders nav item** in patient sidebar

---

## [4.0.0] — 2025

### Added
- **Analytics Service** (`analyticsService.js`) — localStorage-based tracking for all modules
- **`AnalyticsContext`** — Cross-module tracking provider
- **Live Analytics page** — Real data replacing static mock charts
- **Activity heatmap** — 35-day calendar heatmap
- **Badge system** — 9 achievement badges with `BadgeToast` notification
- **`ErrorBoundary`** — Page-level crash isolation
- **Analytics tracking** in Exercises, Posture, Remedies, VoiceAssistant, Dashboard
- **Chatbot analytics context** — Greeting includes real progress stats
- **Demo data seeder** — First-run data population

---

## [3.0.0] — 2025

### Added
- **MediaPipe Posture Analysis** — Real-time 17-joint skeleton tracking
- **Posture fallback simulation** — Realistic synthetic coaching when camera unavailable
- **Relief Remedies module** — 10 pain areas, 4 remedy types, video guidance
- **AI posture session tracking** — Start/end with score history
- **Session analytics refs** — `sessionIdRef`, `scoreHistoryRef`, `sessionStartRef`

---

## [2.0.0] — 2025

### Added
- **Multilingual AI Assistant** — EN/HI/TE voice + text chatbot
- **PWA support** — Service worker, manifest, offline fallback, install prompt
- **Elder Mode** — Larger UI, bigger tap targets
- **Dark/Light theme** — CSS variable-based palette flip
- **Doctor dashboard** — Patient table, session replay, adherence charts
- **Caretaker dashboard** — Alert management, status cards
- **Recovery Journey** — Milestone tracker

---

## [1.0.0] — 2025

### Initial Release
- Patient dashboard with recovery rings
- Exercise library with instructions
- JWT authentication (patient/doctor/caretaker roles)
- MongoDB + demo mode fallback
- Basic responsive layout
