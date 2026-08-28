import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ErrorBoundary, IntroAnimation } from '@/components/common'
import { AuthProvider } from '@/context/AuthProvider'
import { queryClient } from '@/lib/query-client'
import { AppRouter } from './router'

export const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <IntroAnimation />
          <AppRouter />
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ style: { fontFamily: 'Plus Jakarta Sans, sans-serif' } }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
)
