import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/layout'
import { EmptyState, ErrorState, Pagination } from '@/components/ui'
import { ProductCard, ProductCardSkeleton, ProductFilters } from '@/components/product'
import { useProducts } from '@/hooks/use-products'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ProductQuery } from '@/types'

export const ActivitiesPage = () => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    limit: 12,
    isActive: true,
    city: searchParams.get('city') ?? undefined,
    sortBy: 'popularityScore',
  })

  const debouncedSearch = useDebouncedValue(query.search ?? '', 400)
  const effectiveQuery = useMemo<ProductQuery>(
    () => ({ ...query, search: debouncedSearch || undefined }),
    [query, debouncedSearch],
  )

  const { data, isPending, isError, error, refetch } = useProducts(effectiveQuery)

  const handleChange = (patch: Partial<ProductQuery>) => setQuery((current) => ({ ...current, ...patch }))

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Viofun aktiviteleri"
        description="Rotalarınıza ekleyebileceğiniz tüm bilet ve deneyimler."
      />

      <ProductFilters query={query} onChange={handleChange} />

      <div className="mt-6">
        {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

        {isPending && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="Aradığınız kriterlere uygun aktivite yok"
            description="Filtreleri değiştirerek tekrar deneyebilirsiniz."
          />
        )}

        {data && data.items.length > 0 && (
          <>
            <p className="mb-4 text-sm text-ink-500">{data.meta.total} aktivite bulundu</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              className="mt-8"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(page) => handleChange({ page })}
            />
          </>
        )}
      </div>
    </PageContainer>
  )
}
