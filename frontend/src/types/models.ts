import type {
  ApiKeyScope,
  RouteStatus,
  StopType,
  TransportMode,
  TravelPace,
  UserRole,
  VenueSetting,
} from './enums'

export interface UserPreferences {
  homeCity?: string
  interests?: string[]
  currency?: string
  language?: string
}

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
  avatarUrl: string | null
  preferences: UserPreferences
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  categoryId: string
  category?: Category
  price: number
  currency: string
  city: string
  district: string | null
  address: string | null
  latitude: number
  longitude: number
  durationMinutes: number
  tags: string[]
  imageUrl: string | null
  bookingUrl: string | null
  isActive: boolean
  isAiRecommendable: boolean
  rating: number
  reviewCount: number
  popularityScore: number
  createdAt: string
  updatedAt: string
}

export interface RouteStop {
  id: string
  routeId: string
  dayNumber: number
  orderIndex: number
  title: string
  description: string | null
  type: StopType
  productId: string | null
  product?: Product | null
  latitude: number | null
  longitude: number | null
  address: string | null
  startTime: string | null
  durationMinutes: number
  estimatedCost: number | null
  categoryLabel: string | null
  isIncluded: boolean
  matchScore: number | null
  matchReason: string | null
  bookingUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface TravelRoute {
  id: string
  userId: string | null
  title: string
  summary: string | null
  city: string
  startDate: string | null
  days: number
  budget: number
  currency: string
  travelers: number
  interests: string[]
  transportMode: TransportMode
  pace: TravelPace
  status: RouteStatus
  estimatedCost: number | null
  centerLatitude: number | null
  centerLongitude: number | null
  aiModel: string | null
  generationMs: number | null
  stops?: RouteStop[]
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  name: string
  description: string | null
  keyPrefix: string
  scopes: ApiKeyScope[]
  isActive: boolean
  expiresAt: string | null
  lastUsedAt: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiKeyCreated {
  apiKey: ApiKey
  plainKey: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface ProductSuggestion {
  product: Product
  score: number
  reason: string
  distanceKm: number
}

export interface AiStatus {
  configured: boolean
  model: string
  provider: string
  embeddingModel: string
  semanticMatching: boolean
  embeddingLoaded: boolean
}

/** Sohbet sorusundan çıkarılan arama kısıtları; sistemin soruyu nasıl anladığını gösterir. */
export interface ChatFilters {
  city: string | null
  requiresIndoor: boolean
  childAge: number | null
  travelers: number | null
  budget: number | null
  currency: string | null
  interests: string[]
  date: string | null
  statedWeather: string | null
}

export interface ChatWeather {
  date: string
  condition: 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'
  isWet: boolean
  temperatureMax: number | null
  temperatureMin: number | null
  precipitationProbability: number | null
  description: string
}

export interface ChatSuggestion {
  id: string
  name: string
  category: string | null
  city: string
  district: string | null
  price: number
  currency: string
  rating: number
  durationMinutes: number
  venueSetting: VenueSetting | null
  minAge: number | null
  imageUrl: string | null
  bookingUrl: string | null
}

export interface ChatAnswer {
  answer: string
  filters: ChatFilters
  weather: ChatWeather | null
  suggestions: ChatSuggestion[]
  needsCity: boolean
  generationMs: number
}

export interface AdminCategoryStat {
  categoryId: string
  name: string
  color: string | null
  count: number
}

export interface AdminStats {
  totalUsers: number
  totalCategories: number
  totalProducts: number
  activeProducts: number
  aiRecommendableProducts: number
  totalRoutes: number
  topCities: { city: string; count: number }[]
  categoryBreakdown: AdminCategoryStat[]
}

export interface CityStat {
  city: string
  count: number
  imageUrl: string | null
}
