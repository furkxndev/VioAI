import type { AuthUser } from '@/types'

const ACCESS_TOKEN_KEY = 'vioai.accessToken'
const REFRESH_TOKEN_KEY = 'vioai.refreshToken'
const USER_KEY = 'vioai.user'

const safeRead = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeWrite = (key: string, value: string | null): void => {
  try {
    if (value === null) {
      window.localStorage.removeItem(key)
      return
    }
    window.localStorage.setItem(key, value)
  } catch {
    /* storage kullanılamıyor olabilir */
  }
}

export const tokenStorage = {
  getAccessToken: (): string | null => safeRead(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => safeRead(REFRESH_TOKEN_KEY),

  getUser: (): AuthUser | null => {
    const raw = safeRead(USER_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  },

  setSession: (accessToken: string, refreshToken: string, user: AuthUser): void => {
    safeWrite(ACCESS_TOKEN_KEY, accessToken)
    safeWrite(REFRESH_TOKEN_KEY, refreshToken)
    safeWrite(USER_KEY, JSON.stringify(user))
  },

  setUser: (user: AuthUser): void => safeWrite(USER_KEY, JSON.stringify(user)),

  setAccessToken: (accessToken: string): void => safeWrite(ACCESS_TOKEN_KEY, accessToken),

  clear: (): void => {
    safeWrite(ACCESS_TOKEN_KEY, null)
    safeWrite(REFRESH_TOKEN_KEY, null)
    safeWrite(USER_KEY, null)
  },
}
