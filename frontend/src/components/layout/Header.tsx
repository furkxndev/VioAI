import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Lock, LogOut, Settings, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/cn'
import { Avatar, Button } from '@/components/ui'
import { Logo } from './Logo'
import { primaryNavItems } from './nav-items'

export const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    setIsMenuOpen(false)
    await logout()
    navigate('/giris')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Masaüstü gezinme" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNavItems
              .filter((item) => item.to !== '/profil')
              .map(({ to, label, end, requiresAuth }) => {
                const isLocked = Boolean(requiresAuth) && !isAuthenticated

                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      title={isLocked ? `${label} için giriş yapmanız gerekir` : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-200',
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
                        )
                      }
                    >
                      {label}
                      {isLocked && <Lock className="size-3 text-ink-300" />}
                    </NavLink>
                  </li>
                )
              })}
            {isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-200',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
                    )
                  }
                >
                  <ShieldCheck className="size-4" />
                  Yönetim
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-ink-200 py-1 pr-3 pl-1 transition-colors hover:border-brand-300"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
              >
                <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                <span className="hidden max-w-28 truncate text-sm font-semibold text-ink-700 sm:block">
                  {user.fullName}
                </span>
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} aria-hidden />
                  <div className="surface absolute right-0 z-20 mt-2 w-56 p-1.5">
                    <Link
                      to="/profil"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
                    >
                      <Settings className="size-4" />
                      Profil ayarları
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 md:hidden"
                      >
                        <ShieldCheck className="size-4" />
                        Yönetim paneli
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="size-4" />
                      Çıkış yap
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/giris')}>
                Giriş yap
              </Button>
              <Button size="sm" onClick={() => navigate('/kayit')}>
                Ücretsiz başla
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
