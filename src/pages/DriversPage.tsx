import { Users } from 'lucide-react'
import { ComingSoon } from '@/components/shared/ComingSoon'

export function DriversPage() {
  return (
    <ComingSoon
      title="Driver Management"
      description="Driver profiles, license validity, and safety scores. Arriving in a later module."
      icon={Users}
    />
  )
}
