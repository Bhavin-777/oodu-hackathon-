// src/components/driver/DriverForm.tsx
//
// Create/edit form for driver profiles: Name, License Number, License
// Category, License Expiry Date, Contact Number, Safety Score (spec 3.4).

import { useState } from 'react';
import type { Driver, DriverInput } from '../../types/operations';
import { validateDriverInput } from '../../services/driver.service';

interface DriverFormProps {
  initial?: Driver;
  onSubmit: (input: DriverInput) => Promise<void>;
  onCancel: () => void;
}

const emptyForm: DriverInput = {
  name: '',
  licenseNumber: '',
  licenseCategory: '',
  licenseExpiryDate: '',
  contactNumber: '',
  safetyScore: 100,
};

export function DriverForm({ initial, onSubmit, onCancel }: DriverFormProps) {
  const [form, setForm] = useState<DriverInput>(
    initial
      ? {
          name: initial.name,
          licenseNumber: initial.licenseNumber,
          licenseCategory: initial.licenseCategory,
          licenseExpiryDate: initial.licenseExpiryDate,
          contactNumber: initial.contactNumber,
          safetyScore: initial.safetyScore,
          status: initial.status,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof DriverInput>(key: K, value: DriverInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateDriverInput(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to save driver.']);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        {initial ? 'Edit driver' : 'Add driver'}
      </h2>

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <ul className="list-inside list-disc space-y-0.5">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Alex Johnson"
          />
        </Field>

        <Field label="Contact number">
          <input
            className="form-input"
            value={form.contactNumber}
            onChange={(e) => update('contactNumber', e.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="License number">
          <input
            className="form-input"
            value={form.licenseNumber}
            onChange={(e) => update('licenseNumber', e.target.value)}
            placeholder="KA-2023-0011223"
          />
        </Field>

        <Field label="License category">
          <input
            className="form-input"
            value={form.licenseCategory}
            onChange={(e) => update('licenseCategory', e.target.value)}
            placeholder="LMV / HMV / Transport"
          />
        </Field>

        <Field label="License expiry date">
          <input
            type="date"
            className="form-input"
            value={form.licenseExpiryDate}
            onChange={(e) => update('licenseExpiryDate', e.target.value)}
          />
        </Field>

        <Field label="Safety score (0-100)">
          <input
            type="number"
            min={0}
            max={100}
            className="form-input"
            value={form.safetyScore}
            onChange={(e) => update('safetyScore', Number(e.target.value))}
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
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add driver'}
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
