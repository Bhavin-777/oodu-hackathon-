// Status vocabularies straight from the spec (section 3.3–3.5).
// Centralized here so every module (dashboard, tables, forms) refers to
// the same literal unions instead of ad-hoc strings.

export const VEHICLE_STATUS = ['Available', 'On Trip', 'In Shop', 'Retired'] as const
export type VehicleStatus = (typeof VEHICLE_STATUS)[number]

export const DRIVER_STATUS = ['Available', 'On Trip', 'Off Duty', 'Suspended'] as const
export type DriverStatus = (typeof DRIVER_STATUS)[number]

export const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled'] as const
export type TripStatus = (typeof TRIP_STATUS)[number]
