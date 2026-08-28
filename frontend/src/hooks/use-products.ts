import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsService } from '@/services'
import type { ProductPayload, ProductQuery } from '@/types'
import { queryKeys } from './query-keys'

export const useProducts = (query: ProductQuery) =>
  useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => productsService.list(query),
  })

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => productsService.getById(id as string),
    enabled: Boolean(id),
  })

export const useProductCities = () =>
  useQuery({
    queryKey: queryKeys.products.cities,
    queryFn: productsService.cities,
    staleTime: 10 * 60_000,
  })

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProductPayload) => productsService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productsService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export const useToggleProductAi = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isAiRecommendable }: { id: string; isAiRecommendable: boolean }) =>
      productsService.setAiRecommendable(id, isAiRecommendable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })
}
