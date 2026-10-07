import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface PlaceResult {
  display_name: string;
  lat: number;
  lng: number;
}

const searchSchema = z.object({
  query: z.string(),
  biasLat: z.number().optional(),
  biasLng: z.number().optional(),
});

/**
 * Server-side place search function (executed in Node.js, bypasses browser CORS).
 * Uses Komoot Photon with Kerala proximity bias + fallback to Nominatim.
 */
export const searchPlacesServerFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => searchSchema.parse(data))
  .handler(async ({ data }): Promise<PlaceResult[]> => {
    const cleanQ = (data.query || "").trim();
    if (cleanQ.length < 2) return [];

    const lat = data.biasLat ?? 10.5276;
    const lng = data.biasLng ?? 76.2144;

    // 1. Try Komoot Photon on server side (NO CORS issues here)
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&lat=${lat}&lon=${lng}&limit=6`;
      const res = await fetch(url, {
        headers: { "User-Agent": "DrivAlong/1.0 (RideBookingPlatform)" },
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.features && Array.isArray(json.features) && json.features.length > 0) {
          return json.features.map((f: any) => {
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
      console.warn("Server Photon lookup failed:", err);
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQ)}&limit=4&countrycodes=in`,
        {
          headers: { "User-Agent": "DrivAlong/1.0 (RideBookingPlatform)" },
          signal: AbortSignal.timeout(3500),
        }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          return json.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));
        }
      }
    } catch (err) {
      console.warn("Server Nominatim lookup failed:", err);
    }

    return [];
  });
