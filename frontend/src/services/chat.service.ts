import { apiClient } from '@/lib/api-client'
import type { ChatAnswer, ChatQueryPayload } from '@/types'

export const chatService = {
  ask: async (payload: ChatQueryPayload): Promise<ChatAnswer> => {
    const { data } = await apiClient.post<ChatAnswer>('/chat', payload)
    return data
  },
}
