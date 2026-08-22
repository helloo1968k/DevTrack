import { useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import type { ProjectDto } from '@/types'
import { Button } from '@/components/Basics'
import { CreateProjectModal } from '@/components/CreateProjectModal'

interface OutletCtx {
  projects: ProjectDto[]
  setProjects: Dispatch<SetStateAction<ProjectDto[]>>
}

export default function ProjectsPage() {
  const { projects, setProjects } = useOutletContext<OutletCtx>()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="h-full overflow-y-auto px-10 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-paper">Projects</h1>
            <p className="mt-1 text-sm text-paper-dim">Everything your team is tracking, in one place.</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>+ New project</Button>
        </div>

        {projects.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-600 py-20 text-center">
            <p className="font-display text-xl text-paper">No projects yet</p>
            <p className="mt-2 max-w-sm text-sm text-paper-dim">
              Create your first project to start giving work items a place on the line.
            </p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}>
              + New project
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="card group animate-fade-up p-5 text-left transition-transform hover:-translate-y-0.5 hover:border-brass/40"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-ink-800 px-2 py-1 font-mono text-xs text-brass">
                    {p.key}
                  </span>
                  {p.isArchived && (
                    <span className="text-[10px] uppercase tracking-wider text-paper-dim">Archived</span>
                  )}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-paper group-hover:text-brass">
                  {p.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-paper-dim">
                  {p.description || 'No description yet.'}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-paper-dim">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-progress" />
                  {p.workItemCount} {p.workItemCount === 1 ? 'work item' : 'work items'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(project) => {
            setProjects((prev) => [...prev, project])
            setShowCreate(false)
            navigate(`/projects/${project.id}`)
          }}
        />
      )}
    </div>
  )
}
