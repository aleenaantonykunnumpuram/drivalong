import React, { useState, useEffect, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { MapPin, Navigation, AlertTriangle, X, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { searchLocationSuggestions, type PlaceSuggestion } from "@/lib/placesAutocomplete";

interface LocationSearchProps {
  isLoaded: boolean;
  pickup: string;
  drop: string;
  pickupVerified?: boolean;
  dropVerified?: boolean;
  biasCoords?: { lat: number; lng: number } | null;
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
  biasCoords = null,
  onPickupChange,
  onDropChange,
  onUseCurrentLocation,
  locatingUser = false,
  errorMsg = null,
  onClearError,
}: LocationSearchProps) {
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropAutocomplete, setDropAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingPickupSug, setLoadingPickupSug] = useState(false);
  const [loadingDropSug, setLoadingDropSug] = useState(false);

  // Fetch suggestions for Pickup when typing and unverified
  useEffect(() => {
    if (!pickup || pickup.trim().length < 2 || pickupVerified) {
      setPickupSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingPickupSug(true);
      try {
        const results = await searchLocationSuggestions(pickup, biasCoords);
        setPickupSuggestions(results);
      } catch (e) {
        console.warn("Failed to fetch pickup suggestions:", e);
      } finally {
        setLoadingPickupSug(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [pickup, pickupVerified, biasCoords]);

  // Fetch suggestions for Drop when typing and unverified
  useEffect(() => {
    if (!drop || drop.trim().length < 2 || dropVerified) {
      setDropSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingDropSug(true);
      try {
        const results = await searchLocationSuggestions(drop, biasCoords);
        setDropSuggestions(results);
      } catch (e) {
        console.warn("Failed to fetch drop suggestions:", e);
      } finally {
        setLoadingDropSug(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [drop, dropVerified, biasCoords]);

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();
      const hasCoords = lat !== undefined && lng !== undefined;
      if (place.formatted_address) {
        onPickupChange(place.formatted_address, hasCoords ? { lat, lng } : undefined, hasCoords);
        setPickupSuggestions([]);
      } else if (place.name) {
        onPickupChange(place.name, hasCoords ? { lat, lng } : undefined, hasCoords);
        setPickupSuggestions([]);
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
        setDropSuggestions([]);
      } else if (place.name) {
        onDropChange(place.name, hasCoords ? { lat, lng } : undefined, hasCoords);
        setDropSuggestions([]);
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
      <div className="relative z-30">
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

        <div className={`flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring min-w-0 ${pickupVerified ? "border-primary/40" : "border-border"}`}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          {isLoaded && window.google?.maps?.places ? (
            <Autocomplete
              onLoad={(ac) => setPickupAutocomplete(ac)}
              onPlaceChanged={onPickupPlaceChanged}
              className="flex-1 min-w-0 w-full"
            >
              <input
                type="text"
                value={pickup}
                onChange={(e) => onPickupChange(e.target.value, undefined, false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pickupSuggestions[0]) {
                    e.preventDefault();
                    onPickupChange(pickupSuggestions[0].display_name, { lat: pickupSuggestions[0].lat, lng: pickupSuggestions[0].lng }, true);
                    setPickupSuggestions([]);
                  }
                }}
                placeholder="Search pickup address..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={pickup}
              onChange={(e) => onPickupChange(e.target.value, undefined, false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pickupSuggestions[0]) {
                  e.preventDefault();
                  onPickupChange(pickupSuggestions[0].display_name, { lat: pickupSuggestions[0].lat, lng: pickupSuggestions[0].lng }, true);
                  setPickupSuggestions([]);
                }
              }}
              placeholder="Enter pickup location..."
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
            />
          )}
          {pickupVerified ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-label="Verified location" />
          ) : (
            pickup && <span className="text-[10px] font-semibold tracking-wide text-primary animate-pulse shrink-0">Resolving...</span>
          )}
        </div>

        {/* Pickup Instant Dropdown Suggestions */}
        {!pickupVerified && pickupSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-2xl animate-rise">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Matching Locations</span>
              {loadingPickupSug && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            {pickupSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onPickupChange(s.display_name, { lat: s.lat, lng: s.lng }, true);
                  setPickupSuggestions([]);
                }}
                className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-foreground transition hover:bg-subtle active:scale-[0.99]"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="flex-1 line-clamp-2 leading-relaxed">{s.display_name}</span>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-50" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination Input Field (Optional) */}
      <div className="relative z-20">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Destination <span className="text-[10px] lowercase font-normal text-muted-foreground">(optional for hourly/daily)</span></span>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 transition focus-within:border-primary focus-within:shadow-ring min-w-0 ${dropVerified ? "border-secondary/50" : "border-border"}`}>
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-secondary" />
          {isLoaded && window.google?.maps?.places ? (
            <Autocomplete
              onLoad={(ac) => setDropAutocomplete(ac)}
              onPlaceChanged={onDropPlaceChanged}
              className="flex-1 min-w-0 w-full"
            >
              <input
                type="text"
                value={drop}
                onChange={(e) => onDropChange(e.target.value, undefined, false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && dropSuggestions[0]) {
                    e.preventDefault();
                    onDropChange(dropSuggestions[0].display_name, { lat: dropSuggestions[0].lat, lng: dropSuggestions[0].lng }, true);
                    setDropSuggestions([]);
                  }
                }}
                placeholder="Search destination (optional for hourly/daily)..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              value={drop}
              onChange={(e) => onDropChange(e.target.value, undefined, false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && dropSuggestions[0]) {
                  e.preventDefault();
                  onDropChange(dropSuggestions[0].display_name, { lat: dropSuggestions[0].lat, lng: dropSuggestions[0].lng }, true);
                  setDropSuggestions([]);
                }
              }}
              placeholder="Enter destination (optional)..."
              className="flex-1 min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground truncate"
            />
          )}
          {dropVerified ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" aria-label="Verified location" />
          ) : (
            drop && <span className="text-[10px] font-semibold tracking-wide text-primary animate-pulse shrink-0">Resolving...</span>
          )}
        </div>

        {/* Drop Instant Dropdown Suggestions */}
        {!dropVerified && dropSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-2xl animate-rise">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Matching Destinations</span>
              {loadingDropSug && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
            {dropSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onDropChange(s.display_name, { lat: s.lat, lng: s.lng }, true);
                  setDropSuggestions([]);
                }}
                className="flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-foreground transition hover:bg-subtle active:scale-[0.99]"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="flex-1 line-clamp-2 leading-relaxed">{s.display_name}</span>
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-50" />
              </button>
            ))}
          </div>
        )}
      </div>

      {(!pickupVerified || !dropVerified) && (pickup || drop) && (
        <p className="text-[11px] text-muted-foreground">
          Choose a location from the dropdown suggestions or click one of the matching addresses to confirm your route.
        </p>
      )}
    </div>
  );
}
