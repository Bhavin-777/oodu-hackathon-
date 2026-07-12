import { Truck } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export function VehiclesPage() {
  return (
    <ComingSoon
      title="Vehicle Registry"
      description="Register and manage vehicles, statuses, and load capacities. Arriving in the next module."
      icon={Truck}
    />
  )
}
