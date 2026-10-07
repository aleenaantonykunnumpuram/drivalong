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
export const searchPlacesServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => searchSchema.parse(data))
  .handler(async ({ data }): Promise<PlaceResult[]> => {
    const cleanQ = (data.query || "").trim();
    if (cleanQ.length < 2) return [];

    const lat = data.biasLat ?? 10.5276;
    const lng = data.biasLng ?? 76.2144;

    // 1. Primary: OpenStreetMap Nominatim with India filter & address details (responds in ~900ms)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQ)}&limit=5&countrycodes=in&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "DrivAlongBooking/1.0 (dev@drivalong.com)" },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          return json.map((item: any) => {
            const addr = item.address || {};
            const mainName =
              addr.amenity ||
              addr.building ||
              addr.road ||
              addr.suburb ||
              addr.neighbourhood ||
              item.name ||
              "";
            const locality =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.district ||
              "";
            const state = addr.state || "";

            const parts = [mainName, locality, state].filter(Boolean);
            const formatted = parts.length > 0
              ? parts.filter((p, i) => parts.indexOf(p) === i).join(", ")
              : item.display_name;

            return {
              display_name: formatted,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            };
          });
        }
      }
    } catch (err: any) {
      console.warn("Server Nominatim lookup failed or timed out:", err?.message || err);
    }

    // 2. Secondary fallback: Komoot Photon with Kerala bias
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&lat=${lat}&lon=${lng}&limit=5`;
      const res = await fetch(url, {
        headers: { "User-Agent": "DrivAlongBooking/1.0" },
        signal: AbortSignal.timeout(2500),
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
    } catch (err: any) {
      console.warn("Server Photon lookup failed or timed out:", err?.message || err);
    }

    return [];
  });
