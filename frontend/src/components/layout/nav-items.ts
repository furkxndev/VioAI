import { Compass, LayoutDashboard, Ticket, User, Wand2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  requiresAuth?: boolean
}

export const primaryNavItems: NavItem[] = [
  { to: '/', label: 'Keşfet', icon: Compass, end: true },
  { to: '/aktiviteler', label: 'Aktiviteler', icon: Ticket },
  { to: '/rota-olustur', label: 'Rota Oluştur', icon: Wand2, requiresAuth: true },
  { to: '/rotalarim', label: 'Rotalarım', icon: LayoutDashboard, requiresAuth: true },
  { to: '/profil', label: 'Profil', icon: User, requiresAuth: true },
]
