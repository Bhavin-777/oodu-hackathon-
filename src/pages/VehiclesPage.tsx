import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CheckCircle2, XCircle, Play, ShieldCheck } from 'lucide-react'
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '@/services/trip.service'
import { getVehicles } from '@/services/vehicle.service'
import { getDrivers } from '@/services/driver.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Trip, VehicleSummary, Driver, TripCreateInput } from '@/types/operations'

export function TripsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [cargoWeight, setCargoWeight] = useState(400)
  const [plannedDistance, setPlannedDistance] = useState(120)

  // Completion modal tracking state
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null)
  const [finalOdometer, setFinalOdometer] = useState(0)
  const [fuelConsumed, setFuelConsumed] = useState(15)

  const { data: trips = [], isLoading: loadingTrips } = useQuery({ queryKey: ['trips'], queryFn: getTrips })
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles'], queryFn: getVehicles })
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: getDrivers })

  const createMutation = useMutation({
    mutationFn: (input: { data: TripCreateInput; vehicle: VehicleSummary; driver: Driver }) =>
      createTrip(input.data, input.vehicle, input.driver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setShowForm(false)
      setSource('')
      setDestination('')
    },
  })

  const dispatchMutation = useMutation({
    mutationFn: (trip: Trip) => {
      const v = vehicles.find((item) => item.id === trip.vehicleId)
      const d = drivers.find((item) => item.id === trip.driverId)
      if (!v || !d) throw new Error('Associated vehicle or driver not found.')
      return dispatchTrip(trip, v, d)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles', 'drivers'] }),
  })

  const completeMutation = useMutation({
    mutationFn: (data: { trip: Trip; finalOdometer: number; fuelConsumed: number }) =>
      completeTrip(data.trip, { finalOdometer: data.finalOdometer, fuelConsumed: data.fuelConsumed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles', 'drivers'] })
      setCompletingTrip(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', 'vehicles', 'drivers'] }),
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    const driver = drivers.find((d) => d.id === driverId)

    if (!vehicle || !driver) {
      setErrorMsg('Please select a valid vehicle and driver.')
      return
    }

    if (cargoWeight > vehicle.maxLoadCapacity) {
      setErrorMsg(`Cargo weight (${cargoWeight} kg) exceeds vehicle max load limit (${vehicle.maxLoadCapacity} kg).`)
      return
    }

    try {
      await createMutation.mutateAsync({
        data: { source, destination, vehicleId, driverId, cargoWeight: Number(cargoWeight), plannedDistance: Number(plannedDistance) },
        vehicle,
        driver,
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to schedule trip.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Trip Dispatch Management</h2>
          <p className="text-sm text-muted-foreground">Move transport cycles through Draft $\rightarrow$ Dispatched $\rightarrow$ Completed.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="mr-1.5 size-4" /> Create trip
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs font-medium underline">Dismiss</button>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Schedule New Trip</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Warehouse A" required />
              </div>
              <div className="space-y-1.5">
                <Label>Destination</Label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Hub B" required />
              </div>
              <div className="space-y-1.5">
                <Label>Available Vehicle</Label>
                <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full rounded-md border border-input bg-background p-2 text-sm" required>
                  <option value="">Select vehicle...</option>
                  {vehicles.filter(v => v.status === 'Available').map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} (Max: {v.maxLoadCapacity}kg)</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Available Driver</Label>
                <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full rounded-md border border-input bg-background p-2 text-sm" required>
                  <option value="">Select driver...</option>
                  {drivers.filter(d => d.status === 'Available').map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Cargo Weight (kg)</Label>
                <Input type="number" value={cargoWeight} onChange={(e) => setCargoWeight(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Planned Distance (km)</Label>
                <Input type="number" value={plannedDistance} onChange={(e) => setPlannedDistance(Number(e.target.value))} required />
              </div>
              <div className="sm:col-span-2 md:col-span-3 flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Save Draft</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loadingTrips ? (
        <div className="p-10 text-center text-muted-foreground">Loading trips...</div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3.5">Route</th>
                <th className="p-3.5">Vehicle</th>
                <th className="p-3.5">Driver</th>
                <th className="p-3.5">Cargo</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trips.map((t) => {
                const v = vehicles.find((x) => x.id === t.vehicleId)
                const d = drivers.find((x) => x.id === t.driverId)
                return (
                  <tr key={t.id} className={`status-rail-${t.status.toLowerCase().replace(/\s+/g, '')}`}>
                    <td className="p-3.5 font-medium">{t.source} $\rightarrow$ {t.destination}</td>
                    <td className="p-3.5 text-muted-foreground">{v?.registrationNumber ?? t.vehicleId}</td>
                    <td className="p-3.5 text-muted-foreground">{d?.name ?? t.driverId}</td>
                    <td className="p-3.5">{t.cargoWeight} kg</td>
                    <td className="p-3.5">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-foreground">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {t.status === 'Draft' && (
                        <Button size="sm" variant="ghost" onClick={() => dispatchMutation.mutate(t)}>
                          <Play className="mr-1 size-3.5 text-blue-500" /> Dispatch
                        </Button>
                      )}
                      {t.status === 'Dispatched' && (
                        <Button size="sm" variant="ghost" onClick={() => setCompletingTrip(t)}>
                          <CheckCircle2 className="mr-1 size-3.5 text-green-500" /> Complete
                        </Button>
                      )}
                      {t.status !== 'Completed' && t.status !== 'Cancelled' && (
                        <Button size="sm" variant="ghost" onClick={() => cancelMutation.mutate(t)}>
                          <XCircle className="mr-1 size-3.5 text-destructive" /> Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {completingTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle className="text-base">Complete Trip</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                completeMutation.mutate({ trip: completingTrip, finalOdometer, fuelConsumed })
              }} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Final Odometer (km)</Label>
                  <Input type="number" value={finalOdometer} onChange={(e) => setFinalOdometer(Number(e.target.value))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Fuel Consumed (Liters)</Label>
                  <Input type="number" value={fuelConsumed} onChange={(e) => setFuelConsumed(Number(e.target.value))} required />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCompletingTrip(null)}>Abort</Button>
                  <Button type="submit">Confirm Completion</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
