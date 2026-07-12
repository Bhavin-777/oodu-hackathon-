import { Truck, CheckCircle2, Wrench, Route, Clock, UserCheck, Gauge } from 'lucide-react'
import type { Kpi, UtilizationPoint, TripStatusPoint } from '@/types/dashboard'

// TODO(reports-module): replace with live Firestore aggregation queries.
export const MOCK_KPIS: Kpi[] = [
  { id: 'active-vehicles', label: 'Active Vehicles', value: '42', icon: Truck, rail: 'on-trip' },
  { id: 'available-vehicles', label: 'Available Vehicles', value: '27', icon: CheckCircle2, rail: 'available' },
  { id: 'vehicles-in-maintenance', label: 'Vehicles in Maintenance', value: '5', icon: Wrench, rail: 'in-shop' },
  { id: 'active-trips', label: 'Active Trips', value: '18', icon: Route, rail: 'on-trip' },
  { id: 'pending-trips', label: 'Pending Trips', value: '9', icon: Clock, rail: 'draft' },
  { id: 'drivers-on-duty', label: 'Drivers On Duty', value: '31', icon: UserCheck, rail: 'available' },
  { id: 'fleet-utilization', label: 'Fleet Utilization', value: '76%', icon: Gauge, rail: 'on-trip' },
]

export const MOCK_UTILIZATION: UtilizationPoint[] = [
  { week: 'Wk 1', utilization: 61 },
  { week: 'Wk 2', utilization: 68 },
  { week: 'Wk 3', utilization: 64 },
  { week: 'Wk 4', utilization: 72 },
  { week: 'Wk 5', utilization: 70 },
  { week: 'Wk 6', utilization: 76 },
]

export const MOCK_TRIP_STATUS: TripStatusPoint[] = [
  { status: 'Draft', count: 9 },
  { status: 'Dispatched', count: 18 },
  { status: 'Completed', count: 124 },
  { status: 'Cancelled', count: 6 },
]
