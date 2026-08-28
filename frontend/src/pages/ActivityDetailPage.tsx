import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, ExternalLink, MapPin, Sparkles, Star, Tag } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Badge, Button, ErrorState, Skeleton } from '@/components/ui'
import { SinglePointMap } from '@/components/map'
import { useProduct } from '@/hooks/use-products'
import { formatCurrency, formatDuration, formatNumber } from '@/utils/format'

export const ActivityDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: product, isPending, isError, error, refetch } = useProduct(id)

  if (isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="mt-4 h-8 w-2/3" />
        <Skeleton className="mt-3 h-24 w-full" />
      </PageContainer>
    )
  }

  if (isError || !product) {
    return (
      <PageContainer>
        <ErrorState error={error} onRetry={() => void refetch()} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        leftIcon={<ArrowLeft className="size-4" />}
        onClick={() => navigate(-1)}
      >
        Geri
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
            ) : (
              <div className="gradient-brand size-full" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.category && <Badge tone="brand">{product.category.name}</Badge>}
              {product.isAiRecommendable && (
                <Badge tone="accent" icon={<Sparkles className="size-3" />}>
                  AI önerilebilir
                </Badge>
              )}
              {!product.isActive && <Badge tone="danger">Pasif</Badge>}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {product.address ?? `${product.district ?? ''} ${product.city}`.trim()}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {formatDuration(product.durationMinutes)}
              </span>
              {product.rating > 0 && (
                <span className="flex items-center gap-1.5 font-semibold text-ink-800">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {product.rating.toFixed(1)}
                  <span className="font-normal text-ink-400">
                    ({formatNumber(product.reviewCount)} değerlendirme)
                  </span>
                </span>
              )}
            </div>

            <p className="mt-5 leading-relaxed whitespace-pre-line text-ink-600">{product.description}</p>

            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Tag className="size-4 text-ink-400" />
                {product.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-5">
            <p className="text-xs font-semibold text-ink-400">Kişi başı</p>
            <p className="mt-1 text-3xl font-extrabold text-ink-900">
              {formatCurrency(product.price, product.currency)}
            </p>

            {product.bookingUrl && (
              <Button
                fullWidth
                className="mt-4"
                rightIcon={<ExternalLink className="size-4" />}
                onClick={() => window.open(product.bookingUrl as string, '_blank', 'noopener,noreferrer')}
              >
                Viofun'da bilet al
              </Button>
            )}

            <Button
              fullWidth
              variant="outline"
              className="mt-2.5"
              leftIcon={<Sparkles className="size-4" />}
              onClick={() => navigate('/rota-olustur')}
            >
              Bu şehir için rota oluştur
            </Button>
          </div>

          <SinglePointMap latitude={product.latitude} longitude={product.longitude} className="h-64" />
        </aside>
      </div>
    </PageContainer>
  )
}
