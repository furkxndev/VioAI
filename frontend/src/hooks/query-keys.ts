import type { ProductQuery, RouteQuery, UserQuery } from '@/types'

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (query: ProductQuery) => ['products', 'list', query] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    cities: ['products', 'cities'] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (isActive?: boolean) => ['categories', 'list', isActive ?? 'all'] as const,
  },
  routes: {
    all: ['routes'] as const,
    list: (query: RouteQuery) => ['routes', 'list', query] as const,
    detail: (id: string) => ['routes', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (query: UserQuery) => ['users', 'list', query] as const,
    profile: ['users', 'profile'] as const,
  },
  apiKeys: {
    all: ['api-keys'] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
  },
  ai: {
    status: ['ai', 'status'] as const,
  },
}
