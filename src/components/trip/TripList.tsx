// src/components/trip/TripList.tsx
//
// Trip table with lifecycle actions. Dispatch is only shown for Draft trips,
// Complete/Cancel only for Dispatched trips — the UI mirrors the state
// machine in spec 3.5 (Draft → Dispatched → Completed → Cancelled) so an
// invalid transition can't even be clicked, on top of the service-layer
// guards in trip.service.ts.

import type { Driver, Trip, VehicleSummary } from '../../types/operations';
import { StatusBadge, tripStatusTone } from '../common/StatusBadge';

interface TripListProps {
  trips: Trip[];
  vehicles: VehicleSummary[];
  drivers: Driver[];
  onDispatch: (trip: Trip) => void;
  onComplete: (trip: Trip) => void;
  onCancel: (trip: Trip) => void;
}

export function TripList({ trips, vehicles, drivers, onDispatch, onComplete, onCancel }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        No trips yet. Create a trip to start dispatching.
      </div>
    );
  }

  const vehicleName = (id: string) => vehicles.find((v) => v.id === id)?.registrationNumber ?? '—';
  const driverName = (id: string) => drivers.find((d) => d.id === id)?.name ?? '—';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {['Route', 'Vehicle', 'Driver', 'Cargo', 'Status', ''].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {trips.map((trip) => (
            <tr key={trip.id}>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">
                  {trip.source} → {trip.destination}
                </div>
                <div className="text-xs text-slate-500">{trip.plannedDistance} km planned</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{vehicleName(trip.vehicleId)}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{driverName(trip.driverId)}</td>
              <td className="px-4 py-3 text-sm text-slate-700">{trip.cargoWeight} kg</td>
              <td className="px-4 py-3">
                <StatusBadge label={trip.status} tone={tripStatusTone(trip.status)} />
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <div className="flex justify-end gap-3">
                  {trip.status === 'Draft' && (
                    <>
                      <button
                        onClick={() => onDispatch(trip)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Dispatch
                      </button>
                      <button onClick={() => onCancel(trip)} className="text-red-600 hover:text-red-800">
                        Cancel
                      </button>
                    </>
                  )}
                  {trip.status === 'Dispatched' && (
                    <>
                      <button
                        onClick={() => onComplete(trip)}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        Complete
                      </button>
                      <button onClick={() => onCancel(trip)} className="text-red-600 hover:text-red-800">
                        Cancel
                      </button>
                    </>
                  )}
                  {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                    <span className="text-slate-400">No actions</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
