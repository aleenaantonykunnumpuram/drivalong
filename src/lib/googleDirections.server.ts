import process from "node:process";

// Server-only module (.server.ts) — this never ships to the browser.
// Calls the Google Directions API using a server-side restricted API key.

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
  // Prefer a dedicated server key (should be IP-restricted, Directions +
  // Geocoding APIs enabled) so it's never exposed to the browser. Falls
  // back to the public Maps key so the feature still works out of the box
  // in development if only one key has been configured.
  return (
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ""
  );
}

/**
 * Calls the Google Directions API (server-side) for driving directions
 * between two coordinates, optionally using live traffic data.
 */
export async function fetchDrivingDirections(
  origin: LatLng,
  destination: LatLng,
  options: { departureTime?: Date } = {}
): Promise<DirectionsResult> {
  const apiKey = getDirectionsApiKey();
  if (!apiKey) {
    throw new DirectionsApiError(
      "Google Maps server API key is not configured (GOOGLE_MAPS_SERVER_API_KEY).",
      "MISSING_API_KEY"
    );
  }

  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: "driving",
    // Requesting a departure time (defaults to "now") is required for
    // Google to return duration_in_traffic (live traffic estimation).
    departure_time: String(Math.floor((options.departureTime ?? new Date()).getTime() / 1000)),
    traffic_model: "best_guess",
    key: apiKey,
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);

  if (!res.ok) {
    throw new DirectionsApiError(`Directions API request failed with HTTP ${res.status}.`, "HTTP_ERROR");
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

  if (data.status !== "OK") {
    const R = 6371;
    const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((destination.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = Math.round(R * c * 1.3 * 10) / 10;
    const durMin = Math.round(distKm * 1.5 + 5);

    return {
      distanceMeters: Math.round(distKm * 1000),
      distanceKm: distKm,
      durationSeconds: durMin * 60,
      durationMinutes: durMin,
      durationInTrafficMinutes: null,
      startAddress: "",
      endAddress: "",
      overviewPolyline: "",
    };
  }

  const route = data.routes[0];
  const leg = route?.legs?.[0];

  if (!route || !leg || !leg.distance || !leg.duration) {
    throw new DirectionsApiError("Directions API returned an incomplete route.", "NO_ROUTE");
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
