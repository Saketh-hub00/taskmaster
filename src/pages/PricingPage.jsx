import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const plans = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    description: 'Perfect for individuals getting started with task management.',
    color: 'border-border-dark',
    badge: null,
    features: [
      'Up to 10 active tasks',
      '2 projects',
      '1 user',
      '100MB storage',
      'Basic task management',
      'Calendar view',
      'Mobile app access',
    ],
    missing: ['Advanced analytics', 'Team collaboration', 'Integrations', 'Priority support', 'Custom categories'],
  },
  {
    name: 'Premium',
    monthly: 9.99,
    annual: 7.99,
    description: 'For power users who need advanced features and more capacity.',
    color: 'border-primary',
    badge: 'Most Popular',
    features: [
      'Unlimited tasks',
      '20 projects',
      '1 user',
      '10GB storage',
      'Advanced analytics',
      'Recurring tasks',
      'File attachments',
      'Calendar sync (Google, Outlook)',
      'Custom categories & colors',
      'Priority email support',
      'Export reports (PDF, CSV)',
    ],
    missing: ['Team collaboration', 'Admin dashboard'],
  },
  {
    name: 'Enterprise',
    monthly: 24.99,
    annual: 19.99,
    description: 'For teams that need collaboration, security, and scale.',
    color: 'border-purple-500',
    badge: 'Best Value',
    features: [
      'Everything in Premium',
      'Unlimited projects',
      'Up to 25 team members',
      '100GB storage',
      'Team task assignment',
      'Role-based access control',
      'Admin dashboard',
      'Slack & GitHub integrations',
      'Audit logs',
      'SSO / SAML',
      'Dedicated account manager',
      '24/7 priority support',
    ],
    missing: [],
  },
]

const faqs = [
  { q: 'Can I upgrade or downgrade at any time?', a: 'Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades will apply at the start of your next billing cycle.' },
  { q: 'Is there a free trial for paid plans?', a: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start your trial.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. All payments are processed securely via Stripe.' },
  { q: 'What happens to my data if I cancel?', a: 'Your data is retained for 30 days after cancellation, giving you time to export it. After that, it is permanently deleted.' },
  { q: 'Do you offer discounts for nonprofits or students?', a: 'Yes! We offer 50% off for verified nonprofits and 30% off for students. Contact our support team to apply.' },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSelectPlan = (plan) => {
    if (!user) { navigate('/auth'); return }
    if (plan === 'Free') { toast.success('You are on the Free plan'); return }
    toast.success(`Redirecting to checkout for the ${plan} plan...`)
  }

  return (
    <div className="min-h-screen bg-background-dark text-text-primary">
      {/* Header */}
      <div className="border-b border-border-dark px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-lg">TaskMaster</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">Go to App</button>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="text-sm text-text-secondary hover:text-text-primary">Sign In</button>
              <button onClick={() => navigate('/auth')} className="btn-primary text-sm">Get Started</button>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">Pricing</span>
        <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
        <p className="text-text-secondary text-lg max-w-xl mx-auto">Start for free. Upgrade when you need more power. No hidden fees.</p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm ${!annual ? 'text-text-primary font-medium' : 'text-text-muted'}`}>Monthly</span>
          <button onClick={() => setAnnual(a => !a)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-primary' : 'bg-surface-dark border border-border-dark'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${annual ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm ${annual ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
            Annual <span className="ml-1 px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-xs font-semibold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className={`relative card p-6 flex flex-col border-2 ${plan.color} ${plan.name === 'Premium' ? 'shadow-lg shadow-primary/10' : ''}`}>
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white ${plan.name === 'Premium' ? 'bg-primary' : 'bg-purple-500'}`}>
                  {plan.badge}
                </span>
              )}
              <div className="mb-5">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="text-text-muted text-sm mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${annual ? plan.annual : plan.monthly}</span>
                  <span className="text-text-muted text-sm ml-1">/month</span>
                  {annual && plan.monthly > 0 && (
                    <p className="text-xs text-text-muted mt-0.5">Billed annually at ${(plan.annual * 12).toFixed(2)}/yr</p>
                  )}
                </div>
              </div>
              <button onClick={() => handleSelectPlan(plan.name)}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm mb-6 transition-all ${plan.name === 'Premium' ? 'btn-primary' : plan.name === 'Enterprise' ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'border border-border-dark text-text-secondary hover:border-primary hover:text-primary'}`}>
                {plan.monthly === 0 ? 'Get Started Free' : 'Start 14-day Trial'}
              </button>
              <div className="flex-1 space-y-2.5">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="material-symbols-rounded text-green-400 text-base mt-0.5 flex-shrink-0">check_circle</span>
                    <span className="text-text-primary">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="material-symbols-rounded text-text-muted text-base mt-0.5 flex-shrink-0">cancel</span>
                    <span className="text-text-muted line-through">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left p-4 text-text-secondary font-medium">Feature</th>
                  {plans.map(p => (
                    <th key={p.name} className="text-center p-4 text-text-secondary font-medium">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Active Tasks', '10', 'Unlimited', 'Unlimited'],
                  ['Projects', '2', '20', 'Unlimited'],
                  ['Team Members', '1', '1', '25'],
                  ['Storage', '100MB', '10GB', '100GB'],
                  ['File Attachments', '✗', '✓', '✓'],
                  ['Analytics & Reports', '✗', '✓', '✓'],
                  ['Calendar Sync', '✗', '✓', '✓'],
                  ['Recurring Tasks', '✗', '✓', '✓'],
                  ['Team Collaboration', '✗', '✗', '✓'],
                  ['Admin Dashboard', '✗', '✗', '✓'],
                  ['Integrations', '✗', 'Basic', 'Full'],
                  ['Support', 'Community', 'Email', '24/7 Priority'],
                ].map(([feature, ...vals]) => (
                  <tr key={feature} className="border-b border-border-dark/50 hover:bg-surface-dark/30 transition-colors">
                    <td className="p-4 text-text-secondary">{feature}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`p-4 text-center font-medium ${v === '✗' ? 'text-text-muted' : v === '✓' ? 'text-green-400' : 'text-text-primary'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card">
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-medium text-text-primary">{faq.q}</span>
                  <span className={`material-symbols-rounded text-text-muted transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-5 text-sm text-text-secondary">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center py-12 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/10 border border-primary/20">
          <h2 className="text-3xl font-bold mb-2">Ready to boost your productivity?</h2>
          <p className="text-text-secondary mb-6">Join thousands of users already using TaskMaster.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/auth')} className="btn-primary px-6 py-2.5 text-sm font-semibold">Start for Free</button>
            <button onClick={() => handleSelectPlan('Premium')} className="px-6 py-2.5 rounded-xl border border-border-dark text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors">Try Premium</button>
          </div>
          <p className="text-xs text-text-muted mt-4">No credit card required · Cancel anytime</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border-dark py-6 px-6 flex items-center justify-between text-xs text-text-muted">
        <span>© 2025 TaskMaster. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-text-secondary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-text-secondary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-text-secondary transition-colors">Contact</a>
        </div>
      </div>
    </div>
  )
}
