import { searchPlacesServerFn, type PlaceResult } from "./api/places.functions";

export type PlaceSuggestion = PlaceResult;

/**
 * Searches location suggestions by calling our server function (zero CORS issues)
 * with a fallback to direct Nominatim if needed.
 */
export async function searchLocationSuggestions(
  query: string,
  bias?: { lat: number; lng: number } | null
): Promise<PlaceSuggestion[]> {
  const cleanQ = (query || "").trim();
  if (cleanQ.length < 2) return [];

  // 1. Primary: Server-side search function (avoids all browser CORS)
  try {
    const results = await searchPlacesServerFn({
      data: {
        query: cleanQ,
        biasLat: bias?.lat,
        biasLng: bias?.lng,
      },
    });
    if (Array.isArray(results) && results.length > 0) {
      return results;
    }
  } catch (err) {
    console.warn("searchPlacesServerFn call failed, attempting fallback:", err);
  }

  // 2. Direct browser fallback: Nominatim (has Access-Control-Allow-Origin: *)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQ)}&limit=5&countrycodes=in&addressdetails=1`,
      {
        headers: { "User-Agent": "DrivAlongBooking/1.0" },
        signal: AbortSignal.timeout(2500),
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => {
          const addr = item.address || {};
          const mainName = addr.amenity || addr.building || addr.road || addr.suburb || item.name || "";
          const locality = addr.city || addr.town || addr.village || addr.municipality || addr.district || "";
          const state = addr.state || "";
          const parts = [mainName, locality, state].filter(Boolean);
          const formatted = parts.length > 0
            ? parts.filter((p: any, i: any) => parts.indexOf(p) === i).join(", ")
            : item.display_name;

          return {
            display_name: formatted,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          };
        });
      }
    }
  } catch (err) {
    console.warn("Direct Nominatim fallback failed:", err);
  }

  return [];
}
