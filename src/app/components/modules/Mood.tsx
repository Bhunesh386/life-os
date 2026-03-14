import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMood } from '@/hooks/useMood'
import { format, subDays } from 'date-fns'
import Topbar from '../Topbar'

const moodColors: Record<number, string> = { 1: '#D95F50', 2: '#F5C4B3', 3: '#E8E7E4', 4: '#9FE1CB', 5: '#1D9E75' }
const moodLabels: Record<number, string> = { 1: 'Awful', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Great' }

export default function Mood() {
  const { entries, upsertMood, updateJournal, getEntry } = useMood()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const [journalText, setJournalText] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const entry = getEntry(selectedDate)

  useEffect(() => {
    setJournalText(entry?.journal_text || '')
    setWordCount(entry?.journal_text?.trim().split(/\s+/).filter(Boolean).length || 0)
  }, [selectedDate, entry?.journal_text])

  const handleJournalChange = useCallback((text: string) => {
    setJournalText(text)
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateJournal(selectedDate, text), 800)
  }, [selectedDate, updateJournal])

  // Build 35-day calendar
  const days: string[] = []
  for (let i = 34; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }

  // Insights
  const insights: string[] = []
  const recentEntries = entries.filter(e => {
    const d = new Date(e.date)
    return d >= subDays(new Date(), 7)
  })
  if (recentEntries.length > 0) {
    const avg = recentEntries.reduce((s, e) => s + e.mood, 0) / recentEntries.length
    if (avg >= 4) insights.push('Mood improving this week')
    const goodDays = recentEntries.filter(e => e.mood >= 4).length
    if (goodDays >= 3) insights.push(`${goodDays} great days this week`)
  }
  // Day of week analysis
  const dayMoods: Record<string, number[]> = {}
  entries.forEach(e => {
    const dow = format(new Date(e.date), 'EEEE')
    ;(dayMoods[dow] = dayMoods[dow] || []).push(e.mood)
  })
  const happiest = Object.entries(dayMoods).sort((a, b) => {
    const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length
    const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length
    return avgB - avgA
  })[0]
  if (happiest) insights.push(`Usually happy on ${happiest[0]}s`)

  return (
    <div>
      <Topbar title="Mood & Journal" />
      <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', height: 'calc(100vh - 48px)' }}>
        {/* Left — Calendar */}
        <div style={{ borderRight: '0.5px solid var(--los-border)', padding: 24, overflow: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6, maxWidth: 280
          }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)', textAlign: 'center', marginBottom: 4 }}>
                {d}
              </div>
            ))}
            {days.map(d => {
              const e = getEntry(d)
              const isSelected = d === selectedDate
              return (
                <motion.button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  whileHover={{ scale: 1.1 }}
                  style={{
                    width: 32, height: 32, borderRadius: 4,
                    background: e ? moodColors[e.mood] : 'transparent',
                    border: e ? (isSelected ? '2px solid var(--los-primary)' : 'none') : '0.5px dashed var(--los-border)',
                    cursor: 'pointer', padding: 0,
                    outline: isSelected && !e ? '2px solid var(--los-accent)' : 'none',
                    transition: 'background-color 150ms ease'
                  }}
                  title={`${format(new Date(d), 'MMM d')}${e ? ` — ${moodLabels[e.mood]}` : ''}`}
                />
              )
            })}
          </div>

          <div style={{ marginTop: 16, fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)' }}>
            {format(new Date(selectedDate), 'MMMM yyyy')}
          </div>
        </div>

        {/* Right — Journal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ padding: 24, overflow: 'auto' }}
          >
            <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)', marginBottom: 20 }}>
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </div>

            {/* Mood selector */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
              {[1, 2, 3, 4, 5].map(v => (
                <motion.button
                  key={v}
                  onClick={() => upsertMood(selectedDate, v)}
                  whileHover={{ scale: 1.08 }}
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: moodColors[v], border: 'none', cursor: 'pointer',
                    outline: entry?.mood === v ? `2.5px solid var(--los-accent)` : 'none',
                    outlineOffset: 3,
                    transform: entry?.mood === v ? 'scale(1.08)' : 'scale(1)',
                    transition: 'transform 180ms ease, outline 180ms ease',
                    padding: 0
                  }}
                  title={moodLabels[v]}
                />
              ))}
            </div>

            {/* Journal */}
            <div style={{ position: 'relative' }}>
              <textarea
                value={journalText}
                onChange={e => handleJournalChange(e.target.value)}
                placeholder="What's on your mind today?"
                style={{
                  width: '100%', minHeight: 200, fontSize: 16,
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7,
                  border: 'none', outline: 'none', background: 'transparent',
                  color: 'var(--los-primary)', resize: 'none'
                }}
              />
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--los-muted)'
              }}>
                {wordCount} words
              </div>
            </div>

            {/* Insight chips */}
            {insights.length > 0 && (
              <div style={{
                display: 'flex', gap: 8, marginTop: 24,
                overflowX: 'auto', scrollbarWidth: 'none' as const,
                whiteSpace: 'nowrap' as const,
              }}>
                {insights.map((text, i) => (
                  <span key={i} style={{
                    background: 'var(--los-accent-light)', color: 'var(--los-accent)',
                    fontSize: 11, fontFamily: "'DM Mono', monospace",
                    padding: '4px 12px', borderRadius: 20, flexShrink: 0
                  }}>
                    ✦ {text}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
