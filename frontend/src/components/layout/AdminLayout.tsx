import { NavLink, Outlet } from 'react-router-dom'
import { FolderTree, KeyRound, LayoutDashboard, Ticket, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageContainer } from './PageContainer'

const adminNavItems = [
  { to: '/admin', label: 'Genel bakış', icon: LayoutDashboard, end: true },
  { to: '/admin/urunler', label: 'Ürünler', icon: Ticket },
  { to: '/admin/kategoriler', label: 'Kategoriler', icon: FolderTree },
  { to: '/admin/kullanicilar', label: 'Kullanıcılar', icon: Users },
  { to: '/admin/api-anahtarlari', label: 'API Anahtarları', icon: KeyRound },
]

export const AdminLayout = () => (
  <PageContainer size="wide">
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-60 lg:shrink-0">
        <nav aria-label="Yönetim gezinme" className="lg:surface lg:sticky lg:top-24 lg:p-3">
          <p className="hidden px-2 pb-2 text-xs font-bold tracking-widest text-ink-400 uppercase lg:block">
            Yönetim
          </p>
          <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {adminNavItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0 lg:shrink">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200',
                      isActive
                        ? 'gradient-brand text-white shadow-glow'
                        : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:text-brand-600 lg:bg-transparent lg:ring-0 lg:hover:bg-ink-100 lg:hover:text-ink-900',
                    )
                  }
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  </PageContainer>
)
