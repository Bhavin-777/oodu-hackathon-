// Top-level page for vehicle registry and management (spec 3.3).

import { useEffect, useState } from 'react';
import { getVehicles, createVehicle, deleteVehicle, updateVehicleStatus } from '../services/vehicle.service';
import type { VehicleSummary } from '../types/operations';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [nameModel, setNameModel] = useState('');
  const [type, setType] = useState('Truck');
  const [maxLoadCapacity, setMaxLoadCapacity] = useState(1000);
  const [odometer, setOdometer] = useState(0);
  const [acquisitionCost, setAcquisitionCost] = useState(30000);
  const [region, setRegion] = useState('North');

  useEffect(() => {
    void loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await createVehicle({
        registrationNumber,
        nameModel,
        type,
        maxLoadCapacity: Number(maxLoadCapacity),
        odometer: Number(odometer),
        acquisitionCost: Number(acquisitionCost),
        region,
        status: 'Available',
      });
      setVehicles((prev) => [...prev, created]);
      setShowForm(false);
      setRegistrationNumber('');
      setNameModel('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle.');
    }
  }

  async function handleDelete(vehicle: VehicleSummary) {
    if (vehicle.status === 'On Trip' || vehicle.status === 'In Shop') {
      setError(`Cannot delete ${vehicle.registrationNumber} while status is ${vehicle.status}.`);
      return;
    }
    if (!confirm(`Delete vehicle ${vehicle.registrationNumber}?`)) return;
    await deleteVehicle(vehicle.id);
    setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
  }

  async function handleToggleStatus(vehicle: VehicleSummary, newStatus: VehicleSummary['status']) {
    const updated = await updateVehicleStatus(vehicle.id, newStatus);
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Vehicle Registry</h1>
          <p className="text-sm text-slate-500">Manage fleet assets, load limits, and operational states.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            + Register vehicle
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-medium">Dismiss</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-medium">New Vehicle Registration</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-500">Registration Number (Unique)</label>
              <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Vehicle Name / Model</label>
              <input value={nameModel} onChange={(e) => setNameModel(e.target.value)} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Max Load Capacity (kg)</label>
              <input type="number" value={maxLoadCapacity} onChange={(e) => setMaxLoadCapacity(Number(e.target.value))} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Acquisition Cost ($)</label>
              <input type="number" value={acquisitionCost} onChange={(e) => setAcquisitionCost(Number(e.target.value))} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-3 py-1.5 text-sm">Cancel</button>
            <button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white dark:bg-slate-100 dark:text-slate-900">Save Vehicle</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading vehicles…</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="p-4">Registration</th>
                <th className="p-4">Model</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Odometer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vehicles.map((v) => (
                <tr key={v.id} className={`status-rail-${v.status.toLowerCase().replace(/\s+/g, '')}`}>
                  <td className="p-4 font-medium">{v.registrationNumber}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{v.nameModel}</td>
                  <td className="p-4">{v.maxLoadCapacity} kg</td>
                  <td className="p-4">{v.odometer} km</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {v.status === 'Available' && (
                      <button onClick={() => void handleToggleStatus(v, 'Retired')} className="text-xs text-amber-600 hover:underline">Retire</button>
                    )}
                    <button onClick={() => void handleDelete(v)} className="text-xs text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
