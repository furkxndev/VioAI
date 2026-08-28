import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { RouteMapProps } from './RouteMap'
import type { SinglePointMapProps } from './SinglePointMap'

const RouteMapImpl = lazy(() => import('./RouteMap').then((module) => ({ default: module.RouteMap })))
const SinglePointMapImpl = lazy(() =>
  import('./SinglePointMap').then((module) => ({ default: module.SinglePointMap })),
)

const MapFallback = ({ className }: { className?: string }) => (
  <Skeleton className={cn('min-h-[260px] w-full rounded-2xl', className)} />
)

export const RouteMap = (props: RouteMapProps) => (
  <Suspense fallback={<MapFallback className={props.className} />}>
    <RouteMapImpl {...props} />
  </Suspense>
)

export const SinglePointMap = (props: SinglePointMapProps) => (
  <Suspense fallback={<MapFallback className={props.className} />}>
    <SinglePointMapImpl {...props} />
  </Suspense>
)
