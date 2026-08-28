import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface OptionCardProps {
  selected: boolean
  onClick: () => void
  title: string
  description?: string
  icon?: ReactNode
  meta?: string
  className?: string
}

export const OptionCard = ({
  selected,
  onClick,
  title,
  description,
  icon,
  meta,
  className,
}: OptionCardProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'group relative flex flex-col items-start gap-2.5 rounded-2xl border-2 bg-white p-4 text-left',
      'transition-all duration-200 [transition-timing-function:var(--ease-out-soft)] hover:-translate-y-0.5',
      selected ? 'border-brand-500 shadow-glow' : 'border-ink-200 hover:border-brand-300 hover:shadow-soft',
      className,
    )}
  >
    {icon && (
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl transition-colors duration-200',
          selected
            ? 'gradient-brand text-white'
            : 'bg-ink-100 text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-600',
        )}
      >
        {icon}
      </span>
    )}

    <span className="min-w-0">
      <span className={cn('block text-sm font-bold', selected ? 'text-brand-700' : 'text-ink-900')}>
        {title}
      </span>
      {description && <span className="mt-0.5 block text-xs leading-relaxed text-ink-400">{description}</span>}
      {meta && <span className="mt-1 block text-xs font-semibold text-brand-600">{meta}</span>}
    </span>

    {selected && (
      <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-brand-500 text-white">
        <Check className="size-3" strokeWidth={3} />
      </span>
    )}
  </button>
)
