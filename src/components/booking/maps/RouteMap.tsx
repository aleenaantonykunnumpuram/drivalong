import React, { useEffect, useState, useCallback, useMemo } from "react";
import { GoogleMap, MarkerF, Polyline, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

interface Coords {
  lat: number;
  lng: number;
}

interface RouteMapProps {
  isLoaded: boolean;
  loadError?: Error | null;
  pickupCoords?: Coords | null;
  dropCoords?: Coords | null;
  userCoords?: Coords | null;
  pickupText?: string;
  dropText?: string;
  /** Encoded route polyline returned by the backend Directions API call. */
  routePolyline?: string | null;
  /**
   * Called only when this component falls back to calculating the route
   * client-side (e.g. the backend estimate hasn't returned yet, or the
   * server key isn't configured).
   */
  onRouteCalculated?: (distanceKm: number, durationMinutes: number, durationText: string, overviewPolyline?: string) => void;
  onRouteError?: (msg: string) => void;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "320px",
  borderRadius: "24px",
};

const defaultCenter: Coords = {
  lat: 9.9312, // Kochi / Kerala default
  lng: 76.2673,
};

const defaultOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

function createFallbackRoutePath(origin: Coords, destination: Coords): Coords[] {
  const points: Coords[] = [];
  const steps = 25;

  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  const dx = destination.lng - origin.lng;
  const dy = destination.lat - origin.lat;
  const curveFactor = 0.12;
  const controlLat = midLat - dx * curveFactor;
  const controlLng = midLng + dy * curveFactor;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) * (1 - t) * origin.lat + 2 * (1 - t) * t * controlLat + t * t * destination.lat;
    const lng = (1 - t) * (1 - t) * origin.lng + 2 * (1 - t) * t * controlLng + t * t * destination.lng;
    points.push({ lat, lng });
  }

  return points;
}

