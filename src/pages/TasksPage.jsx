import { useState, useMemo } from 'react'
import { useTask } from '../contexts/TaskContext'
import { useAuth } from '../contexts/AuthContext'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const STATUSES = ['todo', 'in_progress', 'in_review', 'done']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUS_LABELS = { todo: 'To-Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
const PRIORITY_ICONS = { low: 'text-blue-400', medium: 'text-amber-400', high: 'text-red-400', urgent: 'text-rose-500' }

function TaskForm({ onClose, editTask = null }) {
  const { createTask, updateTask, categories, projects } = useTask()
  const { user } = useAuth()
  const [form, setForm] = useState({
    task_name: editTask?.task_name || '',
    task_summary: editTask?.task_summary || '',
    status: editTask?.status || 'todo',
    priority: editTask?.priority || 'medium',
    deadline: editTask?.deadline ? editTask.deadline.slice(0, 16) : '',
    category_id: editTask?.category_id || '',
    project_id: editTask?.project_id || '',
    is_recurring: editTask?.is_recurring || false,
  })
  const [loading, setLoading] = useState(false)
  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.task_name.trim()) { toast.error('Task name is required'); return }
    setLoading(true)
    const payload = {
      ...form,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      category_id: form.category_id || null,
      project_id: form.project_id || null,
    }
    const { error } = editTask
      ? await updateTask(editTask.id, payload)
      : await createTask(payload)
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success(editTask ? 'Task updated!' : 'Task created!')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111318] rounded-2xl border border-border-dark w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border-dark">
          <h2 className="text-lg font-bold text-white">{editTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Task name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Task Name *</label>
            <input
              value={form.task_name}
              onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))}
              placeholder="What needs to be done?"
              className="input-field text-lg font-semibold"
              maxLength={50}
            />
          </div>
          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Description</label>
            <textarea
              value={form.task_summary}
              onChange={e => setForm(f => ({ ...f, task_summary: e.target.value }))}
              placeholder="Add details about this task..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field appearance-none">
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Priority</label>
              <div className="flex gap-1 bg-surface-dark rounded-lg p-1 border border-border-dark">
                {PRIORITIES.map(p => (
                  <button key={p} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded capitalize transition-all ${
                      form.priority === p ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-white'
                    }`}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          {/* Row: Deadline + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="input-field"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="input-field appearance-none">
                <option value="">No Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          {/* Project */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Project</label>
            <select value={form.project_id} onChange={e => setForm(f => ({ ...f, project_id: e.target.value }))} className="input-field appearance-none">
              <option value="">No Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
          </div>
          {/* Subtasks */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary block mb-2">Subtasks</label>
            <div className="space-y-2 mb-2">
              {subtasks.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-surface-dark rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-[16px] text-text-secondary">drag_indicator</span>
                  <span className="flex-1 text-sm text-white">{s}</span>
                  <button type="button" onClick={() => setSubtasks(prev => prev.filter((_, j) => j !== i))} className="text-text-secondary hover:text-red-400">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSubtask.trim()) { setSubtasks(p => [...p, newSubtask.trim()]); setNewSubtask('') } } }}
                placeholder="Add subtask and press Enter..."
                className="input-field flex-1 text-sm"
              />
            </div>
          </div>
          {/* Recurring */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, is_recurring: !f.is_recurring }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.is_recurring ? 'bg-primary' : 'bg-surface-dark border border-border-dark'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_recurring ? 'translate-x-6' : 'translate-x-1'}`}/>
            </div>
            <span className="text-sm text-white">Recurring task</span>
          </label>
          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border-dark">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TasksPage({ showForm: initShowForm = false }) {
  const { tasks, updateTask, deleteTask, loading } = useTask()
  const [showForm, setShowForm] = useState(initShowForm)
  const [editTask, setEditTask] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('deadline')

  const filtered = useMemo(() => {
    let list = [...tasks]
    if (search) list = list.filter(t => t.task_name.toLowerCase().includes(search.toLowerCase()))
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus)
    if (filterPriority !== 'all') list = list.filter(t => t.priority === filterPriority)
    list.sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline || 9e15) - new Date(b.deadline || 9e15)
      if (sortBy === 'priority') return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority)
      return new Date(b.created_at) - new Date(a.created_at)
    })
    return list
  }, [tasks, search, filterStatus, filterPriority, sortBy])

  const toggleStatus = async (task) => {
    const next = task.status === 'done' ? 'todo' : 'done'
    const { error } = await updateTask(task.id, {
      status: next,
      completed_at: next === 'done' ? new Date().toISOString() : null
    })
    if (!error) toast.success(next === 'done' ? 'Task completed! 🎉' : 'Task reopened')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    const { error } = await deleteTask(id)
    if (!error) toast.success('Task deleted')
    else toast.error('Failed to delete task')
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {(showForm || editTask) && (
        <TaskForm
          onClose={() => { setShowForm(false); setEditTask(null) }}
          editTask={editTask}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">All Tasks</h1>
          <p className="text-text-secondary mt-1">{filtered.length} tasks · {tasks.filter(t=>t.status==='done').length} completed</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto text-sm appearance-none px-3">
            <option value="all">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input-field w-auto text-sm appearance-none px-3">
            <option value="all">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-auto text-sm appearance-none px-3">
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="created">Sort: Newest</option>
          </select>
        </div>
      </div>

      {/* Task table */}
      <div className="rounded-xl border border-border-dark overflow-hidden bg-[#111318]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-dark bg-surface-dark/50">
              <th className="py-3 px-4 w-10"><input type="checkbox" className="rounded border-border-dark bg-transparent text-primary focus:ring-primary w-4 h-4" /></th>
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Task Name</th>
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">Status</th>
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hidden lg:table-cell">Priority</th>
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hidden lg:table-cell">Due Date</th>
              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary hidden xl:table-cell">Category</th>
              <th className="py-3 px-4 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark">
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center">
                <div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-text-secondary">
                <span className="material-symbols-outlined text-4xl block mb-2">inbox</span>
                No tasks found. Create your first task!
              </td></tr>
            ) : filtered.map(task => {
              const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done'
              const isDone = task.status === 'done'
              return (
                <tr key={task.id} className="hover:bg-surface-dark/30 transition-colors group">
                  <td className="py-3 px-4">
                    <button onClick={() => toggleStatus(task)} className="text-text-secondary hover:text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        {isDone ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <p className={`text-sm font-medium ${isDone ? 'line-through text-text-secondary' : 'text-white'}`}>
                      {task.task_name}
                    </p>
                    {task.task_summary && <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs hidden lg:block">{task.task_summary}</p>}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`badge-status status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className={`material-symbols-outlined text-[16px] ${PRIORITY_ICONS[task.priority]}`}>flag</span>
                      <span className="text-sm text-white capitalize">{task.priority}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : isDone ? 'text-text-secondary line-through' : 'text-white'}`}>
                      {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : '—'}
                      {isOverdue && ' · Overdue'}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    {task.category ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-surface-dark text-text-secondary border border-border-dark">
                        {task.category.title}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditTask(task); setShowForm(true) }}
                        className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="w-7 h-7 rounded flex items-center justify-center text-text-secondary hover:text-red-400 hover:bg-red-400/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="border-t border-border-dark px-4 py-3 flex justify-between items-center text-xs text-text-secondary">
            <span>Showing {filtered.length} of {tasks.length} tasks</span>
          </div>
        )}
      </div>
    </div>
  )
}
