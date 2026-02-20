import { useState } from 'react'
import toast from 'react-hot-toast'

const categories = [
  { icon: 'task_alt', label: 'Task Management', count: 12 },
  { icon: 'folder_open', label: 'Projects', count: 8 },
  { icon: 'calendar_month', label: 'Calendar & Reminders', count: 6 },
  { icon: 'group', label: 'Team & Collaboration', count: 9 },
  { icon: 'account_circle', label: 'Account & Billing', count: 11 },
  { icon: 'integration_instructions', label: 'Integrations', count: 7 },
]

const faqs = [
  {
    category: 'Getting Started',
    items: [
      { q: 'How do I create my first task?', a: 'Click the "+ New Task" button in the top right of the Tasks page, or use the keyboard shortcut Ctrl+N (Cmd+N on Mac). Fill in the task name, priority, and deadline, then click Save.' },
      { q: 'How do I organize tasks into projects?', a: 'From the Projects page, create a new project and assign it a category and color. When creating or editing tasks, use the Project dropdown to assign them to your project.' },
      { q: 'What are the different task statuses?', a: 'TaskMaster uses four statuses: To-Do (not started), In Progress (actively working), In Review (awaiting review/approval), and Done (completed). You can update status from the task list, Kanban board, or task details.' },
      { q: 'How do I set up recurring tasks?', a: 'When creating or editing a task, toggle the "Recurring" switch and select your frequency (daily, weekly, monthly, etc.). The task will automatically recreate itself after completion.' },
    ]
  },
  {
    category: 'Account & Billing',
    items: [
      { q: 'How do I upgrade my plan?', a: 'Go to Settings > Billing, or visit the Pricing page. Click "Upgrade Plan" and select your desired plan. You\'ll be redirected to our secure Stripe checkout.' },
      { q: 'Can I export my data?', a: 'Yes! Premium and Enterprise users can export tasks, projects, and reports as PDF or CSV. Go to Settings > Account > Export Data.' },
      { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from Settings > Billing > Cancel Subscription. Your plan remains active until the end of the current billing period.' },
    ]
  },
]

const statusItems = [
  { service: 'Web Application', status: 'operational', uptime: '99.97%' },
  { service: 'Mobile App (iOS)', status: 'operational', uptime: '99.95%' },
  { service: 'Mobile App (Android)', status: 'operational', uptime: '99.94%' },
  { service: 'API', status: 'operational', uptime: '99.99%' },
  { service: 'Database', status: 'operational', uptime: '99.99%' },
  { service: 'File Storage', status: 'degraded', uptime: '98.12%' },
  { service: 'Email Notifications', status: 'operational', uptime: '99.89%' },
  { service: 'Push Notifications', status: 'operational', uptime: '99.76%' },
]

const statusColor = (s) => s === 'operational' ? 'bg-green-400' : s === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
const statusLabel = (s) => s === 'operational' ? 'text-green-400' : s === 'degraded' ? 'text-yellow-400' : 'text-red-400'

export default function HelpPage() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [activeSection, setActiveSection] = useState('help-center')
  const [contactForm, setContactForm] = useState({ subject: '', message: '', priority: 'normal' })
  const [submitting, setSubmitting] = useState(false)

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  const handleSubmitTicket = async () => {
    if (!contactForm.subject || !contactForm.message) { toast.error('Please fill in all fields'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    toast.success('Support ticket submitted! We\'ll respond within 24 hours.')
    setContactForm({ subject: '', message: '', priority: 'normal' })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Help & Support</h1>
        <p className="text-text-secondary mt-1">Find answers, contact support, or check system status</p>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-dark border border-border-dark mb-6 w-fit">
        {[
          { id: 'help-center', label: 'Help Center', icon: 'help' },
          { id: 'contact', label: 'Contact Support', icon: 'support_agent' },
          { id: 'status', label: 'System Status', icon: 'monitor_heart' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === tab.id ? 'bg-background-dark text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>
            <span className="material-symbols-rounded text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'help-center' && (
        <>
          {/* Search */}
          <div className="relative mb-8">
            <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">search</span>
            <input
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-dark border border-border-dark text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="Search help articles..." value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Categories */}
          {!search && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {categories.map(cat => (
                <button key={cat.label} className="card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors text-left group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-rounded text-primary text-xl">{cat.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{cat.label}</p>
                    <p className="text-xs text-text-muted">{cat.count} articles</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* FAQs */}
          <div className="space-y-6">
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 text-text-muted">
                <span className="material-symbols-rounded text-4xl block mb-2">search_off</span>
                <p className="text-sm">No articles found for "{search}"</p>
                <p className="text-xs mt-1">Try different keywords or contact support below</p>
              </div>
            )}
            {filteredFaqs.map(cat => (
              <div key={cat.category}>
                <h2 className="text-base font-semibold text-text-primary mb-3">{cat.category}</h2>
                <div className="space-y-2">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.category}-${idx}`
                    return (
                      <div key={key} className="card">
                        <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setOpenFaq(openFaq === key ? null : key)}>
                          <span className="font-medium text-text-primary text-sm">{item.q}</span>
                          <span className={`material-symbols-rounded text-text-muted text-base transition-transform flex-shrink-0 ml-3 ${openFaq === key ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        {openFaq === key && (
                          <p className="px-4 pb-4 text-sm text-text-secondary leading-relaxed">{item.a}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          {!search && (
            <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/5 border border-primary/20">
              <h3 className="text-base font-semibold text-text-primary mb-1">Can't find what you're looking for?</h3>
              <p className="text-text-secondary text-sm mb-3">Our support team is ready to help you.</p>
              <button onClick={() => setActiveSection('contact')} className="btn-primary text-sm">Contact Support</button>
            </div>
          )}
        </>
      )}

      {activeSection === 'contact' && (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Submit a Support Ticket</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Subject</label>
                  <input className="input-field" placeholder="Brief description of your issue"
                    value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Priority</label>
                  <select className="input-field" value={contactForm.priority} onChange={e => setContactForm({...contactForm, priority: e.target.value})}>
                    <option value="low">Low - General question or feedback</option>
                    <option value="normal">Normal - Issue affecting my workflow</option>
                    <option value="high">High - Critical issue, work blocked</option>
                    <option value="urgent">Urgent - Complete outage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Message</label>
                  <textarea className="input-field resize-none" rows={6} placeholder="Describe your issue in detail. Include steps to reproduce if applicable."
                    value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Attachments (optional)</label>
                  <div className="border-2 border-dashed border-border-dark rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
                    <span className="material-symbols-rounded text-3xl text-text-muted block mb-1">upload_file</span>
                    <p className="text-sm text-text-muted">Drag & drop or click to upload</p>
                    <p className="text-xs text-text-muted mt-0.5">PNG, JPG, PDF up to 10MB</p>
                  </div>
                </div>
                <button className="btn-primary w-full" onClick={handleSubmitTicket} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-2 space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-text-primary mb-3">Response Times</h3>
              <div className="space-y-3">
                {[
                  { label: 'Low Priority', time: '3-5 business days', color: 'text-blue-400' },
                  { label: 'Normal Priority', time: '1-2 business days', color: 'text-green-400' },
                  { label: 'High Priority', time: 'Within 24 hours', color: 'text-yellow-400' },
                  { label: 'Urgent (Enterprise)', time: 'Within 4 hours', color: 'text-red-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                    <span className="text-xs text-text-muted">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-text-primary mb-3">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                {[
                  { icon: 'mail', label: 'Email Us', value: 'support@taskmaster.app' },
                  { icon: 'chat', label: 'Live Chat', value: 'Available 9am–5pm EST' },
                  { icon: 'people', label: 'Community Forum', value: 'community.taskmaster.app' },
                  { icon: 'video_call', label: 'Enterprise Calls', value: 'By appointment' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="material-symbols-rounded text-primary text-base mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.label}</p>
                      <p className="text-xs text-text-muted">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5 bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-rounded text-purple-400">workspace_premium</span>
                <h3 className="font-semibold text-text-primary">Enterprise Support</h3>
              </div>
              <p className="text-xs text-text-secondary mb-3">Get a dedicated account manager and 24/7 priority support.</p>
              <button className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'status' && (
        <div className="space-y-6">
          {/* Overall status */}
          <div className={`card p-5 border-green-500/30 bg-green-500/5`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
                <span className="material-symbols-rounded text-green-400">check_circle</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">All Systems Operational</h2>
                <p className="text-sm text-text-secondary">Last checked: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Service status */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-dark">
              <h2 className="font-semibold text-text-primary">Service Status</h2>
            </div>
            <div className="divide-y divide-border-dark/50">
              {statusItems.map(item => (
                <div key={item.service} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColor(item.status)} ${item.status === 'operational' ? '' : 'animate-pulse'}`} />
                    <span className="text-sm text-text-primary">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-text-muted">{item.uptime} uptime</span>
                    <span className={`text-xs font-medium capitalize ${statusLabel(item.status)}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uptime chart */}
          <div className="card p-5">
            <h2 className="font-semibold text-text-primary mb-3">90-Day Uptime</h2>
            <div className="flex items-end gap-0.5 h-12">
              {Array.from({length: 90}, (_, i) => {
                const val = Math.random() > 0.04 ? 1 : 0.5
                return (
                  <div key={i} className={`flex-1 rounded-sm ${val === 1 ? 'bg-green-500' : 'bg-yellow-500'} hover:opacity-80 cursor-pointer`}
                    style={{height: `${val * 100}%`}} title={`Day ${i+1}: ${val === 1 ? 'Operational' : 'Degraded'}`} />
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-text-muted mt-2">
              <span>90 days ago</span>
              <span className="text-green-400 font-medium">99.8% uptime overall</span>
              <span>Today</span>
            </div>
          </div>

          {/* Incidents */}
          <div className="card p-5">
            <h2 className="font-semibold text-text-primary mb-3">Recent Incidents</h2>
            <div className="space-y-3">
              {[
                { date: 'Feb 14, 2025', title: 'File Storage Degraded Performance', status: 'Investigating', severity: 'minor' },
                { date: 'Jan 28, 2025', title: 'API Latency Spike', status: 'Resolved', severity: 'minor' },
                { date: 'Jan 10, 2025', title: 'Scheduled Maintenance', status: 'Resolved', severity: 'maintenance' },
              ].map(inc => (
                <div key={inc.date} className="flex items-start gap-3 p-3 rounded-lg bg-surface-dark/30">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${inc.status === 'Resolved' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary truncate">{inc.title}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${inc.status === 'Resolved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{inc.status}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{inc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