export function RouteMap({
  isLoaded,
  loadError = null,
  pickupCoords,
  dropCoords,
  userCoords,
  pickupText,
  dropText,
  routePolyline,
  onRouteCalculated,
  onRouteError,
  className = "",
}: RouteMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

  const onLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Decode backend polyline if present
  const decodedPath = useMemo(() => {
    if (!routePolyline || !isLoaded || !window.google?.maps?.geometry || !pickupCoords) return null;
    try {
      const path = window.google.maps.geometry.encoding.decodePath(routePolyline);
      if (path && path.length > 0) {
        const start = path[0];
        const dist = Math.abs(start.lat() - pickupCoords.lat) + Math.abs(start.lng() - pickupCoords.lng);
        if (dist > 0.5) return null;
      }
      return path;
    } catch {
      return null;
    }
  }, [routePolyline, isLoaded, pickupCoords]);

  // Compute fallback curved route path when Google Directions API is restricted
  const fallbackRoutePath = useMemo(() => {
    if (!pickupCoords || !dropCoords) return null;
    return createFallbackRoutePath(pickupCoords, dropCoords);
  }, [pickupCoords, dropCoords]);

  // Client-side Google Directions Service calculation
  useEffect(() => {
    if (routePolyline) {
      setDirectionsResponse(null);
      return;
    }
    if (!isLoaded || !window.google || !pickupCoords || !dropCoords) {
      setDirectionsResponse(null);
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result);

            const leg = result.routes[0]?.legs[0];
            if (leg && onRouteCalculated) {
              const distanceKm = (leg.distance?.value || 0) / 1000;
              const durationMinutes = (leg.duration?.value || 0) / 60;
              const durationText = leg.duration?.text || "Unknown";
              const overviewPolyline = result.routes[0]?.overview_polyline || undefined;
              onRouteCalculated(Math.round(distanceKm * 10) / 10, Math.round(durationMinutes), durationText, overviewPolyline);
            }
          } else {
            console.warn("Directions service status:", status);
            setDirectionsResponse(null);
          }
        }
      );
    } catch (e) {
      console.warn("Directions calculation error:", e);
      setDirectionsResponse(null);
    }
  }, [isLoaded, pickupCoords, dropCoords, onRouteCalculated, onRouteError, routePolyline]);

  // Adjust map bounds when markers change
  useEffect(() => {
    if (!map || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    if (pickupCoords) {
      bounds.extend(pickupCoords);
      hasPoints = true;
    }
    if (dropCoords) {
      bounds.extend(dropCoords);
      hasPoints = true;
    }
    if (userCoords && !pickupCoords && !dropCoords) {
      bounds.extend(userCoords);
      hasPoints = true;
    }

    if (hasPoints) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      if (pickupCoords && !dropCoords) {
        map.setZoom(14);
      }
    }
  }, [map, pickupCoords, dropCoords, userCoords]);

  const currentCenter = pickupCoords || userCoords || defaultCenter;

  // Fallback map preview when Google Maps API fails to load
  if (loadError || !isLoaded) {
    return (
      <div className={`relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-border bg-subtle p-6 shadow-inner ${className}`} style={{ minHeight: "340px" }}>
        <div className="absolute inset-0 grid-bg opacity-40" />

        <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M0 240 C 90 200, 160 270, 240 180 S 370 100, 400 120" stroke="#CBD5E1" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M0 240 C 90 200, 160 270, 240 180 S 370 100, 400 140" stroke="#1E5AE8" strokeWidth="4" fill="none" strokeDasharray="6 8" strokeLinecap="round" />
          <path d="M10 50 L 390 70" stroke="#E2E8F0" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M110 0 L 140 300" stroke="#E2E8F0" strokeWidth="8" fill="none" strokeLinecap="round" />
        </svg>

        <div className="absolute left-10 bottom-16 z-10 flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 -m-2 animate-ping rounded-full bg-[#1E5AE8]/30" />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#1E5AE8] text-white shadow-lift font-bold text-xs">
              P
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/95 px-3 py-1.5 text-xs font-semibold shadow-soft backdrop-blur max-w-[160px] truncate">
            {pickupText || "Pickup Location"}
          </div>
        </div>

        <div className="absolute right-10 top-12 z-10 flex items-center gap-2">
          <div className="rounded-xl border border-border bg-background/95 px-3 py-1.5 text-xs font-semibold shadow-soft backdrop-blur max-w-[160px] truncate">
            {dropText || "Drop Location"}
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-[#F4B400] text-slate-900 shadow-lift font-bold text-xs">
            D
          </div>
        </div>

        <div className="relative z-10 my-auto w-full max-w-sm rounded-2xl border border-border/80 bg-background/90 p-4 shadow-lift backdrop-blur text-center space-y-2">
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#1E5AE8]/10 text-[#1E5AE8]">
            <MapPin className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Interactive Route & Location Map</h4>
          <p className="text-[11px] text-muted-foreground">
            Live chauffeur navigation & distance estimation active.
          </p>
        </div>

        <div className="relative z-10 flex w-full items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 shadow-soft backdrop-blur text-[#1E5AE8]">
            <span className="h-2 w-2 rounded-full bg-[#1E5AE8] animate-pulse" /> Driving Route Active
          </span>
          <span className="rounded-full bg-background/90 px-3 py-1 shadow-soft backdrop-blur">
            Live Chauffeur Tracking
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border shadow-lift ${className}`} style={{ minHeight: "320px", height: "100%" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentCenter}
        zoom={13}
        options={defaultOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* User Current Location Marker */}
        {userCoords && !pickupCoords && (
          <MarkerF
            position={userCoords}
            title="Your Current Location"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#1E5AE8",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            }}
          />
        )}

        {/* Pickup Marker (P) */}
        {pickupCoords && (
          <MarkerF
            position={pickupCoords}
            title={`Pickup: ${pickupText || ""}`}
            label={{
              text: "P",
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          />
        )}

        {/* Drop-off Marker (D) */}
        {dropCoords && (
          <MarkerF
            position={dropCoords}
            title={`Drop: ${dropText || ""}`}
            label={{
              text: "D",
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: "12px",
            }}
          />
        )}

        {/* Driving Route: Tier 1 - Backend Polyline */}
        {decodedPath && (
          <Polyline
            path={decodedPath}
            options={{
              strokeColor: "#1E5AE8",
              strokeWeight: 6,
              strokeOpacity: 0.9,
            }}
          />
        )}

        {/* Driving Route: Tier 2 - Google DirectionsRenderer */}
        {!decodedPath && directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: "#1E5AE8",
                strokeWeight: 6,
                strokeOpacity: 0.9,
              },
              suppressMarkers: true,
            }}
          />
        )}

        {/* Driving Route: Tier 3 - Guaranteed Fallback Polyline Route */}
        {!decodedPath && !directionsResponse && fallbackRoutePath && (
          <Polyline
            path={fallbackRoutePath}
            options={{
              strokeColor: "#1E5AE8",
              strokeWeight: 6,
              strokeOpacity: 0.9,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
