import { apiClient } from '@/lib/api-client'
import type { AiStatus, ProductSuggestion, SuggestProductsPayload } from '@/types'

export const aiService = {
  status: async (): Promise<AiStatus> => {
    const { data } = await apiClient.get<AiStatus>('/ai/status')
    return data
  },

  suggest: async (payload: SuggestProductsPayload): Promise<ProductSuggestion[]> => {
    const { data } = await apiClient.post<ProductSuggestion[]>('/ai/suggestions', payload)
    return data
  },
}
