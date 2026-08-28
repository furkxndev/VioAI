import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center',
      className,
    )}
  >
    {icon && (
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        {icon}
      </span>
    )}
    <div className="space-y-1">
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mx-auto max-w-sm text-sm text-ink-500">{description}</p>}
    </div>
    {action}
  </div>
)
