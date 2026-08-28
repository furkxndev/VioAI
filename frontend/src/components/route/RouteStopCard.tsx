import { Clock, ExternalLink, MapPin, Sparkles, Ticket, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge, Button, Switch } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDuration } from '@/utils/format'
import { StopType, type RouteStop } from '@/types'

interface RouteStopCardProps {
  stop: RouteStop
  currency: string
  index: number
  onToggleInclusion?: (stop: RouteStop) => void
  onRemove?: (stop: RouteStop) => void
  isMutating?: boolean
}

export const RouteStopCard = ({
  stop,
  currency,
  index,
  onToggleInclusion,
  onRemove,
  isMutating = false,
}: RouteStopCardProps) => {
  const isViofun = stop.type === StopType.VIOFUN_PRODUCT

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={cn(
        'relative rounded-2xl border p-4 transition-all duration-300',
        isViofun
          ? 'border-accent-300/70 bg-gradient-to-br from-accent-100/70 to-white shadow-soft'
          : 'border-ink-200 bg-white',
        !stop.isIncluded && 'opacity-55',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white',
            isViofun ? 'bg-accent-500' : 'bg-ink-800',
          )}
        >
          {isViofun ? <Ticket className="size-4" /> : index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isViofun && (
              <Badge tone="accent" icon={<Sparkles className="size-3" />}>
                Viofun aktivitesi
              </Badge>
            )}
            {stop.categoryLabel && !isViofun && <Badge tone="neutral">{stop.categoryLabel}</Badge>}
            {stop.startTime && (
              <span className="flex items-center gap-1 text-xs font-semibold text-ink-500">
                <Clock className="size-3.5" />
                {stop.startTime}
              </span>
            )}
          </div>

          <h4 className="mt-1.5 text-sm font-bold text-ink-900">{stop.title}</h4>

          {stop.description && (
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-500">{stop.description}</p>
          )}

          {isViofun && stop.matchReason && (
            <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs leading-relaxed text-accent-600 ring-1 ring-accent-300/50">
              <span className="font-bold">Neden önerildi: </span>
              {stop.matchReason}
              {stop.matchScore !== null && (
                <span className="ml-1 font-bold">({Math.round(stop.matchScore)}/100 uyum)</span>
              )}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDuration(stop.durationMinutes)}
            </span>
            {stop.estimatedCost !== null && stop.estimatedCost > 0 && (
              <span className="font-bold text-ink-800">{formatCurrency(stop.estimatedCost, currency)}</span>
            )}
            {stop.address && (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{stop.address}</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {onToggleInclusion && (
              <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-600">
                <Switch
                  checked={stop.isIncluded}
                  onChange={() => onToggleInclusion(stop)}
                  disabled={isMutating}
                  label="Rotaya dahil et"
                />
                {stop.isIncluded ? 'Rotada' : 'Rotadan çıkarıldı'}
              </label>
            )}

            {isViofun && stop.bookingUrl && (
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink className="size-3.5" />}
                onClick={() => window.open(stop.bookingUrl as string, '_blank', 'noopener,noreferrer')}
              >
                Bileti incele
              </Button>
            )}

            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                leftIcon={<Trash2 className="size-3.5" />}
                onClick={() => onRemove(stop)}
                disabled={isMutating}
              >
                Kaldır
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
