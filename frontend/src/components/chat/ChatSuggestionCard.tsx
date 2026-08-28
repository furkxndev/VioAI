import { motion } from 'framer-motion'
import { Clock, ExternalLink, MapPin, Star, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui'
import { VenueSetting, type ChatSuggestion } from '@/types'

const venueLabel: Record<VenueSetting, string> = {
  [VenueSetting.INDOOR]: 'Kapalı alan',
  [VenueSetting.OUTDOOR]: 'Açık alan',
  [VenueSetting.MIXED]: 'Kısmen kapalı',
}

const formatPrice = (price: number, currency: string): string =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)

const formatDuration = (minutes: number): string =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)} sa${minutes % 60 ? ` ${minutes % 60} dk` : ''}`
    : `${minutes} dk`

interface ChatSuggestionCardProps {
  suggestion: ChatSuggestion
  index: number
}

export const ChatSuggestionCard = ({ suggestion, index }: ChatSuggestionCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
    className="surface flex gap-3 overflow-hidden p-3"
  >
    {suggestion.imageUrl && (
      <img
        src={suggestion.imageUrl}
        alt=""
        aria-hidden
        loading="lazy"
        className="size-20 shrink-0 rounded-xl object-cover"
      />
    )}

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm leading-snug font-bold text-ink-900">{suggestion.name}</h4>
        <span className="shrink-0 text-sm font-extrabold text-brand-600">
          {formatPrice(suggestion.price, suggestion.currency)}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" />
          {suggestion.district ? `${suggestion.district}, ${suggestion.city}` : suggestion.city}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatDuration(suggestion.durationMinutes)}
        </span>
        {suggestion.rating > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {suggestion.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {suggestion.venueSetting && (
          <Badge tone={suggestion.venueSetting === VenueSetting.INDOOR ? 'success' : 'neutral'}>
            {venueLabel[suggestion.venueSetting]}
          </Badge>
        )}
        {suggestion.minAge !== null && suggestion.minAge > 0 && (
          <Badge tone="warning" icon={<UserRound className="size-3" />}>
            {suggestion.minAge} yaş ve üzeri
          </Badge>
        )}
        {suggestion.category && <Badge tone="brand">{suggestion.category}</Badge>}
      </div>

      {suggestion.bookingUrl && (
        <a
          href={suggestion.bookingUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 underline-offset-4 hover:underline"
        >
          Viofun'da incele
          <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  </motion.article>
)
