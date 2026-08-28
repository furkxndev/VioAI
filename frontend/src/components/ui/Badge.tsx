import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeTone = 'brand' | 'accent' | 'neutral' | 'success' | 'warning' | 'danger'

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  accent: 'bg-accent-100 text-accent-600 ring-accent-300/60',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
}

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  icon?: ReactNode
  children: ReactNode
}

export const Badge = ({ tone = 'neutral', className, icon, children }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
      toneClasses[tone],
      className,
    )}
  >
    {icon}
    {children}
  </span>
)
