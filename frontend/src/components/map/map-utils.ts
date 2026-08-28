import { divIcon, type LatLngExpression } from 'leaflet'
import { StopType } from '@/types'

export const DAY_COLORS = ['#6D4AFF', '#0EA5E9', '#F97316', '#16A34A', '#DB2777', '#F59E0B', '#0F766E'] as const

export const colorForDay = (dayNumber: number): string =>
  DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length] ?? DAY_COLORS[0]

export const createStopIcon = (label: string, color: string, type: StopType) =>
  divIcon({
    className: 'vioai-marker',
    html: `<span style="
        display:flex;align-items:center;justify-content:center;
        width:30px;height:30px;border-radius:999px;
        background:${type === StopType.VIOFUN_PRODUCT ? '#FF6B4A' : color};
        color:#fff;font-size:12px;font-weight:800;
        border:2.5px solid #fff;
        box-shadow:0 6px 16px -6px rgba(18,18,26,.6);
        font-family:'Plus Jakarta Sans',sans-serif;
      ">${label}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })

export const ISTANBUL_CENTER: LatLngExpression = [41.0082, 28.9784]
