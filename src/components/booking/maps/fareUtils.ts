/**
 * Fare calculation utilities for Chauffeur / Vehicle Bookings.
 * Formula: Base Fare + (Distance in km * Vehicle Rate per km)
 */

export interface VehicleRate {
  id: string;
  name: string;
  baseFare: number;
  ratePerKm: number;
}

export const VEHICLE_RATES: Record<string, VehicleRate> = {
  hatchback: { id: "hatchback", name: "Hatchback", baseFare: 50, ratePerKm: 10 },
  sedan: { id: "sedan", name: "Sedan", baseFare: 100, ratePerKm: 15 },
  suv: { id: "suv", name: "SUV", baseFare: 150, ratePerKm: 20 },
  luxury: { id: "luxury", name: "Luxury", baseFare: 250, ratePerKm: 30 },
  ev: { id: "ev", name: "Electric (EV)", baseFare: 80, ratePerKm: 12 },
};

/**
 * Calculates estimated fare based on vehicle type and distance in kilometers.
 */
export function calculateFare(distanceKm: number, vehicleType: string = "sedan"): {
  baseFare: number;
  ratePerKm: number;
  distanceKm: number;
  distanceCost: number;
  totalFare: number;
} {
  const vehicle = VEHICLE_RATES[vehicleType.toLowerCase()] || VEHICLE_RATES.sedan;
  const distanceCost = Math.round(distanceKm * vehicle.ratePerKm);
  const totalFare = vehicle.baseFare + distanceCost;

  return {
    baseFare: vehicle.baseFare,
    ratePerKm: vehicle.ratePerKm,
    distanceKm: Math.round(distanceKm * 10) / 10,
    distanceCost,
    totalFare,
  };
}

/**
 * Haversine formula to compute direct distance between two lat/lng coordinates in km.
 * Used for fallback distance calculation if Directions API is unavailable.
 */
export function computeHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 1.3 * 10) / 10; // 1.3 road winding factor
}
