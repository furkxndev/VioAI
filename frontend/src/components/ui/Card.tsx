import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export const Card = ({ className, interactive, ...props }: CardProps) => (
  <div
    className={cn(
      'surface overflow-hidden',
      interactive &&
        'transition-all duration-300 [transition-timing-function:var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-lift',
      className,
    )}
    {...props}
  />
)

interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export const CardHeader = ({ title, description, action, className }: CardHeaderProps) => (
  <div className={cn('flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4', className)}>
    <div className="min-w-0">
      <h3 className="truncate text-base font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
    </div>
    {action}
  </div>
)

export const CardBody = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...props} />
)
