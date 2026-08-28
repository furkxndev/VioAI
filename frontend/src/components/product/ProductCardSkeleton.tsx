import { Skeleton } from '@/components/ui'

export const ProductCardSkeleton = () => (
  <div className="surface overflow-hidden">
    <Skeleton className="aspect-[16/10] w-full rounded-none" />
    <div className="space-y-2.5 p-4">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
)
