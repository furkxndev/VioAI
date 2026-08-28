import { apiClient } from '@/lib/api-client'
import type { AdminStats } from '@/types'

export const adminService = {
  stats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<AdminStats>('/admin/stats')
    return data
  },
}
