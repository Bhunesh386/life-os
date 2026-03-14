import { NavLink, useLocation } from 'react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon },
  { to: '/habits', label: 'Habits', icon: HabitsIcon },
  { to: '/mood', label: 'Mood', icon: MoodIcon },
  { to: '/finance', label: 'Finance', icon: FinanceIcon },
  { to: '/goals', label: 'Goals', icon: GoalsIcon },
  { to: '/notes', label: 'Notes', icon: NotesIcon },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [tasksLeft, setTasksLeft] = useState(0)
  const [moodColor, setMoodColor] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('los-dark') === 'true'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('los-dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    if (!user) return
    const today = format(new Date(), 'yyyy-MM-dd')
    // tasks remaining today
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('section', 'today')
      .eq('status', 'todo')
      .then(({ count }) => setTasksLeft(count ?? 0))
    // mood today
    supabase
      .from('mood_entries')
      .select('mood')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const colors: Record<number, string> = { 1: '#D95F50', 2: '#F5C4B3', 3: '#E8E7E4', 4: '#9FE1CB', 5: '#1D9E75' }
          setMoodColor(colors[data.mood] || null)
        }
      })
  }, [user, location.pathname])

  return (
    <aside style={{
      width: 200, height: '100vh', position: 'fixed', top: 0, left: 0,
      background: 'var(--los-surface)', display: 'flex', flexDirection: 'column',
      paddingTop: 20, zIndex: 10
    }}>
      {/* Logo */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", color: 'var(--los-primary)' }}>
          life<span style={{ color: 'var(--los-accent)' }}>·</span>os
        </span>
      </div>
      <div style={{ borderBottom: '0.5px solid var(--los-border)', margin: '0 16px 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              height: 36, padding: '0 16px', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: isActive ? 'var(--los-primary)' : 'var(--los-muted)',
              background: isActive ? 'var(--los-bg)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--los-accent)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'background-color 150ms ease',
              cursor: 'pointer'
            })}
          >
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer — Today at a glance */}
      <div style={{ borderTop: '0.5px solid var(--los-border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)' }}>
          {format(new Date(), 'EEE, MMM d')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {moodColor && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: moodColor }} />
          )}
          <span style={{
            fontSize: 11, fontFamily: "'DM Mono', monospace",
            background: 'var(--los-bg)', border: '0.5px solid var(--los-border)',
            borderRadius: 6, padding: '2px 8px', color: 'var(--los-muted)'
          }}>
            {tasksLeft} left today
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--los-muted)', padding: 4,
              transition: 'background-color 150ms ease'
            }}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => signOut()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--los-muted)', fontSize: 11, fontFamily: "'DM Mono', monospace",
              transition: 'background-color 150ms ease'
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}

/* ── SVG Icons (16×16, stroke-only, 1.5px) ── */

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}

function HabitsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function MoodIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}

function FinanceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}

function GoalsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
      <path d="M4 4h16" />
      <path d="M4 20h16" />
    </svg>
  )
}

function NotesIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}
