import { NavLink } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/cn'
import { primaryNavItems } from './nav-items'

export const BottomNav = () => {
  const { isAuthenticated } = useAuth()

  return (
    <nav
      aria-label="Ana gezinme"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/80 bg-white/90 backdrop-blur-xl md:hidden"
    >
      <ul className="flex items-stretch justify-between px-2 pt-1.5">
        {primaryNavItems.map(({ to, label, icon: Icon, end, requiresAuth }) => {
          const isLocked = Boolean(requiresAuth) && !isAuthenticated

          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                title={isLocked ? `${label} için giriş yapmanız gerekir` : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors duration-200',
                    isActive ? 'text-brand-600' : 'text-ink-400 hover:text-ink-600',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'relative flex size-9 items-center justify-center rounded-xl transition-all duration-200',
                        isActive && 'bg-brand-50',
                      )}
                    >
                      <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
                      {isLocked && (
                        <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-ink-300 text-white">
                          <Lock className="size-2" strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
