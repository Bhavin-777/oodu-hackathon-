import { Card, CardContent } from '@/components/ui/card'
import type { Kpi } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const RAIL_CLASS: Record<Kpi['rail'], string> = {
  available: 'status-rail-available',
  'on-trip': 'status-rail-on-trip',
  'in-shop': 'status-rail-in-shop',
  retired: 'status-rail-retired',
  draft: 'status-rail-draft',
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon
  return (
    <Card className={cn('status-rail py-0', RAIL_CLASS[kpi.rail])}>
      <CardContent className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">{kpi.value}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
