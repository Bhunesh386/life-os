import { motion } from 'motion/react'
import { useAuth } from '@/lib/auth'
import { useTasks } from '@/hooks/useTasks'
import { useHabits } from '@/hooks/useHabits'
import { useMood } from '@/hooks/useMood'
import { useFinance } from '@/hooks/useFinance'
import { useGoals } from '@/hooks/useGoals'
import { useNotes } from '@/hooks/useNotes'
import { getGreeting, formatCurrency } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import Topbar from '../Topbar'

export default function Dashboard() {
  const { user } = useAuth()
  const { tasks } = useTasks()
  const { habits, habitLogs, isCheckedToday } = useHabits()
  const { entries: moodEntries, upsertMood } = useMood()
  const { transactions, totalIncome, totalExpenses, netBalance } = useFinance()
  const { goals, getGoalProgress } = useGoals()
  const { notes } = useNotes()

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayTasks = tasks.filter(t => t.section === 'today' && t.status === 'todo')
  const todayMood = moodEntries.find(e => e.date === todayStr)
  const habitsComplete = habits.filter(h => isCheckedToday(h.id)).length
  const habitsTotal = habits.length

  // Yesterday's habit count
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const yesterdayCompleted = habitLogs.filter(l => l.completed_date === yesterdayStr).length

  const insightText = `You have ${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} due today and completed ${yesterdayCompleted} of ${habitsTotal} habit${habitsTotal !== 1 ? 's' : ''} yesterday.`

  // Sparkline data — last 7 days net
  const sparkData: number[] = []
  for (let i = 6; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
    const dayTxns = transactions.filter(t => t.date === d)
    const net = dayTxns.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
    sparkData.push(net)
  }

  const moodColors: Record<number, string> = { 1: '#D95F50', 2: '#F5C4B3', 3: '#E8E7E4', 4: '#9FE1CB', 5: '#1D9E75' }
  const moodLabels: Record<number, string> = { 1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' }

  const cardStyle: React.CSSProperties = {
    border: '0.5px solid var(--los-border)', borderRadius: 10, padding: 20,
    background: 'var(--los-bg)', transition: 'background-color 150ms ease'
  }

  const ringPercent = habitsTotal > 0 ? habitsComplete / habitsTotal : 0
  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference * (1 - ringPercent)

  // Sparkline SVG path
  const sparkMax = Math.max(...sparkData.map(Math.abs), 1)
  const sparkPoints = sparkData.map((v, i) => {
    const x = (i / 6) * 120
    const y = 30 - (v / sparkMax) * 25
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <Topbar title="Dashboard" />
      <div style={{ padding: 24 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {/* Greeting — spans 2 cols */}
          <AnimCard index={0} style={{ gridColumn: 'span 2', border: 'none', background: 'transparent', padding: '20px 0' }}>
            <h1 style={{ fontSize: 28, fontWeight: 300, fontFamily: "'DM Sans', sans-serif", color: 'var(--los-primary)', marginBottom: 8, lineHeight: 1.3 }}>
              {getGreeting()}, {user?.email?.split('@')[0] || 'there'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--los-muted)', fontFamily: "'DM Sans', sans-serif" }}>
              {insightText}
            </p>
          </AnimCard>

          {/* Today Tasks */}
          <AnimCard index={1} style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 16 }}>
              Today's Tasks
            </h3>
            {todayTasks.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--los-muted)', fontStyle: 'italic' }}>All clear! ✦</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayTasks.slice(0, 5).map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--los-border)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--los-primary)' }}>{task.title}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)' }}>
              {todayTasks.length} tasks remaining
            </div>
          </AnimCard>

          {/* Habits Ring */}
          <AnimCard index={2} style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 16 }}>
              Habits
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="var(--los-border)" strokeWidth="4" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="var(--los-accent)" strokeWidth="4"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 600ms ease' }}
                />
                <text x="40" y="44" textAnchor="middle" fill="var(--los-primary)"
                  fontFamily="'DM Mono', monospace" fontSize="20" fontWeight="300">
                  {habitsTotal > 0 ? Math.round(ringPercent * 100) : 0}%
                </text>
              </svg>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {habits.filter(h => isCheckedToday(h.id)).map(h => (
                  <span key={h.id} style={{
                    fontSize: 11, fontFamily: "'DM Mono', monospace",
                    color: 'var(--los-accent)', background: 'var(--los-accent-light)',
                    padding: '2px 8px', borderRadius: 20
                  }}>{h.name}</span>
                ))}
              </div>
            </div>
          </AnimCard>

          {/* Mood */}
          <AnimCard index={3} style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 16 }}>
              Mood
            </h3>
            {todayMood ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: moodColors[todayMood.mood]
                }} />
                <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--los-primary)' }}>
                  {moodLabels[todayMood.mood]}
                </span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: 'var(--los-muted)', marginBottom: 12 }}>How are you feeling?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => upsertMood(todayStr, v)} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: moodColors[v], border: 'none', cursor: 'pointer',
                      transition: 'background-color 150ms ease'
                    }} title={moodLabels[v]} />
                  ))}
                </div>
              </div>
            )}
          </AnimCard>

          {/* Finance */}
          <AnimCard index={4} style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 16 }}>
              Finance
            </h3>
            <div style={{
              fontSize: 24, fontWeight: 300, fontFamily: "'DM Mono', monospace",
              color: netBalance >= 0 ? 'var(--los-accent)' : 'var(--los-coral)',
              marginBottom: 12
            }}>
              {formatCurrency(netBalance)}
            </div>
            {/* Sparkline */}
            <svg width="120" height="60" viewBox="0 0 120 60" style={{ marginBottom: 12 }}>
              <polyline points={sparkPoints} fill="none" stroke="var(--los-accent)" strokeWidth="1" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'var(--los-accent)' }}>
                Income {formatCurrency(totalIncome)}
              </span>
              <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'var(--los-coral)' }}>
                Expenses {formatCurrency(totalExpenses)}
              </span>
            </div>
          </AnimCard>

          {/* Goals — spans 2 cols */}
          <AnimCard index={5} style={{ ...cardStyle, gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 16 }}>
              Goals
            </h3>
            {goals.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--los-muted)', fontStyle: 'italic' }}>No goals yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.slice(0, 3).map(g => {
                  const pct = getGoalProgress(g.id)
                  return (
                    <div key={g.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: 'var(--los-primary)' }}>{g.title}</span>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-accent)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 4, background: 'var(--los-border)' }}>
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                          style={{ height: '100%', borderRadius: 4, background: 'var(--los-accent)' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </AnimCard>

          {/* Recent Notes */}
          <AnimCard index={6} style={cardStyle}>
            <h3 style={{ fontSize: 13, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--los-muted)', marginBottom: 16 }}>
              Recent Notes
            </h3>
            {notes.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--los-muted)', fontStyle: 'italic' }}>No notes yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notes.slice(0, 3).map(n => (
                  <div key={n.id}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--los-primary)', marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--los-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.content?.slice(0, 60) || 'Empty note'}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)', marginTop: 4 }}>
                      {format(new Date(n.updated_at), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimCard>
        </div>
      </div>
    </div>
  )
}

function AnimCard({ children, index, style }: { children: React.ReactNode; index: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}
