/** The page's signature element: a vertical thread of the workflow's own
 * colors (Backlog -> ToDo -> InProgress -> InReview -> Done), with a soft
 * light pulse traveling along it. On the sidebar it's a slim 3px edge; on
 * the auth hero it's a wide animated centerpiece. */
export function StatusRail({ width = 3, pulse = false }: { width?: number; pulse?: boolean }) {
  return (
    <div
      className="status-rail status-rail-track rounded-full"
      style={{ width, height: '100%' }}
    >
      {pulse && <div className="status-rail-pulse animate-pulse-rail" />}
    </div>
  )
}
