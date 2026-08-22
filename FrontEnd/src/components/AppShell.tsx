import { NavLink, Outlet, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { ProjectDto } from '@/types'
import { StatusRail } from './StatusRail'
import { Avatar } from './Basics'

export default function AppShell() {
  const { user, logout } = useAuth()
  const { projectId } = useParams()
  const [projects, setProjects] = useState<ProjectDto[]>([])

  useEffect(() => {
    api.get<ProjectDto[]>('/api/projects').then(setProjects).catch(() => {})
  }, [])

  return (
    <div className="flex h-screen bg-ink-950">
      {/* Sidebar */}
      <aside className="relative flex w-64 shrink-0 flex-col border-r border-ink-700 bg-ink-900/60">
        <div className="absolute inset-y-0 right-0">
          <StatusRail width={2} />
        </div>

        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brass text-sm font-bold text-ink-950">
            D
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-paper">
            DevTracker
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          <p className="px-2 pb-1.5 pt-3 text-[11px] font-medium uppercase tracking-wider text-paper-dim/70">
            Projects
          </p>
          {projects.length === 0 && (
            <p className="px-2 py-2 text-sm text-paper-dim">No projects yet</p>
          )}
          {projects.map((p) => (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}`}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  isActive || projectId === String(p.id)
                    ? 'bg-ink-800 text-paper'
                    : 'text-paper-dim hover:bg-ink-800/60 hover:text-paper'
                }`
              }
            >
              <span className="flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] text-brass">{p.key}</span>
                <span className="truncate">{p.name}</span>
              </span>
              <span className="text-xs text-paper-dim">{p.workItemCount}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-700 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar name={user?.fullName ?? user?.username ?? '?'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-paper">{user?.fullName}</p>
              <p className="truncate text-xs text-paper-dim">@{user?.username}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-md px-2 py-1 text-xs text-paper-dim hover:bg-ink-800 hover:text-paper"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet context={{ projects, setProjects }} />
      </main>
    </div>
  )
}
