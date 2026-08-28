import { apiClient } from '@/lib/api-client'
import type { Category, CategoryPayload } from '@/types'

export const categoriesService = {
  list: async (isActive?: boolean): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories', {
      params: isActive === undefined ? undefined : { isActive },
    })
    return data
  },

  create: async (payload: CategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', payload)
    return data
  },

  update: async (id: string, payload: Partial<CategoryPayload>): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
