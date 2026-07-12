import {
  LayoutDashboard,
  Truck,
  Users,
  Route as RouteIcon,
  Wrench,
  Fuel,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types/user'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  roles: Role[]
}

// Role mapping per spec §2 (Target Users) — Fleet Manager oversees
// everything; Driver only needs trip-adjacent screens; Safety Officer
// covers compliance-relevant areas (drivers, vehicles, maintenance);
// Financial Analyst covers cost-relevant areas (maintenance view, fuel &
// expenses, reports). Dashboard is visible to all roles.
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst'],
  },
  {
    label: 'Vehicles',
    path: '/vehicles',
    icon: Truck,
    roles: ['Fleet Manager', 'Driver', 'Safety Officer'],
  },
  {
    label: 'Drivers',
    path: '/drivers',
    icon: Users,
    roles: ['Fleet Manager', 'Driver', 'Safety Officer'],
  },
  {
    label: 'Trips',
    path: '/trips',
    icon: RouteIcon,
    roles: ['Fleet Manager', 'Driver'],
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: Wrench,
    roles: ['Fleet Manager', 'Safety Officer', 'Financial Analyst'],
  },
  {
    label: 'Fuel & Expenses',
    path: '/fuel-expenses',
    icon: Fuel,
    roles: ['Fleet Manager', 'Financial Analyst'],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: ['Fleet Manager', 'Financial Analyst'],
  },
]
