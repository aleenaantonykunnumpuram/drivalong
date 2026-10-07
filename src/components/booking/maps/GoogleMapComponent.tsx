import React, { useState, useEffect, useCallback, useRef } from "react";
import { LocationSearch } from "./LocationSearch";
import { RouteMap } from "./RouteMap";
import { BookingSummary } from "./BookingSummary";
import { calculateFare, DURATION_HOURS, type FareBreakdown, type ServiceType, type DurationOption } from "./fareUtils";
import { getTripEstimate } from "@/lib/api/trip.functions";
import { searchLocationSuggestions } from "@/lib/placesAutocomplete";

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
  pickup?: string;
  drop?: string;
  pickupCoords?: Coords | null;
  dropCoords?: Coords | null;
  serviceType?: string;
  duration?: string;
  vehicleType?: string;
  onPickupChange?: (val: string, coords?: Coords, verified?: boolean) => void;
  onDropChange?: (val: string, coords?: Coords, verified?: boolean) => void;
  onLocationsChanged?: (pickupAddr: string, dropAddr: string, pCoords: any, dCoords: any, metrics: TripMetrics | null) => void;
  onMetricsCalculated?: (metrics: TripMetrics) => void;
  className?: string;
}

export function GoogleMapComponent({
  pickup = "",
  drop = "",
  pickupCoords: propPickupCoords = null,
  dropCoords: propDropCoords = null,
  serviceType = "Round-Trip Chauffeur",
  duration = "4 Hours",
  onPickupChange,
  onDropChange,
  onLocationsChanged,
  onMetricsCalculated,
  className = "",
}: GoogleMapComponentProps) {
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
  const onLocationsChangedRef = useRef(onLocationsChanged);

  useEffect(() => {
    onMetricsCalculatedRef.current = onMetricsCalculated;
  }, [onMetricsCalculated]);

  useEffect(() => {
    onLocationsChangedRef.current = onLocationsChanged;
  }, [onLocationsChanged]);

  useEffect(() => {
    if (propPickupCoords) {
      setPickupCoords(propPickupCoords);
      setPickupVerified(true);
    } else {
      setPickupCoords(null);
      setPickupVerified(false);
    }
  }, [propPickupCoords]);

  useEffect(() => {
    if (propDropCoords) {
      setDropCoords(propDropCoords);
      setDropVerified(true);
    } else {
      setDropCoords(null);
      setDropVerified(false);
    }
  }, [propDropCoords]);

  const handlePickupChange = useCallback(
    (val: string, coords?: Coords, verified?: boolean) => {
      setPickupCoords(coords ?? null);
      setPickupVerified(Boolean(verified));
      if (onPickupChange) onPickupChange(val, coords, verified);
      if (onLocationsChangedRef.current) {
        onLocationsChangedRef.current(val, drop, coords ?? null, dropCoords, metrics);
      }
    },
    [onPickupChange, drop, dropCoords, metrics]
  );

  const handleDropChange = useCallback(
    (val: string, coords?: Coords, verified?: boolean) => {
      setDropCoords(coords ?? null);
      setDropVerified(Boolean(verified));
      if (onDropChange) onDropChange(val, coords, verified);
      if (onLocationsChangedRef.current) {
        onLocationsChangedRef.current(pickup, val, pickupCoords, coords ?? null, metrics);
      }
    },
    [onDropChange, pickup, pickupCoords, metrics]
  );

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

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`, {
          headers: { "User-Agent": "DrivAlong/1.0" },
        })
          .then((r) => r.json())
          .then((data) => {
            const addr = data?.display_name || `Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;
            handlePickupChange(addr, coords, true);
          })
          .catch(() => {
            handlePickupChange(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`, coords, true);
          });
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
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [handlePickupChange]);

  // Trigger Geolocation detection on mount
  useEffect(() => {
    detectUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-geocode Pickup text if typed manually without selecting dropdown
  useEffect(() => {
    if (!pickup || pickup.trim().length < 2 || pickupVerified) return;

    const timer = setTimeout(async () => {
      try {
        const results = await searchLocationSuggestions(pickup, userCoords || pickupCoords);
        if (results && results[0]) {
          handlePickupChange(pickup, { lat: results[0].lat, lng: results[0].lng }, true);
        }
      } catch (err) {
        console.warn("Fallback geocoding failed:", err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [pickup, pickupVerified, handlePickupChange, userCoords, pickupCoords]);

  // Auto-geocode Drop text if typed manually without selecting dropdown
  useEffect(() => {
    if (!drop || drop.trim().length < 2 || dropVerified) return;

    const timer = setTimeout(async () => {
      try {
        const results = await searchLocationSuggestions(drop, pickupCoords || userCoords);
        if (results && results[0]) {
          handleDropChange(drop, { lat: results[0].lat, lng: results[0].lng }, true);
        }
      } catch (err) {
        console.warn("Fallback geocoding failed:", err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [drop, dropVerified, handleDropChange, pickupCoords, userCoords]);

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
    }, 350);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropCoords, pickupVerified, dropVerified, serviceType, duration, pickup, drop, applyMetrics]);

  return (
    <div className={`space-y-6 w-full max-w-full ${className}`}>
      {/* Top 2-Column Desktop Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start w-full max-w-full">
        {/* Left Column: Location Search & Ride Metrics */}
        <div className="space-y-5 min-w-0 w-full relative z-20">
          <LocationSearch
            pickup={pickup}
            drop={drop}
            pickupVerified={pickupVerified}
            dropVerified={dropVerified}
            biasCoords={pickupCoords || userCoords || { lat: 10.5276, lng: 76.2144 }}
            onPickupChange={(val, coords, verified) => {
              handlePickupChange(val, coords, verified);
            }}
            onDropChange={(val, coords, verified) => {
              handleDropChange(val, coords, verified);
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

        {/* Right Column: Clean Leaflet Map (Zero Google Modals, Zero Watermarks) */}
        <div className="h-full min-h-[300px] sm:min-h-[340px] min-w-0 w-full overflow-hidden rounded-3xl">
          <RouteMap
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            userCoords={userCoords}
            pickupText={pickup}
            dropText={drop}
            routePolyline={metrics?.routePolyline}
            className="h-full w-full max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
