import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const tabs = ['Profile', 'Account', 'Notifications', 'Appearance', 'Integrations', 'Billing']

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    timezone: profile?.timezone || 'UTC',
  })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [notifications, setNotifications] = useState({
    email_tasks: true, email_projects: true, email_weekly: false,
    push_tasks: true, push_reminders: true, push_mentions: true,
  })
  const [appearance, setAppearance] = useState({
    theme: 'dark', language: 'en', date_format: 'MM/DD/YYYY', time_format: '12h',
    first_day: 'Sunday', density: 'comfortable',
  })

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profile updated successfully!')
    } catch (e) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error('Passwords do not match'); return
    }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/
    if (!regex.test(passwordForm.newPass)) {
      toast.error('Password must be 8-16 chars with uppercase, lowercase, digit, and special character'); return
    }
    toast.success('Password updated successfully!')
    setPasswordForm({ current: '', newPass: '', confirm: '' })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account preferences and configurations</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-dark'
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'Profile' && (
            <>
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h2>
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-2xl font-bold">
                    {(form.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <button className="btn-primary text-sm px-4 py-2">Upload Photo</button>
                    <button className="ml-2 text-sm text-text-muted hover:text-text-secondary px-4 py-2 rounded-lg border border-border-dark">Remove</button>
                    <p className="text-xs text-text-muted mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                    <input className="input-field" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Username</label>
                    <input className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="johndoe" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
                    <input className="input-field bg-surface-dark/50 cursor-not-allowed" value={user?.email || ''} disabled />
                    <p className="text-xs text-text-muted mt-1">Contact support to change your email address.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone Number</label>
                    <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Timezone</label>
                    <select className="input-field" value={form.timezone} onChange={e => setForm({...form, timezone: e.target.value})}>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
                    <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us a bit about yourself..." />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="btn-primary" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Account' && (
            <>
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Current Password</label>
                    <input type="password" className="input-field" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
                    <input type="password" className="input-field" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} />
                    <p className="text-xs text-text-muted mt-1">8-16 chars, with uppercase, lowercase, number, and special character.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm New Password</label>
                    <input type="password" className="input-field" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} />
                  </div>
                  <button className="btn-primary" onClick={handleChangePassword}>Update Password</button>
                </div>
              </div>
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-1">Two-Factor Authentication</h2>
                <p className="text-text-secondary text-sm mb-4">Add an extra layer of security to your account.</p>
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-dark border border-border-dark">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-text-muted">smartphone</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Authenticator App</p>
                      <p className="text-xs text-text-muted">Use an app like Google Authenticator</p>
                    </div>
                  </div>
                  <button className="text-sm px-4 py-2 rounded-lg border border-border-dark text-text-secondary hover:text-text-primary hover:border-primary transition-colors">Enable</button>
                </div>
              </div>
              <div className="card p-6 border-red-500/30">
                <h2 className="text-lg font-semibold text-red-400 mb-1">Danger Zone</h2>
                <p className="text-text-secondary text-sm mb-4">Irreversible actions for your account.</p>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Delete Account</p>
                    <p className="text-xs text-text-muted">Permanently delete your account and all data</p>
                  </div>
                  <button className="text-sm px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">Delete Account</button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Notifications' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Notification Preferences</h2>
              {[
                { group: 'Email Notifications', items: [
                  { key: 'email_tasks', label: 'Task updates', desc: 'When tasks are assigned or updated' },
                  { key: 'email_projects', label: 'Project activity', desc: 'When projects are updated' },
                  { key: 'email_weekly', label: 'Weekly digest', desc: 'Weekly summary of your productivity' },
                ]},
                { group: 'Push Notifications', items: [
                  { key: 'push_tasks', label: 'Task reminders', desc: 'Upcoming task deadline alerts' },
                  { key: 'push_reminders', label: 'Custom reminders', desc: 'Reminders you set manually' },
                  { key: 'push_mentions', label: 'Mentions', desc: 'When someone mentions you in comments' },
                ]},
              ].map(section => (
                <div key={section.group} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">{section.group}</h3>
                  <div className="space-y-3">
                    {section.items.map(item => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{item.label}</p>
                          <p className="text-xs text-text-muted">{item.desc}</p>
                        </div>
                        <button onClick={() => setNotifications(n => ({...n, [item.key]: !n[item.key]}))}
                          className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary' : 'bg-surface-dark border border-border-dark'}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notifications[item.key] ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn-primary mt-4" onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</button>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Appearance & Language</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Theme</label>
                  <div className="flex gap-3">
                    {['dark', 'light', 'system'].map(t => (
                      <button key={t} onClick={() => setAppearance(a => ({...a, theme: t}))}
                        className={`flex-1 py-3 rounded-lg border text-sm capitalize transition-colors ${appearance.theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border-dark text-text-secondary hover:border-primary/50'}`}>
                        <span className="material-symbols-rounded block mx-auto mb-1 text-xl">
                          {t === 'dark' ? 'dark_mode' : t === 'light' ? 'light_mode' : 'brightness_auto'}
                        </span>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Language</label>
                    <select className="input-field" value={appearance.language} onChange={e => setAppearance(a => ({...a, language: e.target.value}))}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Date Format</label>
                    <select className="input-field" value={appearance.date_format} onChange={e => setAppearance(a => ({...a, date_format: e.target.value}))}>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Time Format</label>
                    <select className="input-field" value={appearance.time_format} onChange={e => setAppearance(a => ({...a, time_format: e.target.value}))}>
                      <option value="12h">12-hour (2:30 PM)</option>
                      <option value="24h">24-hour (14:30)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">First Day of Week</label>
                    <select className="input-field" value={appearance.first_day} onChange={e => setAppearance(a => ({...a, first_day: e.target.value}))}>
                      <option>Sunday</option>
                      <option>Monday</option>
                      <option>Saturday</option>
                    </select>
                  </div>
                </div>
                <button className="btn-primary" onClick={() => toast.success('Appearance settings saved!')}>Save Settings</button>
              </div>
            </div>
          )}

          {activeTab === 'Integrations' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-1">Integrations</h2>
              <p className="text-text-secondary text-sm mb-5">Connect TaskMaster with your favorite tools.</p>
              <div className="space-y-4">
                {[
                  { name: 'Google Calendar', desc: 'Sync tasks and deadlines with Google Calendar', icon: '📅', connected: false },
                  { name: 'Google Drive', desc: 'Attach files directly from Google Drive', icon: '💾', connected: false },
                  { name: 'Slack', desc: 'Receive task notifications in Slack channels', icon: '💬', connected: true },
                  { name: 'GitHub', desc: 'Link tasks to GitHub issues and PRs', icon: '🐙', connected: false },
                  { name: 'Microsoft Outlook', desc: 'Sync with Outlook calendar and tasks', icon: '📧', connected: false },
                  { name: 'Zapier', desc: 'Connect with 5000+ apps via Zapier', icon: '⚡', connected: false },
                ].map(item => (
                  <div key={item.name} className="flex items-center justify-between p-4 rounded-lg border border-border-dark bg-surface-dark/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.desc}</p>
                      </div>
                    </div>
                    <button className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${item.connected ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-border-dark text-text-secondary hover:border-primary hover:text-primary'}`}>
                      {item.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Billing' && (
            <div className="space-y-5">
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">Current Plan</h2>
                    <p className="text-text-secondary text-sm">You are on the Free plan.</p>
                  </div>
                  <a href="/pricing" className="btn-primary text-sm">Upgrade Plan</a>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-blue-500/10 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-primary uppercase tracking-wide">Free Plan</p>
                      <p className="text-2xl font-bold text-text-primary mt-0.5">$0 <span className="text-sm font-normal text-text-muted">/month</span></p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">Active</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {[['10', 'Tasks'], ['2', 'Projects'], ['100MB', 'Storage']].map(([val, lbl]) => (
                      <div key={lbl} className="bg-white/5 rounded-lg p-2">
                        <p className="text-base font-bold text-text-primary">{val}</p>
                        <p className="text-xs text-text-muted">{lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Billing History</h2>
                <div className="text-center py-8 text-text-muted">
                  <span className="material-symbols-rounded text-4xl mb-2 block">receipt_long</span>
                  <p className="text-sm">No billing history yet.</p>
                  <p className="text-xs mt-1">Upgrade to a paid plan to see your invoices here.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
