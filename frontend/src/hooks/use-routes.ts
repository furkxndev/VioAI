import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { routesService } from '@/services'
import type { AddProductStopPayload, GenerateRoutePayload, RouteQuery, UpdateRoutePayload } from '@/types'
import { queryKeys } from './query-keys'

export const useRoutes = (query: RouteQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.routes.list(query),
    queryFn: () => routesService.list(query),
    enabled,
  })

export const useRoute = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.routes.detail(id ?? ''),
    queryFn: () => routesService.getById(id as string),
    enabled: Boolean(id),
  })

export const useGenerateRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GenerateRoutePayload) => routesService.generate(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes.all }),
  })
}

export const useUpdateRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoutePayload }) =>
      routesService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes.all }),
  })
}

export const useDeleteRoute = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => routesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes.all }),
  })
}

export const useAddProductStop = (routeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddProductStopPayload) => routesService.addProductStop(routeId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes.detail(routeId) }),
  })
}

export const useToggleStopInclusion = (routeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stopId, isIncluded }: { stopId: string; isIncluded: boolean }) =>
      routesService.setStopInclusion(routeId, stopId, isIncluded),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes.detail(routeId) }),
  })
}

export const useRemoveStop = (routeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stopId: string) => routesService.removeStop(routeId, stopId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.routes.detail(routeId) }),
  })
}
