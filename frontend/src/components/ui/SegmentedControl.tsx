import { cn } from '@/lib/cn'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) => (
  <div className={cn('flex gap-1 rounded-xl bg-ink-100 p-1', className)}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={cn(
          'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
          value === option.value ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
)
