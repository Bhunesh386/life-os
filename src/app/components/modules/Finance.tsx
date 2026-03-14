import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useFinance } from '@/hooks/useFinance'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Topbar from '../Topbar'
import type { Transaction } from '@/types'

const categoryConfig: Record<string, { bg: string; color: string }> = {
  Food: { bg: '#FEF3C7', color: 'var(--los-amber)' },
  Transport: { bg: '#DBEAFE', color: 'var(--los-blue)' },
  Entertainment: { bg: 'var(--los-coral-light)', color: 'var(--los-coral)' },
  Health: { bg: 'var(--los-accent-light)', color: 'var(--los-accent)' },
  Shopping: { bg: 'var(--los-accent-light)', color: 'var(--los-accent)' },
  Other: { bg: 'var(--los-surface)', color: 'var(--los-muted)' },
}

const categories = ['Food', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Other']

export default function Finance() {
  const { transactions, loading, addTransaction, totalIncome, totalExpenses, netBalance } = useFinance()
  const [showModal, setShowModal] = useState(false)
  const currentMonth = new Date().getMonth()

  // Monthly chart data
  const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  const chartData = monthLabels.map((label, i) => {
    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === i)
      .reduce((s, t) => s + t.amount, 0)
    return { month: label, expenses: monthExpenses, isCurrent: i === currentMonth }
  })

  // Count-up animation
  const [displayIncome, setDisplayIncome] = useState(0)
  const [displayExpenses, setDisplayExpenses] = useState(0)
  const [displayNet, setDisplayNet] = useState(0)
  const animRef = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const duration = 600
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease out cubic
      setDisplayIncome(Math.round(totalIncome * eased))
      setDisplayExpenses(Math.round(totalExpenses * eased))
      setDisplayNet(Math.round(netBalance * eased))
      if (progress < 1) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [totalIncome, totalExpenses, netBalance])

  return (
    <div>
      <Topbar title="Finance" />
      <div style={{ padding: 24 }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <MetricCard label="INCOME" value={formatCurrency(displayIncome)} color="var(--los-accent)" index={0} />
          <MetricCard label="EXPENSES" value={formatCurrency(displayExpenses)} color="var(--los-coral)" index={1} />
          <MetricCard label="NET BALANCE" value={formatCurrency(displayNet)} color={netBalance >= 0 ? 'var(--los-accent)' : 'var(--los-coral)'} index={2} />
        </div>

        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ height: 200, marginBottom: 24 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap={8}>
              <XAxis dataKey="month" axisLine={false} tickLine={false}
                tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace", fill: 'var(--los-muted)' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                  const idx = monthLabels.indexOf(label as string)
                  return (
                    <div style={{
                      background: 'var(--los-bg)', border: '0.5px solid var(--los-border)',
                      borderRadius: 6, padding: '8px 12px',
                      fontSize: 12, fontFamily: "'DM Mono', monospace"
                    }}>
                      <div style={{ color: 'var(--los-muted)', marginBottom: 4 }}>{monthNames[idx]}</div>
                      <div style={{ color: 'var(--los-primary)' }}>{formatCurrency(payload[0].value as number)}</div>
                    </div>
                  )
                }}
              />
              <Bar dataKey="expenses" radius={[4, 4, 0, 0]} barSize={16}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isCurrent ? 'var(--los-accent)' : 'var(--los-border)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Transactions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>Transactions</span>
        </div>

        {transactions.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="var(--los-border)" strokeWidth="1.5">
              <circle cx="60" cy="60" r="50" />
              <line x1="60" y1="35" x2="60" y2="85" />
              <path d="M42 53h36" />
            </svg>
            <p style={{ fontSize: 13, color: 'var(--los-muted)', marginTop: 16 }}>No transactions yet</p>
          </div>
        )}

        {transactions.map((txn, i) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              height: 48, borderBottom: '0.5px solid var(--los-border)',
              transition: 'background-color 150ms ease', padding: '0 8px',
              cursor: 'default'
            }}
          >
            {/* Category icon */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: (categoryConfig[txn.category] || categoryConfig.Other).bg,
              color: (categoryConfig[txn.category] || categoryConfig.Other).color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 500, flexShrink: 0
            }}>
              {txn.category.charAt(0)}
            </div>

            {/* Merchant + date */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, color: 'var(--los-primary)', fontFamily: "'DM Sans', sans-serif" }}>
                {txn.merchant || txn.category}
              </div>
              <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)' }}>
                {format(new Date(txn.date), 'MMM d')}
              </div>
            </div>

            {/* Amount */}
            <span style={{
              fontSize: 13, fontFamily: "'DM Mono', monospace",
              color: txn.type === 'income' ? 'var(--los-accent)' : 'var(--los-coral)'
            }}>
              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </span>
          </motion.div>
        ))}

        {/* FAB */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--los-accent)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 24, fontWeight: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 150ms ease'
          }}
        >+</button>

        {/* Add transaction modal */}
        <AnimatePresence>
          {showModal && (
            <AddTransactionModal onClose={() => setShowModal(false)} onAdd={addTransaction} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color, index }: { label: string; value: string; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: 'var(--los-surface)', borderRadius: 10,
        padding: '16px 20px', minHeight: 80,
      }}
    >
      <div style={{
        fontSize: 11, fontWeight: 500, textTransform: 'uppercase' as const,
        letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 8,
        fontFamily: "'DM Sans', sans-serif"
      }}>{label}</div>
      <div style={{
        fontSize: 24, fontWeight: 300, fontFamily: "'DM Mono', monospace",
        color
      }}>{value}</div>
    </motion.div>
  )
}

function AddTransactionModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (t: Partial<Transaction>) => void
}) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('Other')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return
    onAdd({
      amount: parseFloat(amount),
      type, category, merchant, date,
    })
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 50 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.22 }}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 420, padding: 24, borderRadius: 14,
          background: 'var(--los-bg)', border: '0.5px solid var(--los-border)',
          zIndex: 51
        }}
      >
        {/* Amount */}
        <input
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="0.00"
          autoFocus
          style={{
            width: '100%', fontSize: 32, fontFamily: "'DM Mono', monospace",
            fontWeight: 300, border: 'none', outline: 'none', background: 'transparent',
            color: 'var(--los-primary)', marginBottom: 20, textAlign: 'center'
          }}
        />

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['income', 'expense'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, fontSize: 13, padding: '8px 0', borderRadius: 6,
              border: '0.5px solid var(--los-border)', cursor: 'pointer',
              background: type === t ? (t === 'income' ? 'var(--los-accent)' : 'var(--los-coral)') : 'transparent',
              color: type === t ? '#fff' : 'var(--los-primary)',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background-color 150ms ease'
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              fontSize: 13, padding: '8px 0', borderRadius: 6,
              border: '0.5px solid var(--los-border)', cursor: 'pointer',
              background: category === c ? 'var(--los-surface)' : 'transparent',
              color: 'var(--los-primary)', fontFamily: "'DM Sans', sans-serif",
              transition: 'background-color 150ms ease'
            }}>{c}</button>
          ))}
        </div>

        {/* Merchant */}
        <input
          value={merchant}
          onChange={e => setMerchant(e.target.value)}
          placeholder="Merchant name"
          style={{
            width: '100%', padding: '10px 12px', fontSize: 14,
            border: '0.5px solid var(--los-border)', borderRadius: 6,
            background: 'var(--los-bg)', color: 'var(--los-primary)',
            fontFamily: "'DM Sans', sans-serif", marginBottom: 12
          }}
        />

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 13,
            fontFamily: "'DM Mono', monospace",
            border: '0.5px solid var(--los-border)', borderRadius: 6,
            background: 'var(--los-bg)', color: 'var(--los-primary)',
            marginBottom: 20
          }}
        />

        {/* Save */}
        <button onClick={handleSave} style={{
          width: '100%', height: 40, background: 'var(--los-accent)',
          color: '#fff', border: 'none', borderRadius: 6, fontSize: 13,
          fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          transition: 'background-color 150ms ease'
        }}>Save Transaction</button>
      </motion.div>
    </>
  )
}
