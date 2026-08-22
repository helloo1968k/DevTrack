import { useState, type FormEvent } from 'react'
import { api, ApiClientError } from '@/lib/api'
import type { ProjectMemberDto, WorkItemDto } from '@/types'
import { WorkItemType, WorkItemPriority, TYPE_LABELS, PRIORITY_LABELS } from '@/types'
import { Button } from './Basics'
import { Field } from '@/pages/LoginPage'

export function CreateWorkItemModal({
  projectId,
  members,
  onClose,
  onCreated
}: {
  projectId: number
  members: ProjectMemberDto[]
  onClose: () => void
  onCreated: (item: WorkItemDto) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState(WorkItemType.Task)
  const [priority, setPriority] = useState(WorkItemPriority.Medium)
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const item = await api.post<WorkItemDto>(`/api/projects/${projectId}/workitems`, {
        title,
        description,
        type,
        priority,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        parentId: null,
        dueDate: null,
        estimatedHours: null
      })
      onCreated(item)
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not create work item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-paper">New work item</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Title">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Set up CI pipeline"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[70px] resize-none"
              placeholder="Optional details…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <select value={type} onChange={(e) => setType(Number(e.target.value))} className="input">
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="input"
              >
                {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Assignee">
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="input">
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.username}
                </option>
              ))}
            </select>
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
              {loading ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
