import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import type { Note } from '@/types'

export function useNotes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const addNote = async () => {
    if (!user) return null
    const { data, error } = await supabase.from('notes').insert({
      title: 'Untitled', content: '', user_id: user.id,
    }).select().single()
    if (error) { toast.error('Failed to create note'); return null }
    if (data) setNotes(prev => [data, ...prev])
    return data
  }

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id
      ? { ...n, ...updates, updated_at: new Date().toISOString() }
      : n
    ))
    const { error } = await supabase.from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', user!.id)
    if (error) toast.error('Failed to save note')
  }

  const deleteNote = async (id: string) => {
    const prev = notes
    setNotes(p => p.filter(n => n.id !== id))
    const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', user!.id)
    if (error) { setNotes(prev); toast.error('Failed to delete note') }
    else toast.success('Note deleted')
  }

  return { notes, loading, addNote, updateNote, deleteNote, refetch: fetchNotes }
}
