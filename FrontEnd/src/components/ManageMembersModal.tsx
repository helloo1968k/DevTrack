import { useEffect, useState } from 'react'
import { api, ApiClientError } from '@/lib/api'
import type { ProjectMemberDto, UserDto } from '@/types'
import { ProjectRole } from '@/types'
import { Avatar, Button } from './Basics'

const ROLE_LABELS: Record<ProjectRole, string> = {
  [ProjectRole.Owner]: 'Owner',
  [ProjectRole.Maintainer]: 'Maintainer',
  [ProjectRole.Contributor]: 'Contributor',
  [ProjectRole.Viewer]: 'Viewer'
}

export function ManageMembersModal({
  projectId,
  ownerId,
  onClose
}: {
  projectId: number
  ownerId: number
  onClose: () => void
}) {
  const [members, setMembers] = useState<ProjectMemberDto[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserDto[]>([])
  const [role, setRole] = useState<ProjectRole>(ProjectRole.Contributor)
  const [error, setError] = useState<string | null>(null)

  function loadMembers() {
    api.get<ProjectMemberDto[]>(`/api/projects/${projectId}/members`).then(setMembers)
  }

  useEffect(() => {
    loadMembers()
  }, [projectId])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(() => {
      api.get<UserDto[]>(`/api/users/search?q=${encodeURIComponent(query)}`).then(setResults)
    }, 250)
    return () => clearTimeout(timeout)
  }, [query])

  async function addMember(userId: number) {
    setError(null)
    try {
      await api.post(`/api/projects/${projectId}/members`, { userId, role })
      setQuery('')
      setResults([])
      loadMembers()
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not add member.')
    }
  }

  async function removeMember(userId: number) {
    if (!confirm('Remove this member from the project?')) return
    try {
      await api.delete(`/api/projects/${projectId}/members/${userId}`)
      loadMembers()
    } catch (err) {
      if (err instanceof ApiClientError) alert(err.message)
    }
  }

  const existingIds = new Set(members.map((m) => m.userId))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-paper">Manage members</h2>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-paper-dim">Add someone</label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username or email…"
              className="input flex-1"
            />
            <select
              value={role}
              onChange={(e) => setRole(Number(e.target.value))}
              className="input w-36"
            >
              {Object.entries(ROLE_LABELS)
                .filter(([val]) => Number(val) !== ProjectRole.Owner)
                .map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          {results.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-ink-600">
              {results.map((u) => (
                <button
                  key={u.id}
                  disabled={existingIds.has(u.id)}
                  onClick={() => addMember(u.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-paper hover:bg-ink-800 disabled:opacity-40"
                >
                  <Avatar name={u.username} size={22} />
                  <span>{u.username}</span>
                  <span className="text-xs text-paper-dim">{u.email}</span>
                  {existingIds.has(u.id) && (
                    <span className="ml-auto text-xs text-paper-dim">Already a member</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="mt-2 rounded-lg border border-signal-critical/30 bg-signal-critical/10 px-3 py-2 text-sm text-signal-critical">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-medium text-paper-dim">
            Current members ({members.length})
          </label>
          <div className="space-y-1.5">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-ink-800"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={m.username} size={24} />
                  <span className="text-sm text-paper">{m.username}</span>
                  <span className="text-xs text-paper-dim">{ROLE_LABELS[m.role]}</span>
                </div>
                {m.userId !== ownerId && (
                  <button
                    onClick={() => removeMember(m.userId)}
                    className="text-xs text-paper-dim hover:text-signal-critical"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}