import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTask } from '../contexts/TaskContext'
import { format, isAfter } from 'date-fns'
import toast from 'react-hot-toast'

const priorityColors = {
  low: 'priority-low', medium: 'priority-medium', high: 'priority-high', urgent: 'priority-urgent'
}
const statusColors = {
  'to-do': 'status-todo', 'in-progress': 'status-in_progress', 'in-review': 'status-in_review', 'done': 'status-done'
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { projects, tasks, categories, updateTask, deleteTask, createTask } = useTask()
  const [activeTab, setActiveTab] = useState('tasks')
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ name: '', priority: 'medium', status: 'to-do', deadline: '' })

  const project = projects.find(p => p.id === id)
  const projectTasks = tasks.filter(t => t.project_id === id)
  const category = categories.find(c => c.id === project?.category_id)

  if (!project) return (
    <div className="p-6 text-center text-text-muted">
      <span className="material-symbols-rounded text-4xl block mb-2">folder_off</span>
      <p>Project not found</p>
      <Link to="/projects" className="text-primary text-sm hover:underline mt-2 inline-block">← Back to Projects</Link>
    </div>
  )

  const completedCount = projectTasks.filter(t => t.status === 'done').length
  const progress = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0
  const overdueTasks = projectTasks.filter(t => t.deadline && isAfter(new Date(), new Date(t.deadline)) && t.status !== 'done')

  const statusCounts = { 'to-do': 0, 'in-progress': 0, 'in-review': 0, 'done': 0 }
  projectTasks.forEach(t => { if (statusCounts[t.status] !== undefined) statusCounts[t.status]++ })

  const handleAddTask = async () => {
    if (!newTask.name.trim()) { toast.error('Task name is required'); return }
    await createTask({ ...newTask, project_id: id })
    setNewTask({ name: '', priority: 'medium', status: 'to-do', deadline: '' })
    setShowAddTask(false)
    toast.success('Task added!')
  }

  const handleToggleDone = async (task) => {
    await updateTask(task.id, { status: task.status === 'done' ? 'to-do' : 'done' })
  }

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId)
    toast.success('Task deleted')
  }

  const projectColor = project.color || '#135bec'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <Link to="/projects" className="hover:text-text-secondary transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-text-primary">{project.name}</span>
      </div>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{backgroundColor: projectColor + '22', border: `2px solid ${projectColor}44`}}>
              <span className="material-symbols-rounded text-2xl" style={{color: projectColor}}>folder</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
              {project.description && <p className="text-text-secondary mt-1 text-sm max-w-lg">{project.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                {category && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-base">label</span>
                    {category.name}
                  </span>
                )}
                {project.start_date && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-base">calendar_today</span>
                    {format(new Date(project.start_date), 'MMM d')} — {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'Ongoing'}
                  </span>
                )}
                {project.is_team_project && (
                  <span className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-rounded text-base">group</span>
                    Team Project
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-sm flex items-center gap-1.5">
              <span className="material-symbols-rounded text-base">edit</span>
              Edit
            </button>
            <button onClick={() => setShowAddTask(true)} className="btn-primary text-sm flex items-center gap-1.5">
              <span className="material-symbols-rounded text-base">add</span>
              Add Task
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-text-secondary">Overall Progress</span>
            <span className="text-sm font-bold" style={{color: projectColor}}>{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-dark">
            <div className="h-full rounded-full transition-all duration-700" style={{width: `${progress}%`, backgroundColor: projectColor}} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Total Tasks', value: projectTasks.length, icon: 'task_alt', color: 'text-text-primary' },
            { label: 'Completed', value: completedCount, icon: 'check_circle', color: 'text-green-400' },
            { label: 'In Progress', value: statusCounts['in-progress'], icon: 'pending', color: 'text-blue-400' },
            { label: 'Overdue', value: overdueTasks.length, icon: 'warning', color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-dark/40 rounded-xl p-3 text-center border border-border-dark/50">
              <span className={`material-symbols-rounded text-xl ${stat.color}`}>{stat.icon}</span>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-dark border border-border-dark mb-5 w-fit">
        {['tasks', 'overview', 'activity'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-background-dark text-text-primary shadow' : 'text-text-muted hover:text-text-secondary'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <>
          {showAddTask && (
            <div className="card p-5 mb-4 border-primary/30">
              <h3 className="text-sm font-semibold text-text-primary mb-4">New Task</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input className="input-field" placeholder="Task name (max 50 characters)" maxLength={50}
                    value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} autoFocus />
                </div>
                <div>
                  <select className="input-field" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})}>
                    <option value="to-do">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="in-review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <select className="input-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <input type="datetime-local" className="input-field" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn-primary text-sm" onClick={handleAddTask}>Add Task</button>
                <button className="btn-secondary text-sm" onClick={() => setShowAddTask(false)}>Cancel</button>
              </div>
            </div>
          )}

          {projectTasks.length === 0 ? (
            <div className="card p-12 text-center">
              <span className="material-symbols-rounded text-5xl text-text-muted block mb-3">task_alt</span>
              <p className="text-text-secondary font-medium">No tasks yet</p>
              <p className="text-sm text-text-muted mt-1">Add your first task to get started</p>
              <button className="btn-primary mt-4 text-sm" onClick={() => setShowAddTask(true)}>Add Task</button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-dark text-left">
                    <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wide w-8"></th>
                    <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Task</th>
                    <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Status</th>
                    <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Priority</th>
                    <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wide">Due Date</th>
                    <th className="p-4 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {projectTasks.map(task => {
                    const isOverdue = task.deadline && isAfter(new Date(), new Date(task.deadline)) && task.status !== 'done'
                    return (
                      <tr key={task.id} className={`border-b border-border-dark/50 hover:bg-surface-dark/30 transition-colors ${isOverdue ? 'bg-red-500/3' : ''}`}>
                        <td className="pl-4">
                          <button onClick={() => handleToggleDone(task)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'done' ? 'border-green-400 bg-green-400' : 'border-border-dark hover:border-primary'}`}>
                            {task.status === 'done' && <span className="material-symbols-rounded text-white text-xs">check</span>}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-medium ${task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.name}</span>
                        </td>
                        <td className="p-4">
                          <span className={`status-badge ${statusColors[task.status] || 'status-todo'}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`priority-badge ${priorityColors[task.priority] || 'priority-medium'}`}>{task.priority}</span>
                        </td>
                        <td className="p-4">
                          {task.deadline ? (
                            <span className={`text-xs ${isOverdue ? 'text-red-400 font-semibold' : 'text-text-secondary'}`}>
                              {isOverdue && '⚠ '}{format(new Date(task.deadline), 'MMM d, yyyy')}
                            </span>
                          ) : <span className="text-xs text-text-muted">—</span>}
                        </td>
                        <td className="pr-4">
                          <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                            <span className="material-symbols-rounded text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-5">
          {/* Status breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-text-primary mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'To Do', key: 'to-do', color: '#6b7280' },
                { label: 'In Progress', key: 'in-progress', color: '#3b82f6' },
                { label: 'In Review', key: 'in-review', color: '#f59e0b' },
                { label: 'Done', key: 'done', color: '#10b981' },
              ].map(item => {
                const count = statusCounts[item.key]
                const pct = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0
                return (
                  <div key={item.key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="text-text-muted">{count} tasks</span>
                    </div>
                    <div className="h-2 bg-surface-dark rounded-full">
                      <div className="h-full rounded-full" style={{width: `${pct}%`, backgroundColor: item.color}} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Project Details */}
          <div className="card p-5">
            <h3 className="font-semibold text-text-primary mb-4">Project Details</h3>
            <div className="space-y-3">
              {[
                { label: 'Status', value: project.status || 'Active' },
                { label: 'Start Date', value: project.start_date ? format(new Date(project.start_date), 'MMMM d, yyyy') : 'Not set' },
                { label: 'End Date', value: project.end_date ? format(new Date(project.end_date), 'MMMM d, yyyy') : 'Not set' },
                { label: 'Type', value: project.is_team_project ? 'Team Project' : 'Personal Project' },
                { label: 'Category', value: category?.name || 'Uncategorized' },
                { label: 'Created', value: format(new Date(project.created_at || Date.now()), 'MMM d, yyyy') },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border-dark/40 last:border-0">
                  <span className="text-xs text-text-muted">{item.label}</span>
                  <span className="text-xs font-medium text-text-secondary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card p-6">
          <h3 className="font-semibold text-text-primary mb-4">Activity Log</h3>
          <div className="space-y-4">
            {[
              { action: 'Project created', time: 'Today at 10:30 AM', icon: 'add_circle' },
              { action: 'Added 3 tasks', time: 'Today at 10:31 AM', icon: 'task_alt' },
              { action: 'Updated project deadline', time: 'Yesterday at 3:00 PM', icon: 'edit' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-rounded text-primary text-sm">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-text-primary">{item.action}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
