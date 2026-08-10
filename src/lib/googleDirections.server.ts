import process from "node:process";

// Server-only module (.server.ts) — this never ships to the browser.
// Calls the Google Directions API using a server-side restricted API key,
// with automatic fallback calculation if the key is unconfigured or rate-limited.

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DirectionsResult {
  distanceKm: number;
  distanceMeters: number;
  durationMinutes: number;
  durationSeconds: number;
  /** Live-traffic-aware duration, when Google returns one. */
  durationInTrafficMinutes: number | null;
  startAddress: string;
  endAddress: string;
  /** Encoded polyline for the full route (Google's polyline algorithm format). */
  overviewPolyline: string;
}

export class DirectionsApiError extends Error {
  status: string;
  constructor(message: string, status: string) {
    super(message);
    this.name = "DirectionsApiError";
    this.status = status;
  }
}

function getDirectionsApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ""
  );
}

function computeFallbackDirections(origin: LatLng, destination: LatLng): DirectionsResult {
  // Haversine formula for spherical distance in km
  const R = 6371;
  const dLat = (destination.lat - origin.lat) * (Math.PI / 180);
  const dLng = (destination.lng - origin.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(origin.lat * (Math.PI / 180)) *
      Math.cos(destination.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Apply ~1.25x road curvature factor for real driving distance vs straight line
  const distanceKm = Math.max(1, Math.round(straightKm * 1.25 * 10) / 10);
  const distanceMeters = Math.round(distanceKm * 1000);

  // Average city driving speed ~ 35 km/h in Kerala traffic
  const durationMinutes = Math.max(15, Math.round((distanceKm / 35) * 60));
  const durationSeconds = durationMinutes * 60;

  return {
    distanceKm,
    distanceMeters,
    durationMinutes,
    durationSeconds,
    durationInTrafficMinutes: durationMinutes,
    startAddress: "",
    endAddress: "",
    overviewPolyline: "",
  };
}

/**
 * Calls the Google Directions API (server-side) for driving directions.
 * Falls back to estimated road geometry if API key is unconfigured or fails.
 */
export async function fetchDrivingDirections(
  origin: LatLng,
  destination: LatLng,
  options: { departureTime?: Date } = {}
): Promise<DirectionsResult> {
  const apiKey = getDirectionsApiKey();
  if (!apiKey) {
    return computeFallbackDirections(origin, destination);
  }

  try {
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: "driving",
      departure_time: String(Math.floor((options.departureTime ?? new Date()).getTime() / 1000)),
      traffic_model: "best_guess",
      key: apiKey,
    });

    const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);

    if (!res.ok) {
      return computeFallbackDirections(origin, destination);
    }

    const data = (await res.json()) as {
      status: string;
      error_message?: string;
      routes: Array<{
        overview_polyline?: { points: string };
        legs: Array<{
          distance?: { value: number; text: string };
          duration?: { value: number; text: string };
          duration_in_traffic?: { value: number; text: string };
          start_address?: string;
          end_address?: string;
        }>;
      }>;
    };

    if (data.status !== "OK" || !data.routes?.[0]?.legs?.[0]) {
      return computeFallbackDirections(origin, destination);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    if (!leg.distance || !leg.duration) {
      return computeFallbackDirections(origin, destination);
    }

    return {
      distanceMeters: leg.distance.value,
      distanceKm: Math.round((leg.distance.value / 1000) * 10) / 10,
      durationSeconds: leg.duration.value,
      durationMinutes: Math.round(leg.duration.value / 60),
      durationInTrafficMinutes: leg.duration_in_traffic ? Math.round(leg.duration_in_traffic.value / 60) : null,
      startAddress: leg.start_address || "",
      endAddress: leg.end_address || "",
      overviewPolyline: route.overview_polyline?.points || "",
    };
  } catch {
    return computeFallbackDirections(origin, destination);
  }
}

/** Forward-geocodes a free-text address into coordinates (server-side). */
export async function geocodeAddress(address: string): Promise<LatLng> {
  const apiKey = getDirectionsApiKey();
  if (!apiKey) {
    throw new DirectionsApiError("Google Maps server API key is not configured.", "MISSING_API_KEY");
  }

  const params = new URLSearchParams({ address, key: apiKey });
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  const data = (await res.json()) as {
    status: string;
    results: Array<{ geometry: { location: { lat: number; lng: number } } }>;
  };

  if (data.status !== "OK" || !data.results[0]) {
    throw new DirectionsApiError(`Geocoding failed: ${data.status}`, data.status);
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}
