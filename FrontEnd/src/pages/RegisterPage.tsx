import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import { ApiClientError } from '@/lib/api'
import { Button } from '@/components/Basics'
import { AuthHero } from '@/components/AuthHero'
import { Field } from './LoginPage'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(username, email, password, fullName)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid h-screen grid-cols-1 lg:grid-cols-2">
      <AuthHero />

      <div className="flex items-center justify-center overflow-y-auto px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <h1 className="font-display text-3xl font-semibold text-paper">Create your account</h1>
          <p className="mt-2 text-sm text-paper-dim">Start tracking work in under a minute.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="Full name">
              <input
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input"
                placeholder="Alice Dev"
              />
            </Field>
            <Field label="Username">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input"
                placeholder="alice"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="alice@example.com"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input"
                placeholder="At least 8 characters"
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-signal-critical/30 bg-signal-critical/10 px-3 py-2 text-sm text-signal-critical">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-sm text-paper-dim">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brass hover:text-brass-bright">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
