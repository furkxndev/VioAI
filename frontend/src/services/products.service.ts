import { apiClient } from '@/lib/api-client'
import type { CityStat, Paginated, Product, ProductPayload, ProductQuery } from '@/types'

const serializeQuery = (query: ProductQuery): Record<string, unknown> => ({
  ...query,
  tags: query.tags?.length ? query.tags.join(',') : undefined,
})

export const productsService = {
  list: async (query: ProductQuery): Promise<Paginated<Product>> => {
    const { data } = await apiClient.get<Paginated<Product>>('/products', {
      params: serializeQuery(query),
    })
    return data
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  cities: async (): Promise<CityStat[]> => {
    const { data } = await apiClient.get<CityStat[]>('/products/cities')
    return data
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', payload)
    return data
  },

  update: async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, payload)
    return data
  },

  setAiRecommendable: async (id: string, isAiRecommendable: boolean): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/products/${id}/ai-recommendable`, {
      isAiRecommendable,
    })
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },
}
