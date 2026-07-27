import React, { useState, useEffect, useCallback } from "react";
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { LocationSearch } from "./LocationSearch";
import { RouteMap } from "./RouteMap";
import { BookingSummary } from "./BookingSummary";
import { computeHaversineDistance } from "./fareUtils";
import { MapPin, Navigation, RouteIcon, Sparkles } from "lucide-react";

interface Coords {
  lat: number;
  lng: number;
}

interface GoogleMapComponentProps {
  pickup: string;
  drop: string;
  vehicleType?: string;
  onPickupChange: (val: string, coords?: Coords) => void;
  onDropChange: (val: string, coords?: Coords) => void;
  onMetricsCalculated?: (distanceKm: number, durationText: string) => void;
  className?: string;
}

const libraries: Libraries = ["places", "geometry"];

export function GoogleMapComponent({
  pickup,
  drop,
  vehicleType = "sedan",
  onPickupChange,
  onDropChange,
  onMetricsCalculated,
  className = "",
}: GoogleMapComponentProps) {
  // Load Google Maps JavaScript API script
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "";

  const { isLoaded: scriptLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  const isLoaded = Boolean(apiKey && apiKey.trim().length > 0) && scriptLoaded;

  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null);
  const [dropCoords, setDropCoords] = useState<Coords | null>(null);

  const [locatingUser, setLocatingUser] = useState<boolean>(false);
  const [distanceKm, setDistanceKm] = useState<number>(34); // Default estimation
  const [durationText, setDurationText] = useState<string>("48 min");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        setLocatingUser(false);

        // Geocode coordinates to address string if Google Maps API is ready
        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              onPickupChange(results[0].formatted_address, coords);
            } else {
              onPickupChange(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`, coords);
            }
          });
        } else {
          onPickupChange(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`, coords);
        }
      },
      (error) => {
        setLocatingUser(false);
        console.warn("Geolocation permission error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("Location permission denied. Please enter pickup address manually.");
        } else {
          setErrorMsg("Could not retrieve your current location. Please enter manually.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [onPickupChange]);

  // Trigger Geolocation detection on mount
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  // Geocode pickup address when changed manually
  useEffect(() => {
    if (!pickup || !isLoaded || !window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickup }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        setPickupCoords({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  }, [pickup, isLoaded]);

  // Geocode drop address when changed manually
  useEffect(() => {
    if (!drop || !isLoaded || !window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: drop }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        setDropCoords({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  }, [drop, isLoaded]);

  // Fallback distance calculation if Directions Service is unavailable
  useEffect(() => {
    if (pickupCoords && dropCoords && (!isLoaded || loadError)) {
      const dist = computeHaversineDistance(
        pickupCoords.lat,
        pickupCoords.lng,
        dropCoords.lat,
        dropCoords.lng
      );
      setDistanceKm(dist);
      const estMins = Math.round(dist * 1.5 + 5);
      const estTime = `${estMins} min`;
      setDurationText(estTime);
      if (onMetricsCalculated) onMetricsCalculated(dist, estTime);
    }
  }, [pickupCoords, dropCoords, isLoaded, loadError, onMetricsCalculated]);

  const handleRouteCalculated = useCallback(
    (dist: number, timeStr: string) => {
      setDistanceKm(dist);
      setDurationText(timeStr);
      setErrorMsg(null);
      if (onMetricsCalculated) onMetricsCalculated(dist, timeStr);
    },
    [onMetricsCalculated]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        {/* Left Column: Location Inputs & Summary Card */}
        <div className="space-y-6">
          <LocationSearch
            isLoaded={isLoaded && !loadError}
            pickup={pickup}
            drop={drop}
            onPickupChange={(val, coords) => {
              onPickupChange(val, coords);
              if (coords) setPickupCoords(coords);
            }}
            onDropChange={(val, coords) => {
              onDropChange(val, coords);
              if (coords) setDropCoords(coords);
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
            durationText={durationText}
            vehicleType={vehicleType}
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
            onRouteCalculated={handleRouteCalculated}
            onRouteError={(err) => setErrorMsg(err)}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
