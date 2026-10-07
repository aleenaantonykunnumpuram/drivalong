export interface PlaceSuggestion {
  display_name: string;
  lat: number;
  lng: number;
}

/**
 * High-speed typeahead place search with proximity bias and fallback.
 * Primary: Komoot Photon (OpenStreetMap real-time prefix engine).
 * Fallback: OpenStreetMap Nominatim.
 */
export async function searchLocationSuggestions(
  query: string,
  bias?: { lat: number; lng: number } | null
): Promise<PlaceSuggestion[]> {
  const cleanQ = (query || "").trim();
  if (cleanQ.length < 2) return [];

  // Default proximity bias: Kerala center (Thrissur) if no bias provided
  const lat = bias?.lat ?? 10.5276;
  const lng = bias?.lng ?? 76.2144;

  // 1. Primary: Komoot Photon (instant prefix typeahead)
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&lat=${lat}&lon=${lng}&limit=6`;
    const res = await fetch(url, { headers: { "User-Agent": "DrivAlongApp/1.0" } });
    if (res.ok) {
      const data = await res.json();
      if (data?.features && Array.isArray(data.features) && data.features.length > 0) {
        return data.features.map((f: any) => {
          const p = f.properties || {};
          const parts = [p.name, p.street, p.city || p.district || p.suburb, p.state, p.country].filter(Boolean);
          const uniqueParts = parts.filter((part, idx) => parts.indexOf(part) === idx);
          return {
            display_name: uniqueParts.join(", "),
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        });
      }
    }
  } catch (err) {
    console.warn("Photon autocomplete query failed:", err);
  }

  // 2. Fallback: OpenStreetMap Nominatim
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQ)}&limit=4&countrycodes=in`,
      { headers: { "User-Agent": "DrivAlongApp/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
      }
    }
  } catch (err) {
    console.warn("Nominatim autocomplete query failed:", err);
  }

  return [];
}
