import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/types/user'

interface RequireRoleProps {
  roles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Hides/shows UI based on role — e.g. wrap the "Reports" nav link so only
 * Financial Analysts see it, while every authenticated role can still
 * navigate anywhere (per the single-auth-gate decision).
 */
export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { role } = useAuth()
  if (!role || !roles.includes(role)) return <>{fallback}</>
  return <>{children}</>
}
