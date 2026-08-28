import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  eyebrow?: string
}

export const PageHeader = ({ title, description, action, eyebrow }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && (
        <p className="mb-1 text-xs font-bold tracking-widest text-brand-600 uppercase">{eyebrow}</p>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-500">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)
