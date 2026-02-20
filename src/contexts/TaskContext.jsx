import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const TaskContext = createContext({})

export const useTask = () => {
  const context = useContext(TaskContext)
  if (!context) throw new Error('useTask must be used within TaskProvider')
  return context
}

export const TaskProvider = ({ children }) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, overdue: 0 })

  useEffect(() => {
    if (user) {
      fetchTasks()
      fetchProjects()
      fetchCategories()
    }
  }, [user])

  const fetchTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(id, title, color_code, icon),
        project:projects(id, project_name, color_code),
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url),
        creator:profiles!tasks_created_by_fkey(id, full_name, avatar_url)
      `)
      .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTasks(data)
      computeStats(data)
    }
    setLoading(false)
  }, [user])

  const computeStats = (taskList) => {
    const now = new Date()
    setStats({
      total: taskList.length,
      completed: taskList.filter(t => t.status === 'done').length,
      inProgress: taskList.filter(t => t.status === 'in_progress').length,
      overdue: taskList.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'done').length,
    })
  }

  const fetchProjects = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(id, title, color_code),
        tasks:tasks(id, status)
      `)
      .or(`owner_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    if (data) setProjects(data)
  }, [user])

  const fetchCategories = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
    if (data) setCategories(data)
  }, [user])

  const createTask = async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...taskData, created_by: user.id, assigned_to: taskData.assigned_to || user.id })
      .select(`*, category:categories(*), project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*)`)
      .single()
    if (!error && data) {
      setTasks(prev => [data, ...prev])
      computeStats([data, ...tasks])
    }
    return { data, error }
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select(`*, category:categories(*), project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*)`)
      .single()
    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === id ? data : t))
      computeStats(tasks.map(t => t.id === id ? data : t))
    }
    return { data, error }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      computeStats(updated)
    }
    return { error }
  }

  const createProject = async (projectData) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...projectData, owner_id: user.id })
      .select('*')
      .single()
    if (!error && data) {
      // Add creator as owner in user_projects
      await supabase.from('user_projects').insert({ user_id: user.id, project_id: data.id, role: 'owner' })
      setProjects(prev => [data, ...prev])
    }
    return { data, error }
  }

  const updateProject = async (id, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()
    if (!error && data) setProjects(prev => prev.map(p => p.id === id ? data : p))
    return { data, error }
  }

  const createCategory = async (categoryData) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...categoryData, user_id: user.id })
      .select('*')
      .single()
    if (!error && data) setCategories(prev => [...prev, data])
    return { data, error }
  }

  const getProjectProgress = (project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const done = project.tasks.filter(t => t.status === 'done').length
    return Math.round((done / project.tasks.length) * 100)
  }

  return (
    <TaskContext.Provider value={{
      tasks, projects, categories, loading, stats,
      fetchTasks, fetchProjects, fetchCategories,
      createTask, updateTask, deleteTask,
      createProject, updateProject, createCategory,
      getProjectProgress,
    }}>
      {children}
    </TaskContext.Provider>
  )
}
