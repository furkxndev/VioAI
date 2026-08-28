import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type StatTone = 'brand' | 'accent' | 'emerald' | 'sky'

const toneClasses: Record<StatTone, { icon: string; glow: string }> = {
  brand: { icon: 'gradient-brand text-white', glow: 'bg-brand-100/70' },
  accent: { icon: 'bg-accent-500 text-white', glow: 'bg-accent-100/80' },
  emerald: { icon: 'bg-emerald-500 text-white', glow: 'bg-emerald-100/70' },
  sky: { icon: 'bg-sky-500 text-white', glow: 'bg-sky-100/70' },
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  tone?: StatTone
  progress?: number
}

export const StatCard = ({ icon, label, value, hint, tone = 'brand', progress }: StatCardProps) => {
  const classes = toneClasses[tone]

  return (
    <div className="surface relative overflow-hidden p-5 transition-all duration-300 [transition-timing-function:var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-lift">
      <span
        aria-hidden
        className={cn('absolute -top-8 -right-8 size-28 rounded-full', classes.glow)}
      />

      <span
        className={cn(
          'relative flex size-11 items-center justify-center rounded-xl shadow-soft',
          classes.icon,
        )}
      >
        {icon}
      </span>

      <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-ink-900 tabular-nums">
        {value}
      </p>
      <p className="relative text-sm font-semibold text-ink-500">{label}</p>
      {hint && <p className="relative mt-1 text-xs text-ink-400">{hint}</p>}

      {progress !== undefined && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className={cn('h-full rounded-full transition-all duration-700', classes.icon)}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
