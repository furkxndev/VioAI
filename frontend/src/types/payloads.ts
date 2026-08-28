import type { ApiKeyScope, TransportMode, TravelPace, UserRole } from './enums'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export interface UpdateProfilePayload {
  fullName?: string
  email?: string
  avatarUrl?: string
  preferences?: {
    homeCity?: string
    interests?: string[]
    currency?: string
    language?: string
  }
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ProductQuery {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  city?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  isAiRecommendable?: boolean
  sortBy?: 'createdAt' | 'price' | 'rating' | 'popularityScore' | 'name'
  sortOrder?: 'ASC' | 'DESC'
}

export interface ProductPayload {
  name: string
  description: string
  categoryId: string
  price: number
  currency?: string
  city: string
  district?: string
  address?: string
  latitude: number
  longitude: number
  durationMinutes?: number
  tags?: string[]
  imageUrl?: string
  bookingUrl?: string
  isActive?: boolean
  isAiRecommendable?: boolean
  rating?: number
  reviewCount?: number
  popularityScore?: number
}

export interface CategoryPayload {
  name: string
  slug?: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  sortOrder?: number
}

export interface GenerateRoutePayload {
  city: string
  days: number
  budget: number
  currency?: string
  travelers: number
  interests?: string[]
  transportMode: TransportMode
  pace?: TravelPace
  startDate?: string
  notes?: string
}

export interface RouteQuery {
  page?: number
  limit?: number
  city?: string
  status?: string
}

export interface UpdateRoutePayload {
  title?: string
  summary?: string
  status?: string
}

export interface AddProductStopPayload {
  productId: string
  dayNumber: number
  orderIndex?: number
  startTime?: string
}

export interface SuggestProductsPayload {
  city: string
  interests?: string[]
  budget?: number
  travelers?: number
  latitude?: number
  longitude?: number
  limit?: number
}

export interface UserQuery {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  isActive?: boolean
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
  role?: UserRole
  isActive?: boolean
}

export interface ApiKeyPayload {
  name: string
  description?: string
  scopes: ApiKeyScope[]
  expiresAt?: string
}
