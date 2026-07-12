// src/pages/Trips.tsx
//
// Top-level page for trip management (spec 3.5). Loads trips, vehicles, and
// drivers, then wires TripForm / TripList / CompleteTripModal to
// trip.service.ts for the full Draft -> Dispatched -> Completed/Cancelled
// lifecycle.

import { useEffect, useState } from 'react';
import { TripForm } from '../components/trip/TripForm';
import { TripList } from '../components/trip/TripList';
import { CompleteTripModal } from '../components/trip/CompleteTripModal';
import { getDrivers } from '../services/driver.service';
import { getVehicles } from '../services/vehicle.service';
import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  getTrips,
} from '../services/trip.service';
import type { Driver, Trip, TripCompleteInput, TripCreateInput, VehicleSummary } from '../types/operations';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<Trip | undefined>(undefined);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [tripData, vehicleData, driverData] = await Promise.all([
        getTrips(),
        getVehicles(),
        getDrivers(),
      ]);
      setTrips(tripData);
      setVehicles(vehicleData);
      setDrivers(driverData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTrip(input: TripCreateInput) {
    const vehicle = vehicles.find((v) => v.id === input.vehicleId);
    const driver = drivers.find((d) => d.id === input.driverId);
    if (!vehicle || !driver) throw new Error('Selected vehicle or driver not found.');

    const created = await createTrip(input, vehicle, driver);
    setTrips((prev) => [...prev, created]);
    setShowForm(false);
  }

  async function handleDispatch(trip: Trip) {
    setError(null);
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);
    if (!vehicle || !driver) {
      setError('Could not find the vehicle or driver for this trip.');
      return;
    }
    try {
      const updatedTrip = await dispatchTrip(trip, vehicle, driver);
      setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
      // Dispatch flips vehicle & driver to 'On Trip' on the backend — refresh
      // both pools so the next trip's dropdowns reflect current availability.
      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, status: 'On Trip' } : v))
      );
      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, status: 'On Trip' } : d))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispatch trip.');
    }
  }

  async function handleCompleteConfirm(input: TripCompleteInput) {
    if (!completingTrip) return;
    const updatedTrip = await completeTrip(completingTrip, input);
    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedTrip.vehicleId ? { ...v, status: 'Available' } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === updatedTrip.driverId ? { ...d, status: 'Available' } : d))
    );
    setCompletingTrip(undefined);
  }

  async function handleCancel(trip: Trip) {
    setError(null);
    if (!confirm(`Cancel trip ${trip.source} → ${trip.destination}?`)) return;
    try {
      const updatedTrip = await cancelTrip(trip);
      setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
      if (trip.status === 'Dispatched') {
        setVehicles((prev) =>
          prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available' } : v))
        );
        setDrivers((prev) =>
          prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trip.');
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Trips</h1>
          <p className="text-sm text-slate-500">
            Create trips and move them through Draft → Dispatched → Completed / Cancelled.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Create trip
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-medium">
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <TripForm
          vehicles={vehicles}
          drivers={drivers}
          onSubmit={handleCreateTrip}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading trips…</div>
      ) : (
        <TripList
          trips={trips}
          vehicles={vehicles}
          drivers={drivers}
          onDispatch={handleDispatch}
          onComplete={(trip) => setCompletingTrip(trip)}
          onCancel={handleCancel}
        />
      )}

      {completingTrip && (
        <CompleteTripModal
          trip={completingTrip}
          onConfirm={handleCompleteConfirm}
          onClose={() => setCompletingTrip(undefined)}
        />
      )}
    </div>
  );
}
