import { cn } from '@/lib/cn'

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-ink-100', className)} />
)

export const SkeletonCard = () => (
  <div className="surface space-y-3 p-4">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }, (_, index) => (
      <Skeleton key={index} className="h-20 w-full" />
    ))}
  </div>
)
