import { apiClient } from '@/lib/api-client'
import type { ApiKey, ApiKeyCreated, ApiKeyPayload } from '@/types'

export const apiKeysService = {
  list: async (): Promise<ApiKey[]> => {
    const { data } = await apiClient.get<ApiKey[]>('/api-keys')
    return data
  },

  create: async (payload: ApiKeyPayload): Promise<ApiKeyCreated> => {
    const { data } = await apiClient.post<ApiKeyCreated>('/api-keys', payload)
    return data
  },

  revoke: async (id: string): Promise<ApiKey> => {
    const { data } = await apiClient.post<ApiKey>(`/api-keys/${id}/revoke`)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`)
  },
}
