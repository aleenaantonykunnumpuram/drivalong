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

  return [];
}
