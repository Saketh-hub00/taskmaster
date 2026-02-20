import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { TaskProvider } from './contexts/TaskContext'

import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import CalendarPage from './pages/CalendarPage'
import KanbanPage from './pages/KanbanPage'
import SettingsPage from './pages/SettingsPage'
import PricingPage from './pages/PricingPage'
import HelpPage from './pages/HelpPage'
import AppLayout from './components/layout/AppLayout'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-text-secondary text-sm font-medium">Loading TaskMaster...</span>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TasksPage showForm />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1c2333',
                color: '#fff',
                border: '1px solid #2d3748',
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
