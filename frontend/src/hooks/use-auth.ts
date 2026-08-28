import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from '@/context/auth-context'

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth yalnızca AuthProvider içinde kullanılabilir')
  }

  return context
}
