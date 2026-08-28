import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
}

export const Chip = ({ selected = false, onClick, children, className }: ChipProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200',
      selected
        ? 'border-brand-500 bg-brand-500 text-white shadow-glow'
        : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-600',
      className,
    )}
  >
    {children}
  </button>
)
