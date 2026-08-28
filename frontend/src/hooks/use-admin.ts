import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminService, apiKeysService, usersService } from '@/services'
import type { ApiKeyPayload, UpdateUserPayload, UserQuery } from '@/types'
import { queryKeys } from './query-keys'

export const useAdminStats = () =>
  useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: adminService.stats,
  })

export const useUsers = (query: UserQuery) =>
  useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => usersService.list(query),
  })

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}

export const useApiKeys = () =>
  useQuery({
    queryKey: queryKeys.apiKeys.all,
    queryFn: apiKeysService.list,
  })

export const useCreateApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ApiKeyPayload) => apiKeysService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all }),
  })
}

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiKeysService.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all }),
  })
}

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiKeysService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all }),
  })
}
