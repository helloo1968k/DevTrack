import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/lib/api'
import type { PagedResult, ProjectDto, ProjectMemberDto, WorkItemDto } from '@/types'
import { STATUS_COLUMNS, WorkItemStatus } from '@/types'
import { Avatar, Button } from '@/components/Basics'
import { PriorityBadge, TypeBadge, statusColor } from '@/components/Badges'
import { CreateWorkItemModal } from '@/components/CreateWorkItemModal'
import { WorkItemDrawer } from '@/components/WorkItemDrawer'

export default function BoardPage() {
  const { projectId } = useParams()
  const pid = Number(projectId)

  const [project, setProject] = useState<ProjectDto | null>(null)
  const [members, setMembers] = useState<ProjectMemberDto[]>([])
  const [items, setItems] = useState<WorkItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<WorkItemDto | null>(null)
  const [search, setSearch] = useState('')
  const [dragOverStatus, setDragOverStatus] = useState<WorkItemStatus | null>(null)

  useEffect(() => {
    if (!pid) return
    setLoading(true)
    Promise.all([
      api.get<ProjectDto>(`/api/projects/${pid}`),
      api.get<ProjectMemberDto[]>(`/api/projects/${pid}/members`),
      api.get<PagedResult<WorkItemDto>>(`/api/projects/${pid}/workitems?pageSize=200`)
    ])
      .then(([proj, mem, work]) => {
        setProject(proj)
        setMembers(mem)
        setItems(work.items)
      })
      .finally(() => setLoading(false))
  }, [pid])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) => i.title.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
    )
  }, [items, search])

  const columns = useMemo(() => {
    const grouped = new Map<WorkItemStatus, WorkItemDto[]>()
    STATUS_COLUMNS.forEach((c) => grouped.set(c.status, []))
    filtered.forEach((item) => {
      if (item.status === WorkItemStatus.Cancelled) return
      grouped.get(item.status)?.push(item)
    })
    return grouped
  }, [filtered])

  async function moveItem(item: WorkItemDto, status: WorkItemStatus) {
    if (item.status === status) return
    // optimistic update
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)))
    try {
      const updated = await api.patch<WorkItemDto>(
        `/api/projects/${pid}/workitems/${item.id}/status`,
        { status }
      )
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i))) // revert
    }
  }

  function handleDrop(e: DragEvent, status: WorkItemStatus) {
    e.preventDefault()
    setDragOverStatus(null)
    const id = Number(e.dataTransfer.getData('text/plain'))
    const item = items.find((i) => i.id === id)
    if (item) moveItem(item, status)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-1 rounded-full status-rail animate-pulse-rail" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-700 px-8 py-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-paper-dim">
            <span className="font-mono text-brass">{project.key}</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-paper">{project.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work items…"
            className="input w-56"
          />
          <Button onClick={() => setShowCreate(true)}>+ New item</Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 py-6">
        <div className="grid h-full auto-cols-[280px] grid-flow-col gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colItems = columns.get(col.status) ?? []
            const isOver = dragOverStatus === col.status
            return (
              <div
                key={col.status}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverStatus(col.status)
                }}
                onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`flex h-full flex-col rounded-xl border transition-colors ${
                  isOver ? 'border-brass/50 bg-ink-800/60' : 'border-ink-700 bg-ink-900/40'
                }`}
              >
                <div className="flex items-center justify-between px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: statusColor(col.status) }}
                    />
                    <span className="text-sm font-medium text-paper">{col.label}</span>
                  </div>
                  <span className="text-xs text-paper-dim">{colItems.length}</span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto px-2.5 pb-3">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', String(item.id))}
                      onClick={() => setSelected(item)}
                      className="card group cursor-pointer p-3 transition-all hover:border-brass/30 active:cursor-grabbing"
                      style={{ borderLeftWidth: 3, borderLeftColor: statusColor(item.status) }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-paper-dim">{item.code}</span>
                        <TypeBadge type={item.type} />
                      </div>
                      <p className="mt-2 text-sm leading-snug text-paper group-hover:text-brass">
                        {item.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <PriorityBadge priority={item.priority} />
                        {item.assigneeUsername && <Avatar name={item.assigneeUsername} size={22} />}
                      </div>
                    </div>
                  ))}

                  {colItems.length === 0 && (
                    <div className="rounded-lg border border-dashed border-ink-600 py-6 text-center text-xs text-paper-dim">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showCreate && (
        <CreateWorkItemModal
          projectId={pid}
          members={members}
          onClose={() => setShowCreate(false)}
          onCreated={(item) => {
            setItems((prev) => [item, ...prev])
            setShowCreate(false)
          }}
        />
      )}

      {selected && (
        <WorkItemDrawer
          item={selected}
          members={members}
          onClose={() => setSelected(null)}
          onChanged={(updated) => {
            setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
            setSelected(updated)
          }}
          onDeleted={(id) => {
            setItems((prev) => prev.filter((i) => i.id !== id))
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
