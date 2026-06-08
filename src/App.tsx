import { Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { ToastViewport } from './components/ToastViewport'
import { AuthProvider } from './hooks/useAuth'
import { RatingsProvider } from './hooks/useRatings'
import { ToastProvider } from './hooks/useToast'
import { StudentConfigProvider, useStudentConfig } from './hooks/useStudentConfig'
import { LiveView } from './pages/LiveView'
import { StatsView } from './pages/StatsView'
import { HistoryView } from './pages/HistoryView'
import { SettingsView } from './pages/SettingsView'
import { Onboarding } from './pages/Onboarding'

function Shell() {
  const { config } = useStudentConfig()

  // Erst-Einrichtung als Vollbild-Gate.
  if (!config.onboarded) return <Onboarding />

  return (
    <>
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-28 pt-3">
        <Routes>
          <Route path="/" element={<LiveView />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="/verlauf" element={<HistoryView />} />
          <Route path="/einstellungen" element={<SettingsView />} />
          <Route path="*" element={<LiveView />} />
        </Routes>
      </div>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <StudentConfigProvider>
          <RatingsProvider>
            <Shell />
            <ToastViewport />
          </RatingsProvider>
        </StudentConfigProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
