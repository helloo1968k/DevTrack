import { WorkItemPriority, WorkItemStatus, WorkItemType, PRIORITY_LABELS, TYPE_LABELS } from '@/types'

const STATUS_META: Record<WorkItemStatus, { label: string; color: string }> = {
  [WorkItemStatus.Backlog]: { label: 'Backlog', color: '#5A6478' },
  [WorkItemStatus.ToDo]: { label: 'To do', color: '#8B93A7' },
  [WorkItemStatus.InProgress]: { label: 'In progress', color: '#5B8DEF' },
  [WorkItemStatus.InReview]: { label: 'In review', color: '#9C7CE0' },
  [WorkItemStatus.Done]: { label: 'Done', color: '#4FAE8A' },
  [WorkItemStatus.Cancelled]: { label: 'Cancelled', color: '#5A6478' }
}

export function statusColor(status: WorkItemStatus): string {
  return STATUS_META[status].color
}

export function StatusDot({ status }: { status: WorkItemStatus }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ backgroundColor: STATUS_META[status].color }}
    />
  )
}

export function StatusBadge({ status }: { status: WorkItemStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
    >
      <StatusDot status={status} />
      {meta.label}
    </span>
  )
}

const PRIORITY_META: Record<WorkItemPriority, { color: string; icon: string }> = {
  [WorkItemPriority.Low]: { color: '#5A6478', icon: '▾' },
  [WorkItemPriority.Medium]: { color: '#5B8DEF', icon: '▸' },
  [WorkItemPriority.High]: { color: '#E0995B', icon: '▴' },
  [WorkItemPriority.Critical]: { color: '#E2665A', icon: '▲' }
}

export function PriorityBadge({ priority }: { priority: WorkItemPriority }) {
  const meta = PRIORITY_META[priority]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ borderColor: `${meta.color}40`, color: meta.color }}
    >
      <span aria-hidden>{meta.icon}</span>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export function TypeBadge({ type }: { type: WorkItemType }) {
  return (
    <span className="inline-flex items-center rounded border border-ink-600 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-paper-dim">
      {TYPE_LABELS[type]}
    </span>
  )
}
