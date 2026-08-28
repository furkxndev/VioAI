import { Link } from 'react-router-dom'
import { Clock, MapPin, Sparkles, Star } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDuration } from '@/utils/format'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export const ProductCard = ({ product, className }: ProductCardProps) => (
  <Card interactive className={cn('group flex h-full flex-col', className)}>
    <Link to={`/aktiviteler/${product.id}`} className="flex h-full flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 [transition-timing-function:var(--ease-out-soft)] group-hover:scale-105"
          />
        ) : (
          <div className="gradient-brand size-full opacity-80" />
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.category && (
            <Badge tone="brand" className="bg-white/95 ring-white/60">
              {product.category.name}
            </Badge>
          )}
          {product.isAiRecommendable && (
            <Badge tone="accent" icon={<Sparkles className="size-3" />} className="bg-white/95 ring-white/60">
              AI
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold text-ink-900 group-hover:text-brand-700">
            {product.name}
          </h3>
          {product.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ink-700">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {product.district ? `${product.district}, ${product.city}` : product.city}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatDuration(product.durationMinutes)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-[11px] font-medium text-ink-400">Kişi başı</p>
            <p className="text-base font-extrabold text-ink-900">
              {formatCurrency(product.price, product.currency)}
            </p>
          </div>
          {!product.isActive && <Badge tone="danger">Pasif</Badge>}
        </div>
      </div>
    </Link>
  </Card>
)
