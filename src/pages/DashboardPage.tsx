import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KpiCard } from '@/components/shared/KpiCard'
import { MOCK_KPIS, MOCK_UTILIZATION, MOCK_TRIP_STATUS } from '@/constants/mockDashboardData'

const CHART_GRID_COLOR = 'var(--border)'
const CHART_TEXT_COLOR = 'var(--muted-foreground)'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Fleet overview</h2>
        <p className="text-sm text-muted-foreground">
          Snapshot of vehicles, drivers, and trips across the fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_KPIS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Fleet utilization trend</CardTitle>
            <CardDescription>Weekly utilization over the last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_UTILIZATION} margin={{ left: -20, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="week" stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} />
                <YAxis
                  stroke={CHART_TEXT_COLOR}
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}%`, 'Utilization']}
                />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Trips by status</CardTitle>
            <CardDescription>Current lifecycle distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TRIP_STATUS} margin={{ left: -20, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="status" stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
