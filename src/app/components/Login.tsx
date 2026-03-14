import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import { motion } from 'motion/react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--los-surface)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: 400, padding: 40, borderRadius: 14,
          background: 'var(--los-bg)',
          border: '0.5px solid var(--los-border)'
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 500, color: 'var(--los-primary)' }}>
            life<span style={{ color: 'var(--los-accent)' }}>·</span>os
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--los-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px', fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                border: '0.5px solid var(--los-border)',
                borderRadius: 6, background: 'var(--los-bg)',
                color: 'var(--los-primary)',
                transition: 'box-shadow 100ms'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--los-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '10px 12px', fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                border: '0.5px solid var(--los-border)',
                borderRadius: 6, background: 'var(--los-bg)',
                color: 'var(--los-primary)',
                transition: 'box-shadow 100ms'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 40, fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              background: 'var(--los-accent)', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 150ms ease'
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--los-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--los-accent)', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
