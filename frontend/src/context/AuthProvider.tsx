import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UNAUTHORIZED_EVENT } from '@/lib/api-client'
import { queryClient } from '@/lib/query-client'
import { tokenStorage } from '@/lib/token-storage'
import { authService } from '@/services'
import { UserRole, type AuthResponse, type AuthUser, type LoginPayload, type RegisterPayload } from '@/types'
import { AuthContext, type AuthContextValue } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<AuthUser | null>(() =>
    tokenStorage.getAccessToken() ? tokenStorage.getUser() : null,
  )

  useEffect(() => {
    const handleUnauthorized = () => {
      setUserState(null)
      queryClient.clear()
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)

    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [])

  const applySession = useCallback((response: AuthResponse): AuthResponse => {
    tokenStorage.setSession(response.accessToken, response.refreshToken, response.user)
    setUserState(response.user)
    return response
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => applySession(await authService.login(payload)),
    [applySession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => applySession(await authService.register(payload)),
    [applySession],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      tokenStorage.clear()
      setUserState(null)
      queryClient.clear()
    }
  }, [])

  const setUser = useCallback((nextUser: AuthUser) => {
    tokenStorage.setUser(nextUser)
    setUserState(nextUser)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === UserRole.ADMIN,
      login,
      register,
      logout,
      setUser,
    }),
    [user, login, register, logout, setUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
