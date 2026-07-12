import { Route } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export function TripsPage() {
  return (
    <ComingSoon
      title="Trip Management"
      description="Create and dispatch trips with vehicle/driver assignment. Arriving in a later module."
      icon={Route}
    />
  )
}
