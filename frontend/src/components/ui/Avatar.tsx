import { cn } from '@/lib/cn'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')

export const Avatar = ({ name, src, size = 'md', className }: AvatarProps) =>
  src ? (
    <img
      src={src}
      alt={name}
      className={cn('rounded-full object-cover', sizeClasses[size], className)}
      loading="lazy"
    />
  ) : (
    <span
      className={cn(
        'gradient-brand flex items-center justify-center rounded-full font-bold text-white',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
