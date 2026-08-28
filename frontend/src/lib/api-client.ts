import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { tokenStorage } from './token-storage'
import type { ApiErrorBody, AuthResponse } from '@/types'

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retried?: boolean
}

export const UNAUTHORIZED_EVENT = 'vioai:unauthorized'

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

let refreshPromise: Promise<string> | null = null

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) {
    throw new Error('Yenileme anahtarı yok')
  }

  const { data } = await axios.post<AuthResponse>(`${env.apiBaseUrl}/auth/refresh`, { refreshToken })

  tokenStorage.setSession(data.accessToken, data.refreshToken, data.user)

  return data.accessToken
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const request = error.config as RetriableRequest | undefined
    const isAuthEndpoint = request?.url?.includes('/auth/')

    if (error.response?.status === 401 && request && !request._retried && !isAuthEndpoint) {
      request._retried = true

      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const accessToken = await refreshPromise
        refreshPromise = null

        request.headers.set('Authorization', `Bearer ${accessToken}`)

        return await apiClient.request(request)
      } catch {
        refreshPromise = null
        tokenStorage.clear()
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
      }
    }

    return Promise.reject(error)
  },
)

export const getApiErrorMessage = (error: unknown, fallback = 'Beklenmeyen bir hata oluştu'): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) return message[0] ?? fallback
    if (typeof message === 'string') return message
    if (error.code === 'ECONNABORTED') return 'İstek zaman aşımına uğradı'
    if (!error.response) return 'Sunucuya ulaşılamıyor'
  }

  if (error instanceof Error && error.message) return error.message

  return fallback
}
