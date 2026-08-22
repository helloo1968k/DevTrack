import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Deterministic hue from the name so each person reads as a distinct color.
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const hue = Math.abs(hash) % 360

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-mono font-medium text-ink-950"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: `hsl(${hue}, 55%, 65%)`
      }}
      title={name}
    >
      {initials || '?'}
    </span>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<string, string> = {
    primary: 'bg-brass text-ink-950 hover:bg-brass-bright',
    secondary: 'bg-ink-700 text-paper hover:bg-ink-600 border border-ink-600',
    ghost: 'text-paper-dim hover:text-paper hover:bg-ink-800',
    danger: 'bg-signal-critical/15 text-signal-critical hover:bg-signal-critical/25'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
