// src/services/trip.service.ts
//
// Owns: Trip creation and the full lifecycle Draft → Dispatched → Completed
//       / Cancelled, plus every "mandatory business rule" from spec section 4
//       that touches trips:
//
//   - Cargo Weight must not exceed the vehicle's maximum load capacity.
//   - Retired or In Shop vehicles must never appear in the dispatch selection.
//   - A vehicle already marked On Trip cannot be assigned to another trip.
//   - Drivers with expired licenses or Suspended status cannot be assigned.
//   - A driver already marked On Trip cannot be assigned to another trip.
//   - Dispatching a trip -> vehicle & driver become On Trip.
//   - Completing a trip -> vehicle & driver become Available.
//   - Cancelling a dispatched trip -> vehicle & driver restored to Available.
//
// Status flips on Vehicle/Driver are enforced authoritatively by the backend
// (this calls dedicated /dispatch, /complete, /cancel endpoints rather than
// PATCHing status fields directly), but every rule is re-validated here first
// so the UI can reject bad input immediately with a clear reason.

import { apiClient } from './apiClient';
import { validateDriverForAssignment } from './driver.service';
import type {
  Driver,
  Trip,
  TripCompleteInput,
  TripCreateInput,
  ValidationResult,
  VehicleSummary,
} from '../types/operations';

const BASE_URL = '/trips';

// ---------------------------------------------------------------------------
// CRUD / reads
// ---------------------------------------------------------------------------

export async function getTrips(): Promise<Trip[]> {
  const { data } = await apiClient.get<Trip[]>(BASE_URL);
  return data;
}

export async function getTrip(id: string): Promise<Trip> {
  const { data } = await apiClient.get<Trip>(`${BASE_URL}/${id}`);
  return data;
}

// ---------------------------------------------------------------------------
// Vehicle-side eligibility (mirrors driver.service's validateDriverForAssignment)
// ---------------------------------------------------------------------------

/** Can this vehicle be picked for a new trip right now? */
export function validateVehicleForAssignment(vehicle: VehicleSummary): ValidationResult {
  if (vehicle.status === 'Retired') {
    return { valid: false, reason: `${vehicle.registrationNumber} is retired.` };
  }
  if (vehicle.status === 'In Shop') {
    return { valid: false, reason: `${vehicle.registrationNumber} is in maintenance.` };
  }
  if (vehicle.status === 'On Trip') {
    return { valid: false, reason: `${vehicle.registrationNumber} is already on a trip.` };
  }
  return { valid: true };
}

export function getAssignableVehicles(vehicles: VehicleSummary[]): VehicleSummary[] {
  return vehicles.filter((v) => validateVehicleForAssignment(v).valid);
}

/** Cargo weight must not exceed the selected vehicle's max load capacity. */
export function validateCargoWeight(
  cargoWeight: number,
  vehicle: Pick<VehicleSummary, 'maxLoadCapacity' | 'registrationNumber'>
): ValidationResult {
  if (cargoWeight <= 0) {
    return { valid: false, reason: 'Cargo weight must be greater than zero.' };
  }
  if (cargoWeight > vehicle.maxLoadCapacity) {
    return {
      valid: false,
      reason: `Cargo weight (${cargoWeight} kg) exceeds ${vehicle.registrationNumber}'s max load capacity (${vehicle.maxLoadCapacity} kg).`,
    };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Full validation pass, run before create AND re-checked before dispatch
// (statuses can change between the two steps if the trip is saved as Draft).
// ---------------------------------------------------------------------------

export function validateTripInput(
  input: TripCreateInput,
  vehicle: VehicleSummary,
  driver: Driver
): ValidationResult {
  if (!input.source?.trim() || !input.destination?.trim()) {
    return { valid: false, reason: 'Source and destination are required.' };
  }
  if (input.source.trim().toLowerCase() === input.destination.trim().toLowerCase()) {
    return { valid: false, reason: 'Source and destination must be different.' };
  }
  if (!input.plannedDistance || input.plannedDistance <= 0) {
    return { valid: false, reason: 'Planned distance must be greater than zero.' };
  }

  const vehicleCheck = validateVehicleForAssignment(vehicle);
  if (!vehicleCheck.valid) return vehicleCheck;

  const driverCheck = validateDriverForAssignment(driver);
  if (!driverCheck.valid) return driverCheck;

  const cargoCheck = validateCargoWeight(input.cargoWeight, vehicle);
  if (!cargoCheck.valid) return cargoCheck;

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Lifecycle actions
// ---------------------------------------------------------------------------

/** Creates a trip in Draft status. Does not touch vehicle/driver status. */
export async function createTrip(
  input: TripCreateInput,
  vehicle: VehicleSummary,
  driver: Driver
): Promise<Trip> {
  const check = validateTripInput(input, vehicle, driver);
  if (!check.valid) {
    throw new Error(check.reason);
  }
  const { data } = await apiClient.post<Trip>(BASE_URL, { ...input, status: 'Draft' });
  return data;
}

/**
 * Dispatches a Draft trip: re-validates vehicle/driver are still eligible
 * (they may have changed since the trip was drafted), then asks the backend
 * to flip trip -> Dispatched and vehicle & driver -> On Trip atomically.
 */
export async function dispatchTrip(
  trip: Trip,
  vehicle: VehicleSummary,
  driver: Driver
): Promise<Trip> {
  if (trip.status !== 'Draft') {
    throw new Error(`Only Draft trips can be dispatched (current status: ${trip.status}).`);
  }
  const vehicleCheck = validateVehicleForAssignment(vehicle);
  if (!vehicleCheck.valid) throw new Error(vehicleCheck.reason);

  const driverCheck = validateDriverForAssignment(driver);
  if (!driverCheck.valid) throw new Error(driverCheck.reason);

  const cargoCheck = validateCargoWeight(trip.cargoWeight, vehicle);
  if (!cargoCheck.valid) throw new Error(cargoCheck.reason);

  const { data } = await apiClient.patch<Trip>(`${BASE_URL}/${trip.id}/dispatch`);
  return data;
}

/**
 * Completes a Dispatched trip: records final odometer + fuel consumed, and
 * asks the backend to flip trip -> Completed, vehicle & driver -> Available.
 */
export async function completeTrip(trip: Trip, input: TripCompleteInput): Promise<Trip> {
  if (trip.status !== 'Dispatched') {
    throw new Error(`Only Dispatched trips can be completed (current status: ${trip.status}).`);
  }
  if (input.finalOdometer === undefined || input.finalOdometer === null) {
    throw new Error('Final odometer reading is required.');
  }
  if (input.fuelConsumed === undefined || input.fuelConsumed < 0) {
    throw new Error('Fuel consumed must be zero or greater.');
  }

  const { data } = await apiClient.patch<Trip>(`${BASE_URL}/${trip.id}/complete`, input);
  return data;
}

/**
 * Cancels a Dispatched trip: asks the backend to flip trip -> Cancelled and
 * restore vehicle & driver -> Available. Draft trips can also be cancelled
 * (nothing to restore since they never flipped anyone to On Trip).
 */
export async function cancelTrip(trip: Trip): Promise<Trip> {
  if (trip.status !== 'Dispatched' && trip.status !== 'Draft') {
    throw new Error(`Trip cannot be cancelled from status ${trip.status}.`);
  }
  const { data } = await apiClient.patch<Trip>(`${BASE_URL}/${trip.id}/cancel`);
  return data;
}
