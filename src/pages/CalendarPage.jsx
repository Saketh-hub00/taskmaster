import { useState, useMemo } from 'react'
import { useTask } from '../contexts/TaskContext'
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameDay, isToday, addMonths, subMonths, isPast } from 'date-fns'

const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', urgent: '#dc2626' }
const VIEWS = ['Month', 'Week', 'Day']

export default function CalendarPage() {
  const { tasks } = useTask()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('Month')
  const [selectedDay, setSelectedDay] = useState(null)

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = startOfWeek(endOfMonth(currentDate))
    const days = []
    let d = start
    while (d <= addDays(end, 6)) {
      days.push(d)
      d = addDays(d, 1)
    }
    return days.slice(0, 35)
  }, [currentDate])

  const getTasksForDay = (date) => tasks.filter(t => {
    if (!t.deadline) return false
    return isSameDay(new Date(t.deadline), date)
  })

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r border-border-dark bg-[#111318] p-5 gap-6 overflow-y-auto">
        {/* Mini calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white">{format(currentDate, 'MMMM yyyy')}</span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 rounded text-text-secondary hover:text-white hover:bg-surface-dark">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 rounded text-text-secondary hover:text-white hover:bg-surface-dark">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-text-secondary mb-1">
            {['S','M','T','W','T','F','S'].map((d,i) => <span key={i} className="py-1 font-medium">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((day, i) => {
              const tasks = getTasksForDay(day)
              const today = isToday(day)
              const selected = selectedDay && isSameDay(day, selectedDay)
              const sameMonth = day.getMonth() === currentDate.getMonth()
              return (
                <button key={i} onClick={() => setSelectedDay(day)}
                  className={`w-7 h-7 text-xs rounded-full mx-auto flex items-center justify-center transition-colors relative ${
                    today ? 'bg-primary text-white font-bold' :
                    selected ? 'bg-surface-dark text-white ring-1 ring-primary' :
                    sameMonth ? 'text-text-secondary hover:bg-surface-dark hover:text-white' : 'text-text-secondary/30'
                  }`}
                >
                  {format(day, 'd')}
                  {tasks.length > 0 && !today && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Calendars */}
        <div>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">My Calendars</h3>
          {[
            { label: 'My Tasks', color: '#135bec', checked: true },
            { label: 'Team Tasks', color: '#8b5cf6', checked: false },
            { label: 'Google Calendar', color: '#f59e0b', checked: true },
          ].map(({ label, color, checked }) => (
            <label key={label} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
              <input type="checkbox" defaultChecked={checked} className="rounded" style={{ accentColor: color }} />
              <span className="text-sm text-white group-hover:text-white">{label}</span>
            </label>
          ))}
        </div>

        {/* Legend */}
        <div>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Priority</h3>
          {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
            <div key={p} className="flex items-center gap-2 py-1">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-sm text-text-secondary capitalize">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main calendar */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#111318]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1.5 rounded hover:bg-surface-dark text-text-secondary hover:text-white">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-text-secondary border border-border-dark rounded hover:border-primary hover:text-white transition-colors">
                Today
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1.5 rounded hover:bg-surface-dark text-text-secondary hover:text-white">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="flex bg-surface-dark p-1 rounded-lg border border-border-dark">
            {VIEWS.map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                  view === v ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-white'
                }`}>{v}</button>
            ))}
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border-dark shrink-0">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-text-secondary">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(5, minmax(120px, 1fr))' }}>
            {calendarDays.map((day, i) => {
              const dayTasks = getTasksForDay(day)
              const today = isToday(day)
              const selected = selectedDay && isSameDay(day, selectedDay)
              const sameMonth = day.getMonth() === currentDate.getMonth()

              return (
                <div key={i}
                  onClick={() => setSelectedDay(day)}
                  className={`border-b border-r border-border-dark p-2 min-h-[120px] cursor-pointer transition-colors
                    ${today ? 'bg-primary/5' : sameMonth ? 'hover:bg-surface-dark/30' : 'bg-[#0b0e14]/50'}
                    ${selected ? 'ring-1 ring-inset ring-primary' : ''}
                  `}
                >
                  {/* Day number */}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-all ${
                      today ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30 text-xs' :
                      sameMonth ? 'text-white' : 'text-text-secondary/40'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {today && <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Today</span>}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div key={task.id}
                        className="text-[11px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: PRIORITY_COLORS[task.priority] + '25', color: PRIORITY_COLORS[task.priority], borderLeft: `2px solid ${PRIORITY_COLORS[task.priority]}` }}
                      >
                        {task.task_name}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-text-secondary pl-1">+{dayTasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="w-72 border-l border-border-dark bg-[#111318] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-white">{format(selectedDay, 'EEEE')}</p>
              <p className="text-text-secondary text-sm">{format(selectedDay, 'MMMM d, yyyy')}</p>
            </div>
            <button onClick={() => setSelectedDay(null)} className="text-text-secondary hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <span className="material-symbols-outlined text-4xl block mb-2">event_available</span>
                <p className="text-sm">No tasks on this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayTasks.map(task => (
                  <div key={task.id} className="bg-surface-dark rounded-lg p-3 border border-border-dark hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-white">{task.task_name}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize shrink-0" style={{
                        background: PRIORITY_COLORS[task.priority] + '20',
                        color: PRIORITY_COLORS[task.priority]
                      }}>{task.priority}</span>
                    </div>
                    {task.deadline && (
                      <p className={`text-xs mt-1 ${isPast(new Date(task.deadline)) && task.status !== 'done' ? 'text-red-400' : 'text-text-secondary'}`}>
                        {format(new Date(task.deadline), 'h:mm a')}
                      </p>
                    )}
                    {task.category && (
                      <span className="text-[10px] mt-2 inline-block px-2 py-0.5 rounded-full bg-border-dark text-text-secondary">
                        {task.category.title}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
