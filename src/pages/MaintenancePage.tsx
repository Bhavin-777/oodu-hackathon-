import { useEffect, useState } from 'react';
import { getMaintenanceLogs, createMaintenanceRecord, closeMaintenanceRecord } from '../services/maintenance.service';
import { getVehicles } from '../services/vehicle.service';
import type { MaintenanceLog, VehicleSummary } from '../types/operations';

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(150);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [logData, vehicleData] = await Promise.all([getMaintenanceLogs(), getVehicles()]);
      setLogs(logData);
      setVehicles(vehicleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId) return;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const created = await createMaintenanceRecord({
      vehicleId,
      description,
      cost: Number(cost),
      startDate: new Date().toISOString().split('T')[0],
      status: 'Open',
    }, vehicle);

    setLogs((prev) => [...prev, created]);
    setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? { ...v, status: 'In Shop' } : v)));
    setDescription('');
  }

  async function handleCloseRecord(log: MaintenanceLog) {
    const updated = await closeMaintenanceRecord(log.id, log.vehicleId);
    setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setVehicles((prev) => prev.map((v) => (v.id === log.vehicleId ? { ...v, status: 'Available' } : v)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Maintenance Management</h1>
        <p className="text-sm text-slate-500">Active records change vehicle status to In Shop automatically.</p>
      </div>

      <form onSubmit={handleAddRecord} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-lg font-medium">Create Maintenance Ticket</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Select Available Vehicle</label>
            <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required>
              <option value="">Select vehicle...</option>
              {vehicles.filter(v => v.status === 'Available').map(v => (
                <option key={v.id} value={v.id}>{v.registrationNumber} ({v.nameModel})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Estimated Cost ($)</label>
            <input type="number" value={cost} onChange={(e) => setCost(Number(e.target.value))} className="w-full rounded-md border p-2 text-sm dark:bg-slate-800" required />
          </div>
        </div>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900">Submit to Shop</button>
      </form>

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading logs…</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
              <tr>
                <th className="p-4">Vehicle ID</th>
                <th className="p-4">Description</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((l) => (
                <tr key={l.id} className={l.status === 'Open' ? 'status-rail-inshop' : 'status-rail-available'}>
                  <td className="p-4 font-medium">{l.vehicleId}</td>
                  <td className="p-4">{l.description}</td>
                  <td className="p-4">${l.cost}</td>
                  <td className="p-4">{l.startDate}</td>
                  <td className="p-4">{l.status}</td>
                  <td className="p-4 text-right">
                    {l.status === 'Open' && (
                      <button onClick={() => void handleCloseRecord(l)} className="text-xs text-blue-600 hover:underline">Close Maintenance</button>
                    )}
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
