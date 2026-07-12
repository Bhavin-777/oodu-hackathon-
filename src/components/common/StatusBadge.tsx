// src/components/common/StatusBadge.tsx
//
// Small shared presentational component — not in the owned-files list, but
// both DriverList and TripList need a consistent way to render a status
// pill, so it's factored out rather than duplicated.

import type { ReactNode } from 'react';

type Tone = 'green' | 'amber' | 'red' | 'slate' | 'blue';

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  amber: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  red: 'bg-red-100 text-red-800 ring-red-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  blue: 'bg-blue-100 text-blue-800 ring-blue-600/20',
};

export function StatusBadge({ label, tone }: { label: ReactNode; tone: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function driverStatusTone(status: string): Tone {
  switch (status) {
    case 'Available':
      return 'green';
    case 'On Trip':
      return 'blue';
    case 'Off Duty':
      return 'slate';
    case 'Suspended':
      return 'red';
    default:
      return 'slate';
  }
}

export function tripStatusTone(status: string): Tone {
  switch (status) {
    case 'Draft':
      return 'slate';
    case 'Dispatched':
      return 'blue';
    case 'Completed':
      return 'green';
    case 'Cancelled':
      return 'red';
    default:
      return 'slate';
  }
}
