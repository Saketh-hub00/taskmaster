import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: 'dashboard',     label: 'Dashboard' },
  { to: '/tasks',     icon: 'check_box',     label: 'My Tasks' },
  { to: '/projects',  icon: 'folder',        label: 'Projects' },
  { to: '/kanban',    icon: 'view_kanban',   label: 'Kanban' },
  { to: '/calendar',  icon: 'calendar_month',label: 'Calendar' },
]

const bottomItems = [
  { to: '/settings', icon: 'settings', label: 'Settings' },
  { to: '/help',     icon: 'help',     label: 'Help & Support' },
  { to: '/pricing',  icon: 'workspace_premium', label: 'Upgrade' },
]

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/auth')
  }

  const avatarUrl = profile?.avatar_url
  const initials = (profile?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen bg-background-dark overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-[#111318] border-r border-border-dark
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border-dark">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-[18px]">check_circle</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">TaskMaster</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border-dark">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-text-secondary capitalize">{profile?.subscription || 'free'} plan</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-secondary hover:text-white hover:bg-surface-dark'}
              `}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-3 border-t border-border-dark space-y-1">
          {bottomItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-white hover:bg-surface-dark'}
              `}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3 border-b border-border-dark bg-[#111318] shrink-0">
          <button
            className="lg:hidden text-text-secondary hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search tasks, projects..."
                className="w-full bg-surface-dark border border-border-dark text-white text-sm rounded-lg pl-10 pr-4 py-2 placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative w-9 h-9 rounded-lg bg-surface-dark hover:bg-border-dark flex items-center justify-center text-text-secondary hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#111318]" />
            </button>
            <NavLink to="/tasks/new">
              <button className="btn-primary text-sm hidden sm:flex">
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Task
              </button>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
