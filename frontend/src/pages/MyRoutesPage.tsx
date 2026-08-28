import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPinned, Plus } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/layout'
import { Button, EmptyState, ErrorState, Pagination, SkeletonList } from '@/components/ui'
import { RouteCard } from '@/components/route'
import { useRoutes } from '@/hooks/use-routes'

export const MyRoutesPage = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isPending, isError, error, refetch } = useRoutes({ page, limit: 9 })

  return (
    <PageContainer size="wide">
      <PageHeader
        title="Rotalarım"
        description="Oluşturduğunuz tüm gezi planları burada."
        action={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate('/rota-olustur')}>
            Yeni rota
          </Button>
        }
      />

      {isPending && <SkeletonList count={4} />}

      {isError && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && data.items.length === 0 && (
        <EmptyState
          icon={<MapPinned className="size-6" />}
          title="Henüz rotanız yok"
          description="İlk rotanızı oluşturarak yapay zekânın sizin için hazırladığı planı görün."
          action={
            <Button leftIcon={<Plus className="size-4" />} onClick={() => navigate('/rota-olustur')}>
              Rota oluştur
            </Button>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
          <Pagination
            className="mt-8"
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </PageContainer>
  )
}
