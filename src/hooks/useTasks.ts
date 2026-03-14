import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import type { Task } from '@/types'

export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTask = async (task: Partial<Task>) => {
    if (!user) return
    const temp: Task = {
      id: crypto.randomUUID(),
      user_id: user.id,
      title: task.title || '',
      description: task.description || null,
      status: 'todo',
      priority: task.priority || 'normal',
      section: task.section || 'today',
      due_date: task.due_date || null,
      goal_id: task.goal_id || null,
      tags: task.tags || null,
      subtasks: task.subtasks || null,
      created_at: new Date().toISOString(),
      completed_at: null,
    }
    setTasks(prev => [temp, ...prev])
    const { data, error } = await supabase.from('tasks').insert({
      title: temp.title, description: temp.description, status: temp.status,
      priority: temp.priority, section: temp.section, due_date: temp.due_date,
      goal_id: temp.goal_id, tags: temp.tags, subtasks: temp.subtasks,
      user_id: user.id,
    }).select().single()
    if (error) {
      setTasks(prev => prev.filter(t => t.id !== temp.id))
      toast.error('Failed to add task')
    } else if (data) {
      setTasks(prev => prev.map(t => t.id === temp.id ? data : t))
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    const { error } = await supabase.from('tasks').update(updates).eq('id', id).eq('user_id', user!.id)
    if (error) toast.error('Failed to update task')
  }

  const deleteTask = async (id: string) => {
    const prev = tasks
    setTasks(p => p.filter(t => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user!.id)
    if (error) { setTasks(prev); toast.error('Failed to delete task') }
    else toast.success('Task deleted')
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const updates = task.status === 'done'
      ? { status: 'todo' as const, completed_at: null }
      : { status: 'done' as const, completed_at: new Date().toISOString() }
    await updateTask(id, updates)
  }

  return { tasks, loading, addTask, updateTask, deleteTask, toggleTask, refetch: fetchTasks }
}
