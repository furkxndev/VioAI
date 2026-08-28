import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CounterCardProps {
  label: string
  value: number
  suffix: string
  min: number
  max: number
  onChange: (value: number) => void
  icon?: ReactNode
  presets?: number[]
  className?: string
}

export const CounterCard = ({
  label,
  value,
  suffix,
  min,
  max,
  onChange,
  icon,
  presets,
  className,
}: CounterCardProps) => {
  const clamp = (next: number) => onChange(Math.min(Math.max(next, min), max))

  return (
    <div className={cn('rounded-2xl border-2 border-ink-200 bg-white p-5', className)}>
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-500">
        {icon}
        {label}
      </p>

      <div className="mt-4 flex items-center justify-between gap-4">
        <CounterButton label={`${label} azalt`} disabled={value <= min} onClick={() => clamp(value - 1)}>
          <Minus className="size-4" strokeWidth={3} />
        </CounterButton>

        <p className="text-3xl font-extrabold tracking-tight text-ink-900 tabular-nums">
          {value}
          <span className="ml-1.5 text-base font-bold text-ink-400">{suffix}</span>
        </p>

        <CounterButton label={`${label} artır`} disabled={value >= max} onClick={() => clamp(value + 1)}>
          <Plus className="size-4" strokeWidth={3} />
        </CounterButton>
      </div>

      {presets && presets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-4">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => clamp(preset)}
              className={cn(
                'rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors duration-200',
                value === preset
                  ? 'bg-brand-500 text-white'
                  : 'bg-ink-100 text-ink-500 hover:bg-brand-50 hover:text-brand-600',
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const CounterButton = ({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode
  label: string
  disabled: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-600 transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:bg-transparent disabled:hover:text-ink-600"
  >
    {children}
  </button>
)
