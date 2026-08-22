import { useState, type FormEvent } from 'react'
import { api, ApiClientError } from '@/lib/api'
import type { ProjectDto } from '@/types'
import { Button } from './Basics'
import { Field } from '@/pages/LoginPage'

export function CreateProjectModal({
  onClose,
  onCreated
}: {
  onClose: () => void
  onCreated: (project: ProjectDto) => void
}) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const project = await api.post<ProjectDto>('/api/projects', { name, key, description })
      onCreated(project)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl font-semibold text-paper">New project</h2>
        <p className="mt-1 text-sm text-paper-dim">
          Gives your team a shared space and a code for work item numbers.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Project name">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="Payments Platform"
            />
          </Field>
          <Field label="Key">
            <input
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 8))}
              required
              className="input font-mono uppercase"
              placeholder="PAY"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="What is this project for?"
            />
          </Field>

          {error && (
            <p className="rounded-lg border border-signal-critical/30 bg-signal-critical/10 px-3 py-2 text-sm text-signal-critical">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
