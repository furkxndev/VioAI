import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users, Wallet } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { formatCurrency, formatDate } from '@/utils/format'
import { routeStatusLabels } from '@/utils/labels'
import { RouteStatus, type TravelRoute } from '@/types'

const statusTone: Record<RouteStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  [RouteStatus.READY]: 'success',
  [RouteStatus.GENERATING]: 'warning',
  [RouteStatus.DRAFT]: 'neutral',
  [RouteStatus.FAILED]: 'danger',
  [RouteStatus.ARCHIVED]: 'neutral',
}

export const RouteCard = ({ route }: { route: TravelRoute }) => (
  <Card interactive>
    <Link to={`/rotalarim/${route.id}`} className="block p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-brand-600 uppercase">
            <MapPin className="size-3.5" />
            {route.city}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-extrabold text-ink-900">{route.title}</h3>
        </div>
        <Badge tone={statusTone[route.status]}>{routeStatusLabels[route.status]}</Badge>
      </div>

      {route.summary && <p className="mt-2 line-clamp-2 text-sm text-ink-500">{route.summary}</p>}

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-ink-100 pt-4">
        <div>
          <dt className="flex items-center gap-1 text-[11px] font-semibold text-ink-400">
            <CalendarDays className="size-3.5" />
            Süre
          </dt>
          <dd className="mt-0.5 text-sm font-bold text-ink-800">{route.days} gün</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[11px] font-semibold text-ink-400">
            <Users className="size-3.5" />
            Kişi
          </dt>
          <dd className="mt-0.5 text-sm font-bold text-ink-800">{route.travelers}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[11px] font-semibold text-ink-400">
            <Wallet className="size-3.5" />
            Bütçe
          </dt>
          <dd className="mt-0.5 text-sm font-bold text-ink-800">
            {formatCurrency(route.budget, route.currency)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-ink-400">{formatDate(route.createdAt)} tarihinde oluşturuldu</p>
    </Link>
  </Card>
)
