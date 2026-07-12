import type { LucideIcon } from 'lucide-react'

export interface Kpi {
  id: string
  label: string
  value: string
  icon: LucideIcon
  rail: 'available' | 'on-trip' | 'in-shop' | 'retired' | 'draft'
}

export interface UtilizationPoint {
  week: string
  utilization: number
}

export interface TripStatusPoint {
  status: string
  count: number
}
