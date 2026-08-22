import { StatusRail } from './StatusRail'

const STAGES = [
  { label: 'Backlog', color: '#5A6478' },
  { label: 'To do', color: '#8B93A7' },
  { label: 'In progress', color: '#5B8DEF' },
  { label: 'In review', color: '#9C7CE0' },
  { label: 'Done', color: '#4FAE8A' }
]

export function AuthHero() {
  return (
    <div className="relative hidden overflow-hidden border-r border-ink-700 bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-14">
      {/* faint grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#E8E6DF 1px, transparent 1px), linear-gradient(90deg, #E8E6DF 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brass text-base font-bold text-ink-950">
          D
        </div>
        <span className="font-display text-xl font-semibold text-paper">DevTracker</span>
      </div>

      <div className="relative z-10 max-w-md">
        <h1 className="font-display text-5xl font-semibold leading-[1.1] text-paper">
          Every task has
          <br />a place on the line.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-paper-dim">
          Backlog to done, tracked as one continuous thread — not a scattered board.
          DevTracker keeps your team's work visible at every stage.
        </p>
      </div>

      {/* Signature: the workflow rail with a moving example card */}
      <div className="relative z-10 flex h-64 items-stretch gap-6">
        <StatusRail width={3} pulse />
        <div className="flex flex-1 flex-col justify-between py-1">
          {STAGES.map((stage, i) => (
            <div key={stage.label} className="flex items-center gap-3">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-xs font-medium uppercase tracking-wider text-paper-dim">
                {stage.label}
              </span>
              {i === 3 && (
                <div
                  className="ml-2 flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                  style={{ borderColor: `${stage.color}40`, backgroundColor: `${stage.color}12` }}
                >
                  <span className="font-mono text-[11px] text-paper-dim">DEV-128</span>
                  <span className="text-xs text-paper">Ship auth flow</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
