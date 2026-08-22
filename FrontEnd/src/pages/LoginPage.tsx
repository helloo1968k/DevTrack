import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { ApiClientError } from '@/lib/api'
import { Button } from '@/components/Basics'
import { AuthHero } from '@/components/AuthHero'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not sign in. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
      <AuthHero />

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Welcome back</h1>
          <p className="mt-2 text-sm text-paper-dim">Sign in to pick up where your team left off.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="Username">
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input"
                placeholder="alice"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-signal-critical/30 bg-signal-critical/10 px-3 py-2 text-sm text-signal-critical">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-paper-dim">
            New here?{' '}
            <Link to="/register" className="font-medium text-brass hover:text-brass-bright">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-paper-dim">{label}</span>
      {children}
    </label>
  )
}
