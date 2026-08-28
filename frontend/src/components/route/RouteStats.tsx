import { CalendarDays, MapPinned, Ticket, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { StopType, type TravelRoute } from '@/types'

interface StatItem {
  icon: LucideIcon
  label: string
  value: string
}

export const RouteStats = ({ route }: { route: TravelRoute }) => {
  const stops = route.stops ?? []
  const includedStops = stops.filter((stop) => stop.isIncluded)
  const viofunStops = includedStops.filter((stop) => stop.type === StopType.VIOFUN_PRODUCT)
  const totalCost = includedStops.reduce((sum, stop) => sum + (stop.estimatedCost ?? 0), 0)

  const items: StatItem[] = [
    { icon: CalendarDays, label: 'Gün', value: `${route.days}` },
    { icon: MapPinned, label: 'Durak', value: `${includedStops.length}` },
    { icon: Ticket, label: 'Viofun', value: `${viofunStops.length}` },
    {
      icon: Wallet,
      label: 'Tahmini',
      value: formatCurrency(totalCost * route.travelers, route.currency),
    },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="surface p-4">
          <dt className="flex items-center gap-1.5 text-xs font-semibold text-ink-400">
            <Icon className="size-3.5" />
            {label}
          </dt>
          <dd className="mt-1 truncate text-lg font-extrabold text-ink-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
