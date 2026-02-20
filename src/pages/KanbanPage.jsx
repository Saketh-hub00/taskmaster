import { useState, useMemo } from 'react'
import { useTask } from '../contexts/TaskContext'
import { format, isPast } from 'date-fns'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'todo',        label: 'To-Do',       countClass: 'bg-slate-500/20 text-slate-400' },
  { id: 'in_progress', label: 'In Progress',  countClass: 'bg-blue-500/20 text-blue-400' },
  { id: 'in_review',   label: 'In Review',    countClass: 'bg-amber-500/20 text-amber-400' },
  { id: 'done',        label: 'Done',         countClass: 'bg-green-500/20 text-green-400' },
]

const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' }

function KanbanCard({ task, onDragStart }) {
  const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done'
  const isDone = task.status === 'done'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-[#111318] rounded-xl p-4 border border-border-dark hover:border-primary/40 cursor-grab active:cursor-grabbing transition-all group shadow-sm hover:shadow-md ${isDone ? 'opacity-60' : ''}`}
    >
      {/* Priority + Category badge */}
      <div className="flex items-center justify-between mb-3">
        {task.category ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide" style={{
            background: (task.category.color_code || '#135bec') + '25',
            color: task.category.color_code || '#135bec'
          }}>
            {task.category.title}
          </span>
        ) : <span />}
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-primary">
          <span className="material-symbols-outlined text-[16px]">edit</span>
        </button>
      </div>

      {/* Title */}
      <h4 className={`text-sm font-semibold text-white leading-snug mb-2 ${isDone ? 'line-through' : ''}`}>
        {task.task_name}
      </h4>

      {task.task_summary && (
        <p className="text-xs text-text-secondary mb-3 line-clamp-2">{task.task_summary}</p>
      )}

      {/* Priority badge */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded" style={{
          background: PRIORITY_COLORS[task.priority] + '20',
          color: PRIORITY_COLORS[task.priority]
        }}>
          <span className="material-symbols-outlined text-[12px]">flag</span>
          {task.priority}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-dark">
        <div className="flex items-center">
          {task.assignee ? (
            task.assignee.avatar_url ? (
              <img src={task.assignee.avatar_url} alt="" className="w-6 h-6 rounded-full ring-2 ring-[#111318] object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-primary text-[10px] font-bold ring-2 ring-[#111318]">
                {task.assignee.full_name?.[0] || 'U'}
              </div>
            )
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-dark border border-border-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] text-text-secondary">person</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-text-secondary">
          {task.deadline && (
            <span className={`flex items-center gap-0.5 text-[11px] font-medium ${isOverdue ? 'text-red-400' : ''}`}>
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {format(new Date(task.deadline), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function KanbanPage() {
  const { tasks, updateTask, loading, projects } = useTask()
  const [dragTaskId, setDragTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [selectedProject, setSelectedProject] = useState('all')

  const filteredTasks = useMemo(() =>
    selectedProject === 'all'
      ? tasks
      : tasks.filter(t => t.project_id === selectedProject),
    [tasks, selectedProject]
  )

  const columnTasks = useMemo(() =>
    COLUMNS.reduce((acc, col) => ({
      ...acc,
      [col.id]: filteredTasks.filter(t => t.status === col.id)
    }), {}),
    [filteredTasks]
  )

  const handleDragStart = (e, taskId) => {
    setDragTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (e, colId) => {
    e.preventDefault()
    if (!dragTaskId || !colId) return
    const task = tasks.find(t => t.id === dragTaskId)
    if (!task || task.status === colId) return
    const { error } = await updateTask(dragTaskId, {
      status: colId,
      completed_at: colId === 'done' ? new Date().toISOString() : null
    })
    if (!error) toast.success(`Moved to ${COLUMNS.find(c => c.id === colId)?.label}`)
    setDragTaskId(null)
    setDragOverCol(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-dark bg-[#111318] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Kanban Board</h1>
          <p className="text-text-secondary text-sm">{filteredTasks.length} tasks across {COLUMNS.length} columns</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="input-field w-auto text-sm appearance-none"
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
          </select>
          <button className="btn-primary text-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Task
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6 bg-[#0b0e14]">
        <div className="flex gap-5 h-full min-w-max">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className="w-72 flex-shrink-0 flex flex-col h-full max-h-[calc(100vh-160px)]"
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id) }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{col.label}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countClass}`}>
                    {columnTasks[col.id]?.length || 0}
                  </span>
                </div>
                <button className="text-text-secondary hover:text-white p-1 rounded hover:bg-surface-dark transition-colors">
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </div>

              {/* Drop zone */}
              <div className={`flex-1 overflow-y-auto flex flex-col gap-3 rounded-xl p-2 transition-colors ${
                dragOverCol === col.id ? 'bg-primary/5 ring-1 ring-primary/30' : ''
              }`}>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : columnTasks[col.id]?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-secondary text-center">
                    <span className="material-symbols-outlined text-3xl mb-2 opacity-30">inbox</span>
                    <p className="text-xs">Drop tasks here</p>
                  </div>
                ) : columnTasks[col.id]?.map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onDragStart={e => handleDragStart(e, task.id)}
                  />
                ))}

                <button className="flex items-center gap-2 text-text-secondary hover:text-white hover:bg-surface-dark p-2 rounded-lg text-xs font-medium transition-all mt-1">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Task
                </button>
              </div>
            </div>
          ))}

          {/* Add column */}
          <div className="w-72 flex-shrink-0">
            <button className="w-full h-12 border-2 border-dashed border-border-dark rounded-xl flex items-center justify-center gap-2 text-text-secondary hover:border-primary hover:text-primary transition-all text-sm font-semibold">
              <span className="material-symbols-outlined">add</span>
              Add Section
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
