import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services'
import type { ChangePasswordPayload, UpdateProfilePayload } from '@/types'
import { queryKeys } from './query-keys'

export const useProfile = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.users.profile,
    queryFn: usersService.getProfile,
    enabled,
  })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersService.updateProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.profile }),
  })
}

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: ChangePasswordPayload) => usersService.changePassword(payload),
  })
