// src/services/vehicle.service.ts
//
// NOT part of Member 3's owned files — full Vehicle CRUD (spec 3.3) belongs
// to the Fleet Manager slice. This is a minimal read-only stub so
// TripForm/TripList/Trips.tsx compile and run standalone during
// integration/demo. Whoever owns Vehicle Registry should replace this with
// their real service (same function signature: getVehicles(): Promise<VehicleSummary[]>).

import { apiClient } from './apiClient';
import type { VehicleSummary } from '../types/operations';

export async function getVehicles(): Promise<VehicleSummary[]> {
  const { data } = await apiClient.get<VehicleSummary[]>('/vehicles');
  return data;
}
