import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

export const Logo = ({ className, showWordmark = true }: LogoProps) => (
  <Link to="/" className={cn('flex items-center gap-2.5', className)} aria-label="VioAI ana sayfa">
    <span className="gradient-brand flex size-9 items-center justify-center rounded-xl text-base font-black text-white shadow-glow">
      V
    </span>
    {showWordmark && (
      <span className="text-lg leading-none font-extrabold tracking-tight text-ink-900">
        Vio<span className="gradient-text">AI</span>
      </span>
    )}
  </Link>
)
