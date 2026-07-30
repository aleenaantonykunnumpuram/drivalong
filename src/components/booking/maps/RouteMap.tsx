import React, { useEffect, useState, useCallback, useMemo } from "react";
import { GoogleMap, MarkerF, Polyline, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, AlertTriangle } from "lucide-react";

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
   * server key isn't configured). Not used once `routePolyline` is set.
   */
  onRouteCalculated?: (distanceKm: number, durationMinutes: number, durationText: string) => void;
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
  lat: 12.9716, // Bengaluru default
  lng: 77.5946,
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
  const [mapError, setMapError] = useState<string | null>(null);

  const onLoad = useCallback((m: google.maps.Map) => {
    setMap(m);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Decode the backend-supplied encoded polyline into a path for rendering.
  const decodedPath = useMemo(() => {
    if (!routePolyline || !isLoaded || !window.google?.maps?.geometry || !pickupCoords) return null;
    try {
      const path = window.google.maps.geometry.encoding.decodePath(routePolyline);
      if (path && path.length > 0) {
        const start = path[0];
        const dist = Math.abs(start.lat() - pickupCoords.lat) + Math.abs(start.lng() - pickupCoords.lng);
        if (dist > 0.5) return null; // Reject stale polyline from another region (e.g. Bengaluru)
      }
      return path;
    } catch {
      return null;
    }
  }, [routePolyline, isLoaded, pickupCoords]);

  // Client-side fallback: only used when the backend hasn't supplied a
  // route polyline yet (e.g. while the estimate request is in flight, or
  // if the server-side API key isn't configured).
  useEffect(() => {
    if (routePolyline) {
      setDirectionsResponse(null);
      return;
    }
    if (!isLoaded || !window.google || !pickupCoords || !dropCoords) {
      setDirectionsResponse(null);
      return;
    }

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
          setMapError(null);

          const leg = result.routes[0]?.legs[0];
          if (leg && onRouteCalculated) {
            const distanceKm = (leg.distance?.value || 0) / 1000;
            const durationMinutes = (leg.duration?.value || 0) / 60;
            const durationText = leg.duration?.text || "Unknown";
            onRouteCalculated(Math.round(distanceKm * 10) / 10, Math.round(durationMinutes), durationText);
          }
        } else {
          console.warn("Directions request failed:", status);
          setDirectionsResponse(null);
          const errStr = `Unable to calculate driving route (${status}).`;
          setMapError(errStr);
          if (onRouteError) onRouteError(errStr);
        }
      }
    );
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
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      if (pickupCoords && !dropCoords) {
        map.setZoom(14);
      }
    }
  }, [map, pickupCoords, dropCoords, userCoords]);

  // Center map on user coordinates or pickup coordinates
  const currentCenter = pickupCoords || userCoords || defaultCenter;

  // Fallback map preview when Google Maps API key is missing or failed to load
  if (loadError || !isLoaded) {
    return (
      <div className={`relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-border bg-subtle p-6 shadow-inner ${className}`} style={{ minHeight: "340px" }}>
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Interactive Simulated Map Canvas & Highways */}
        <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 400 300" preserveAspectRatio="none">
          {/* Highways & Roads */}
          <path d="M0 240 C 90 200, 160 270, 240 180 S 370 100, 400 120" stroke="#CBD5E1" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path d="M0 240 C 90 200, 160 270, 240 180 S 370 100, 400 140" stroke="#0B5FFF" strokeWidth="4" fill="none" strokeDasharray="6 8" strokeLinecap="round" />
          <path d="M10 50 L 390 70" stroke="#E2E8F0" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M110 0 L 140 300" stroke="#E2E8F0" strokeWidth="8" fill="none" strokeLinecap="round" />
        </svg>

        {/* Animated Pickup Pin Marker */}
        <div className="absolute left-10 bottom-16 z-10 flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 -m-2 animate-ping rounded-full bg-primary/30" />
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift font-bold text-xs">
              P
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/95 px-3 py-1.5 text-xs font-semibold shadow-soft backdrop-blur max-w-[160px] truncate">
            {pickupText || "Pickup Location"}
          </div>
        </div>

        {/* Animated Drop Pin Marker */}
        <div className="absolute right-10 top-12 z-10 flex items-center gap-2">
          <div className="rounded-xl border border-border bg-background/95 px-3 py-1.5 text-xs font-semibold shadow-soft backdrop-blur max-w-[160px] truncate">
            {dropText || "Drop Location"}
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-secondary text-secondary-foreground shadow-lift font-bold text-xs">
            D
          </div>
        </div>

        {/* Status Info Box */}
        <div className="relative z-10 my-auto w-full max-w-sm rounded-2xl border border-border/80 bg-background/90 p-4 shadow-lift backdrop-blur text-center space-y-2">
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground">Interactive Route & Location Map</h4>
          <p className="text-[11px] text-muted-foreground">
            To unlock live Google satellite tiles on localhost, add <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">http://localhost:8080/*</code> to your API key restrictions in Google Cloud Console.
          </p>
        </div>

        {/* Live Route Active Indicator */}
        <div className="relative z-10 flex w-full items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 shadow-soft backdrop-blur text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Driving Route Active
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
              fillColor: "#0B5FFF",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            }}
          />
        )}

        {/* Pickup Marker */}
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

        {/* Drop-off Marker */}
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

        {/* Driving Route: prefer the backend-computed polyline */}
        {decodedPath && (
          <Polyline
            path={decodedPath}
            options={{
              strokeColor: "#0B5FFF",
              strokeWeight: 5,
              strokeOpacity: 0.85,
            }}
          />
        )}

        {/* Client-side fallback route rendering */}
        {!decodedPath && directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: "#0B5FFF",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Map Overlay Banner */}
      {mapError && (
        <div className="absolute top-3 left-3 right-3 z-10 rounded-2xl bg-destructive/90 px-3.5 py-2 text-xs font-semibold text-white shadow-soft backdrop-blur flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{mapError}</span>
        </div>
      )}
    </div>
  );
}
