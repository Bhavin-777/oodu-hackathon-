// src/services/driver.service.ts
//
// Owns: Driver CRUD, license-expiry logic, and the "is this driver allowed
// to be assigned to a trip" business rule from spec section 4:
//   "Drivers with expired licenses or Suspended status cannot be assigned
//    to trips." / "A driver already marked On Trip cannot be assigned to
//    another trip."
//
// These validations are duplicated on the backend (never trust the client),
// but running them here too means the Trip form can disable/explain bad
// choices instantly instead of round-tripping to the server first.

import { apiClient } from './apiClient';
import type { Driver, DriverInput, DriverStatus, ValidationResult } from '../types/operations';

const BASE_URL = '/drivers';

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function getDrivers(): Promise<Driver[]> {
  const { data } = await apiClient.get<Driver[]>(BASE_URL);
  return data;
}

export async function getDriver(id: string): Promise<Driver> {
  const { data } = await apiClient.get<Driver>(`${BASE_URL}/${id}`);
  return data;
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const errors = validateDriverInput(input);
  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }
  const { data } = await apiClient.post<Driver>(BASE_URL, {
    ...input,
    status: input.status ?? 'Available',
  });
  return data;
}

export async function updateDriver(id: string, input: Partial<DriverInput>): Promise<Driver> {
  const { data } = await apiClient.put<Driver>(`${BASE_URL}/${id}`, input);
  return data;
}

export async function deleteDriver(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}

export async function setDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
  const { data } = await apiClient.patch<Driver>(`${BASE_URL}/${id}/status`, { status });
  return data;
}

// ---------------------------------------------------------------------------
// Field-level validation (used by DriverForm before submit)
// ---------------------------------------------------------------------------

export function validateDriverInput(input: DriverInput): string[] {
  const errors: string[] = [];

  if (!input.name?.trim()) errors.push('Name is required.');
  if (!input.licenseNumber?.trim()) errors.push('License number is required.');
  if (!input.licenseCategory?.trim()) errors.push('License category is required.');
  if (!input.licenseExpiryDate) errors.push('License expiry date is required.');
  if (!input.contactNumber?.trim()) errors.push('Contact number is required.');

  if (
    input.safetyScore === undefined ||
    input.safetyScore === null ||
    Number.isNaN(input.safetyScore)
  ) {
    errors.push('Safety score is required.');
  } else if (input.safetyScore < 0 || input.safetyScore > 100) {
    errors.push('Safety score must be between 0 and 100.');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// License expiry
// ---------------------------------------------------------------------------

/** True if the license expiry date is today or in the past. */
export function isLicenseExpired(driver: Pick<Driver, 'licenseExpiryDate'>): boolean {
  const expiry = new Date(driver.licenseExpiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry.getTime() < today.getTime();
}

/** True if the license expires within `days` days (default 30) — used for the "expiring soon" warning badge. */
export function isLicenseExpiringSoon(
  driver: Pick<Driver, 'licenseExpiryDate'>,
  days = 30
): boolean {
  if (isLicenseExpired(driver)) return false;
  const expiry = new Date(driver.licenseExpiryDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return expiry.getTime() <= cutoff.getTime();
}

export function daysUntilExpiry(driver: Pick<Driver, 'licenseExpiryDate'>): number {
  const expiry = new Date(driver.licenseExpiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Safety score
// ---------------------------------------------------------------------------

export type SafetyTier = 'excellent' | 'good' | 'at-risk';

/** Buckets the numeric safety score into a tier for badge coloring. */
export function safetyTier(score: number): SafetyTier {
  if (score >= 85) return 'excellent';
  if (score >= 60) return 'good';
  return 'at-risk';
}

// ---------------------------------------------------------------------------
// Assignment eligibility (spec section 4 — mandatory business rules)
// ---------------------------------------------------------------------------

/**
 * Can this driver be assigned to a new trip right now?
 * Blocks: Suspended status, expired license, already On Trip, Off Duty.
 * Only 'Available' + valid license passes.
 */
export function validateDriverForAssignment(driver: Driver): ValidationResult {
  if (driver.status === 'Suspended') {
    return { valid: false, reason: `${driver.name} is suspended and cannot be assigned.` };
  }
  if (isLicenseExpired(driver)) {
    return {
      valid: false,
      reason: `${driver.name}'s license expired on ${driver.licenseExpiryDate}.`,
    };
  }
  if (driver.status === 'On Trip') {
    return { valid: false, reason: `${driver.name} is already on a trip.` };
  }
  if (driver.status === 'Off Duty') {
    return { valid: false, reason: `${driver.name} is off duty.` };
  }
  return { valid: true };
}

/** Filters a driver list down to the pool selectable in the Trip form's driver dropdown. */
export function getAssignableDrivers(drivers: Driver[]): Driver[] {
  return drivers.filter((d) => validateDriverForAssignment(d).valid);
}
