import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Wrench, ShieldAlert } from 'lucide-react'
import { getVehicles, createVehicle, deleteVehicle, updateVehicleStatus } from '@/services/vehicle.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { VehicleSummary } from '@/types/operations'

export function VehiclesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [registrationNumber, setRegistrationNumber] = useState('')
  const [nameModel, setNameModel] = useState('')
  const [maxLoadCapacity, setMaxLoadCapacity] = useState(1000)
  const [acquisitionCost, setAcquisitionCost] = useState(35000)
  const [region, setRegion] = useState('North')

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  })

  const createMutation = useMutation({
    mutationFn: (newVehicle: Omit<VehicleSummary, 'id' | 'status' | 'odometer'>) =>
      createVehicle({ ...newVehicle, odometer: 0, status: 'Available' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setShowForm(false)
      setRegistrationNumber('')
      setNameModel('')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VehicleSummary['status'] }) =>
      updateVehicleStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    try {
      await createMutation.mutateAsync({
        registrationNumber,
        nameModel,
        type: 'Truck',
        maxLoadCapacity: Number(maxLoadCapacity),
        acquisitionCost: Number(acquisitionCost),
        region,
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to register vehicle.')
    }
  }

  const handleDelete = (vehicle: VehicleSummary) => {
    if (vehicle.status === 'On Trip' || vehicle.status === 'In Shop') {
      setErrorMsg(`Cannot delete ${vehicle.registrationNumber} while status is ${vehicle.status}.`)
      return
    }
    if (confirm(`Delete vehicle ${vehicle.registrationNumber}?`)) {
      deleteMutation.mutate(vehicle.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Vehicle Registry</h2>
          <p className="text-sm text-muted-foreground">Manage active fleet assets, capacities, and statuses.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="mr-1.5 size-4" /> Register vehicle
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
          <CardHeader>
            <CardTitle className="text-base">New Vehicle Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Registration Number</Label>
                <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="VAN-01" required />
              </div>
              <div className="space-y-1.5">
                <Label>Model Name</Label>
                <Input value={nameModel} onChange={(e) => setNameModel(e.target.value)} placeholder="Ford Transit" required />
              </div>
              <div className="space-y-1.5">
                <Label>Max Load Capacity (kg)</Label>
                <Input type="number" value={maxLoadCapacity} onChange={(e) => setMaxLoadCapacity(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Acquisition Cost ($)</Label>
                <Input type="number" value={acquisitionCost} onChange={(e) => setAcquisitionCost(Number(e.target.value))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Region</Label>
                <Input value={region} onChange={(e) => setRegion(e.target.value)} required />
              </div>
              <div className="flex items-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="w-full">Cancel</Button>
                <Button type="submit" className="w-full">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="p-10 text-center text-muted-foreground">Loading vehicle records...</div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3.5">Registration</th>
                <th className="p-3.5">Model</th>
                <th className="p-3.5">Capacity</th>
                <th className="p-3.5">Odometer</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vehicles.map((v) => (
                <tr key={v.id} className={`status-rail-${v.status.toLowerCase().replace(/\s+/g, '')}`}>
                  <td className="p-3.5 font-medium">{v.registrationNumber}</td>
                  <td className="p-3.5 text-muted-foreground">{v.nameModel}</td>
                  <td className="p-3.5">{v.maxLoadCapacity} kg</td>
                  <td className="p-3.5">{v.odometer} km</td>
                  <td className="p-3.5">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-foreground">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {v.status === 'Available' && (
                      <button onClick={() => statusMutation.mutate({ id: v.id, status: 'Retired' })} title="Retire" className="text-xs text-amber-500 hover:underline">Retire</button>
                    )}
                    <button onClick={() => handleDelete(v)} title="Delete" className="text-xs text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
