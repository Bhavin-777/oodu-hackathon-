import React, { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { Driver, DriverStatus } from '../types';

export function DriversPage() {
  const { drivers, isLoading, createDriver } = useDrivers();
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Heavy');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState(100);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !licenseNumber || !licenseExpiryDate) return;

    await createDriver({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: Number(safetyScore),
      status: 'Available',
    });

    setName('');
    setLicenseNumber('');
    setLicenseExpiryDate('');
    setContactNumber('');
  };

  if (isLoading) return <div className="p-6 text-muted-foreground">Loading drivers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Driver Management</h2>
      </div>

      {/* Driver Creation Form */}
      <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-muted">
        <input placeholder="Driver Name" value={name} onChange={e => setName(e.target.value)} className="bg-muted px-3 py-2 rounded text-sm" required />
        <input placeholder="License Number" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="bg-muted px-3 py-2 rounded text-sm" required />
        <input type="date" value={licenseExpiryDate} onChange={e => setLicenseExpiryDate(e.target.value)} className="bg-muted px-3 py-2 rounded text-sm text-muted-foreground" required />
        <input placeholder="Contact Number" value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="bg-muted px-3 py-2 rounded text-sm" />
        <button type="submit" className="md:col-span-4 bg-primary text-white py-2 rounded font-medium text-sm transition-colors hover:bg-primary/90">
          Register New Driver
        </button>
      </form>

      {/* Data Table */}
      <div className="border border-muted rounded-lg overflow-hidden bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase text-xs">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">License Info</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3">Safety Score</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver: Driver) => {
              const isExpired = new Date(driver.licenseExpiryDate) < new Date();
              const statusClass = isExpired ? 'status-rail-suspended' : `status-rail-${driver.status.toLowerCase().replace(/\s+/g, '')}`;
              
              return (
                <tr key={driver.id} className={`border-t border-muted ${statusClass}`}>
                  <td className="p-3 font-medium">{driver.name}</td>
                  <td className="p-3 text-muted-foreground">{driver.licenseNumber} ({driver.licenseCategory})</td>
                  <td className={`p-3 ${isExpired ? 'text-red-400 font-semibold' : ''}`}>{driver.licenseExpiryDate} {isExpired && ' (Expired)'}</td>
                  <td className="p-3">{driver.safetyScore}/100</td>
                  <td className="p-3">{isExpired ? 'Expired License' : driver.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
