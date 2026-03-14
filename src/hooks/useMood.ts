import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'
import type { MoodEntry } from '@/types'

export function useMood() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    if (!user) return
    // Fetch last 35 days
    const start = format(subDays(new Date(), 34), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .order('date', { ascending: true })
    setEntries(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const upsertMood = async (date: string, mood: number) => {
    if (!user) return
    const existing = entries.find(e => e.date === date)
    if (existing) {
      setEntries(prev => prev.map(e => e.date === date ? { ...e, mood: mood as MoodEntry['mood'] } : e))
      await supabase.from('mood_entries').update({ mood }).eq('id', existing.id).eq('user_id', user.id)
    } else {
      const temp: MoodEntry = {
        id: crypto.randomUUID(), user_id: user.id, date, mood: mood as MoodEntry['mood'],
        journal_text: null, created_at: new Date().toISOString()
      }
      setEntries(prev => [...prev, temp])
      const { data, error } = await supabase.from('mood_entries').insert({ user_id: user.id, date, mood }).select().single()
      if (error) { toast.error('Failed to save mood'); await fetchEntries() }
      else if (data) setEntries(prev => prev.map(e => e.id === temp.id ? data : e))
    }
  }

  const updateJournal = async (date: string, journal_text: string) => {
    if (!user) return
    const existing = entries.find(e => e.date === date)
    if (existing) {
      setEntries(prev => prev.map(e => e.date === date ? { ...e, journal_text } : e))
      await supabase.from('mood_entries').update({ journal_text }).eq('id', existing.id).eq('user_id', user.id)
    } else {
      const temp: MoodEntry = {
        id: crypto.randomUUID(), user_id: user.id, date, mood: 3,
        journal_text, created_at: new Date().toISOString()
      }
      setEntries(prev => [...prev, temp])
      const { data, error } = await supabase.from('mood_entries').insert({
        user_id: user.id, date, mood: 3, journal_text
      }).select().single()
      if (error) { toast.error('Failed to save journal'); await fetchEntries() }
      else if (data) setEntries(prev => prev.map(e => e.id === temp.id ? data : e))
    }
  }

  const getEntry = (date: string) => entries.find(e => e.date === date) || null

  return { entries, loading, upsertMood, updateJournal, getEntry, refetch: fetchEntries }
}
