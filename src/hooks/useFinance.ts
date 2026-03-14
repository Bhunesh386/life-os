import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'
import type { Transaction } from '@/types'

export function useFinance() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const addTransaction = async (txn: Partial<Transaction>) => {
    if (!user) return
    const temp: Transaction = {
      id: crypto.randomUUID(), user_id: user.id,
      amount: txn.amount || 0, type: txn.type || 'expense',
      category: txn.category || 'Other', merchant: txn.merchant || '',
      date: txn.date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    }
    setTransactions(prev => [temp, ...prev])
    const { data, error } = await supabase.from('transactions').insert({
      amount: temp.amount, type: temp.type, category: temp.category,
      merchant: temp.merchant, date: temp.date, user_id: user.id,
    }).select().single()
    if (error) {
      setTransactions(prev => prev.filter(t => t.id !== temp.id))
      toast.error('Failed to add transaction')
    } else if (data) {
      setTransactions(prev => prev.map(t => t.id === temp.id ? data : t))
      toast.success('Transaction added')
    }
  }

  const deleteTransaction = async (id: string) => {
    const prev = transactions
    setTransactions(p => p.filter(t => t.id !== id))
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user!.id)
    if (error) { setTransactions(prev); toast.error('Failed to delete transaction') }
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netBalance = totalIncome - totalExpenses

  return { transactions, loading, addTransaction, deleteTransaction, totalIncome, totalExpenses, netBalance, refetch: fetchTransactions }
}
