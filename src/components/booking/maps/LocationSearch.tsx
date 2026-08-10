import React, { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { MapPin, Navigation, AlertTriangle, X, CheckCircle2 } from "lucide-react";

interface LocationSearchProps {
  isLoaded: boolean;
  pickup: string;
  drop: string;
  pickupVerified?: boolean;
  dropVerified?: boolean;
  onPickupChange: (val: string, coords?: { lat: number; lng: number }, verified?: boolean) => void;
  onDropChange: (val: string, coords?: { lat: number; lng: number }, verified?: boolean) => void;
  onUseCurrentLocation: () => void;
  locatingUser?: boolean;
  errorMsg?: string | null;
  onClearError?: () => void;
}

export function LocationSearch({
  isLoaded,
  pickup,
  drop,
  pickupVerified = false,
  dropVerified = false,
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
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const hasCoords = lat !== undefined && lng !== undefined;
      if (place.formatted_address) {
        onPickupChange(place.formatted_address, hasCoords ? { lat, lng } : undefined, hasCoords);
      } else if (place.name) {
        onPickupChange(place.name, hasCoords ? { lat, lng } : undefined, hasCoords);
      }
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete !== null) {
      const place = dropAutocomplete.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const hasCoords = lat !== undefined && lng !== undefined;
      if (place.formatted_address) {
        onDropChange(place.formatted_address, hasCoords ? { lat, lng } : undefined, hasCoords);
      } else if (place.name) {
        onDropChange(place.name, hasCoords ? { lat, lng } : undefined, hasCoords);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert Banner */}
      {errorMsg && !errorMsg.includes("GOOGLE_MAPS") && !errorMsg.includes("API key") && (
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

        <div className={`flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring min-w-0 overflow-hidden ${pickupVerified ? "border-primary/40" : "border-border"}`}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          {isLoaded && window.google?.maps?.places ? (
            <Autocomplete
              onLoad={(ac) => setPickupAutocomplete(ac)}
              onPlaceChanged={onPickupPlaceChanged}
              className="flex-1 min-w-0 w-full overflow-hidden"
            >
              <input
                type="text"
                value={pickup}
                onChange={(e) => onPickupChange(e.target.value, undefined, false)}
                placeholder="Search pickup address..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={pickup}
              onChange={(e) => onPickupChange(e.target.value, undefined, false)}
              placeholder="Enter pickup location..."
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
            />
          )}
          {pickupVerified ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-label="Verified location" />
          ) : (
            pickup && <span className="text-[10px] font-semibold tracking-wide text-primary animate-pulse shrink-0">Resolving location...</span>
          )}
        </div>
      </div>

      {/* Destination Input Field (Optional) */}
      <div className="relative">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Destination <span className="text-[10px] lowercase font-normal text-muted-foreground">(optional for hourly/daily)</span></span>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring min-w-0 overflow-hidden ${dropVerified ? "border-secondary/50" : "border-border"}`}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-secondary" />
          {isLoaded && window.google?.maps?.places ? (
            <Autocomplete
              onLoad={(ac) => setDropAutocomplete(ac)}
              onPlaceChanged={onDropPlaceChanged}
              className="flex-1 min-w-0 w-full overflow-hidden"
            >
              <input
                type="text"
                value={drop}
                onChange={(e) => onDropChange(e.target.value, undefined, false)}
                placeholder="Search destination (optional for hourly/daily)..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={drop}
              onChange={(e) => onDropChange(e.target.value, undefined, false)}
              placeholder="Enter destination (optional)..."
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
            />
          )}
          {dropVerified ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" aria-label="Verified location" />
          ) : (
            drop && <span className="text-[10px] font-semibold tracking-wide text-primary animate-pulse shrink-0">Resolving location...</span>
          )}
        </div>
      </div>

      {(!pickupVerified || !dropVerified) && (pickup || drop) && (
        <p className="text-[11px] text-muted-foreground">
          Select an address from the Google suggestions dropdown for pickup and drop-off so we can calculate an accurate route and fare.
        </p>
      )}
    </div>
  );
}
