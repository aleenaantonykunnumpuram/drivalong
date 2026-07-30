/**
 * Re-exports the shared Driv-A-Long pricing engine for use inside the
 * booking UI components. See `src/lib/pricing.ts` for the formula:
 *   Total Fare = ₹299 (base) + (Distance × ₹13/km) + (Duration in hrs × ₹120/hr)
 */
export {
  PRICING,
  VEHICLE_MULTIPLIERS,
  calculateFare,
  computeHaversineDistance,
  formatDuration,
  formatEta,
  formatCurrency,
  computeEtaDate,
} from "@/lib/pricing";
export type { VehicleType, FareBreakdown } from "@/lib/pricing";
