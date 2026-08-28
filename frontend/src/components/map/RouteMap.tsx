import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { StopType, type RouteStop } from '@/types'
import { cn } from '@/lib/cn'
import { colorForDay, createStopIcon, ISTANBUL_CENTER } from './map-utils'

export interface RouteMapProps {
  stops: RouteStop[]
  center?: LatLngExpression | null
  className?: string
  activeDay?: number | null
}

interface MappedStop {
  stop: RouteStop
  position: LatLngTuple
  label: string
}

export const RouteMap = ({ stops, center, className, activeDay = null }: RouteMapProps) => {
  const visibleStops = useMemo<MappedStop[]>(
    () =>
      stops
        .filter((stop) => stop.isIncluded && stop.latitude !== null && stop.longitude !== null)
        .filter((stop) => activeDay === null || stop.dayNumber === activeDay)
        .map((stop, index) => ({
          stop,
          position: [stop.latitude as number, stop.longitude as number] as LatLngTuple,
          label: String(index + 1),
        })),
    [stops, activeDay],
  )

  const dayLines = useMemo(() => {
    const grouped = new Map<number, LatLngTuple[]>()

    visibleStops.forEach(({ stop, position }) => {
      const current = grouped.get(stop.dayNumber) ?? []
      current.push(position)
      grouped.set(stop.dayNumber, current)
    })

    return [...grouped.entries()].filter(([, positions]) => positions.length > 1)
  }, [visibleStops])

  const mapCenter = center ?? visibleStops[0]?.position ?? ISTANBUL_CENTER

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-ink-200', className)}>
      <MapContainer
        center={mapCenter}
        zoom={visibleStops.length > 0 ? 13 : 11}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: '320px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {dayLines.map(([dayNumber, positions]) => (
          <Polyline
            key={dayNumber}
            positions={positions}
            pathOptions={{ color: colorForDay(dayNumber), weight: 3.5, opacity: 0.75, dashArray: '6 8' }}
          />
        ))}

        {visibleStops.map(({ stop, position, label }) => (
          <Marker
            key={stop.id}
            position={position}
            icon={createStopIcon(label, colorForDay(stop.dayNumber), stop.type)}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-bold text-ink-900">{stop.title}</p>
                <p className="text-xs text-ink-500">
                  {stop.dayNumber}. gün{stop.startTime ? ` · ${stop.startTime}` : ''}
                </p>
                {stop.type === StopType.VIOFUN_PRODUCT && (
                  <p className="text-xs font-semibold text-accent-600">Viofun aktivitesi</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
