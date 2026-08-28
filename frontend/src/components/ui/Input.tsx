import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  leftIcon?: ReactNode
  rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, leftIcon, rightSlot, ...props }, ref) => (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 transition-colors',
          'placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none',
          'disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-400',
          hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-ink-200',
          leftIcon && 'pl-10',
          rightSlot && 'pr-11',
          className,
        )}
        {...props}
      />
      {rightSlot && <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>}
    </div>
  ),
)

Input.displayName = 'Input'
