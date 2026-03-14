import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useHabits } from '@/hooks/useHabits'
import { format } from 'date-fns'
import Topbar from '../Topbar'

export default function Habits() {
  const { habits, loading, addHabit, checkHabit, deleteHabit, isCheckedToday, getWeekLogs } = useHabits()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily')
  const [newColor, setNewColor] = useState('#1D9E75')

  const colors = ['#1D9E75', '#3B7DD8', '#D95F50', '#D4872A', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B']

  const todayComplete = habits.filter(h => isCheckedToday(h.id)).length
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0)

  const handleAdd = () => {
    if (!newName.trim()) return
    addHabit({ name: newName.trim(), frequency: newFreq, color: newColor })
    setNewName(''); setShowAdd(false)
  }

  const chipStyle: React.CSSProperties = {
    background: 'var(--los-surface)', border: '0.5px solid var(--los-border)',
    borderRadius: 6, padding: '8px 12px', fontSize: 13,
    fontFamily: "'DM Mono', monospace", color: 'var(--los-primary)'
  }

  return (
    <div>
      <Topbar title="Habits" />
      <div style={{ padding: 24 }}>
        {/* Metrics */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={chipStyle}>{habits.length} active habits</div>
          <div style={chipStyle}>Longest streak: {longestStreak} days</div>
          <div style={chipStyle}>Today: {todayComplete}/{habits.length} complete</div>
        </div>

        {/* Empty state */}
        {habits.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="var(--los-border)" strokeWidth="1.5">
              <circle cx="60" cy="60" r="50" />
              <path d="M40 60l10 10 20-20" />
            </svg>
            <p style={{ fontSize: 13, color: 'var(--los-muted)', marginTop: 16, marginBottom: 16 }}>Start tracking habits</p>
            <button onClick={() => setShowAdd(true)} style={{
              background: 'var(--los-accent)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}>Add your first habit</button>
          </div>
        )}

        {/* Habit list */}
        <div>
          {habits.map((habit, i) => {
            const weekLogs = getWeekLogs(habit.id)
            const checked = isCheckedToday(habit.id)
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  height: 64, padding: '0 4px',
                  borderBottom: '0.5px solid var(--los-border)',
                }}
              >
                {/* Color dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />

                {/* Name + streak */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: 'var(--los-primary)', fontFamily: "'DM Sans', sans-serif" }}>
                    {habit.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--los-accent)">
                      <path d="M12 23c-3.6 0-6.5-3-6.5-7 0-3.2 2.9-6.5 4.7-8.2.4-.4 1.1-.4 1.5 0C13.6 9.5 18.5 12.8 18.5 16c0 4-2.9 7-6.5 7z" />
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--los-accent)', fontFamily: "'DM Mono', monospace" }}>
                      {habit.streak} days
                    </span>
                  </div>
                </div>

                {/* 7-day strip */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {weekLogs.map((day, j) => (
                    <motion.div
                      key={day.date}
                      initial={false}
                      animate={{ background: day.done ? habit.color : 'transparent' }}
                      style={{
                        width: 12, height: 12, borderRadius: 3,
                        border: day.done ? 'none' : '0.5px solid var(--los-border)',
                      }}
                    />
                  ))}
                </div>

                {/* Check button */}
                <motion.button
                  onClick={() => !checked && checkHabit(habit.id)}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 32, height: 32, borderRadius: 6,
                    border: checked ? 'none' : '0.5px solid var(--los-border)',
                    background: checked ? 'var(--los-accent)' : 'transparent',
                    cursor: checked ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 150ms ease', padding: 0
                  }}
                >
                  {checked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <motion.path d="M20 6L9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, type: 'spring' }} />
                    </svg>
                  )}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* Streak milestones */}
        {habits.filter(h => h.streak > 0 && h.streak % 7 === 0).map(h => (
          <AnimatePresence key={h.id + '-milestone'}>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: 'var(--los-accent-light)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', padding: '0 16px',
                fontSize: 13, fontStyle: 'italic', color: 'var(--los-accent)',
                borderRadius: 6, marginTop: 8
              }}
            >
              ✦ {h.streak}-day streak on {h.name}!
            </motion.div>
          </AnimatePresence>
        ))}

        {/* FAB */}
        <button
          onClick={() => setShowAdd(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24,
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--los-accent)', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: 24, fontWeight: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 150ms ease'
          }}
        >
          +
        </button>

        {/* Add habit modal */}
        <AnimatePresence>
          {showAdd && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setShowAdd(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 50 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.28, type: 'spring', damping: 25 }}
                style={{
                  position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                  width: 420, padding: 24, borderRadius: '14px 14px 0 0',
                  background: 'var(--los-bg)', border: '0.5px solid var(--los-border)',
                  zIndex: 51
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                  New Habit
                </h3>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Habit name"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 15,
                    border: '0.5px solid var(--los-border)', borderRadius: 6,
                    background: 'var(--los-bg)', color: 'var(--los-primary)',
                    fontFamily: "'DM Sans', sans-serif", marginBottom: 16
                  }}
                />

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {(['daily', 'weekly'] as const).map(f => (
                    <button key={f} onClick={() => setNewFreq(f)} style={{
                      fontSize: 13, padding: '6px 14px', borderRadius: 6,
                      border: '0.5px solid var(--los-border)', cursor: 'pointer',
                      background: newFreq === f ? 'var(--los-accent)' : 'transparent',
                      color: newFreq === f ? '#fff' : 'var(--los-primary)',
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'background-color 150ms ease'
                    }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginBottom: 20 }}>
                  {colors.map(c => (
                    <button key={c} onClick={() => setNewColor(c)} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c,
                      border: newColor === c ? '2.5px solid var(--los-primary)' : '2.5px solid transparent',
                      cursor: 'pointer', padding: 0
                    }} />
                  ))}
                </div>

                <button onClick={handleAdd} style={{
                  width: '100%', height: 40, background: 'var(--los-accent)',
                  color: '#fff', border: 'none', borderRadius: 6, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'background-color 150ms ease'
                }}>Save Habit</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
