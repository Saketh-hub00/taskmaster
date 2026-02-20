import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { useTask } from '../contexts/TaskContext'
import { format, isToday, isPast, startOfWeek, addDays } from 'date-fns'

const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' }
const STATUS_MAP = {
  todo:        { label: 'To-Do',       className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-in_progress' },
  in_review:   { label: 'In Review',   className: 'status-in_review' },
  done:        { label: 'Done',        className: 'status-done' },
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { tasks, stats, projects, loading } = useTask()

  const weeklyData = useMemo(() => {
    const start = startOfWeek(new Date())
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i)
      const dayLabel = format(day, 'EEE')
      const count = tasks.filter(t =>
        t.status === 'done' && t.completed_at &&
        format(new Date(t.completed_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      ).length
      return { day: dayLabel, count, isToday: isToday(day) }
    })
  }, [tasks])

  const upcomingTasks = useMemo(() =>
    tasks
      .filter(t => t.status !== 'done' && t.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5),
    [tasks]
  )

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const firstName = profile?.full_name?.split(' ')[0] || 'User'

  const kpiCards = [
    { icon: 'assignment', label: 'Total Tasks', value: stats.total, badge: `${stats.inProgress} active`, color: 'blue' },
    { icon: 'pie_chart', label: 'Completion Rate', value: `${completionRate}%`, badge: '+5% this week', color: 'green', positive: true },
    { icon: 'folder_open', label: 'Active Projects', value: projects.filter(p => p.status === 'active').length, color: 'purple' },
    { icon: 'warning', label: 'Overdue Tasks', value: stats.overdue, badge: 'Needs attention', color: 'red' },
  ]

  const colorMap = {
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500' },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    red:    { bg: 'bg-red-500/10',    text: 'text-red-500' },
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-text-secondary mt-1">
            You have <span className="text-white font-semibold">{stats.inProgress} tasks</span> in progress today.
          </p>
        </div>
        <Link to="/tasks/new">
          <button className="btn-primary">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Task
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ icon, label, value, badge, color, positive }) => (
          <div key={label} className="card hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`${colorMap[color].bg} p-2 rounded-lg`}>
                <span className={`material-symbols-outlined ${colorMap[color].text}`}>{icon}</span>
              </div>
              {badge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded bg-surface-dark ${positive ? 'text-green-400' : 'text-text-secondary'}`}>
                  {badge}
                </span>
              )}
            </div>
            <p className="text-text-secondary text-sm mb-1">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="xl:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">Weekly Productivity</h3>
              <p className="text-text-secondary text-sm">Tasks completed this week</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barCategoryGap="30%">
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9da6b9', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(19,91,236,0.08)' }}
                  contentStyle={{ background: '#1c2333', border: '1px solid #2d3748', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#9da6b9' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={index} fill={entry.isToday ? '#135bec' : 'rgba(19,91,236,0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion ring */}
        <div className="card flex flex-col items-center justify-center text-center gap-4">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#2d3748" strokeWidth="12"/>
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#135bec" strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - completionRate / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{completionRate}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold">Overall Progress</h3>
            <p className="text-text-secondary text-sm mt-1">{stats.completed} of {stats.total} tasks done</p>
          </div>
          <div className="w-full grid grid-cols-2 gap-2 text-sm">
            <div className="bg-surface-dark rounded-lg p-2">
              <p className="text-text-secondary text-xs">Completed</p>
              <p className="text-green-400 font-bold">{stats.completed}</p>
            </div>
            <div className="bg-surface-dark rounded-lg p-2">
              <p className="text-text-secondary text-xs">In Progress</p>
              <p className="text-blue-400 font-bold">{stats.inProgress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming tasks */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-lg">Upcoming Tasks</h3>
          <Link to="/tasks" className="text-primary text-sm font-medium hover:underline">View All</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : upcomingTasks.length === 0 ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-4xl text-text-secondary">task_alt</span>
            <p className="text-text-secondary mt-2">No upcoming tasks! You're all caught up.</p>
            <Link to="/tasks/new">
              <button className="btn-primary mt-4 text-sm">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Create Task
              </button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {upcomingTasks.map(task => {
              const isOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'done'
              return (
                <div key={task.id} className="flex items-center gap-4 py-3 hover:bg-surface-dark/30 rounded-lg px-2 transition-colors group">
                  <span className="material-symbols-outlined text-text-secondary hover:text-primary cursor-pointer text-[20px]">
                    radio_button_unchecked
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{task.task_name}</p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {task.project?.project_name || task.category?.title || 'No project'}
                      {task.deadline && (
                        <span className={`ml-2 ${isOverdue ? 'text-red-400' : ''}`}>
                          · {isOverdue ? 'Overdue · ' : ''}{format(new Date(task.deadline), 'MMM d, h:mm a')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge-status priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className={`badge-status ${STATUS_MAP[task.status]?.className}`}>
                      {STATUS_MAP[task.status]?.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
