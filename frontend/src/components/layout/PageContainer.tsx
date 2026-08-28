import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'narrow'
}

const sizeClasses = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

export const PageContainer = ({ children, className, size = 'default' }: PageContainerProps) => (
  <div className={cn('mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8', sizeClasses[size], className)}>
    {children}
  </div>
)
