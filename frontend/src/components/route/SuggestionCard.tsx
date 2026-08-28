import { Plus, Sparkles, Star } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { formatCurrency, formatDistance, formatDuration } from '@/utils/format'
import type { ProductSuggestion } from '@/types'

interface SuggestionCardProps {
  suggestion: ProductSuggestion
  onAdd?: (suggestion: ProductSuggestion) => void
  isAdding?: boolean
  isAdded?: boolean
}

export const SuggestionCard = ({ suggestion, onAdd, isAdding, isAdded }: SuggestionCardProps) => {
  const { product } = suggestion

  return (
    <article className="flex gap-3 rounded-2xl border border-ink-200 bg-white p-3 transition-colors hover:border-brand-300">
      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-ink-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="gradient-brand size-full" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 text-sm font-bold text-ink-900">{product.name}</h4>
          <Badge tone="brand" icon={<Sparkles className="size-3" />}>
            {Math.round(suggestion.score)}
          </Badge>
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">{suggestion.reason}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          <span className="font-bold text-ink-900">{formatCurrency(product.price, product.currency)}</span>
          <span>{formatDuration(product.durationMinutes)}</span>
          {suggestion.distanceKm > 0 && <span>{formatDistance(suggestion.distanceKm)}</span>}
          {product.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        {onAdd && (
          <Button
            size="sm"
            variant={isAdded ? 'outline' : 'primary'}
            className="mt-2.5"
            leftIcon={<Plus className="size-3.5" />}
            isLoading={isAdding}
            disabled={isAdded}
            onClick={() => onAdd(suggestion)}
          >
            {isAdded ? 'Rotada' : 'Rotaya ekle'}
          </Button>
        )}
      </div>
    </article>
  )
}
