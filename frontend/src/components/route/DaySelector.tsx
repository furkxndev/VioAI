import { cn } from '@/lib/cn'

interface DaySelectorProps {
  days: number[]
  activeDay: number | null
  onChange: (day: number | null) => void
}

export const DaySelector = ({ days, activeDay, onChange }: DaySelectorProps) => (
  <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
    <button
      type="button"
      onClick={() => onChange(null)}
      className={cn(
        'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
        activeDay === null ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200',
      )}
    >
      Tüm günler
    </button>
    {days.map((day) => (
      <button
        key={day}
        type="button"
        onClick={() => onChange(day)}
        className={cn(
          'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
          activeDay === day ? 'bg-brand-500 text-white shadow-glow' : 'bg-white text-ink-600 ring-1 ring-ink-200',
        )}
      >
        {day}. gün
      </button>
    ))}
  </div>
)
