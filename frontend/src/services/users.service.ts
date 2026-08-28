import { apiClient } from '@/lib/api-client'
import type {
  ChangePasswordPayload,
  Paginated,
  UpdateProfilePayload,
  UpdateUserPayload,
  User,
  UserQuery,
} from '@/types'

export const usersService = {
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me')
    return data
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const { data } = await apiClient.patch<User>('/users/me', payload)
    return data
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await apiClient.post('/users/me/change-password', payload)
  },

  list: async (query: UserQuery): Promise<Paginated<User>> => {
    const { data } = await apiClient.get<Paginated<User>>('/users', { params: query })
    return data
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, payload)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
