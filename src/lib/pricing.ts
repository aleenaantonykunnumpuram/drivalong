/**
 * Driv-A-Long Professional Chauffeur Rental Fare Calculation Engine.
 *
 * Chauffeur Services pricing model:
 *   Base Fare        = Service Base Fare (₹299 - ₹1,499)
 *   Duration Charge  = Service Duration Hours × Rate per hour
 *   Distance Charge  = Optional Distance (km) × Rate per km
 *   Total Fare       = Base Fare + Duration Charge + Distance Charge
 */

export const PRICING = {
  baseFare: 299,
  ratePerKm: 13,
  ratePerHour: 120,
} as const;

export type ServiceType =
  | "One-Way Chauffeur"
  | "Hourly Chauffeur"
  | "Full-Day Chauffeur"
  | "Airport Chauffeur"
  | "Designated Driver"
  | "Corporate Chauffeur"
  | "Event Chauffeur"
  | "Outstation Chauffeur";

export type DurationOption =
  | "1 Hour"
  | "2 Hours"
  | "4 Hours"
  | "6 Hours"
  | "8 Hours"
  | "12 Hours"
  | "Full Day";

export const DURATION_HOURS: Record<DurationOption, number> = {
  "1 Hour": 1,
  "2 Hours": 2,
  "4 Hours": 4,
  "6 Hours": 6,
  "8 Hours": 8,
  "12 Hours": 12,
  "Full Day": 24,
};

export const CHAUFFEUR_SERVICES: Record<
  ServiceType,
  {
    title: string;
    description: string;
    baseFare: number;
    ratePerHour: number;
    ratePerKm: number;
  }
> = {
  "One-Way Chauffeur": {
    title: "One-Way Chauffeur",
    description: "Hire a professional driver for a single point-to-point trip in your car.",
    baseFare: 299,
    ratePerHour: 120,
    ratePerKm: 13,
  },
  "Hourly Chauffeur": {
    title: "Hourly Chauffeur",
    description: "Flexible hourly chauffeur rental for shopping, errands, or multiple stops.",
    baseFare: 349,
    ratePerHour: 140,
    ratePerKm: 0,
  },
  "Full-Day Chauffeur": {
    title: "Full-Day Chauffeur",
    description: "Dedicated chauffeur for your vehicle for the entire day (up to 8 hrs included).",
    baseFare: 1499,
    ratePerHour: 100,
    ratePerKm: 0,
  },
  "Airport Chauffeur": {
    title: "Airport Chauffeur",
    description: "Reliable airport pickup or drop-off service in the comfort of your own car.",
    baseFare: 499,
    ratePerHour: 120,
    ratePerKm: 13,
  },
  "Designated Driver": {
    title: "Designated Driver",
    description: "Safe drive home service after parties, events, or nightlife in your car.",
    baseFare: 399,
    ratePerHour: 130,
    ratePerKm: 10,
  },
  "Corporate Chauffeur": {
    title: "Corporate Chauffeur",
    description: "Executive chauffeurs for business meetings, VIP guests, and corporate mobility.",
    baseFare: 799,
    ratePerHour: 150,
    ratePerKm: 12,
  },
  "Event Chauffeur": {
    title: "Event Chauffeur",
    description: "Chauffeur service tailored for weddings, family functions, and special events.",
    baseFare: 699,
    ratePerHour: 150,
    ratePerKm: 0,
  },
  "Outstation Chauffeur": {
    title: "Outstation Chauffeur",
    description: "Experienced highway driver for long-distance intercity road trips.",
    baseFare: 999,
    ratePerHour: 120,
    ratePerKm: 14,
  },
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
}

/**
 * Calculates the fare for Chauffeur Services.
 */
export function calculateFare(
  distanceKm: number = 0,
  durationMinutes: number = 60,
  serviceType: ServiceType = "Hourly Chauffeur"
): FareBreakdown {
  const service = CHAUFFEUR_SERVICES[serviceType] || CHAUFFEUR_SERVICES["Hourly Chauffeur"];
  const safeDistance = Math.max(0, distanceKm || 0);
  const safeDuration = Math.max(0, durationMinutes || 60);

  const baseFare = service.baseFare;
  const ratePerKm = service.ratePerKm;
  const ratePerHour = service.ratePerHour;

  const distanceCharge = Math.round(safeDistance * ratePerKm);
  const timeCharge = Math.round((safeDuration / 60) * ratePerHour);
  const totalFare = Math.round(baseFare + distanceCharge + timeCharge);

  return {
    baseFare,
    distanceKm: Math.round(safeDistance * 10) / 10,
    durationMinutes: Math.round(safeDuration),
    ratePerKm,
    ratePerHour,
    distanceCharge,
    timeCharge,
    totalFare,
  };
}

/** Formats duration in minutes to a human-readable label */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Formats ETA timestamp */
export function formatEta(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Computes ETA Date */
export function computeEtaDate(durationMinutes: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + Math.max(0, durationMinutes || 0) * 60_000);
}

/** Formats currency amount */
export function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Haversine offline distance computation */
export function computeHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3 * 10) / 10;
}
