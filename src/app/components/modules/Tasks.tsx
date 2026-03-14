import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTasks } from '@/hooks/useTasks'
import { useGoals } from '@/hooks/useGoals'
import { format } from 'date-fns'
import Topbar from '../Topbar'
import type { Task, Subtask } from '@/types'

export default function Tasks() {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTask } = useTasks()
  const { goals } = useGoals()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addingTask, setAddingTask] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedTask = tasks.find(t => t.id === selectedId) || null

  const sections: { key: string; label: string }[] = [
    { key: 'today', label: 'TODAY' },
    { key: 'upcoming', label: 'UPCOMING' },
    { key: 'someday', label: 'SOMEDAY' },
  ]

  const handleAddTask = () => {
    if (newTitle.trim()) {
      addTask({ title: newTitle.trim(), section: 'today' })
      setNewTitle('')
      setAddingTask(false)
    }
  }

  return (
    <div>
      <Topbar title="Tasks" action={
        <button onClick={() => { setAddingTask(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          style={{
            fontSize: 13, border: '0.5px solid var(--los-border)', borderRadius: 6,
            background: 'transparent', color: 'var(--los-primary)', padding: '6px 12px',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'background-color 150ms ease'
          }}>
          + Add task
        </button>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: selectedTask ? '60% 40%' : '1fr', height: 'calc(100vh - 48px)' }}>
        {/* Left — Task list */}
        <div style={{ overflow: 'auto', padding: '16px 24px' }}>
          {/* Add task input */}
          <AnimatePresence>
            {addingTask && (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                style={{ transformOrigin: 'top', marginBottom: 8 }}
                transition={{ duration: 0.18 }}
              >
                <input
                  ref={inputRef}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') { setAddingTask(false); setNewTitle('') } }}
                  placeholder="Task title…"
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 15,
                    fontFamily: "'DM Sans', sans-serif",
                    border: '0.5px solid var(--los-accent)',
                    borderRadius: 6, background: 'var(--los-bg)',
                    color: 'var(--los-primary)', outline: 'none'
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {sections.map(section => {
            const sectionTasks = tasks.filter(t => t.section === section.key)
            const isCollapsed = collapsed[section.key]
            return (
              <div key={section.key} style={{ marginBottom: 24 }}>
                <button
                  onClick={() => setCollapsed(p => ({ ...p, [section.key]: !p[section.key] }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    fontSize: 11, fontWeight: 500, textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em', color: 'var(--los-muted)',
                    background: 'none', border: 'none', borderBottom: '0.5px solid var(--los-border)',
                    paddingBottom: 8, marginBottom: 4, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                >
                  <span style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 150ms' }}>▾</span>
                  {section.label}
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                    ({sectionTasks.filter(t => t.status === 'todo').length})
                  </span>
                </button>

                <AnimatePresence>
                  {!isCollapsed && sectionTasks.map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => setSelectedId(task.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        minHeight: 44, padding: '0 8px',
                        borderBottom: '0.5px solid var(--los-border)',
                        cursor: 'pointer',
                        background: selectedId === task.id ? 'var(--los-surface)' : 'transparent',
                        transition: 'background-color 150ms ease',
                        opacity: task.status === 'done' ? 0.35 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleTask(task.id) }}
                        style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: task.status === 'done' ? 'none' : '1.5px solid var(--los-border)',
                          background: task.status === 'done' ? 'var(--los-accent)' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'background-color 150ms ease', padding: 0
                        }}
                      >
                        {task.status === 'done' && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                              d="M20 6L9 17l-5-5"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          </svg>
                        )}
                      </button>

                      {/* Title */}
                      <span style={{
                        fontSize: 15, color: 'var(--los-primary)', flex: 1,
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                        fontFamily: "'DM Sans', sans-serif"
                      }}>
                        {task.title}
                      </span>

                      {/* Due date chip */}
                      {task.due_date && (
                        <span style={{
                          fontSize: 11, fontFamily: "'DM Mono', monospace",
                          color: 'var(--los-muted)', background: 'var(--los-surface)',
                          padding: '2px 8px', borderRadius: 6,
                          border: '0.5px solid var(--los-border)'
                        }}>
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      )}

                      {/* Priority dot */}
                      <div style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: task.priority === 'high' ? 'var(--los-accent)' : 'var(--los-border)',
                        flexShrink: 0
                      }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          })}

          {/* Add task CTA at bottom */}
          {!addingTask && (
            <button
              onClick={() => { setAddingTask(true); setTimeout(() => inputRef.current?.focus(), 50) }}
              style={{
                fontSize: 13, color: 'var(--los-muted)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '8px 0',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background-color 150ms ease'
              }}
            >
              + Add task
            </button>
          )}
        </div>

        {/* Right — Detail panel */}
        <AnimatePresence>
          {selectedTask && (
            <TaskDetail
              key={selectedTask.id}
              task={selectedTask}
              goals={goals}
              onUpdate={(updates) => updateTask(selectedTask.id, updates)}
              onDelete={() => { deleteTask(selectedTask.id); setSelectedId(null) }}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TaskDetail({ task, goals, onUpdate, onDelete, onClose }: {
  task: Task
  goals: { id: string; title: string }[]
  onUpdate: (u: Partial<Task>) => void
  onDelete: () => void
  onClose: () => void
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [subtaskTitle, setSubtaskTitle] = useState('')

  useEffect(() => { setTitle(task.title); setDescription(task.description || '') }, [task.id])

  const debouncedUpdate = (updates: Partial<Task>) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onUpdate(updates), 500)
  }

  const addSubtask = () => {
    if (!subtaskTitle.trim()) return
    const newSub: Subtask = { id: crypto.randomUUID(), title: subtaskTitle.trim(), completed: false }
    onUpdate({ subtasks: [...(task.subtasks || []), newSub] })
    setSubtaskTitle('')
  }

  const toggleSubtask = (subId: string) => {
    const updated = (task.subtasks || []).map(s =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    )
    onUpdate({ subtasks: updated })
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: 'var(--los-muted)',
    marginBottom: 6, display: 'block', fontFamily: "'DM Sans', sans-serif"
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderLeft: '0.5px solid var(--los-border)',
        padding: 24, overflow: 'auto', height: 'calc(100vh - 48px)'
      }}
    >
      {/* Title */}
      <input
        value={title}
        onChange={e => { setTitle(e.target.value); debouncedUpdate({ title: e.target.value }) }}
        style={{
          width: '100%', fontSize: 18, fontWeight: 500, border: 'none', outline: 'none',
          background: 'transparent', color: 'var(--los-primary)',
          fontFamily: "'DM Sans', sans-serif", marginBottom: 16
        }}
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={e => { setDescription(e.target.value); debouncedUpdate({ description: e.target.value }) }}
        placeholder="Add a description…"
        style={{
          width: '100%', minHeight: 80, fontSize: 14, lineHeight: 1.7,
          border: 'none', outline: 'none', background: 'transparent',
          color: 'var(--los-primary)', resize: 'none',
          fontFamily: "'DM Sans', sans-serif", marginBottom: 24
        }}
      />

      {/* Metadata fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input
            type="date"
            value={task.due_date || ''}
            onChange={e => onUpdate({ due_date: e.target.value || null })}
            style={{
              fontSize: 13, fontFamily: "'DM Mono', monospace",
              border: '0.5px solid var(--los-border)', borderRadius: 6,
              padding: '6px 10px', background: 'var(--los-bg)',
              color: 'var(--los-primary)'
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['high', 'normal'] as const).map(p => (
              <button key={p} onClick={() => onUpdate({ priority: p })}
                style={{
                  fontSize: 13, padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                  border: '0.5px solid var(--los-border)',
                  background: task.priority === p ? (p === 'high' ? 'var(--los-accent)' : 'var(--los-surface)') : 'transparent',
                  color: task.priority === p && p === 'high' ? '#fff' : 'var(--los-primary)',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'background-color 150ms ease'
                }}
              >{p === 'high' ? 'High' : 'Normal'}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Section</label>
          <select
            value={task.section}
            onChange={e => onUpdate({ section: e.target.value as Task['section'] })}
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '0.5px solid var(--los-border)', background: 'var(--los-bg)',
              color: 'var(--los-primary)', fontFamily: "'DM Sans', sans-serif"
            }}
          >
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="someday">Someday</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Linked to Goal</label>
          <select
            value={task.goal_id || ''}
            onChange={e => onUpdate({ goal_id: e.target.value || null })}
            style={{
              fontSize: 13, padding: '6px 10px', borderRadius: 6,
              border: '0.5px solid var(--los-border)', background: 'var(--los-bg)',
              color: 'var(--los-primary)', fontFamily: "'DM Sans', sans-serif"
            }}
          >
            <option value="">None</option>
            {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>

        {/* Subtasks */}
        <div>
          <label style={labelStyle}>Subtasks</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(task.subtasks || []).map(sub => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => toggleSubtask(sub.id)} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: sub.completed ? 'none' : '1.5px solid var(--los-border)',
                  background: sub.completed ? 'var(--los-accent)' : 'transparent',
                  cursor: 'pointer', padding: 0, flexShrink: 0
                }} />
                <span style={{
                  fontSize: 13, color: sub.completed ? 'var(--los-muted)' : 'var(--los-primary)',
                  textDecoration: sub.completed ? 'line-through' : 'none'
                }}>{sub.title}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={subtaskTitle}
                onChange={e => setSubtaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                placeholder="+ Add subtask"
                style={{
                  fontSize: 13, border: 'none', outline: 'none',
                  background: 'transparent', color: 'var(--los-primary)',
                  fontFamily: "'DM Sans', sans-serif", flex: 1
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete */}
      <button onClick={onDelete} style={{
        marginTop: 32, fontSize: 13, color: 'var(--los-coral)',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'background-color 150ms ease'
      }}>
        Delete task
      </button>
    </motion.div>
  )
}
