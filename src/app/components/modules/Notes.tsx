import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNotes } from '@/hooks/useNotes'
import { format } from 'date-fns'
import Topbar from '../Topbar'

export default function Notes() {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const titleRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const selectedNote = notes.find(n => n.id === selectedId) || null

  const filteredNotes = searchQuery
    ? notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  const handleNew = async () => {
    const note = await addNote()
    if (note) {
      setSelectedId(note.id)
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }

  const handleSave = useCallback((id: string, updates: { title?: string; content?: string }) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateNote(id, updates)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }, [updateNote])

  // Sync editable content when selection changes
  useEffect(() => {
    if (selectedNote && titleRef.current) {
      if (titleRef.current.textContent !== selectedNote.title) {
        titleRef.current.textContent = selectedNote.title
      }
    }
    if (selectedNote && contentRef.current) {
      if (contentRef.current.innerHTML !== selectedNote.content) {
        contentRef.current.innerHTML = selectedNote.content
      }
    }
  }, [selectedId])

  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? `<mark style="background: var(--los-accent-light); border-radius: 2px">${part}</mark>`
        : part
    ).join('')
  }

  return (
    <div>
      <Topbar title="Notes" action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)' }}
              >
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={handleNew} style={{
            fontSize: 13, border: '0.5px solid var(--los-border)', borderRadius: 6,
            background: 'transparent', color: 'var(--los-primary)', padding: '6px 12px',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'background-color 150ms ease'
          }}>+ New</button>
        </div>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 48px)' }}>
        {/* Left — Note list */}
        <div style={{ borderRight: '0.5px solid var(--los-border)', overflow: 'auto' }}>
          {/* Search */}
          <div style={{ padding: 12 }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes…"
              style={{
                width: '100%', height: 32, padding: '0 12px', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                border: '0.5px solid var(--los-border)', borderRadius: 6,
                background: 'var(--los-bg)', color: 'var(--los-primary)',
                transition: 'box-shadow 100ms, height 100ms'
              }}
              onFocus={e => { e.currentTarget.style.height = '36px'; e.currentTarget.style.borderColor = 'var(--los-accent)' }}
              onBlur={e => { e.currentTarget.style.height = '32px'; e.currentTarget.style.borderColor = 'var(--los-border)' }}
            />
          </div>

          {/* Notes */}
          {filteredNotes.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--los-muted)' }}>
                {searchQuery ? 'No matching notes' : 'No notes yet'}
              </p>
            </div>
          )}

          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              style={{
                height: 72, padding: '10px 16px',
                borderBottom: '0.5px solid var(--los-border)',
                borderLeft: selectedId === note.id ? '2px solid var(--los-accent)' : '2px solid transparent',
                background: selectedId === note.id ? 'var(--los-accent-light)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 150ms ease',
                overflow: 'hidden'
              }}
            >
              <div style={{
                fontSize: 14, fontWeight: 500, color: 'var(--los-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 2
              }}
                dangerouslySetInnerHTML={searchQuery
                  ? { __html: highlightText(note.title, searchQuery) }
                  : undefined
                }
              >
                {!searchQuery ? note.title : undefined}
              </div>
              <div style={{
                fontSize: 13, color: 'var(--los-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 4
              }}>
                {note.content?.replace(/<[^>]*>/g, '').slice(0, 60) || 'Empty note'}
              </div>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)', textAlign: 'right' }}>
                {format(new Date(note.updated_at), 'MMM d')}
              </div>
            </div>
          ))}
        </div>

        {/* Right — Editor */}
        <div style={{ overflow: 'auto', padding: 24 }}>
          {!selectedNote ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="var(--los-border)" strokeWidth="1.5">
                  <path d="M30 30h60v60H30z" rx="4" />
                  <line x1="45" y1="50" x2="75" y2="50" />
                  <line x1="45" y1="60" x2="65" y2="60" />
                  <line x1="45" y1="70" x2="70" y2="70" />
                </svg>
                <p style={{ fontSize: 13, color: 'var(--los-muted)', marginTop: 16 }}>Select or create a note</p>
              </div>
            </div>
          ) : (
            <motion.div
              key={selectedNote.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {/* Title */}
              <div
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e => handleSave(selectedNote.id, { title: e.currentTarget.textContent || '' })}
                data-placeholder="Untitled"
                style={{
                  fontSize: 22, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', color: 'var(--los-primary)',
                  marginBottom: 12, minHeight: 32
                }}
              />
              <style>{`
                [data-placeholder]:empty::before {
                  content: attr(data-placeholder);
                  color: var(--los-muted);
                  pointer-events: none;
                }
              `}</style>

              {/* Divider */}
              <div style={{ borderBottom: '0.5px solid var(--los-border)', margin: '0 0 12px' }} />

              {/* Content */}
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                onInput={e => handleSave(selectedNote.id, { content: e.currentTarget.innerHTML })}
                data-placeholder="Start writing..."
                style={{
                  fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.7, outline: 'none',
                  color: 'var(--los-primary)', minHeight: 400
                }}
              />

              {/* Delete */}
              <div style={{ marginTop: 32, borderTop: '0.5px solid var(--los-border)', paddingTop: 16 }}>
                <button onClick={() => { deleteNote(selectedNote.id); setSelectedId(null) }} style={{
                  fontSize: 13, color: 'var(--los-coral)', background: 'none',
                  border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  transition: 'background-color 150ms ease'
                }}>Delete note</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
