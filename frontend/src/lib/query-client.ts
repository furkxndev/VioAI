import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 0
          if (status >= 400 && status < 500) return false
        }

        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
