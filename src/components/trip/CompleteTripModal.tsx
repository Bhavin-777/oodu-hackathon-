// src/components/trip/CompleteTripModal.tsx
//
// Small modal collecting final odometer + fuel consumed when a Dispatched
// trip is completed (spec example workflow step 6).

import { useState } from 'react';
import type { Trip, TripCompleteInput } from '../../types/operations';

interface CompleteTripModalProps {
  trip: Trip;
  onConfirm: (input: TripCompleteInput) => Promise<void>;
  onClose: () => void;
}

export function CompleteTripModal({ trip, onConfirm, onClose }: CompleteTripModalProps) {
  const [finalOdometer, setFinalOdometer] = useState<number>(0);
  const [fuelConsumed, setFuelConsumed] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm({ finalOdometer, fuelConsumed });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete trip.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">
          Complete trip {trip.source} → {trip.destination}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the final odometer reading and fuel consumed to close this trip out.
        </p>

        {error && <div className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</div>}

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Final odometer (km)</span>
            <input
              type="number"
              min={0}
              className="form-input"
              value={finalOdometer}
              onChange={(e) => setFinalOdometer(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">Fuel consumed (liters)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              className="form-input"
              value={fuelConsumed}
              onChange={(e) => setFuelConsumed(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Completing…' : 'Mark completed'}
          </button>
        </div>
      </div>
    </div>
  );
}
