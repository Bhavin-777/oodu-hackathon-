// src/pages/Drivers.tsx
//
// Top-level page for driver management (spec 3.4). Fetches drivers on
// mount, and wires the DriverForm / DriverList components to
// driver.service.ts for CRUD + suspend/reinstate.

import { useEffect, useState } from 'react';
import { DriverForm } from '../components/driver/DriverForm';
import { DriverList } from '../components/driver/DriverList';
import {
  createDriver,
  deleteDriver,
  getDrivers,
  setDriverStatus,
  updateDriver,
} from '../services/driver.service';
import type { Driver, DriverInput } from '../types/operations';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | undefined>(undefined);

  useEffect(() => {
    void loadDrivers();
  }, []);

  async function loadDrivers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(input: DriverInput) {
    if (editingDriver) {
      const updated = await updateDriver(editingDriver.id, input);
      setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } else {
      const created = await createDriver(input);
      setDrivers((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditingDriver(undefined);
  }

  async function handleDelete(driver: Driver) {
    if (driver.status === 'On Trip') {
      setError(`Cannot delete ${driver.name} while on a trip.`);
      return;
    }
    if (!confirm(`Delete driver ${driver.name}? This cannot be undone.`)) return;
    await deleteDriver(driver.id);
    setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
  }

  async function handleToggleSuspend(driver: Driver) {
    const nextStatus = driver.status === 'Suspended' ? 'Available' : 'Suspended';
    const updated = await setDriverStatus(driver.id, nextStatus);
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-500">
            Profiles, license validity, and safety scores for every driver.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingDriver(undefined);
              setShowForm(true);
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Add driver
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
        <DriverForm
          initial={editingDriver}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingDriver(undefined);
          }}
        />
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading drivers…</div>
      ) : (
        <DriverList
          drivers={drivers}
          onEdit={(driver) => {
            setEditingDriver(driver);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onToggleSuspend={handleToggleSuspend}
        />
      )}
    </div>
  );
}
