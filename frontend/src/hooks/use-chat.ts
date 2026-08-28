import { useMutation } from '@tanstack/react-query'
import { chatService } from '@/services'
import type { ChatQueryPayload } from '@/types'

export const useChatAsk = () =>
  useMutation({
    mutationFn: (payload: ChatQueryPayload) => chatService.ask(payload),
  })
