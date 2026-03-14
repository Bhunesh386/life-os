import { ReactNode } from 'react'

interface TopbarProps {
  title: string
  action?: ReactNode
}

export default function Topbar({ title, action }: TopbarProps) {
  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '0.5px solid var(--los-border)',
      background: 'var(--los-bg)',
      flexShrink: 0
    }}>
      <span style={{ fontSize: 16, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", color: 'var(--los-primary)' }}>
        {title}
      </span>
      {action && <div>{action}</div>}
    </div>
  )
}
