import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, Sparkles, Ticket, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout'
import { Badge, Button, EmptyState, ErrorState, Modal, Skeleton, Spinner } from '@/components/ui'
import { RouteMap } from '@/components/map'
import { DaySelector, RouteStats, RouteStopCard, SuggestionCard } from '@/components/route'
import {
  useAddProductStop,
  useDeleteRoute,
  useRemoveStop,
  useRoute,
  useToggleStopInclusion,
} from '@/hooks/use-routes'
import { useSuggestProducts } from '@/hooks/use-ai'
import { getApiErrorMessage } from '@/lib/api-client'
import { formatDate } from '@/utils/format'
import { transportModeLabels, travelPaceLabels } from '@/utils/labels'
import { StopType, type ProductSuggestion, type RouteStop } from '@/types'

export const RouteDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const { data: route, isPending, isError, error, refetch } = useRoute(id)
  const toggleInclusion = useToggleStopInclusion(id)
  const removeStop = useRemoveStop(id)
  const addProductStop = useAddProductStop(id)
  const deleteRoute = useDeleteRoute()
  const suggestProducts = useSuggestProducts()

  const stops = useMemo(() => route?.stops ?? [], [route])
  const days = useMemo(
    () => [...new Set(stops.map((stop) => stop.dayNumber))].sort((a, b) => a - b),
    [stops],
  )
  const addedProductIds = useMemo(
    () => new Set(stops.map((stop) => stop.productId).filter((productId): productId is string => Boolean(productId))),
    [stops],
  )

  const loadSuggestions = useCallback(() => {
    if (!route) return

    suggestProducts.mutate({
      city: route.city,
      interests: route.interests,
      budget: route.budget,
      travelers: route.travelers,
      latitude: route.centerLatitude ?? undefined,
      longitude: route.centerLongitude ?? undefined,
      limit: 8,
    })
  }, [route, suggestProducts])

  const openSuggestions = () => {
    setIsSuggestionsOpen(true)
    loadSuggestions()
  }

  const handleToggleInclusion = async (stop: RouteStop) => {
    try {
      await toggleInclusion.mutateAsync({ stopId: stop.id, isIncluded: !stop.isIncluded })
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Durak güncellenemedi'))
    }
  }

  const handleRemoveStop = async (stop: RouteStop) => {
    try {
      await removeStop.mutateAsync(stop.id)
      toast.success('Durak rotadan kaldırıldı')
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Durak kaldırılamadı'))
    }
  }

  const handleAddSuggestion = async (suggestion: ProductSuggestion) => {
    try {
      await addProductStop.mutateAsync({
        productId: suggestion.product.id,
        dayNumber: activeDay ?? days[0] ?? 1,
      })
      toast.success(`${suggestion.product.name} rotanıza eklendi`)
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Aktivite eklenemedi'))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteRoute.mutateAsync(id)
      toast.success('Rota silindi')
      navigate('/rotalarim')
    } catch (mutationError) {
      toast.error(getApiErrorMessage(mutationError, 'Rota silinemedi'))
    }
  }

  if (isPending) {
    return (
      <PageContainer size="wide">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-4 h-80 w-full" />
      </PageContainer>
    )
  }

  if (isError || !route) {
    return (
      <PageContainer size="wide">
        <ErrorState error={error} onRetry={() => void refetch()} />
      </PageContainer>
    )
  }

  const visibleStops = activeDay === null ? stops : stops.filter((stop) => stop.dayNumber === activeDay)
  const isMutating = toggleInclusion.isPending || removeStop.isPending

  return (
    <PageContainer size="wide">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        leftIcon={<ArrowLeft className="size-4" />}
        onClick={() => navigate('/rotalarim')}
      >
        Rotalarım
      </Button>

      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{route.city}</Badge>
            <Badge tone="neutral">{transportModeLabels[route.transportMode]}</Badge>
            <Badge tone="neutral">{travelPaceLabels[route.pace]} tempo</Badge>
            {route.aiModel && (
              <Badge tone="accent" icon={<Bot className="size-3" />}>
                {route.aiModel}
              </Badge>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {route.title}
          </h1>

          {route.summary && <p className="mt-2 max-w-3xl leading-relaxed text-ink-500">{route.summary}</p>}

          <p className="mt-2 text-xs text-ink-400">
            {formatDate(route.createdAt)}
            {route.startDate ? ` · Başlangıç: ${formatDate(route.startDate)}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            leftIcon={<Sparkles className="size-4" />}
            onClick={openSuggestions}
          >
            Aktivite ekle
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Rotayı sil"
            className="text-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </header>

      <RouteStats route={route} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <RouteMap
            stops={stops}
            activeDay={activeDay}
            center={
              route.centerLatitude !== null && route.centerLongitude !== null
                ? [route.centerLatitude, route.centerLongitude]
                : null
            }
            className="h-[360px] lg:h-[520px]"
          />
        </div>

        <div className="space-y-4">
          <DaySelector days={days} activeDay={activeDay} onChange={setActiveDay} />

          {visibleStops.length === 0 ? (
            <EmptyState
              icon={<Ticket className="size-6" />}
              title="Bu günde durak yok"
              description="Başka bir gün seçin veya rotanıza yeni bir aktivite ekleyin."
            />
          ) : (
            days
              .filter((day) => activeDay === null || day === activeDay)
              .map((day) => (
                <section key={day} className="space-y-3">
                  <h2 className="text-sm font-extrabold tracking-wide text-ink-400 uppercase">{day}. gün</h2>
                  {stops
                    .filter((stop) => stop.dayNumber === day)
                    .map((stop, index) => (
                      <RouteStopCard
                        key={stop.id}
                        stop={stop}
                        index={index}
                        currency={route.currency}
                        isMutating={isMutating}
                        onToggleInclusion={handleToggleInclusion}
                        onRemove={stop.type === StopType.VIOFUN_PRODUCT ? handleRemoveStop : undefined}
                      />
                    ))}
                </section>
              ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isSuggestionsOpen}
        onClose={() => setIsSuggestionsOpen(false)}
        title="Rotana uygun Viofun aktiviteleri"
        description={`${route.city} için ilgi alanlarına ve bütçene göre seçildi.`}
      >
        {suggestProducts.isPending && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-500">
            <Spinner />
            Uygun aktiviteler bulunuyor…
          </div>
        )}

        {suggestProducts.isError && (
          <ErrorState error={suggestProducts.error} onRetry={loadSuggestions} />
        )}

        {suggestProducts.data && suggestProducts.data.length === 0 && (
          <EmptyState
            icon={<Ticket className="size-6" />}
            title="Şu an uygun aktivite yok"
            description="Bu şehir için AI önerilebilir aktivite bulunamadı."
          />
        )}

        {suggestProducts.data && suggestProducts.data.length > 0 && (
          <div className="space-y-3">
            {suggestProducts.data.map((suggestion) => (
              <SuggestionCard
                key={suggestion.product.id}
                suggestion={suggestion}
                onAdd={handleAddSuggestion}
                isAdding={addProductStop.isPending}
                isAdded={addedProductIds.has(suggestion.product.id)}
              />
            ))}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Rotayı sil"
        size="sm"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setIsDeleteOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="danger" fullWidth isLoading={deleteRoute.isPending} onClick={handleDelete}>
              Sil
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-600">
          <strong>{route.title}</strong> rotası ve tüm durakları kalıcı olarak silinecek. Bu işlem geri
          alınamaz.
        </p>
      </Modal>
    </PageContainer>
  )
}
