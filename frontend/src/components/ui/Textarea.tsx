import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-ink-900 transition-colors',
        'placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none',
        hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-200',
        className,
      )}
      {...props}
    />
  ),
)

Textarea.displayName = 'Textarea'
