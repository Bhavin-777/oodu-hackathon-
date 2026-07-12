// src/types/operations.ts
//
// Shared domain types for the Operations Management slice (Member 3).
// These mirror the "Expected Database Entities" in the spec: Drivers, Trips,
// plus the parts of Vehicle that Operations needs to read (it does NOT own
// vehicle CRUD — that belongs to the Fleet Manager slice — but trip creation
// and dispatch need to read/react to vehicle status).

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string; // ISO date string, e.g. "2026-09-01"
  contactNumber: string;
  safetyScore: number; // 0-100
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export type DriverInput = Omit<Driver, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  status?: DriverStatus; // defaults to 'Available' on create
};

// Minimal read-only shape Operations needs from the Vehicle Registry slice.
export interface VehicleSummary {
  id: string;
  registrationNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number; // kg
  status: VehicleStatus;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // kg
  plannedDistance: number; // km
  status: TripStatus;
  finalOdometer?: number;
  fuelConsumed?: number; // liters, recorded on completion
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export type TripCreateInput = {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
};

export type TripCompleteInput = {
  finalOdometer: number;
  fuelConsumed: number;
};

// Generic result wrapper used by every validation function so the UI can
// show *why* something is blocked, not just that it is blocked.
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}
