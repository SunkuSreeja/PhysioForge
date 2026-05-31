# Contributing to PhysioForge

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Development Setup

```bash
git clone https://github.com/your-org/physioforge-fullstack.git
cd physioforge-fullstack
npm run install:all
npm run dev
```

## Code Conventions

### React Components
- Functional components only (no class components, except `ErrorBoundary`)
- All event handlers wrapped in `useCallback`
- No hardcoded hex colors in JSX — use CSS variables (`var(--teal)`, `var(--text2)`, etc.)
- Framer Motion for all enter/exit animations

### Analytics
Any new user action should be tracked through `AnalyticsContext`:
```js
const { logExerciseCompleted } = useAnalytics()
// call on user action
logExerciseCompleted(id, name, durationSec, postureScore)
```

### Styling
- Use `var(--bg)`, `var(--bg2)`, `var(--text)`, `var(--text2)`, `var(--teal)`, `var(--blue)`, `var(--border)` for all colors
- `var(--glass)` for glassmorphism card backgrounds
- Responsive: test at 375px, 768px, 1280px

### i18n
All user-visible strings must be added to `client/src/i18n/index.jsx` for all three languages (en, hi, te).

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/short-description` | `feature/whatsapp-reminders` |
| Bug fix | `fix/short-description` | `fix/posture-score-nan` |
| Docs | `docs/short-description` | `docs/api-reference` |
| Refactor | `refactor/short-description` | `refactor/analytics-engine` |

## Pull Request Checklist

- [ ] `npm run dev` starts without errors
- [ ] No console warnings or errors in browser
- [ ] New user actions tracked in `AnalyticsContext`
- [ ] Works in offline/demo mode (no network required)
- [ ] Tested on mobile viewport (375px)
- [ ] CSS variables used for all colors
- [ ] i18n strings added for EN/HI/TE if UI text changed

## Reporting Issues

Please include:
1. Browser and OS
2. Steps to reproduce
3. Expected vs. actual behaviour
4. Console output (F12 → Console)
