import { RouteStatus, StopType, TransportMode, TravelPace, UserRole } from '@/types'

export const transportModeLabels: Record<TransportMode, string> = {
  [TransportMode.WALKING]: 'Yürüyerek',
  [TransportMode.PUBLIC_TRANSPORT]: 'Toplu taşıma',
  [TransportMode.CAR]: 'Araç',
  [TransportMode.BIKE]: 'Bisiklet',
  [TransportMode.MIXED]: 'Karma',
}

export const travelPaceLabels: Record<TravelPace, string> = {
  [TravelPace.RELAXED]: 'Sakin',
  [TravelPace.BALANCED]: 'Dengeli',
  [TravelPace.INTENSE]: 'Yoğun',
}

export const routeStatusLabels: Record<RouteStatus, string> = {
  [RouteStatus.DRAFT]: 'Taslak',
  [RouteStatus.GENERATING]: 'Oluşturuluyor',
  [RouteStatus.READY]: 'Hazır',
  [RouteStatus.FAILED]: 'Başarısız',
  [RouteStatus.ARCHIVED]: 'Arşivlendi',
}

export const stopTypeLabels: Record<StopType, string> = {
  [StopType.AI_SUGGESTION]: 'AI önerisi',
  [StopType.VIOFUN_PRODUCT]: 'Viofun aktivitesi',
}

export const userRoleLabels: Record<UserRole, string> = {
  [UserRole.USER]: 'Kullanıcı',
  [UserRole.ADMIN]: 'Yönetici',
}

export const interestOptions = [
  'kültür',
  'sanat',
  'müze',
  'tarih',
  'antik kent',
  'macera',
  'adrenalin',
  'doğa',
  'deniz',
  'tekne turu',
  'fotoğraf',
  'manzara',
] as const
