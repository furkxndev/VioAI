import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Beklenmeyen arayüz hatası', error, info)
  }

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children
    }

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertTriangle className="size-7" />
        </span>
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-ink-900">Uygulama beklenmedik bir hatayla karşılaştı</h1>
          <p className="max-w-md text-sm text-ink-500">
            Sayfayı yenilemeyi deneyin. Sorun sürerse lütfen bizimle iletişime geçin.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Sayfayı yenile</Button>
      </div>
    )
  }
}
