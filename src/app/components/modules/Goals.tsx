import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGoals } from '@/hooks/useGoals'
import { format } from 'date-fns'
import Topbar from '../Topbar'

export default function Goals() {
  const { goals, milestones, loading, addGoal, deleteGoal, addMilestone, toggleMilestone, getGoalProgress, getGoalMilestones } = useGoals()
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [addingMilestone, setAddingMilestone] = useState<string | null>(null)
  const [msTitle, setMsTitle] = useState('')

  const handleAddGoal = () => {
    if (!newTitle.trim()) return
    addGoal({ title: newTitle.trim(), deadline: newDeadline || null })
    setNewTitle(''); setNewDeadline(''); setShowModal(false)
  }

  const handleAddMilestone = (goalId: string) => {
    if (!msTitle.trim()) return
    addMilestone({ goal_id: goalId, title: msTitle.trim() })
    setMsTitle(''); setAddingMilestone(null)
  }

  return (
    <div>
      <Topbar title="Goals" action={
        <button onClick={() => setShowModal(true)} style={{
          fontSize: 13, border: '0.5px solid var(--los-border)', borderRadius: 6,
          background: 'transparent', color: 'var(--los-primary)', padding: '6px 12px',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          transition: 'background-color 150ms ease'
        }}>+ New Goal</button>
      } />
      <div style={{ padding: 24 }}>
        {/* Empty state */}
        {goals.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="var(--los-border)" strokeWidth="1.5">
              <circle cx="60" cy="60" r="50" />
              <circle cx="60" cy="60" r="30" />
              <circle cx="60" cy="60" r="10" />
            </svg>
            <p style={{ fontSize: 13, color: 'var(--los-muted)', marginTop: 16, marginBottom: 16 }}>No goals yet</p>
            <button onClick={() => setShowModal(true)} style={{
              background: 'var(--los-accent)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}>Set your first goal</button>
          </div>
        )}

        {/* Goals grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
          {goals.map((goal, i) => {
            const pct = getGoalProgress(goal.id)
            const gm = getGoalMilestones(goal.id)
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  border: '0.5px solid var(--los-border)', borderRadius: 10,
                  padding: 20, minHeight: 160
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--los-primary)', fontFamily: "'DM Sans', sans-serif" }}>
                    {goal.title}
                  </span>
                  {goal.deadline && (
                    <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)' }}>
                      {format(new Date(goal.deadline), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, borderRadius: 6, background: 'var(--los-border)', marginBottom: 8 }}>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    style={{ height: '100%', borderRadius: 6, background: 'var(--los-accent)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--los-muted)' }}>
                    {gm.filter(m => m.completed).length} of {gm.length} milestones complete
                  </span>
                  <span style={{
                    fontSize: 11, fontFamily: "'DM Mono', monospace",
                    background: 'var(--los-accent-light)', color: 'var(--los-accent)',
                    padding: '2px 8px', borderRadius: 20
                  }}>{pct}%</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Milestone timeline */}
        {goals.length > 0 && (
          <div>
            <h3 style={{
              fontSize: 13, fontWeight: 500, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 20,
              fontFamily: "'DM Sans', sans-serif"
            }}>Milestones</h3>

            {goals.map(goal => {
              const gm = getGoalMilestones(goal.id)
              if (gm.length === 0 && addingMilestone !== goal.id) return (
                <div key={goal.id} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--los-primary)', marginBottom: 8 }}>{goal.title}</div>
                  <button
                    onClick={() => { setAddingMilestone(goal.id); setMsTitle('') }}
                    style={{
                      fontSize: 13, color: 'var(--los-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                    }}
                  >+ Add milestone</button>
                </div>
              )

              return (
                <div key={goal.id} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--los-primary)', marginBottom: 12 }}>{goal.title}</div>
                  <div style={{ position: 'relative', paddingLeft: 20 }}>
                    {/* Vertical line */}
                    <div style={{
                      position: 'absolute', left: 4, top: 0, bottom: 0,
                      width: 1, background: 'var(--los-accent)'
                    }} />

                    {gm.map((ms, j) => (
                      <div key={ms.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
                        {/* Node */}
                        <motion.button
                          onClick={() => toggleMilestone(ms.id)}
                          whileHover={{ scale: 1.4 }}
                          style={{
                            position: 'absolute', left: -16,
                            width: 10, height: 10, borderRadius: '50%',
                            background: ms.completed ? 'var(--los-accent)' : 'var(--los-bg)',
                            border: ms.completed ? 'none' : '1.5px solid var(--los-accent)',
                            cursor: 'pointer', padding: 0, zIndex: 1
                          }}
                        />
                        {/* Connector */}
                        <div style={{ width: 24, height: 1, background: 'var(--los-border)' }} />
                        {/* Content */}
                        <div>
                          <span style={{
                            fontSize: 13,
                            color: ms.completed ? 'var(--los-muted)' : 'var(--los-primary)',
                            textDecoration: ms.completed ? 'line-through' : 'none',
                            fontFamily: "'DM Sans', sans-serif"
                          }}>{ms.title}</span>
                          {ms.due_date && (
                            <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)', marginLeft: 8 }}>
                              {format(new Date(ms.due_date), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add milestone inline */}
                    {addingMilestone === goal.id ? (
                      <div style={{ display: 'flex', gap: 8, paddingLeft: 8 }}>
                        <input
                          value={msTitle}
                          onChange={e => setMsTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddMilestone(goal.id); if (e.key === 'Escape') setAddingMilestone(null) }}
                          placeholder="Milestone title"
                          autoFocus
                          style={{
                            fontSize: 13, border: '0.5px solid var(--los-border)',
                            borderRadius: 6, padding: '6px 10px', flex: 1,
                            background: 'var(--los-bg)', color: 'var(--los-primary)',
                            fontFamily: "'DM Sans', sans-serif"
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingMilestone(goal.id); setMsTitle('') }}
                        style={{
                          fontSize: 13, color: 'var(--los-muted)', background: 'none',
                          border: 'none', cursor: 'pointer', marginLeft: 8,
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                      >+ Add milestone</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add goal modal */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 50 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.22 }}
                style={{
                  position: 'fixed', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 420, padding: 24, borderRadius: 14,
                  background: 'var(--los-bg)', border: '0.5px solid var(--los-border)',
                  zIndex: 51
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>New Goal</h3>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Goal title"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 15,
                    border: '0.5px solid var(--los-border)', borderRadius: 6,
                    background: 'var(--los-bg)', color: 'var(--los-primary)',
                    fontFamily: "'DM Sans', sans-serif", marginBottom: 12
                  }}
                />
                <input
                  type="date"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 13,
                    fontFamily: "'DM Mono', monospace",
                    border: '0.5px solid var(--los-border)', borderRadius: 6,
                    background: 'var(--los-bg)', color: 'var(--los-primary)',
                    marginBottom: 20
                  }}
                />
                <button onClick={handleAddGoal} style={{
                  width: '100%', height: 40, background: 'var(--los-accent)',
                  color: '#fff', border: 'none', borderRadius: 6, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'background-color 150ms ease'
                }}>Create Goal</button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
