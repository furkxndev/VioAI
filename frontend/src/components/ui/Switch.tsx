import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export const Switch = ({ checked, onChange, label, disabled, className }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
      checked ? 'bg-brand-500' : 'bg-ink-300',
      className,
    )}
  >
    <span
      className={cn(
        'inline-block size-4.5 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1',
      )}
    />
  </button>
)
