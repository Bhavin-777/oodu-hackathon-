// src/components/trip/TripForm.tsx
//
// Trip creation form (spec 3.5): source, destination, vehicle, driver, cargo
// weight, planned distance. Vehicle and driver dropdowns are pre-filtered to
// only show assignable options, and cargo weight is checked live against the
// selected vehicle's max load capacity so the user gets instant feedback
// instead of a rejected submit.

import { useMemo, useState } from 'react';
import type { Driver, TripCreateInput, VehicleSummary } from '../../types/operations';
import {
  getAssignableVehicles,
  validateCargoWeight,
  validateTripInput,
} from '../../services/trip.service';
import { getAssignableDrivers } from '../../services/driver.service';

interface TripFormProps {
  vehicles: VehicleSummary[];
  drivers: Driver[];
  onSubmit: (input: TripCreateInput) => Promise<void>;
  onCancel: () => void;
}

export function TripForm({ vehicles, drivers, onSubmit, onCancel }: TripFormProps) {
  const assignableVehicles = useMemo(() => getAssignableVehicles(vehicles), [vehicles]);
  const assignableDrivers = useMemo(() => getAssignableDrivers(drivers), [drivers]);

  const [form, setForm] = useState<TripCreateInput>({
    source: '',
    destination: '',
    vehicleId: assignableVehicles[0]?.id ?? '',
    driverId: assignableDrivers[0]?.id ?? '',
    cargoWeight: 0,
    plannedDistance: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
  const selectedDriver = drivers.find((d) => d.id === form.driverId);

  const cargoCheck = selectedVehicle
    ? validateCargoWeight(form.cargoWeight, selectedVehicle)
    : { valid: true as const };

  function update<K extends keyof TripCreateInput>(key: K, value: TripCreateInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicle || !selectedDriver) {
      setError('Select a vehicle and a driver.');
      return;
    }
    const check = validateTripInput(form, selectedVehicle, selectedDriver);
    if (!check.valid) {
      setError(check.reason ?? 'Invalid trip.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Create trip</h2>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Source">
          <input
            className="form-input"
            value={form.source}
            onChange={(e) => update('source', e.target.value)}
            placeholder="Kochi Warehouse"
          />
        </Field>
        <Field label="Destination">
          <input
            className="form-input"
            value={form.destination}
            onChange={(e) => update('destination', e.target.value)}
            placeholder="Kozhikode Depot"
          />
        </Field>

        <Field label="Vehicle">
          <select
            className="form-input"
            value={form.vehicleId}
            onChange={(e) => update('vehicleId', e.target.value)}
          >
            <option value="" disabled>
              Select a vehicle
            </option>
            {assignableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} — {v.name} (max {v.maxLoadCapacity} kg)
              </option>
            ))}
          </select>
          {assignableVehicles.length === 0 && (
            <p className="mt-1 text-xs text-red-600">
              No vehicles available — all are on trip, in shop, or retired.
            </p>
          )}
        </Field>

        <Field label="Driver">
          <select
            className="form-input"
            value={form.driverId}
            onChange={(e) => update('driverId', e.target.value)}
          >
            <option value="" disabled>
              Select a driver
            </option>
            {assignableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — safety {d.safetyScore}/100
              </option>
            ))}
          </select>
          {assignableDrivers.length === 0 && (
            <p className="mt-1 text-xs text-red-600">
              No drivers available — all are on trip, off duty, suspended, or license expired.
            </p>
          )}
        </Field>

        <Field label="Cargo weight (kg)">
          <input
            type="number"
            min={0}
            className="form-input"
            value={form.cargoWeight}
            onChange={(e) => update('cargoWeight', Number(e.target.value))}
          />
          {!cargoCheck.valid && (
            <p className="mt-1 text-xs text-red-600">{cargoCheck.reason}</p>
          )}
        </Field>

        <Field label="Planned distance (km)">
          <input
            type="number"
            min={0}
            className="form-input"
            value={form.plannedDistance}
            onChange={(e) => update('plannedDistance', Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || assignableVehicles.length === 0 || assignableDrivers.length === 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create trip (Draft)'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
