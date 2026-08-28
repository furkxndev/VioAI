import { createContext } from 'react'
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  logout: () => Promise<void>
  setUser: (user: AuthUser) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
