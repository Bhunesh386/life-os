import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'
import type { Habit, HabitLog } from '@/types'

export function useHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setHabits(data || [])

    // Fetch last 7 days of logs
    const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('completed_date', sevenDaysAgo)
    setHabitLogs(logs || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const addHabit = async (habit: Partial<Habit>) => {
    if (!user) return
    const { data, error } = await supabase.from('habits').insert({
      name: habit.name, frequency: habit.frequency || 'daily',
      color: habit.color || '#1D9E75', streak: 0, user_id: user.id,
    }).select().single()
    if (error) toast.error('Failed to add habit')
    else if (data) { setHabits(prev => [...prev, data]); toast.success('Habit added') }
  }

  const checkHabit = async (habitId: string) => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')
    const alreadyDone = habitLogs.some(l => l.habit_id === habitId && l.completed_date === today)
    if (alreadyDone) return

    const tempLog: HabitLog = {
      id: crypto.randomUUID(), habit_id: habitId, user_id: user.id,
      completed_date: today, created_at: new Date().toISOString()
    }
    setHabitLogs(prev => [...prev, tempLog])

    // Increment streak
    const habit = habits.find(h => h.id === habitId)
    if (habit) {
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, streak: h.streak + 1 } : h))
      await supabase.from('habits').update({ streak: habit.streak + 1 }).eq('id', habitId).eq('user_id', user.id)
    }

    const { error } = await supabase.from('habit_logs').insert({
      habit_id: habitId, user_id: user.id, completed_date: today,
    })
    if (error) { toast.error('Failed to log habit'); await fetchHabits() }
  }

  const deleteHabit = async (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user!.id)
    if (error) { toast.error('Failed to delete habit'); await fetchHabits() }
    else toast.success('Habit deleted')
  }

  const isCheckedToday = (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return habitLogs.some(l => l.habit_id === habitId && l.completed_date === today)
  }

  const getWeekLogs = (habitId: string) => {
    const days: { date: string; done: boolean }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      days.push({ date: d, done: habitLogs.some(l => l.habit_id === habitId && l.completed_date === d) })
    }
    return days
  }

  return { habits, habitLogs, loading, addHabit, checkHabit, deleteHabit, isCheckedToday, getWeekLogs, refetch: fetchHabits }
}
