/**
 * Driv-A-Long fare calculation engine.
 *
 * Pricing model (as specified):
 *   Base Fare        = ₹299
 *   Distance Charge  = Distance (km)   × ₹13 per km
 *   Time Charge      = Duration (hrs)  × ₹120 per hour
 *   Total Fare       = Base Fare + Distance Charge + Time Charge
 *
 * This file is isomorphic (no DOM / Node-only APIs) so it can be safely
 * imported from both the browser (React components) and the server
 * (TanStack Start server functions).
 */

export const PRICING = {
  baseFare: 299,
  ratePerKm: 13,
  ratePerHour: 120,
} as const;

export type VehicleType = "hatchback" | "sedan" | "suv" | "luxury" | "ev";

/**
 * Vehicle class multipliers. The base pricing formula above applies exactly
 * to the standard "sedan" class. Other vehicle classes scale the distance
 * and time components so the booking flow can keep its existing vehicle
 * picker while still honouring the ₹299 + ₹13/km + ₹120/hr formula.
 */
export const VEHICLE_MULTIPLIERS: Record<VehicleType, { name: string; multiplier: number }> = {
  hatchback: { name: "Hatchback", multiplier: 0.85 },
  sedan: { name: "Sedan", multiplier: 1 },
  suv: { name: "SUV", multiplier: 1.3 },
  luxury: { name: "Luxury", multiplier: 1.85 },
  ev: { name: "Electric (EV)", multiplier: 0.95 },
};

export interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  durationMinutes: number;
  ratePerKm: number;
  ratePerHour: number;
  distanceCharge: number;
  timeCharge: number;
  totalFare: number;
  vehicleType: VehicleType;
  vehicleMultiplier: number;
}

/**
 * Calculates the fare using the Driv-A-Long pricing formula:
 *   Total Fare = ₹299 + (Distance × ₹13) + (Duration in hours × ₹120)
 */
export function calculateFare(
  distanceKm: number,
  durationMinutes: number,
  vehicleType: VehicleType = "sedan"
): FareBreakdown {
  const vehicle = VEHICLE_MULTIPLIERS[vehicleType] || VEHICLE_MULTIPLIERS.sedan;
  const safeDistance = Math.max(0, distanceKm || 0);
  const safeDuration = Math.max(0, durationMinutes || 0);

  const effectiveRatePerKm = Math.round(PRICING.ratePerKm * vehicle.multiplier * 100) / 100;
  const effectiveRatePerHour = Math.round(PRICING.ratePerHour * vehicle.multiplier * 100) / 100;

  const distanceCharge = Math.round(safeDistance * effectiveRatePerKm);
  const timeCharge = Math.round((safeDuration / 60) * effectiveRatePerHour);
  const totalFare = Math.round(PRICING.baseFare + distanceCharge + timeCharge);

  return {
    baseFare: PRICING.baseFare,
    distanceKm: Math.round(safeDistance * 10) / 10,
    durationMinutes: Math.round(safeDuration),
    ratePerKm: effectiveRatePerKm,
    ratePerHour: effectiveRatePerHour,
    distanceCharge,
    timeCharge,
    totalFare,
    vehicleType,
    vehicleMultiplier: vehicle.multiplier,
  };
}

/** Formats a number of minutes as a friendly "Xh Ym" / "Xm" string. */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Formats a Date (or ISO string) as a local "hh:mm AM/PM" ETA label. */
export function formatEta(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Computes the estimated arrival Date given a duration in minutes from now. */
export function computeEtaDate(durationMinutes: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + Math.max(0, durationMinutes || 0) * 60_000);
}

/** Formats a rupee amount with the ₹ symbol and thousands separators. */
export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Haversine formula to compute direct (as-the-crow-flies) distance between
 * two lat/lng coordinates in km, inflated by a road-winding factor. Used
 * only as an offline fallback when the Directions API is unreachable.
 */
export function computeHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3 * 10) / 10; // 1.3 road-winding factor
}
