import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={cn('size-5 animate-spin text-brand-500', className)} aria-hidden />
)

export const FullPageSpinner = ({ label = 'Yükleniyor…' }: { label?: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
    <Spinner className="size-8" />
    <p className="text-sm font-medium text-ink-500">{label}</p>
  </div>
)
