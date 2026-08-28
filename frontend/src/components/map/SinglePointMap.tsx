import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { StopType } from '@/types'
import { cn } from '@/lib/cn'
import { createStopIcon } from './map-utils'

export interface SinglePointMapProps {
  latitude: number
  longitude: number
  label?: string
  className?: string
}

export const SinglePointMap = ({ latitude, longitude, label = '1', className }: SinglePointMapProps) => (
  <div className={cn('overflow-hidden rounded-2xl border border-ink-200', className)}>
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ minHeight: '260px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[latitude, longitude]} icon={createStopIcon(label, '#6D4AFF', StopType.VIOFUN_PRODUCT)} />
    </MapContainer>
  </div>
)
