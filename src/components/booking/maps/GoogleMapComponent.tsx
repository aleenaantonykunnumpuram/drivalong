import React, { useState, useEffect, useCallback, useRef } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { LocationSearch } from "./LocationSearch";
import { RouteMap } from "./RouteMap";
import { BookingSummary } from "./BookingSummary";
import { computeHaversineDistance, calculateFare, DURATION_HOURS, type FareBreakdown, type ServiceType, type DurationOption } from "./fareUtils";
import { getTripEstimate } from "@/lib/api/trip.functions";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

interface Coords {
  lat: number;
  lng: number;
}

export interface TripMetrics {
  distanceKm: number;
  durationMinutes: number;
  durationInTrafficMinutes: number | null;
  durationText: string;
  etaLabel: string;
  etaTime: string | null;
  routePolyline: string | null;
  fare: FareBreakdown;
}

interface GoogleMapComponentProps {
  pickup: string;
  drop?: string;
  serviceType?: string;
  duration?: string;
  vehicleType?: string;
  onPickupChange: (val: string, coords?: Coords, verified?: boolean) => void;
  onDropChange: (val: string, coords?: Coords, verified?: boolean) => void;
  onMetricsCalculated?: (metrics: TripMetrics) => void;
  className?: string;
}

const libraries: Libraries = ["places", "geometry"];

