export enum WorkItemType {
  Epic = 0,
  Story = 1,
  Task = 2,
  Bug = 3
}

export enum WorkItemStatus {
  Backlog = 0,
  ToDo = 1,
  InProgress = 2,
  InReview = 3,
  Done = 4,
  Cancelled = 5
}

export enum WorkItemPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export enum ProjectRole {
  Owner = 0,
  Maintainer = 1,
  Contributor = 2,
  Viewer = 3
}

export const STATUS_COLUMNS: { status: WorkItemStatus; label: string }[] = [
  { status: WorkItemStatus.Backlog, label: 'Backlog' },
  { status: WorkItemStatus.ToDo, label: 'To do' },
  { status: WorkItemStatus.InProgress, label: 'In progress' },
  { status: WorkItemStatus.InReview, label: 'In review' },
  { status: WorkItemStatus.Done, label: 'Done' }
]

export const TYPE_LABELS: Record<WorkItemType, string> = {
  [WorkItemType.Epic]: 'Epic',
  [WorkItemType.Story]: 'Story',
  [WorkItemType.Task]: 'Task',
  [WorkItemType.Bug]: 'Bug'
}

export const PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  [WorkItemPriority.Low]: 'Low',
  [WorkItemPriority.Medium]: 'Medium',
  [WorkItemPriority.High]: 'High',
  [WorkItemPriority.Critical]: 'Critical'
}

export interface UserDto {
  id: number
  username: string
  email: string
  fullName: string
  role: number
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: UserDto
}

export interface ProjectDto {
  id: number
  name: string
  key: string
  description: string
  ownerId: number
  isArchived: boolean
  createdAt: string
  workItemCount: number
}

export interface ProjectMemberDto {
  id: number
  userId: number
  username: string
  role: ProjectRole
}

export interface WorkItemDto {
  id: number
  code: string
  projectId: number
  title: string
  description: string
  type: WorkItemType
  status: WorkItemStatus
  priority: WorkItemPriority
  parentId: number | null
  reporterId: number
  reporterUsername: string
  assigneeId: number | null
  assigneeUsername: string | null
  dueDate: string | null
  estimatedHours: number | null
  createdAt: string
  updatedAt: string | null
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface CommentDto {
  id: number
  workItemId: number
  userId: number
  username: string
  content: string
  createdAt: string
}

export interface WorkItemActivityDto {
  id: number
  userId: number
  username: string
  fieldChanged: string
  oldValue: string | null
  newValue: string | null
  createdAt: string
}

export interface ApiError {
  error: string
}
