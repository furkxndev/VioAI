import { apiClient } from '@/lib/api-client'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types'

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
