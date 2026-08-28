import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  htmlFor?: string
  className?: string
  children: ReactNode
}

export const Field = ({ label, hint, error, required, htmlFor, className, children }: FieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && (
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="ml-0.5 text-accent-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="text-xs font-medium text-red-600">{error}</p>
    ) : (
      hint && <p className="text-xs text-ink-400">{hint}</p>
    )}
  </div>
)
