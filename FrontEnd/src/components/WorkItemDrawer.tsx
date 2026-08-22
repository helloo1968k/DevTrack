import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { api, ApiClientError } from '@/lib/api'
import type { CommentDto, ProjectMemberDto, WorkItemActivityDto, WorkItemDto } from '@/types'
import { WorkItemStatus, WorkItemPriority, STATUS_COLUMNS, PRIORITY_LABELS } from '@/types'
import { Avatar, Button } from './Basics'
import { PriorityBadge, TypeBadge } from './Badges'

export function WorkItemDrawer({
  item,
  members,
  onClose,
  onChanged,
  onDeleted
}: {
  item: WorkItemDto
  members: ProjectMemberDto[]
  onClose: () => void
  onChanged: (item: WorkItemDto) => void
  onDeleted: (id: number) => void
}) {
  const [tab, setTab] = useState<'comments' | 'activity'>('comments')
  const [comments, setComments] = useState<CommentDto[]>([])
  const [activity, setActivity] = useState<WorkItemActivityDto[]>([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get<CommentDto[]>(`/api/projects/${item.projectId}/workitems/${item.id}/comments`)
      .then(setComments)
      .catch(() => {})
    api
      .get<WorkItemActivityDto[]>(`/api/projects/${item.projectId}/workitems/${item.id}/activity`)
      .then(setActivity)
      .catch(() => {})
  }, [item.id])

  async function updateStatus(status: WorkItemStatus) {
    setSaving(true)
    try {
      const updated = await api.patch<WorkItemDto>(
        `/api/projects/${item.projectId}/workitems/${item.id}/status`,
        { status }
      )
      onChanged(updated)
    } finally {
      setSaving(false)
    }
  }

  async function updateField(patch: Partial<WorkItemDto>) {
    setSaving(true)
    try {
      const updated = await api.put<WorkItemDto>(
        `/api/projects/${item.projectId}/workitems/${item.id}`,
        {
          title: patch.title ?? item.title,
          description: patch.description ?? item.description,
          type: patch.type ?? item.type,
          priority: patch.priority ?? item.priority,
          assigneeId: 'assigneeId' in patch ? patch.assigneeId : item.assigneeId,
          dueDate: patch.dueDate ?? item.dueDate,
          estimatedHours: patch.estimatedHours ?? item.estimatedHours
        }
      )
      onChanged(updated)
    } finally {
      setSaving(false)
    }
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    setPosting(true)
    try {
      const comment = await api.post<CommentDto>(
        `/api/projects/${item.projectId}/workitems/${item.id}/comments`,
        { content: commentText }
      )
      setComments((prev) => [...prev, comment])
      setCommentText('')
    } catch (err) {
      // surfaced inline via disabled state; keep drawer usable
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${item.code}? This can't be undone.`)) return
    try {
      await api.delete(`/api/projects/${item.projectId}/workitems/${item.id}`)
      onDeleted(item.id)
    } catch (err) {
      if (err instanceof ApiClientError) alert(err.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/60 backdrop-blur-sm">
      <button
        aria-label="Close panel"
        className="absolute inset-0 -z-10 cursor-default"
        onClick={onClose}
      />
      <div className="flex h-full w-full max-w-lg animate-fade-up flex-col border-l border-ink-700 bg-ink-900 shadow-panel">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink-700 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-brass">{item.code}</span>
              <TypeBadge type={item.type} />
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-paper">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-paper-dim hover:bg-ink-800 hover:text-paper"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Status pipeline */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_COLUMNS.map((col) => (
              <button
                key={col.status}
                disabled={saving}
                onClick={() => updateStatus(col.status)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  item.status === col.status
                    ? 'bg-brass text-ink-950'
                    : 'bg-ink-800 text-paper-dim hover:text-paper'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-medium text-paper-dim">Description</label>
            <textarea
              defaultValue={item.description}
              onBlur={(e) => e.target.value !== item.description && updateField({ description: e.target.value })}
              className="input min-h-[100px] resize-none"
              placeholder="Add a description…"
            />
          </div>

          {/* Meta grid */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-paper-dim">Priority</label>
              <select
                value={item.priority}
                onChange={(e) => updateField({ priority: Number(e.target.value) as WorkItemPriority })}
                className="input"
              >
                {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-paper-dim">Assignee</label>
              <select
                value={item.assigneeId ?? ''}
                onChange={(e) =>
                  updateField({ assigneeId: e.target.value ? Number(e.target.value) : null })
                }
                className="input"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-paper-dim">
            <span>
              Reported by <span className="text-paper">{item.reporterUsername}</span>
            </span>
            <span className="flex items-center gap-1">
              <PriorityBadge priority={item.priority} />
            </span>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-4 border-b border-ink-700">
            <TabButton active={tab === 'comments'} onClick={() => setTab('comments')}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </TabButton>
            <TabButton active={tab === 'activity'} onClick={() => setTab('activity')}>
              Activity
            </TabButton>
          </div>

          {tab === 'comments' ? (
            <div className="mt-4 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar name={c.username} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-paper">{c.username}</span>
                      <span className="text-xs text-paper-dim">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-paper-dim">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="py-4 text-sm text-paper-dim">No comments yet — be the first to weigh in.</p>
              )}

              <form onSubmit={submitComment} className="flex gap-2 pt-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input"
                  placeholder="Write a comment…"
                />
                <Button type="submit" disabled={posting || !commentText.trim()}>
                  Post
                </Button>
              </form>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <Avatar name={a.username} size={22} />
                  <p className="text-paper-dim">
                    <span className="font-medium text-paper">{a.username}</span> changed{' '}
                    <span className="text-paper">{a.fieldChanged}</span>
                    {a.oldValue && <> from <span className="text-paper">{a.oldValue}</span></>}
                    {' '}to <span className="text-paper">{a.newValue}</span>
                    <span className="ml-2 text-xs text-paper-dim/70">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>
              ))}
              {activity.length === 0 && (
                <p className="py-4 text-sm text-paper-dim">No changes recorded yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-ink-700 px-6 py-4">
          <Button variant="danger" onClick={handleDelete} className="w-full">
            Delete work item
          </Button>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${
        active ? 'border-brass text-paper' : 'border-transparent text-paper-dim hover:text-paper'
      }`}
    >
      {children}
    </button>
  )
}
