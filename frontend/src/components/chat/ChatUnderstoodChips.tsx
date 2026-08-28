import {
  Baby,
  CalendarDays,
  CloudRain,
  Coins,
  Heart,
  Home,
  MapPin,
  Sun,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui'
import type { ChatFilters, ChatWeather } from '@/types'

/**
 * Sistemin soruyu nasıl anladığını kullanıcıya gösterir.
 * Yanlış anlaşılan bir kısıt varsa kullanıcı bunu görüp sorusunu düzeltebilir.
 */
interface ChatUnderstoodChipsProps {
  filters: ChatFilters
  weather: ChatWeather | null
}

const formatDate = (iso: string): string => {
  const date = new Date(`${iso}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' }).format(date)
}

export const ChatUnderstoodChips = ({ filters, weather }: ChatUnderstoodChipsProps) => {
  const chips: { key: string; icon: ReactNode; label: string; tone: 'brand' | 'neutral' | 'warning' }[] =
    []

  if (filters.city) {
    chips.push({ key: 'city', icon: <MapPin className="size-3" />, label: filters.city, tone: 'brand' })
  }

  if (filters.date) {
    chips.push({
      key: 'date',
      icon: <CalendarDays className="size-3" />,
      label: formatDate(filters.date),
      tone: 'neutral',
    })
  }

  if (weather) {
    chips.push({
      key: 'weather',
      icon: weather.isWet ? <CloudRain className="size-3" /> : <Sun className="size-3" />,
      label:
        weather.temperatureMax !== null
          ? `${weather.description}, ${Math.round(weather.temperatureMax)}°`
          : weather.description,
      tone: weather.isWet ? 'warning' : 'neutral',
    })
  } else if (filters.statedWeather) {
    chips.push({
      key: 'stated-weather',
      icon: <CloudRain className="size-3" />,
      label: filters.statedWeather,
      tone: 'warning',
    })
  }

  if (filters.requiresIndoor) {
    chips.push({
      key: 'indoor',
      icon: <Home className="size-3" />,
      label: 'kapalı mekân',
      tone: 'warning',
    })
  }

  if (filters.childAge !== null) {
    chips.push({
      key: 'child',
      icon: <Baby className="size-3" />,
      label: `${filters.childAge} yaşında çocuk`,
      tone: 'neutral',
    })
  }

  if (filters.travelers !== null && filters.travelers > 1) {
    chips.push({
      key: 'travelers',
      icon: <Users className="size-3" />,
      label: `${filters.travelers} kişi`,
      tone: 'neutral',
    })
  }

  if (filters.budget !== null) {
    chips.push({
      key: 'budget',
      icon: <Coins className="size-3" />,
      label: `${filters.budget.toLocaleString('tr-TR')} ${filters.currency ?? 'TRY'}`,
      tone: 'neutral',
    })
  }

  for (const interest of filters.interests) {
    chips.push({
      key: `interest-${interest}`,
      icon: <Heart className="size-3" />,
      label: interest,
      tone: 'brand',
    })
  }

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-semibold text-ink-400">Şöyle anladım:</span>
      {chips.map((chip) => (
        <Badge key={chip.key} tone={chip.tone} icon={chip.icon}>
          {chip.label}
        </Badge>
      ))}
    </div>
  )
}
