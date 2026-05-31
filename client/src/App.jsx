import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './i18n'
import { AnalyticsProvider } from './context/AnalyticsContext'
import { ReminderProvider } from './context/ReminderContext'
import DashboardLayout from './components/layout/DashboardLayout'
import PWAShell from './components/PWAShell'

// Public
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Patient
import PatientDashboard from './pages/patient/Dashboard'
import RecoveryJourney from './pages/patient/RecoveryJourney'
import ExercisesPage from './pages/patient/Exercises'
import PosturePage from './pages/patient/Posture'
import FeedPage from './pages/patient/Feed'
import AnalyticsPage from './pages/patient/Analytics'
import FamilyPage from './pages/patient/Family'
import TeleconsultPage from './pages/patient/Teleconsult'
import EmergencyPage from './pages/patient/Emergency'
import SettingsPage from './pages/patient/Settings'
import RemediesPage from './pages/patient/Remedies'
import RemindersPage from './pages/patient/RemindersPage'

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorPatients from './pages/doctor/Patients'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorAnalytics from './pages/doctor/Analytics'
import DoctorSettings from './pages/doctor/Settings'

// Caretaker
import CaretakerDashboard from './pages/caretaker/Dashboard'
import CaretakerAlerts from './pages/caretaker/Alerts'
import CaretakerAppointments from './pages/caretaker/Appointments'
import CaretakerSettings from './pages/caretaker/Settings'

// Helper: determine dashboard path for a user
function dashboardPath(user) {
  if (!user) return '/login'
  // Elder mode: only applies to 'patient' or 'elder' role — NOT doctor/caretaker
  if (user.role === 'elder') return '/patient/dashboard'
  if ((user.role === 'patient' || !user.role) && user.age >= 55) return '/patient/dashboard'
  return `/${user.role}/dashboard`
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,var(--teal),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 16 }}>⚕ PhysioForge</div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--bg3)', borderTopColor: 'var(--teal)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPath(user)} replace />
  }
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={dashboardPath(user)} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

      {/* Patient + Elder both use /patient/* routes */}
      <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient', 'elder']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="journey" element={<RecoveryJourney />} />
        <Route path="exercises" element={<ExercisesPage />} />
        <Route path="posture" element={<PosturePage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="family" element={<FamilyPage />} />
        <Route path="teleconsult" element={<TeleconsultPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="remedies"  element={<RemediesPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="settings"  element={<SettingsPage />} />
      </Route>

      {/* Elder alias — redirect to patient dashboard */}
      <Route path="/elder/*" element={<ProtectedRoute allowedRoles={['patient', 'elder']}><Navigate to="/patient/dashboard" replace /></ProtectedRoute>} />

      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="analytics" element={<DoctorAnalytics />} />
        <Route path="settings" element={<DoctorSettings />} />
      </Route>

      <Route path="/caretaker" element={<ProtectedRoute allowedRoles={['caretaker']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CaretakerDashboard />} />
        <Route path="alerts" element={<CaretakerAlerts />} />
        <Route path="appointments" element={<CaretakerAppointments />} />
        <Route path="settings" element={<CaretakerSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <ReminderProvider>
              <PWAShell>
                <AppRoutes />
              </PWAShell>
            </ReminderProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
