import { Wrench } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export function MaintenancePage() {
  return (
    <ComingSoon
      title="Maintenance"
      description="Maintenance logs and automatic vehicle status transitions. Arriving in a later module."
      icon={Wrench}
    />
  )
}
