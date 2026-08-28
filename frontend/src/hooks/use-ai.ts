import { useMutation, useQuery } from '@tanstack/react-query'
import { aiService } from '@/services'
import type { SuggestProductsPayload } from '@/types'
import { queryKeys } from './query-keys'

export const useAiStatus = () =>
  useQuery({
    queryKey: queryKeys.ai.status,
    queryFn: aiService.status,
    staleTime: 10 * 60_000,
  })

export const useSuggestProducts = () =>
  useMutation({
    mutationFn: (payload: SuggestProductsPayload) => aiService.suggest(payload),
  })
