import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services'
import type { CategoryPayload } from '@/types'
import { queryKeys } from './query-keys'

export const useCategories = (isActive?: boolean) =>
  useQuery({
    queryKey: queryKeys.categories.list(isActive),
    queryFn: () => categoriesService.list(isActive),
    staleTime: 10 * 60_000,
  })

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoriesService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) =>
      categoriesService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  })
}
