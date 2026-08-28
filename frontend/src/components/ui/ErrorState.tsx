import { AlertTriangle, RotateCcw } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api-client'
import { Button } from './Button'

interface ErrorStateProps {
  error: unknown
  onRetry?: () => void
  title?: string
}

export const ErrorState = ({ error, onRetry, title = 'Bir şeyler ters gitti' }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-6 py-12 text-center">
    <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-red-500">
      <AlertTriangle className="size-6" />
    </span>
    <div className="space-y-1">
      <h3 className="text-base font-bold text-ink-900">{title}</h3>
      <p className="mx-auto max-w-sm text-sm text-ink-600">{getApiErrorMessage(error)}</p>
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" leftIcon={<RotateCcw className="size-4" />} onClick={onRetry}>
        Tekrar dene
      </Button>
    )}
  </div>
)
