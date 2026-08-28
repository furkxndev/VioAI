import { apiClient } from '@/lib/api-client'
import type {
  AddProductStopPayload,
  GenerateRoutePayload,
  Paginated,
  RouteQuery,
  RouteStop,
  TravelRoute,
  UpdateRoutePayload,
} from '@/types'

export const routesService = {
  generate: async (payload: GenerateRoutePayload): Promise<TravelRoute> => {
    const { data } = await apiClient.post<TravelRoute>('/routes/generate', payload)
    return data
  },

  list: async (query: RouteQuery): Promise<Paginated<TravelRoute>> => {
    const { data } = await apiClient.get<Paginated<TravelRoute>>('/routes', { params: query })
    return data
  },

  listAll: async (query: RouteQuery): Promise<Paginated<TravelRoute>> => {
    const { data } = await apiClient.get<Paginated<TravelRoute>>('/routes/all', { params: query })
    return data
  },

  getById: async (id: string): Promise<TravelRoute> => {
    const { data } = await apiClient.get<TravelRoute>(`/routes/${id}`)
    return data
  },

  update: async (id: string, payload: UpdateRoutePayload): Promise<TravelRoute> => {
    const { data } = await apiClient.patch<TravelRoute>(`/routes/${id}`, payload)
    return data
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/routes/${id}`)
  },

  addProductStop: async (routeId: string, payload: AddProductStopPayload): Promise<RouteStop> => {
    const { data } = await apiClient.post<RouteStop>(`/routes/${routeId}/stops/products`, payload)
    return data
  },

  setStopInclusion: async (routeId: string, stopId: string, isIncluded: boolean): Promise<RouteStop> => {
    const { data } = await apiClient.patch<RouteStop>(`/routes/${routeId}/stops/${stopId}/inclusion`, {
      isIncluded,
    })
    return data
  },

  removeStop: async (routeId: string, stopId: string): Promise<void> => {
    await apiClient.delete(`/routes/${routeId}/stops/${stopId}`)
  },
}
