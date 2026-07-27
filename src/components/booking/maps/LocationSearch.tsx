import React, { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { MapPin, Navigation, AlertTriangle, X, Search } from "lucide-react";

interface LocationSearchProps {
  isLoaded: boolean;
  pickup: string;
  drop: string;
  onPickupChange: (val: string, coords?: { lat: number; lng: number }) => void;
  onDropChange: (val: string, coords?: { lat: number; lng: number }) => void;
  onUseCurrentLocation: () => void;
  locatingUser?: boolean;
  errorMsg?: string | null;
  onClearError?: () => void;
}

export function LocationSearch({
  isLoaded,
  pickup,
  drop,
  onPickupChange,
  onDropChange,
  onUseCurrentLocation,
  locatingUser = false,
  errorMsg = null,
  onClearError,
}: LocationSearchProps) {
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropAutocomplete, setDropAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      if (place.formatted_address) {
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        onPickupChange(
          place.formatted_address,
          lat !== undefined && lng !== undefined ? { lat, lng } : undefined
        );
      } else if (place.name) {
        onPickupChange(place.name);
      }
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete !== null) {
      const place = dropAutocomplete.getPlace();
      if (place.formatted_address) {
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        onDropChange(
          place.formatted_address,
          lat !== undefined && lng !== undefined ? { lat, lng } : undefined
        );
      } else if (place.name) {
        onDropChange(place.name);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive animate-rise">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <span>{errorMsg}</span>
          </div>
          {onClearError && (
            <button
              onClick={onClearError}
              className="rounded-lg p-1 hover:bg-destructive/20 text-destructive"
              title="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Pickup Input Field */}
      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Pickup Location</span>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={locatingUser}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
          >
            <Navigation className={`h-3.5 w-3.5 ${locatingUser ? "animate-spin" : ""}`} />
            {locatingUser ? "Locating..." : "Use Current Location"}
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          {isLoaded && window.google?.maps?.places ? (
            <Autocomplete
              onLoad={(ac) => setPickupAutocomplete(ac)}
              onPlaceChanged={onPickupPlaceChanged}
              className="flex-1"
            >
              <input
                type="text"
                value={pickup}
                onChange={(e) => onPickupChange(e.target.value)}
                placeholder="Enter pickup address..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={pickup}
              onChange={(e) => onPickupChange(e.target.value)}
              placeholder="Enter pickup location..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          )}
        </div>
      </div>

      {/* Drop-off Input Field */}
      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Drop-off Location</span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-secondary" />
          {isLoaded && window.google?.maps?.places ? (
            <Autocomplete
              onLoad={(ac) => setDropAutocomplete(ac)}
              onPlaceChanged={onDropPlaceChanged}
              className="flex-1"
            >
              <input
                type="text"
                value={drop}
                onChange={(e) => onDropChange(e.target.value)}
                placeholder="Enter destination address..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={drop}
              onChange={(e) => onDropChange(e.target.value)}
              placeholder="Enter destination location..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          )}
        </div>
      </div>
    </div>
  );
}
