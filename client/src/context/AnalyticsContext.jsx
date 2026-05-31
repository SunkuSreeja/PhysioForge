import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getAllStats, trackRecoveryCheckIn, getTodayCheckIn,
  seedDemoDataIfEmpty, trackChatbotMessage, trackExerciseCompleted,
  trackPostureSessionEnded, trackRemedyViewed, trackRemedyCompleted,
  trackExerciseStarted, trackPostureSessionStarted, trackChatbotNavigation,
  _getActivityHeatmap, getRecoveryConsistencyScore, getProgressReport,
} from '../utils/analyticsService'

const AnalyticsContext = createContext(null)

export function AnalyticsProvider({ children }) {
  const [stats, setStats]               = useState(null)
  const [newBadges, setNewBadges]       = useState([])
  const [todayCheckIn, setTodayCheckIn] = useState(null)

  useEffect(() => {
    seedDemoDataIfEmpty()
    refreshStats()
    setTodayCheckIn(getTodayCheckIn())
  }, [])

  const refreshStats = useCallback(() => {
    setStats(getAllStats())
  }, [])

  // Exercise
  const logExerciseStarted = useCallback((id, name, category) => {
    trackExerciseStarted(id, name, category); refreshStats()
  }, [refreshStats])

  const logExerciseCompleted = useCallback((id, name, durationSec, postureScore) => {
    trackExerciseCompleted(id, name, durationSec, postureScore); refreshStats()
  }, [refreshStats])

  // Posture
  const logPostureStarted = useCallback((mode) => {
    const id = trackPostureSessionStarted(mode); refreshStats(); return id
  }, [refreshStats])

  const logPostureEnded = useCallback((sessionId, data) => {
    trackPostureSessionEnded(sessionId, data); refreshStats()
  }, [refreshStats])

  // Remedies
  const logRemedyViewed = useCallback((id, name, painArea, type) => {
    trackRemedyViewed(id, name, painArea, type); refreshStats()
  }, [refreshStats])

  const logRemedyCompleted = useCallback((id, name, painArea) => {
    trackRemedyCompleted(id, name, painArea); refreshStats()
  }, [refreshStats])

  // Chatbot
  const logChatMessage = useCallback((role, intent) => {
    trackChatbotMessage(role, intent); refreshStats()
  }, [refreshStats])

  const logChatNavigation = useCallback((destination) => {
    trackChatbotNavigation(destination); refreshStats()
  }, [refreshStats])

  // Check-in
  const logCheckIn = useCallback((painMood, painScore) => {
    trackRecoveryCheckIn(painMood, painScore)
    setTodayCheckIn(getTodayCheckIn())
    refreshStats()
  }, [refreshStats])

  // Heatmap
  const getHeatmap = useCallback((days = 35) => _getActivityHeatmap(days), [])

  const dismissBadge = useCallback((badgeId) => {
    setNewBadges(b => b.filter(x => x.id !== badgeId))
  }, [])

  return (
    <AnalyticsContext.Provider value={{
      stats, refreshStats, newBadges, todayCheckIn,
      logExerciseStarted, logExerciseCompleted,
      logPostureStarted, logPostureEnded,
      logRemedyViewed, logRemedyCompleted,
      logChatMessage, logChatNavigation,
      logCheckIn, getHeatmap, dismissBadge,
    }}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider')
  return ctx
}
