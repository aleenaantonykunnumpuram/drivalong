import React, { useEffect, useState, useCallback } from "react";
import { GoogleMap, MarkerF, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";

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
  onRouteCalculated?: (distanceKm: number, durationText: string) => void;
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

  // Calculate driving route using google.maps.DirectionsService
  useEffect(() => {
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
            const durationText = leg.duration?.text || "Unknown";
            onRouteCalculated(Math.round(distanceKm * 10) / 10, durationText);
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
  }, [isLoaded, pickupCoords, dropCoords, onRouteCalculated, onRouteError]);

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
      <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-subtle p-6 text-center shadow-inner ${className}`} style={{ minHeight: "320px" }}>
        <div className="absolute inset-0 grid-bg opacity-50" />
        
        {/* Interactive Simulated Map Roads */}
        <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M0 220 C 80 180, 160 260, 240 200 S 380 120, 400 140" stroke="#CBD5E1" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M0 220 C 80 180, 160 260, 240 200 S 380 120, 400 140" stroke="#0B5FFF" strokeWidth="3" fill="none" strokeDasharray="6 8" strokeLinecap="round" />
          <path d="M20 40 L 380 60" stroke="#E2E8F0" strokeWidth="8" fill="none" />
          <path d="M100 0 L 130 300" stroke="#E2E8F0" strokeWidth="8" fill="none" />
        </svg>

        <div className="relative z-10 max-w-sm rounded-2xl border border-border/80 bg-background/95 p-4 shadow-lift backdrop-blur">
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold">Google Maps Live Interface</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {loadError
              ? "Google Maps API key missing or invalid. Set VITE_GOOGLE_MAPS_API_KEY in .env."
              : "Loading Google Maps script..."}
          </p>

          {(pickupText || dropText) && (
            <div className="mt-3 border-t border-border pt-2.5 text-left text-[11px] space-y-1">
              {pickupText && <p className="truncate"><strong className="text-primary">Pickup:</strong> {pickupText}</p>}
              {dropText && <p className="truncate"><strong className="text-secondary">Drop:</strong> {dropText}</p>}
            </div>
          )}
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

        {/* Driving Route Polyline */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: "#0B5FFF",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: false,
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
