import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTask } from '../contexts/TaskContext'
import toast from 'react-hot-toast'

function ProjectForm({ onClose }) {
  const { createProject, categories } = useTask()
  const [form, setForm] = useState({
    project_name: '', description: '', category_id: '',
    start_date: '', end_date: '', color_code: '#135bec', is_team_project: false, status: 'active'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.project_name.trim()) { toast.error('Project name is required'); return }
    setLoading(true)
    const { error } = await createProject({
      ...form,
      category_id: form.category_id || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Project created!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111318] rounded-2xl border border-border-dark w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border-dark">
          <h2 className="text-lg font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Project Name *</label>
            <input value={form.project_name} onChange={e => setForm(f=>({...f,project_name:e.target.value}))}
              placeholder="Website Redesign" className="input-field" maxLength={50} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
              rows={2} placeholder="What's this project about?" className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f=>({...f,start_date:e.target.value}))} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">End Date</label>
              <input type="date" value={form.end_date} min={form.start_date} onChange={e => setForm(f=>({...f,end_date:e.target.value}))} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Category</label>
              <select value={form.category_id} onChange={e => setForm(f=>({...f,category_id:e.target.value}))} className="input-field appearance-none">
                <option value="">No Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-1.5">Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.color_code} onChange={e => setForm(f=>({...f,color_code:e.target.value}))}
                  className="w-10 h-10 rounded-lg border border-border-dark bg-surface-dark cursor-pointer" />
                <input value={form.color_code} onChange={e => setForm(f=>({...f,color_code:e.target.value}))} className="input-field flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm(f=>({...f,is_team_project:!f.is_team_project}))}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.is_team_project ? 'bg-primary' : 'bg-surface-dark border border-border-dark'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_team_project ? 'translate-x-6' : 'translate-x-1'}`}/>
            </div>
            <span className="text-sm text-white">Team project</span>
            <span className="text-xs text-text-secondary">(Premium/Enterprise)</span>
          </label>
          <div className="flex gap-3 pt-2 border-t border-border-dark">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const STATUS_CONFIG = {
  active:    { label: 'Active',     className: 'bg-green-500/10 text-green-400 ring-green-500/20' },
  in_review: { label: 'In Review',  className: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' },
  completed: { label: 'Completed',  className: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
  delayed:   { label: 'Delayed',    className: 'bg-red-500/10 text-red-400 ring-red-500/20' },
  on_hold:   { label: 'On Hold',    className: 'bg-slate-500/10 text-slate-400 ring-slate-500/20' },
}

export default function ProjectsPage() {
  const { projects, categories, loading, getProjectProgress } = useTask()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {showForm && <ProjectForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-text-secondary mt-1">{projects.length} total projects</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: projects.length, icon: 'folder', color: 'text-primary' },
          { label: 'Active', value: projects.filter(p=>p.status==='active').length, icon: 'play_circle', color: 'text-green-400' },
          { label: 'Completed', value: projects.filter(p=>p.status==='completed').length, icon: 'task_alt', color: 'text-blue-400' },
          { label: 'Delayed', value: projects.filter(p=>p.status==='delayed').length, icon: 'warning', color: 'text-red-400' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card text-center">
            <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            <p className="text-text-secondary text-sm">{label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Categories</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="card hover:border-primary/40 transition-colors cursor-pointer group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: cat.color_code + '20' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: cat.color_code }}>{cat.icon || 'folder'}</span>
              </div>
              <p className="text-white font-semibold text-sm">{cat.title}</p>
              <p className="text-text-secondary text-xs mt-0.5">
                {projects.filter(p => p.category_id === cat.id).length} projects
              </p>
              <div className="mt-2 h-1 rounded-full bg-surface-dark">
                <div className="h-1 rounded-full transition-all" style={{ width: '60%', background: cat.color_code }} />
              </div>
            </div>
          ))}
          <button className="card flex flex-col items-center justify-center gap-2 border-dashed hover:border-primary hover:bg-primary/5 cursor-pointer transition-all min-h-[100px]">
            <div className="w-9 h-9 rounded-full bg-surface-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-text-secondary">add</span>
            </div>
            <span className="text-sm text-text-secondary">New Category</span>
          </button>
        </div>
      </div>

      {/* Projects table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">All Projects</h3>
          <div className="flex gap-1 bg-surface-dark rounded-lg p-1 border border-border-dark">
            {['all', 'active', 'in_review', 'completed'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  filter === s ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'
                }`}
              >{s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}</button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border-dark overflow-hidden bg-[#111318]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-dark bg-surface-dark/50">
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Project</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Status</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">Deadline</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Progress</th>
                <th className="py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-text-secondary">
                  <span className="material-symbols-outlined text-4xl block mb-2">folder_open</span>
                  No projects yet. Create your first project!
                </td></tr>
              ) : filtered.map(project => {
                const progress = getProjectProgress(project)
                const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.active
                return (
                  <tr key={project.id} className="hover:bg-surface-dark/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: (project.color_code || '#135bec') + '25' }}>
                          <span className="material-symbols-outlined text-[16px]" style={{ color: project.color_code || '#135bec' }}>folder</span>
                        </div>
                        <div>
                          <Link to={`/projects/${project.id}`} className="text-sm font-semibold text-white hover:text-primary">{project.project_name}</Link>
                          {project.category && (
                            <p className="text-xs text-text-secondary mt-0.5">{project.category.title}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`badge-status ring-1 ${sc.className}`}>{sc.label}</span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-sm text-text-secondary">
                      {project.end_date || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-surface-dark rounded-full overflow-hidden min-w-[80px]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: project.color_code || '#135bec' }} />
                        </div>
                        <span className="text-xs text-text-secondary w-8">{progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/projects/${project.id}`}>
                        <button className="text-text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
