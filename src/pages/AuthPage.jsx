import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (mode === 'signup' && !form.name.trim()) e.name = 'Name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (mode !== 'forgot') {
      if (form.password.length < 8) e.password = 'At least 8 characters'
      else if (!/[A-Z]/.test(form.password)) e.password = 'At least one uppercase letter'
      else if (!/[0-9]/.test(form.password)) e.password = 'At least one digit'
      else if (!/[^A-Za-z0-9]/.test(form.password)) e.password = 'At least one special character'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name } }
        })
        if (error) throw error
        toast.success('Account created! Check your email to verify.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(form.email)
        if (error) throw error
        toast.success('Password reset email sent!')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/dashboard` } })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen flex bg-background-dark">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#0d1220]">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white">check_circle</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">TaskMaster</span>
        </div>
        <div className="relative z-10">
          <div className="mb-8 space-y-3">
            {[
              { icon: 'task_alt', text: 'Smart task management with priorities & deadlines' },
              { icon: 'group', text: 'Team collaboration with real-time updates' },
              { icon: 'analytics', text: 'Productivity analytics & weekly reports' },
              { icon: 'sync', text: 'Offline-first with automatic cloud sync' },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                </div>
                <span className="text-sm text-text-secondary">{text}</span>
              </div>
            ))}
          </div>
          <blockquote className="border-l-2 border-primary pl-5">
            <p className="text-white text-lg font-medium leading-relaxed italic">
              "TaskMaster has completely transformed how our team collaborates."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold">AM</div>
              <div>
                <p className="text-sm font-semibold text-white">Alex Morgan</p>
                <p className="text-xs text-text-secondary">Product Lead at TechFlow</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">check_circle</span>
            </div>
            <span className="text-xl font-bold text-white">TaskMaster</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-text-secondary text-sm">
              {mode === 'login' ? 'Sign in to access your workspace.' :
               mode === 'signup' ? 'Start your productivity journey today.' :
               "We'll send you a reset link."}
            </p>
          </div>

          {/* Mode toggle */}
          {mode !== 'forgot' && (
            <div className="flex bg-surface-dark rounded-xl p-1 mb-6 border border-border-dark">
              {[['login', 'Log In'], ['signup', 'Sign Up']].map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setErrors({}) }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === m ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Social login */}
          {mode !== 'forgot' && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { provider: 'google', label: 'Google', icon: (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )},
                  { provider: 'apple', label: 'Apple', icon: (
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.29 0-1.02.52-2.11 1.28-2.93.81-.88 2.05-1.54 2.94-1.54.05 0 .16.01.28.01zm-4.66 5.4c-1.69 0-2.81.96-3.72.96-.94 0-1.95-.92-3.32-.92-2.31 0-4.52 2.07-4.52 5.25 0 3.52 3.15 8.79 5.86 8.79 1.34 0 1.83-.82 3.41-.82 1.63 0 2.12.82 3.45.82 2.49 0 4.88-4.25 4.88-6.68 0-.17-.03-.35-.06-.52-1.85-.75-3.03-2.5-3.03-4.44 0-2.49 2.02-3.83 2.13-3.9-1.33-1.88-3.15-2.09-3.79-2.12-1.46-.11-2.96.96-3.41.96z"/>
                    </svg>
                  )},
                  { provider: null, label: 'Microsoft', icon: (
                    <svg className="h-5 w-5" viewBox="0 0 23 23">
                      <path d="M0 0H10.8351V10.8351H0V0Z" fill="#F25022"/>
                      <path d="M12.1649 0H23V10.8351H12.1649V0Z" fill="#7FBA00"/>
                      <path d="M0 12.1649H10.8351V23H0V12.1649Z" fill="#00A4EF"/>
                      <path d="M12.1649 12.1649H23V23H12.1649V12.1649Z" fill="#FFB900"/>
                    </svg>
                  )},
                ].map(({ provider, label, icon }) => (
                  <button
                    key={label}
                    onClick={() => provider && handleSocialLogin(provider)}
                    disabled={!provider}
                    className="flex h-11 items-center justify-center rounded-lg border border-border-dark bg-surface-dark hover:bg-card-dark transition-colors disabled:opacity-40"
                    title={`Sign in with ${label}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center mb-5">
                <div className="flex-grow border-t border-border-dark" />
                <span className="flex-shrink-0 px-4 text-xs text-text-secondary uppercase tracking-wide">Or continue with email</span>
                <div className="flex-grow border-t border-border-dark" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-sm font-semibold text-slate-200 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Alex Johnson"
                  className="input-field"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-slate-200 block mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="name@example.com"
                className="input-field"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-200">Password</label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            )}
            {mode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  className="rounded border-border-dark bg-surface-dark text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-sm font-bold mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
            {mode === 'forgot' && (
              <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm text-text-secondary hover:text-white transition-colors">
                ← Back to login
              </button>
            )}
          </form>

          <p className="text-center text-xs text-text-secondary mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-slate-300 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-slate-300 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
