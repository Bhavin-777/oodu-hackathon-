// src/components/driver/DriverList.tsx
//
// Table of driver profiles showing license validity (with an "expiring
// soon" warning) and safety score, plus edit/delete/suspend actions.

import type { Driver } from '../../types/operations';
import {
  daysUntilExpiry,
  isLicenseExpired,
  isLicenseExpiringSoon,
  safetyTier,
} from '../../services/driver.service';
import { StatusBadge, driverStatusTone } from '../common/StatusBadge';

interface DriverListProps {
  drivers: Driver[];
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
  onToggleSuspend: (driver: Driver) => void;
}

const SAFETY_TONE = {
  excellent: 'green',
  good: 'amber',
  'at-risk': 'red',
} as const;

export function DriverList({ drivers, onEdit, onDelete, onToggleSuspend }: DriverListProps) {
  if (drivers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        No drivers yet. Add your first driver to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {['Name', 'License', 'Expiry', 'Safety Score', 'Status', ''].map((h) => (
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
          {drivers.map((driver) => {
            const expired = isLicenseExpired(driver);
            const expiringSoon = isLicenseExpiringSoon(driver);
            const tier = safetyTier(driver.safetyScore);

            return (
              <tr key={driver.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{driver.name}</div>
                  <div className="text-xs text-slate-500">{driver.contactNumber}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {driver.licenseNumber}
                  <div className="text-xs text-slate-500">{driver.licenseCategory}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className={expired ? 'font-medium text-red-600' : 'text-slate-700'}>
                    {driver.licenseExpiryDate}
                  </div>
                  {expired && (
                    <StatusBadge label="Expired" tone="red" />
                  )}
                  {!expired && expiringSoon && (
                    <StatusBadge label={`Expires in ${daysUntilExpiry(driver)}d`} tone="amber" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={`${driver.safetyScore}/100`} tone={SAFETY_TONE[tier]} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={driver.status} tone={driverStatusTone(driver.status)} />
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => onEdit(driver)} className="text-slate-600 hover:text-slate-900">
                      Edit
                    </button>
                    <button
                      onClick={() => onToggleSuspend(driver)}
                      className="text-amber-600 hover:text-amber-800"
                      disabled={driver.status === 'On Trip'}
                      title={
                        driver.status === 'On Trip'
                          ? 'Cannot change status while on a trip'
                          : undefined
                      }
                    >
                      {driver.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
                    </button>
                    <button onClick={() => onDelete(driver)} className="text-red-600 hover:text-red-800">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
