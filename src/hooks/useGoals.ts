import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import type { Goal, Milestone } from '@/types'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user) return
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setGoals(goalsData || [])

    const { data: milestonesData } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setMilestones(milestonesData || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const addGoal = async (goal: Partial<Goal>) => {
    if (!user) return
    const { data, error } = await supabase.from('goals').insert({
      title: goal.title, deadline: goal.deadline || null, user_id: user.id,
    }).select().single()
    if (error) toast.error('Failed to add goal')
    else if (data) { setGoals(prev => [data, ...prev]); toast.success('Goal added') }
  }

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    setMilestones(prev => prev.filter(m => m.goal_id !== id))
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user!.id)
    if (error) { toast.error('Failed to delete goal'); await fetchGoals() }
  }

  const addMilestone = async (milestone: Partial<Milestone>) => {
    if (!user) return
    const { data, error } = await supabase.from('milestones').insert({
      goal_id: milestone.goal_id, title: milestone.title,
      completed: false, due_date: milestone.due_date || null,
      user_id: user.id,
    }).select().single()
    if (error) toast.error('Failed to add milestone')
    else if (data) { setMilestones(prev => [...prev, data]); toast.success('Milestone added') }
  }

  const toggleMilestone = async (id: string) => {
    const ms = milestones.find(m => m.id === id)
    if (!ms) return
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
    await supabase.from('milestones').update({ completed: !ms.completed }).eq('id', id).eq('user_id', user!.id)
  }

  const getGoalProgress = (goalId: string) => {
    const gm = milestones.filter(m => m.goal_id === goalId)
    if (gm.length === 0) return 0
    return Math.round((gm.filter(m => m.completed).length / gm.length) * 100)
  }

  const getGoalMilestones = (goalId: string) => milestones.filter(m => m.goal_id === goalId)

  return { goals, milestones, loading, addGoal, deleteGoal, addMilestone, toggleMilestone, getGoalProgress, getGoalMilestones, refetch: fetchGoals }
}
