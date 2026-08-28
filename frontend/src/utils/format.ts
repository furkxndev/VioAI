const CURRENCY_LOCALE = 'tr-TR'

export const formatCurrency = (value: number, currency = 'TRY'): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat(CURRENCY_LOCALE).format(value)

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—'

  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—'

  return new Intl.DateTimeFormat(CURRENCY_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} dk`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest === 0 ? `${hours} sa` : `${hours} sa ${rest} dk`
}

export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
