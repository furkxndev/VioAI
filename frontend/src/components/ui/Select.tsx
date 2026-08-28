import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm text-ink-900 transition-colors',
          'focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400',
          hasError ? 'border-red-400' : 'border-ink-200',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  ),
)

Select.displayName = 'Select'