export function GoogleMapComponent({
  pickup,
  drop = "",
  serviceType = "Hourly Chauffeur",
  duration = "4 Hours",
  onPickupChange,
  onDropChange,
  onMetricsCalculated,
  className = "",
}: GoogleMapComponentProps) {
  // Load Google Maps JavaScript API script
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "";

  const [mapAuthFailed, setMapAuthFailed] = useState<boolean>(false);

  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  // Catch global Google Maps auth failures
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn("Google Maps authentication failed (gm_authFailure). Falling back to interactive map view.");
      setMapAuthFailed(true);
      setErrorMsg("Google Maps API key error (ApiNotActivatedMapError). Please enable Maps JavaScript API in Google Cloud Console.");
    };
  }, []);

  const isLoaded = Boolean(apiKey && apiKey.trim().length > 0) && scriptLoaded && !mapAuthFailed;

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);
  const [pickupVerified, setPickupVerified] = useState(false);
  const [dropVerified, setDropVerified] = useState(false);

  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<TripMetrics | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestSeq = useRef(0);
  const onMetricsCalculatedRef = useRef(onMetricsCalculated);

  useEffect(() => {
    onMetricsCalculatedRef.current = onMetricsCalculated;
  }, [onMetricsCalculated]);

  // Helper to atomically set metrics and trigger callback
  const applyMetrics = useCallback((newMetrics: TripMetrics | null) => {
    setMetrics(newMetrics);
    if (newMetrics && onMetricsCalculatedRef.current) {
      onMetricsCalculatedRef.current(newMetrics);
    }
  }, []);

  // Automatically detect user's current location using Browser Geolocation API
  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Browser Geolocation is not supported on your device.");
      return;
    }

    setLocatingUser(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setPickupCoords(coords);
        setPickupVerified(true);
        setLocatingUser(false);

        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              onPickupChange(results[0].formatted_address, coords, true);
            } else {
              onPickupChange(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`, coords, true);
            }
          });
        } else {
          onPickupChange(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`, coords, true);
        }
      },
      (error) => {
        setLocatingUser(false);
        console.warn("Geolocation permission error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("Location permission denied. Please search and select your pickup address.");
        } else {
          setErrorMsg("Could not retrieve your current location. Please search for an address.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [onPickupChange]);

  // Trigger Geolocation detection on mount
  useEffect(() => {
    detectUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-geocode Pickup text if typed manually without selecting dropdown
  useEffect(() => {
    if (!pickup || pickup.trim().length < 3 || pickupVerified) return;

    const timer = setTimeout(async () => {
      if (window.google?.maps?.Geocoder && isLoaded) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: pickup }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            const coords = { lat: loc.lat(), lng: loc.lng() };
            setPickupCoords(coords);
            setPickupVerified(true);
            onPickupChange(pickup, coords, true);
          }
        });
      } else {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickup)}`);
          const data = await res.json();
          if (data && data[0]) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            setPickupCoords(coords);
            setPickupVerified(true);
            onPickupChange(pickup, coords, true);
          }
        } catch (err) {
          console.warn("Fallback geocoding failed:", err);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [pickup, pickupVerified, isLoaded, onPickupChange]);

  // Auto-geocode Drop text if typed manually without selecting dropdown
  useEffect(() => {
    if (!drop || drop.trim().length < 3 || dropVerified) return;

    const timer = setTimeout(async () => {
      if (window.google?.maps?.Geocoder && isLoaded) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: drop }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            const coords = { lat: loc.lat(), lng: loc.lng() };
            setDropCoords(coords);
            setDropVerified(true);
            onDropChange(drop, coords, true);
          }
        });
      } else {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(drop)}`);
          const data = await res.json();
          if (data && data[0]) {
            const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            setDropCoords(coords);
            setDropVerified(true);
            onDropChange(drop, coords, true);
          }
        } catch (err) {
          console.warn("Fallback geocoding failed:", err);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [drop, dropVerified, isLoaded, onDropChange]);

  // Unified Route & Fare Fetching effect
  useEffect(() => {
    if (!pickupCoords || !pickupVerified) return;

    const seq = ++requestSeq.current;
    setEstimating(true);

    const timer = setTimeout(async () => {
      try {
        const res = await getTripEstimate({
          data: {
            pickup: { lat: pickupCoords.lat, lng: pickupCoords.lng, address: pickup },
            drop: dropCoords && dropVerified ? { lat: dropCoords.lat, lng: dropCoords.lng, address: drop } : undefined,
            serviceType: serviceType as ServiceType,
            duration,
          },
        });

        if (seq !== requestSeq.current) return;

        if (res.success) {
          setErrorMsg(null);
          const newMetrics: TripMetrics = {
            distanceKm: res.distanceKm,
            durationMinutes: res.effectiveDurationMinutes,
            durationInTrafficMinutes: res.durationInTrafficMinutes ?? null,
            durationText: res.durationInTrafficMinutes
              ? `${res.durationInTrafficMinutes} min (live traffic)`
              : `${res.durationMinutes} min`,
            etaLabel: new Date(res.etaTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
            etaTime: res.etaTime,
            routePolyline: res.routePolyline || null,
            fare: res.fare,
          };
          applyMetrics(newMetrics);
        } else {
          setErrorMsg(res.error || "Unable to compute route between selected locations.");
        }
      } catch (err: any) {
        if (seq !== requestSeq.current) return;
        console.error("Trip estimate request failed:", err);
        setErrorMsg("Network or API error while calculating route.");
      } finally {
        if (seq === requestSeq.current) {
          setEstimating(false);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropCoords, pickupVerified, dropVerified, serviceType, duration, pickup, drop, applyMetrics]);

  // Synchronized callback for client-side Google Maps Directions rendering fallback
  const handleClientRouteCalculated = useCallback(
    (distKm: number, durMin: number, durText: string, polyline?: string) => {
      const calculatedFare = calculateFare(distKm, durMin, serviceType as ServiceType);
      const etaDate = new Date(Date.now() + durMin * 60_000);
      const newMetrics: TripMetrics = {
        distanceKm: distKm,
        durationMinutes: durMin,
        durationInTrafficMinutes: null,
        durationText: durText,
        etaLabel: etaDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
        etaTime: etaDate.toISOString(),
        routePolyline: polyline || null,
        fare: calculatedFare,
      };
      applyMetrics(newMetrics);
      setEstimating(false);
    },
    [serviceType, applyMetrics]
  );

  return (
    <div className={`space-y-6 w-full max-w-full overflow-hidden ${className}`}>
      {/* Top 2-Column Desktop Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start w-full max-w-full overflow-hidden">
        {/* Left Column: Location Search & Ride Metrics */}
        <div className="space-y-5 min-w-0 w-full overflow-hidden">
          <LocationSearch
            isLoaded={isLoaded && !loadError}
            pickup={pickup}
            drop={drop}
            pickupVerified={pickupVerified}
            dropVerified={dropVerified}
            onPickupChange={(val, coords, verified) => {
              setPickupVerified(Boolean(verified));
              if (coords) setPickupCoords(coords);
              onPickupChange(val, coords, verified);
            }}
            onDropChange={(val, coords, verified) => {
              setDropVerified(Boolean(verified));
              if (coords) setDropCoords(coords);
              onDropChange(val, coords, verified);
            }}
            onUseCurrentLocation={detectUserLocation}
            locatingUser={locatingUser}
            errorMsg={errorMsg}
            onClearError={() => setErrorMsg(null)}
          />

          <BookingSummary
            pickup={pickup}
            drop={drop}
            distanceKm={metrics?.distanceKm ?? 0}
            durationMinutes={metrics?.durationMinutes ?? 0}
            durationText={metrics?.durationText ?? ""}
            etaLabel={metrics?.etaLabel ?? ""}
            fare={metrics?.fare ?? null}
            serviceType={serviceType}
            loading={estimating}
            ready={pickupVerified && Boolean(!drop || dropVerified)}
          />
        </div>

        {/* Right Column: Responsive Interactive Map */}
        <div className="h-full min-h-[300px] sm:min-h-[340px] min-w-0 w-full overflow-hidden rounded-3xl">
          <RouteMap
            isLoaded={isLoaded && !loadError}
            loadError={loadError}
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            userCoords={userCoords}
            pickupText={pickup}
            dropText={drop}
            routePolyline={metrics?.routePolyline}
            onRouteCalculated={handleClientRouteCalculated}
            onRouteError={(err) => setErrorMsg(err)}
            className="h-full w-full max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
