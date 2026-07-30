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
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [durationText, setDurationText] = useState<string>("");
  const [etaLabel, setEtaLabel] = useState<string>("");
  const [etaTime, setEtaTime] = useState<string | null>(null);
  const [routePolyline, setRoutePolyline] = useState<string | null>(null);
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestSeq = useRef(0);

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

  // Fetch trip estimate (route + fare) from backend
  useEffect(() => {
    if (!pickupCoords || !pickupVerified) return;

    const seq = ++requestSeq.current;
    setEstimating(true);
    setErrorMsg(null);

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
          setDistanceKm(res.distanceKm);
          setDurationMinutes(res.effectiveDurationMinutes);
          setDurationText(
            res.durationInTrafficMinutes
              ? `${res.durationInTrafficMinutes} min (live traffic)`
              : `${res.durationMinutes} min`
          );
          setEtaTime(res.etaTime);
          setEtaLabel(
            new Date(res.etaTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
          );
          setRoutePolyline(res.routePolyline || null);
          setFare(res.fare);
          setEstimating(false);

          if (onMetricsCalculated) {
            onMetricsCalculated({
              distanceKm: res.distanceKm,
              durationMinutes: res.effectiveDurationMinutes,
              durationInTrafficMinutes: res.durationInTrafficMinutes ?? null,
              durationText:
                res.durationInTrafficMinutes ? `${res.durationInTrafficMinutes} min (live traffic)` : `${res.durationMinutes} min`,
              etaLabel: new Date(res.etaTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
              etaTime: res.etaTime,
              routePolyline: res.routePolyline || null,
              fare: res.fare,
            });
          }
        } else {
          setEstimating(false);
          setRoutePolyline(null);
          setErrorMsg(null);
        }
      } catch (err) {
        if (seq !== requestSeq.current) return;
        console.error("Trip estimate request failed:", err);
        setEstimating(false);
        setRoutePolyline(null);
        setErrorMsg(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [pickupCoords, dropCoords, pickupVerified, dropVerified, serviceType, duration, pickup, drop, onMetricsCalculated]);

  // Offline / Immediate calculation fallback
  useEffect(() => {
    if (routePolyline || estimating) return;
    if (!pickupCoords) return;

    const dist = pickupCoords && dropCoords ? computeHaversineDistance(pickupCoords.lat, pickupCoords.lng, dropCoords.lat, dropCoords.lng) : 0;
    const estMinutes = (DURATION_HOURS[duration as DurationOption] || 4) * 60;
    const fallbackFare = calculateFare(dist, estMinutes, serviceType as ServiceType);
    const eta = new Date(Date.now() + estMinutes * 60_000);

    setDistanceKm(dist);
    setDurationMinutes(estMinutes);
    setDurationText(`${duration}`);
    setEtaTime(eta.toISOString());
    setEtaLabel(eta.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
    setFare(fallbackFare);

    if (onMetricsCalculated) {
      onMetricsCalculated({
        distanceKm: dist,
        durationMinutes: estMinutes,
        durationInTrafficMinutes: null,
        durationText: `${duration}`,
        etaLabel: eta.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
        etaTime: eta.toISOString(),
        routePolyline: null,
        fare: fallbackFare,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, dropCoords, routePolyline, estimating, serviceType, duration]);

  const handleClientRouteCalculated = useCallback(
    (dist: number, durMin: number, timeStr: string) => {
      setDistanceKm(dist);
      setDurationMinutes(durMin);
      setDurationText(timeStr);
      setEstimating(false);
    },
    []
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top 2-Column Desktop Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left Column: Location Search & Ride Metrics */}
        <div className="space-y-5">
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
            distanceKm={distanceKm}
            durationMinutes={durationMinutes}
            durationText={durationText}
            etaLabel={etaLabel}
            fare={fare}
            serviceType={serviceType}
            loading={estimating}
            ready={pickupVerified && dropVerified}
          />
        </div>

        {/* Right Column: Responsive Interactive Map */}
        <div className="h-full min-h-[340px]">
          <RouteMap
            isLoaded={isLoaded && !loadError}
            loadError={loadError}
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            userCoords={userCoords}
            pickupText={pickup}
            dropText={drop}
            routePolyline={routePolyline}
            onRouteCalculated={handleClientRouteCalculated}
            onRouteError={(err) => setErrorMsg(err)}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
