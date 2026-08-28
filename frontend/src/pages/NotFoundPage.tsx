import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { PageContainer } from '@/components/layout'
import { Button, EmptyState } from '@/components/ui'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <PageContainer size="narrow" className="flex min-h-[60vh] items-center">
      <EmptyState
        className="w-full"
        icon={<Compass className="size-6" />}
        title="Bu sayfa bulunamadı"
        description="Aradığınız sayfa taşınmış veya hiç var olmamış olabilir."
        action={<Button onClick={() => navigate('/')}>Ana sayfaya dön</Button>}
      />
    </PageContainer>
  )
}
