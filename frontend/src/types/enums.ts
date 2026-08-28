export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const TransportMode = {
  WALKING: 'walking',
  PUBLIC_TRANSPORT: 'public_transport',
  CAR: 'car',
  BIKE: 'bike',
  MIXED: 'mixed',
} as const
export type TransportMode = (typeof TransportMode)[keyof typeof TransportMode]

export const TravelPace = {
  RELAXED: 'relaxed',
  BALANCED: 'balanced',
  INTENSE: 'intense',
} as const
export type TravelPace = (typeof TravelPace)[keyof typeof TravelPace]

export const RouteStatus = {
  DRAFT: 'draft',
  GENERATING: 'generating',
  READY: 'ready',
  FAILED: 'failed',
  ARCHIVED: 'archived',
} as const
export type RouteStatus = (typeof RouteStatus)[keyof typeof RouteStatus]

export const StopType = {
  AI_SUGGESTION: 'ai_suggestion',
  VIOFUN_PRODUCT: 'viofun_product',
} as const
export type StopType = (typeof StopType)[keyof typeof StopType]

export const ApiKeyScope = {
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  CATEGORIES_READ: 'categories:read',
  ROUTES_READ: 'routes:read',
  ROUTES_GENERATE: 'routes:generate',
  AI_SUGGEST: 'ai:suggest',
} as const
export type ApiKeyScope = (typeof ApiKeyScope)[keyof typeof ApiKeyScope]
